<template>
  <div v-if="isRecording" class="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
    <!-- 當前累積分數 -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-blue-800 mb-2">累積分數</h3>
      <div class="text-3xl font-bold text-blue-600">{{ currentScore }}</div>
      <div class="text-sm text-gray-600 mt-1">{{ formatCurrentDuration }}</div>
    </div>

    <!-- 進度條顯示距離下個分數的時間 -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>距離下個分數</span>
        <span>{{ timeToNextScore }}</span>
      </div>
      
      <!-- 進度條 -->
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
        <span>{{ currentScore }}分</span>
        <span>{{ currentScore + 1 }}分</span>
      </div>
    </div>

    <!-- 預計完成時間 -->
    <div class="text-center text-sm text-gray-600 bg-white rounded p-2">
      <span class="font-medium">預計達成下個分數時間:</span>
      <br>
      <span class="text-blue-600 font-mono">{{ estimatedNextScoreTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRecorder } from '@/composables/useRecorder'

const { isRecording, startTime } = useRecorder()

// 即時更新的當前時間
const currentTime = ref(new Date())
let intervalId: number | null = null

// 每秒更新當前時間
onMounted(() => {
  intervalId = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// 計算當前已工作的分鐘數
const currentWorkMinutes = computed(() => {
  if (!startTime.value || !isRecording.value) return 0
  return Math.floor((currentTime.value.getTime() - startTime.value.getTime()) / (1000 * 60))
})

// 計算當前累積分數
const currentScore = computed(() => {
  const minutes = currentWorkMinutes.value
  if (minutes < 5) return 0 // 五分以內不計分
  return Math.ceil(minutes / 30) // 每30分鐘一分
})

// 格式化當前工作時長
const formatCurrentDuration = computed(() => {
  const minutes = currentWorkMinutes.value
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}小時${remainingMinutes}分鐘`
  }
  return `${minutes}分鐘`
})

// 計算距離下個分數還需要的時間
const minutesToNextScore = computed(() => {
  const minutes = currentWorkMinutes.value
  if (minutes < 5) return 5 - minutes // 還需要多少分鐘才能開始計分
  
  const nextScoreMinutes = (currentScore.value + 1) * 30
  return nextScoreMinutes - minutes
})

// 格式化距離下個分數的時間
const timeToNextScore = computed(() => {
  const minutes = minutesToNextScore.value
  if (minutes <= 0) return '已達成!'
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}小時${remainingMinutes}分鐘`
  }
  return `${minutes}分鐘`
})

// 計算進度百分比
const progressPercentage = computed(() => {
  const minutes = currentWorkMinutes.value
  if (minutes < 5) {
    // 前5分鐘的進度
    return (minutes / 5) * 100
  }
  
  // 計算在當前30分鐘區間內的進度
  const currentInterval = Math.floor(minutes / 30)
  const minutesInCurrentInterval = minutes - (currentInterval * 30)
  return (minutesInCurrentInterval / 30) * 100
})

// 預計達成下個分數的時間
const estimatedNextScoreTime = computed(() => {
  if (!startTime.value || minutesToNextScore.value <= 0) return '--:--:--'
  
  const estimatedTime = new Date(currentTime.value.getTime() + minutesToNextScore.value * 60 * 1000)
  return estimatedTime.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})
</script>
