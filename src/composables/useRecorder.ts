import { ref, computed } from 'vue'

// 狀態管理
const isRecording = ref(false)
const startTime = ref<Date | null>(null)
const endTime = ref<Date | null>(null)

export function useRecorder() {
  // 切換計時器狀態
  const toggleTimer = () => {
    if (!isRecording.value) {
      // 開始記錄
      startTime.value = new Date()
      endTime.value = null
      isRecording.value = true
    } else {
      // 結束記錄
      endTime.value = new Date()
      isRecording.value = false
    }
  }

  // 計算工作時長（分鐘）
  const workDurationMinutes = computed(() => {
    if (!startTime.value || !endTime.value) return 0
    return Math.floor((endTime.value.getTime() - startTime.value.getTime()) / (1000 * 60))
  })

  // 格式化工作時長顯示
  const workDuration = computed(() => {
    const minutes = workDurationMinutes.value
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours} 小時 ${remainingMinutes} 分鐘`
    }
    return `${minutes} 分鐘`
  })

  // 計算分數：以半小時為一分，不足半小時計1分，超過半小時不足一小時2分，以此類推
  const score = computed(() => {
    const minutes = workDurationMinutes.value
    // 五分以內結束不計分
    if (minutes < 5) return 0

    // 每30分鐘為一個計分單位
    const halfHourUnits = Math.ceil(minutes / 30)
    return halfHourUnits
  })

  // 格式化時間顯示
  const formatTime = (date: Date) => {
    if (!date) return ''
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Taipei'
    })
  }

  return {
    isRecording,
    startTime,
    endTime,
    toggleTimer,
    workDuration,
    workDurationMinutes,
    score,
    formatTime
  }
}
