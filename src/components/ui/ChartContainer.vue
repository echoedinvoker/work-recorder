<template>
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
              {{ item.score }}分{{ showCumulativeLabel ? '(累積)' : '' }}
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
</template>

<script setup lang="ts">
// 定義圖表數據項的類型
interface ChartDataItem {
  date: Date;
  score: number;
  label: string;
  dateLabel: string;
}

// 定義組件的 props
defineProps<{
  chartData: ChartDataItem[];
  yAxisMax: number;
  chartHeight: number;
  showCumulativeLabel: boolean;
}>();
</script>

