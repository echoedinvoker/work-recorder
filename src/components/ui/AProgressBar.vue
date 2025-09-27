<template>
  <!-- Card 包覆樣式，與 LineChart 一致 -->
  <div class="bg-white rounded-lg shadow-md p-6 select-none">
    <!-- 進度條主體 -->
    <div class="space-y-4">
      <!-- 數值顯示區域 -->
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-gray-800">
            {{ formattedValue }}
          </span>
          <span class="text-lg text-gray-500">%</span>

          <!-- 增量顯示 -->
          <div v-if="hasIncrement" class="flex items-center gap-1 ml-2">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-semibold text-green-600">
              +{{ formattedIncrement }}%
            </span>
          </div>
        </div>

        <!-- 狀態指示器 -->
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: progressColor }"></div>
          <span class="text-sm text-gray-600">
            {{ getStatusMessage() }}
          </span>
        </div>
      </div>

      <!-- 進度條容器 -->
      <div class="relative">
        <!-- 進度條背景 -->
        <div class="w-full bg-gray-100 rounded-r-full h-4 shadow-inner overflow-hidden">
          <!-- 基本進度條 -->
          <div class="h-full transition-all duration-500 ease-out relative overflow-hidden" :class="{
            'rounded-r-full': !hasIncrement,  // 只有在沒有增量時右側才有圓角
            'rounded-l-none': true            // 左側永遠沒有圓角
          }" :style="{
              width: `${baseProgress}%`,
              backgroundColor: progressColor
            }">
            <!-- 進度條光澤效果 -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse">
            </div>
          </div>

          <!-- 增量部分 -->
          <div v-if="hasIncrement" class="h-full absolute top-0 rounded-r-full transition-all duration-500 ease-out"
            :style="{
              width: `${incrementValue}%`,
              left: `${baseProgress}%`,
              backgroundColor: incrementColor
            }">
            <!-- 增量光澤效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
          </div>

          <!-- 閾值標記 -->
          <div v-for="threshold in sortedThresholds" :key="threshold.value"
            class="absolute top-0 w-1 h-full bg-white shadow-sm opacity-80 transition-opacity hover:opacity-100"
            :style="{ left: `${threshold.value * 100}%` }" :title="`目標: ${(threshold.value * 100).toFixed(1)}%`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProgressBar, type DataProvider } from '@/composables/useProgressBar'

interface Props {
  dataProvider: DataProvider
  decimals?: number
  showThresholds?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  decimals: 1,
  showThresholds: true
})

// 使用 composable
const {
  currentProgress,
  incrementProgress,
  baseProgress,
  currentColor,
  incrementColor,
  formatProgress,
  formatIncrement,
  hasIncrement
} = useProgressBar(props.dataProvider)

// 計算顯示值
const formattedValue = computed(() => formatProgress(props.decimals))
const formattedIncrement = computed(() => formatIncrement(props.decimals))

// 進度條顏色
const progressColor = computed(() => currentColor.value)

// 增量值
const incrementValue = computed(() => incrementProgress.value)

// 排序後的閾值
const sortedThresholds = computed(() => {
  if (!props.showThresholds) return []
  return [...props.dataProvider.thresholds].sort((a, b) => a.value - b.value)
})

// 根據當前進度獲取狀態訊息
const getStatusMessage = () => {
  const progress = currentProgress.value / 100 // 轉換為 0-1 範圍
  const thresholds = [...props.dataProvider.thresholds].sort((a, b) => b.value - a.value)
  
  // 找到符合當前進度的最高閾值
  for (const threshold of thresholds) {
    if (progress >= threshold.value && threshold.message) {
      return threshold.message
    }
  }
  
  // 如果沒有找到匹配的閾值，返回第一個閾值的訊息
  return thresholds[thresholds.length - 1]?.message || '未開始'
}
</script>
