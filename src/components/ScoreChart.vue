<template>
  <div
    class="bg-white rounded-lg shadow-md p-6"
    v-if="!dailyScoreStore.isRecording &&  !dailyScoreStore.isDisplayingResult" >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">近七日分數趨勢</h3>
    
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
                {{ item.score }}分
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
          <div>{{ item.dayLabel }}</div>
          <div class="text-gray-400">{{ item.dateLabel }}</div>
        </div>
      </div>
    </div>
    
    <!-- 統計資訊 -->
    <div class="flex justify-between text-sm text-gray-600 pt-4 border-t">
      <div>
        <span class="text-gray-500">平均分數:</span>
        <span class="font-medium ml-1">{{ averageScore }}分</span>
      </div>
      <div>
        <span class="text-gray-500">最高分數:</span>
        <span class="font-medium ml-1">{{ maxScore }}分</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDailyScoreStore } from '@/stores/dailyScore'

const dailyScoreStore = useDailyScoreStore()

// 長條圖區域高度 (h-48 = 192px)
const chartHeight = 192

// 計算圖表數據 (最近7天)
const chartData = computed(() => {
  const data = []
  const today = new Date()
  
  // 生成最近7天的數據
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 格式化日期作為 key (YYYY-MM-DD)
    const dateKey = date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'Asia/Taipei'
    }).replace(/\//g, '-')
    
    // 獲取該日分數
    const score = dailyScoreStore.dailyScores[dateKey] || 0
    
    // 格式化顯示標籤
    const dayLabel = i === 0 ? '今天' : 
                    i === 1 ? '昨天' : 
                    date.toLocaleDateString('zh-TW', { weekday: 'short' })
    
    const dateLabel = date.toLocaleDateString('zh-TW', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    data.push({
      date: dateKey,
      score,
      dayLabel,
      dateLabel
    })
  }
  
  return data
})

// 動態計算 Y 軸最大值
const yAxisMax = computed(() => {
  const maxDataScore = Math.max(...chartData.value.map(item => item.score), 0)
  // 設定合理的上限，至少為 10，並向上取整到 5 的倍數
  const minMax = 10
  const calculatedMax = Math.max(maxDataScore * 1.2, minMax)
  return Math.ceil(calculatedMax / 5) * 5
})

// 計算平均分數
const averageScore = computed(() => {
  const scores = chartData.value.map(item => item.score)
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return scores.length > 0 ? Math.round(sum / scores.length) : 0
})

// 計算最高分數
const maxScore = computed(() => {
  const scores = chartData.value.map(item => item.score)
  return scores.length > 0 ? Math.max(...scores) : 0
})
</script>
