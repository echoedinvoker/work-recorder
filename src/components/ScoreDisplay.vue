<template>
  <div v-if="isRecording" class="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4"> <!-- 僅在 working 時顯示 -->
    <!-- 當前累積分數 -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-blue-800 mb-2">累積分數</h3>
      <div class="text-3xl font-bold text-blue-600">{{ score }}</div> <!-- 當前累積分數 -->
      <div class="text-sm text-gray-600 mt-1">{{ workDuration }}</div> <!-- 當前累積的工作時間 -->
    </div>

    <!-- 進度條顯示距離下個分數的時間 -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>距離下個分數</span>
        <!-- 第一個分數至少要累積五分鐘工作時間才會獲得, 例如工作累積時間 3 分鐘, 會顯示距離下個分數 2 分鐘 -->
        <!-- 之後每超過半小時(從0分鐘計算)就會獲得一分數, 例如工作累積時間 8 分鐘, 會顯示距離下個分數 22 分鐘 -->
        <!-- 如果工作時間 32 分鐘, 會顯示距離下個分數 28 分鐘 -->
        <span>{{ minutesToNextScore}}分鐘</span>
      </div>
      
      <!-- 進度條 -->
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <!-- 如果是工作累積時間 3 分鐘, 則進度條寬度為 3/5 = 60% -->
        <!-- 如果是工作累積時間 8 分鐘, 則進度條寬度為 8/30 = 26.67% -->
        <!-- 如果是工作累積時間 32 分鐘, 則進度條寬度為 2/30 = 106.67% -->
        <div 
          class="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        >
          <!-- 動畫效果 -->
          <div class="h-full bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>
      
      <!-- 分數里程碑指示器 -->
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <!-- 當前累積分數 -->
        <span>{{ score }}分</span>
        <!-- 下一個分數(當前累積分數+1) -->
        <span>{{ score + 1 }}分</span>
      </div>
    </div>

    <!-- 預計完成時間 -->
    <div class="text-center text-sm text-gray-600 bg-white rounded p-2">
      <span class="font-medium">預計達成下個分數時間:</span>
      <br>
      <!-- 假設工作開始時間為上午 03:38:22, 工作累積時間為 2 分鐘, 則預計達成下個分數時間為上午 03:43:22 -->
      <!-- 假設工作開始時間為上午 03:38:22, 工作累積時間為 8 分鐘, 則預計達成下個分數時間為上午 04:08:22 -->
      <span class="text-blue-600 font-mono">{{ formatTime(estimatedNextScoreTime) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder'

// 使用 composable 獲取所有需要的資料和方法
const {
  isRecording,
  workDuration,
  score,
  minutesToNextScore,
  progressPercentage,
  estimatedNextScoreTime,
  formatTime
} = useRecorder()
</script>
