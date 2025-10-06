import { useDailyWaterStore } from '@/stores/dailyWaterStore'
import { ref, computed } from 'vue'

export function useWaterRecorder() {
  const dailyWaterStore = useDailyWaterStore()
  
  // 水量輸入
  const waterAmount = ref<number | undefined>(undefined)
  
  // 添加喝水記錄
  const addWaterRecord = () => {
    if (waterAmount.value && waterAmount.value > 0) {
      dailyWaterStore.addRecord(waterAmount.value)
      waterAmount.value = undefined
    }
  }

  return {
    waterAmount,
    addWaterRecord
  }
}

