<template>
  <div
    class="bg-white rounded-lg shadow-md p-6 cursor-pointer select-none"
    v-if="!dailyScoreStore.isRecording &&  !dailyScoreStore.isDisplayingResult"
    @click="toggleChartPeriod"
  >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      {{ chartTitle }}
      <span class="text-sm text-gray-500 ml-2">(點擊切換)</span>
    </h3>
    
    <!-- 圖表容器 -->
    <div class="relative mb-4">
      <!-- Y軸標籤 - 只對應長條圖區域 -->
      <div class="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 pr-2">
        <span>{{ yAxisMax }}</span>
        <span>{{ Math.round(yAxisMax * 0.67) }}</span>
        <span>{{ Math.round(yAxisMax * 0.33) }}</span>
        <span>0</span>
      </div>
      
      <!-- 長條圖區域 - 固定高度，不包含日期標籤 -->
      <div class="ml-8 h-48 flex items-end justify-between space-x-1">
        <div 
          v-for="(item, index) in chartData" 
          :key="index"
          class="flex flex-col items-center flex-1"
        >
          <!-- 長條圖 -->
          <div class="w-full flex justify-center">
            <div 
              class="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 relative group"
              :style="{ 
                height: `${(item.score / yAxisMax) * chartHeight}px`, 
                width: '24px',
                minHeight: item.score > 0 ? '4px' : '0px'
              }"
            >
              <!-- 分數提示 -->
              <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {{ item.score }}分{{ currentPeriod !== 'day' ? '(累積)' : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 日期標籤區域 - 獨立於長條圖區域 -->
      <div class="ml-8 flex justify-between space-x-1 mt-2">
        <div 
          v-for="(item, index) in chartData" 
          :key="`label-${index}`"
          class="flex-1 text-xs text-gray-600 text-center"
        >
          <div>{{ item.label }}</div>
          <div class="text-gray-400">{{ item.dateLabel }}</div>
        </div>
      </div>
    </div>
    
    <!-- 統計資訊 -->
    <div class="flex justify-between text-sm text-gray-600 pt-4 border-t">
      <div>
        <span class="text-gray-500">平均分數:</span>
        <span class="font-medium ml-1">{{ avgScore }}分</span>
      </div>
      <div>
        <span class="text-gray-500">最高{{ currentPeriod === 'day' ? '分數' : '累積' }}:</span>
        <span class="font-medium ml-1">{{ maxScore }}分</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChart } from '@/composables/useChart';
import { useDailyScoreStore } from '@/stores/dailyScore';

const dailyScoreStore = useDailyScoreStore()
const {
  chartHeight,
  currentPeriod,
  toggleChartPeriod,
  chartTitle,
  chartData,
  yAxisMax,
  avgScore,
  maxScore
} = useChart()
</script>

