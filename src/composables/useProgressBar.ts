import { ref, computed } from "vue";

export interface DataProvider {
  ratio: number; // 0 to 1, current progress ratio
  ratioIncrement: number; // 0 to 1, progress ratio increments
  thresholds: readonly {
    value: number; // 0 to 1
    color: string; // CSS color
    message: string; // Description
  }[];
}

export function useProgressBar(dataProvider: DataProvider) {
  // 支援響應式和非響應式的 dataProvider
  const provider = ref(dataProvider)
  
  // 計算當前進度百分比
  const currentProgress = computed(() => {
    return Math.min(Math.max(provider.value.ratio * 100, 0), 100)
  })
  
  // 計算增量百分比
  const incrementProgress = computed(() => {
    return Math.min(Math.max(provider.value.ratioIncrement * 100, 0), 100)
  })
  
  // 計算基礎進度（不包含增量）
  const baseProgress = computed(() => {
    return Math.max(currentProgress.value - incrementProgress.value, 0)
  })
  
  // 根據閾值計算當前顏色
  const currentColor = computed(() => {
    const thresholds = [...provider.value.thresholds].sort((a, b) => a.value - b.value)
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (provider.value.ratio >= thresholds[i].value) {
        return thresholds[i].color
      }
    }
    
    // 如果沒有匹配的閾值，返回第一個顏色或預設顏色
    return thresholds[0]?.color || '#3b82f6'
  })
  
  // 計算增量顏色（通常為綠色表示增長）
  const incrementColor = computed(() => {
    return '#10b981' // green-500
  })
  
  // 格式化顯示文字
  const formatProgress = (decimals: number = 1) => {
    return currentProgress.value.toFixed(decimals)
  }
  
  const formatIncrement = (decimals: number = 1) => {
    return incrementProgress.value.toFixed(decimals)
  }
  
  // 檢查是否有增量
  const hasIncrement = computed(() => {
    return incrementProgress.value > 0
  })
  
  // 檢查是否達到特定閾值
  const isThresholdReached = (threshold: number) => {
    return provider.value.ratio >= threshold
  }
  
  // 獲取下一個閾值
  const nextThreshold = computed(() => {
    const thresholds = [...provider.value.thresholds].sort((a, b) => a.value - b.value)
    return thresholds.find(t => t.value > provider.value.ratio)
  })
  
  return {
    // 進度值
    currentProgress,
    incrementProgress,
    baseProgress,
    
    // 顏色
    currentColor,
    incrementColor,
    
    // 格式化方法
    formatProgress,
    formatIncrement,
    
    // 狀態檢查
    hasIncrement,
    isThresholdReached,
    nextThreshold,
    
    // 原始數據
    provider: provider.value
  }
}
