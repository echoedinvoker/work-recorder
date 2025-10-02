import { useDailySwimmingStore } from '@/stores/dailySwimmingStore'
import { ref, computed } from 'vue'

const currentTime = ref(Date.now())
let intervalId: number | null = null

const isRecording = ref(false)
const startTime = ref<Date | null>(null)
const endTime = ref<Date | null>(null)
const distance = ref<number | undefined>(undefined)

export function useSwimmingRecorder() {
  const dailySwimmingStore = useDailySwimmingStore()
  
  // 添加狀態管理
  
  // 啟動定時器更新當前時間
  const startTimeUpdater = () => {
    if (intervalId) return
    intervalId = setInterval(() => {
      if (isRecording.value) {
        currentTime.value = Date.now()
      }
    }, 1000)
  }

  // 停止定時器
  const stopTimeUpdater = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // 開始計時
  const startTimer = () => {
    startTime.value = new Date()
    endTime.value = null
    isRecording.value = true
    currentTime.value = Date.now()
    startTimeUpdater()
  }
  
  // 結束計時
  const stopTimer = () => {
    if (!isRecording.value) return
    
    endTime.value = new Date()
    isRecording.value = false
    stopTimeUpdater()
    
    // 如果有輸入距離，則添加記錄
    if (distance.value && startTime.value) {
      const durationMinutes = Math.floor(
        (endTime.value.getTime() - startTime.value.getTime()) / (1000 * 60)
      )
      dailySwimmingStore.addRecord(distance.value, durationMinutes)
      distance.value = undefined
    }
  }
  
  // 計算游泳時長（分鐘）
  const swimmingDurationMinutes = computed(() => {
    if (!startTime.value) return 0

    const endOrNow = endTime.value
      ? endTime.value.getTime()
      : currentTime.value

    return Math.floor((endOrNow - startTime.value.getTime()) / (1000 * 60))
  })

  // 格式化游泳時長顯示
  const swimmingDuration = computed(() => {
    const minutes = swimmingDurationMinutes.value
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours} 小時 ${remainingMinutes} 分鐘`
    }
    return `${minutes} 分鐘`
  })
  
  // 格式化時間顯示
  const formatTime = (date: Date | null) => {
    if (!date) return ''

    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Taipei'
    })
  }

  return {
    isRecording: computed(() => isRecording.value),
    startTime: computed(() => startTime.value),
    endTime: computed(() => endTime.value),
    distance,
    startTimer,
    stopTimer,
    swimmingDuration,
    swimmingDurationMinutes,
    formatTime,
  }
}

