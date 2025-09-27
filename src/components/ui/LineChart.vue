<template>
  <div class="bg-white rounded-lg shadow-md p-6 cursor-pointer select-none" @click="toggleChartPeriod">
    <div class="relative mb-4">
      <!-- 左軸標籤 -->
      <div v-if="hasVisibleLeftLegends"
           class="absolute left-0 top-0 flex flex-col justify-between text-xs text-gray-500 pr-2"
           :style="{ height: `${chartHeight}px` }">
        <span>{{ leftYAxisMax }}</span>
        <span>{{ Math.round(leftYAxisMax * 0.67) }}</span>
        <span>{{ Math.round(leftYAxisMax * 0.33) }}</span>
        <span>0</span>
      </div>

      <!-- 右軸標籤 (如果有右軸數據且有可見圖例) -->
      <div v-if="dataProvider.right && hasVisibleRightLegends" 
           class="absolute right-0 top-0 flex flex-col justify-between text-xs text-gray-500 pl-2"
           :style="{ height: `${chartHeight}px` }">
        <span>{{ rightYAxisMax }}</span>
        <span>{{ Math.round(rightYAxisMax * 0.67) }}</span>
        <span>{{ Math.round(rightYAxisMax * 0.33) }}</span>
        <span>0</span>
      </div>

      <!-- 圖表區域 -->
      <div ref="chartContainer" class="mx-8 relative" :style="{ height: `${chartHeight}px` }">
        <!-- 網格線 -->
        <div class="absolute inset-0">
          <div v-for="i in 4" :key="i" 
               class="absolute w-full border-t border-gray-200"
               :style="{ top: `${(i - 1) * 25}%` }">
          </div>
        </div>

        <!-- SVG 折線圖 -->
        <svg class="absolute inset-0 w-full h-full" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
          <!-- 左軸數據線條 -->
          <g v-for="(dataName, index) in Object.keys(dataProvider.left.data)" :key="`left-${dataName}`">
            <!-- 只顯示可見的圖例 -->
            <template v-if="isLeftLegendVisible(dataName)">
              <polyline
                :points="getLeftLinePoints(dataName)"
                :stroke="leftLineColors[index % leftLineColors.length]"
                stroke-width="2"
                fill="none"
                class="transition-all duration-300"
              />
              <!-- 數據點 -->
              <circle
                v-for="(point, pointIndex) in chartData"
                :key="`left-point-${dataName}-${pointIndex}`"
                :cx="getXPosition(pointIndex)"
                :cy="getLeftYPosition(point.leftValues[dataName])"
                r="4"
                :fill="leftLineColors[index % leftLineColors.length]"
                class="hover:r-6 transition-all duration-200 cursor-pointer"
                @mouseenter="showTooltip($event, point, dataName, point.leftValues[dataName], 'left')"
                @mouseleave="hideTooltip"
              />
              <!-- 數值標籤 (如果該圖例設為顯示數值) -->
              <text
                v-if="shouldShowLeftValues(dataName)"
                v-for="(point, pointIndex) in chartData"
                :key="`left-value-${dataName}-${pointIndex}`"
                :x="getXPosition(pointIndex)"
                :y="getLeftYPosition(point.leftValues[dataName]) - 8"
                text-anchor="middle"
                class="text-xs font-medium pointer-events-none"
                :fill="leftLineColors[index % leftLineColors.length]"
              >
                {{ formatValue(point.leftValues[dataName], 'left') }}
              </text>
            </template>
          </g>

          <!-- 右軸數據線條 (如果有) -->
          <g v-if="dataProvider.right" 
             v-for="(dataName, index) in Object.keys(dataProvider.right.data)" 
             :key="`right-${dataName}`">
            <!-- 只顯示可見的圖例 -->
            <template v-if="isRightLegendVisible(dataName)">
              <polyline
                :points="getRightLinePoints(dataName)"
                :stroke="rightLineColors[index % rightLineColors.length]"
                stroke-width="2"
                fill="none"
                stroke-dasharray="5,5"
                class="transition-all duration-300"
              />
              <!-- 數據點 -->
              <circle
                v-for="(point, pointIndex) in chartData"
                :key="`right-point-${dataName}-${pointIndex}`"
                :cx="getXPosition(pointIndex)"
                :cy="getRightYPosition(point.rightValues?.[dataName] || 0)"
                r="4"
                :fill="rightLineColors[index % rightLineColors.length]"
                class="hover:r-6 transition-all duration-200 cursor-pointer"
                @mouseenter="showTooltip($event, point, dataName, point.rightValues?.[dataName] || 0, 'right')"
                @mouseleave="hideTooltip"
              />
              <!-- 數值標籤 (如果該圖例設為顯示數值) -->
              <text
                v-if="shouldShowRightValues(dataName)"
                v-for="(point, pointIndex) in chartData"
                :key="`right-value-${dataName}-${pointIndex}`"
                :x="getXPosition(pointIndex)"
                :y="getRightYPosition(point.rightValues?.[dataName] || 0) - 8"
                text-anchor="middle"
                class="text-xs font-medium pointer-events-none"
                :fill="rightLineColors[index % rightLineColors.length]"
              >
                {{ formatValue(point.rightValues?.[dataName] || 0, 'right') }}
              </text>
            </template>
          </g>
        </svg>
      </div>

      <!-- 日期標籤 -->
      <div class="mx-8 flex justify-between mt-2">
        <div v-for="(item, index) in chartData" 
             :key="`label-${index}`"
             class="flex-1 text-xs text-gray-600 text-center">
          <div>{{ item.label }}</div>
          <div class="text-gray-400">{{ item.dateLabel }}</div>
        </div>
      </div>
    </div>

    <!-- 圖例 -->
    <div class="grid grid-cols-2 gap-4 text-sm">
      <!-- 左軸圖例 -->
      <div class="flex items-center gap-2">
        <span class="text-gray-600">{{ dataProvider.left.unit }}:</span>
        <div v-for="(dataName, index) in Object.keys(dataProvider.left.data)" 
             :key="`legend-left-${dataName}`"
             class="flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
             @click.stop="toggleLeftLegend(dataName)">
          <!-- 圖例指示器 -->
          <div class="relative">
            <div class="w-3 h-3 rounded-full transition-all duration-200" 
                 :class="getLegendIndicatorClass(leftLegendStates[dataName])"
                 :style="{ backgroundColor: leftLineColors[index % leftLineColors.length] }">
            </div>
            <!-- 顯示數值狀態的額外指示器 -->
            <div v-if="leftLegendStates[dataName] === LegendState.WithValues"
                 class="absolute -top-1 -right-1 w-2 h-2 bg-white border rounded-full text-xs flex items-center justify-center"
                 :style="{ borderColor: leftLineColors[index % leftLineColors.length] }">
              <span class="text-xs font-bold" :style="{ color: leftLineColors[index % leftLineColors.length] }">V</span>
            </div>
          </div>
          <span :class="getLegendTextClass(leftLegendStates[dataName])">
            {{ dataName }}
          </span>
        </div>
      </div>

      <!-- 右軸圖例 (如果有) -->
      <div v-if="dataProvider.right" class="flex items-center gap-2">
        <span class="text-gray-600">{{ dataProvider.right.unit }}:</span>
        <div v-for="(dataName, index) in Object.keys(dataProvider.right.data)" 
             :key="`legend-right-${dataName}`"
             class="flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
             @click.stop="toggleRightLegend(dataName)">
          <!-- 圖例指示器 -->
          <div class="relative">
            <div class="w-3 h-3 rounded-full border-2 border-dashed transition-all duration-200" 
                 :class="getLegendIndicatorClass(rightLegendStates[dataName])"
                 :style="{ borderColor: rightLineColors[index % rightLineColors.length] }">
            </div>
            <!-- 顯示數值狀態的額外指示器 -->
            <div v-if="rightLegendStates[dataName] === LegendState.WithValues"
                 class="absolute -top-1 -right-1 w-2 h-2 bg-white border rounded-full text-xs flex items-center justify-center"
                 :style="{ borderColor: rightLineColors[index % rightLineColors.length] }">
              <span class="text-xs font-bold" :style="{ color: rightLineColors[index % rightLineColors.length] }">V</span>
            </div>
          </div>
          <span :class="getLegendTextClass(rightLegendStates[dataName])">
            {{ dataName }}
          </span>
        </div>
      </div>
    </div>

    <!-- 圖例狀態說明 -->
    <div class="mt-2 text-xs text-gray-500">
      點擊圖例切換狀態：顯示 → 顯示數值 → 隱藏
    </div>

    <!-- 提示框 -->
    <div v-if="tooltip.show" 
         class="absolute bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none z-10"
         :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <div>{{ tooltip.date }}</div>
      <div>{{ tooltip.dataName }}: {{ tooltip.value }}{{ tooltip.unit }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useLineChart, type DataProvider } from '@/composables/useLineChart'

// Props
const props = defineProps<{
  dataProvider: DataProvider
}>()

// 格式化數值顯示 - 需要區分左軸和右軸
const formatLeftValue = (value: number) => {
  if (dataProvider.left.formatValue) {
    return dataProvider.left.formatValue(value)
  }
  // 默認邏輯
  return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toString()
}

const formatRightValue = (value: number) => {
  if (dataProvider.right?.formatValue) {
    return dataProvider.right.formatValue(value)
  }
  // 默認邏輯
  return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toString()
}

// 通用格式化函數 - 根據軸來決定使用哪個格式化方法
const formatValue = (value: number, axis: 'left' | 'right' = 'left') => {
  return axis === 'left' ? formatLeftValue(value) : formatRightValue(value)
}

// 使用 composable
const {
  chartTitle,
  chartData,
  leftYAxisMax,
  rightYAxisMax,
  chartHeight,
  toggleChartPeriod,
  dataProvider,
  leftLegendStates,
  rightLegendStates,
  hasVisibleLeftLegends,
  hasVisibleRightLegends,
  toggleLeftLegend,
  toggleRightLegend,
  isLeftLegendVisible,
  isRightLegendVisible,
  shouldShowLeftValues,
  shouldShowRightValues,
  LegendState
} = useLineChart(props.dataProvider)

// 顏色配置
const leftLineColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
const rightLineColors = ['#8B5CF6', '#F97316', '#06B6D4', '#84CC16']

// SVG 尺寸
const svgWidth = 400
const svgHeight = 240

// 圖表容器引用
const chartContainer = ref<HTMLElement>()

// 提示框狀態
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  date: '',
  dataName: '',
  value: 0,
  unit: ''
})

// 獲取圖例指示器樣式類
const getLegendIndicatorClass = (state: number) => {
  switch (state) {
    case LegendState.Hidden:
      return 'opacity-30'
    case LegendState.Visible:
      return ''
    case LegendState.WithValues:
      return 'ring-2 ring-offset-1'
    default:
      return ''
  }
}

// 獲取圖例文字樣式類
const getLegendTextClass = (state: number) => {
  switch (state) {
    case LegendState.Hidden:
      return 'opacity-50 line-through'
    case LegendState.Visible:
      return ''
    case LegendState.WithValues:
      return 'font-semibold'
    default:
      return ''
  }
}

// 計算 X 軸位置 (SVG 座標)
const getXPosition = (index: number) => {
  if (chartData.value.length <= 1) return svgWidth / 2
  return (index / (chartData.value.length - 1)) * svgWidth
}

// 計算左軸 Y 軸位置 (SVG 座標)
const getLeftYPosition = (value: number) => {
  const percentage = Math.max(0, Math.min(1, (leftYAxisMax.value - value) / leftYAxisMax.value))
  return percentage * svgHeight
}

// 計算右軸 Y 軸位置 (SVG 座標)
const getRightYPosition = (value: number) => {
  const percentage = Math.max(0, Math.min(1, (rightYAxisMax.value - value) / rightYAxisMax.value))
  return percentage * svgHeight
}

// 生成左軸線條路徑
const getLeftLinePoints = (dataName: string) => {
  return chartData.value.map((point, index) => {
    const x = getXPosition(index)
    const y = getLeftYPosition(point.leftValues[dataName])
    return `${x},${y}`
  }).join(' ')
}

// 生成右軸線條路徑
const getRightLinePoints = (dataName: string) => {
  return chartData.value.map((point, index) => {
    const x = getXPosition(index)
    const y = getRightYPosition(point.rightValues?.[dataName] || 0)
    return `${x},${y}`
  }).join(' ')
}

// 顯示提示框
const showTooltip = (event: MouseEvent, point: any, dataName: string, value: number, axis: 'left' | 'right') => {
  const rect = (event.target as Element).getBoundingClientRect()
  tooltip.value = {
    show: true,
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY - 40,
    date: `${point.label} (${point.dateLabel})`,
    dataName,
    value,
    unit: axis === 'left' ? dataProvider.left.unit : (dataProvider.right?.unit || '')
  }
}

// 隱藏提示框
const hideTooltip = () => {
  tooltip.value.show = false
}
</script>

