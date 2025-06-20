import { ref, computed } from 'vue'
import { useDailyScoreStore } from '@/stores/dailyScore' // 新增

const currentTime = ref(Date.now()) // 添加響應式的當前時間

let intervalId: number | null = null

export function useRecorder() {
  const dailyScoreStore = useDailyScoreStore()

  // 啟動定時器更新當前時間
  const startTimeUpdater = () => {
    if (intervalId) return
    intervalId = setInterval(() => {
      if (dailyScoreStore.isRecording) {
        currentTime.value = Date.now() // 每秒更新當前時間
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

  // 切換計時器狀態
  const toggleTimer = () => {
    if (!dailyScoreStore.isRecording) {
      // 開始記錄
      dailyScoreStore.startTime = new Date()
      dailyScoreStore.endTime = null
      dailyScoreStore.isRecording = true
      currentTime.value = Date.now() // 立即更新當前時間
      startTimeUpdater() // 啟動定時器
    } else {
      // 結束記錄
      dailyScoreStore.endTime = new Date()
      dailyScoreStore.isRecording = false
      stopTimeUpdater() // 停止定時器

      // 將獲得的分數添加到每日總分
      if (score.value > 0) {
        dailyScoreStore.addScore(score.value)
      }
    }
  }

  // 計算工作時長（分鐘）
  const workDurationMinutes = computed(() => {
    if (!dailyScoreStore.startTime) return 0

    const endOrNow = dailyScoreStore.endTime
      ? dailyScoreStore.endTime.getTime()
      : currentTime.value

    return Math.floor((endOrNow - dailyScoreStore.startTime.getTime()) / (1000 * 60))
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

  // 計算分數：第一個分數需要5分鐘，之後每30分鐘一分
  const score = computed(() => {
    const minutes = workDurationMinutes.value
    if (minutes < 5) return 0 // 五分以內不計分

    // 第一個分數：5分鐘
    if (minutes < 30) return 1

    // 之後每30分鐘一分：30分=2分, 60分=3分, 90分=4分...
    return Math.floor(minutes / 30) + 1
  })

  // 計算距離下個分數的時間（分鐘）
  const minutesToNextScore = computed(() => {
    const minutes = workDurationMinutes.value
    if (minutes < 5) return 5 - minutes // 距離第一個分數

    // 計算距離下個30分鐘里程碑的時間
    const nextMilestone = Math.ceil(minutes / 30) * 30
    return nextMilestone - minutes
  })

  // 計算進度條百分比
  const progressPercentage = computed(() => {
    const minutes = workDurationMinutes.value
    if (minutes < 5) {
      // 第一個分數進度：0-5分鐘
      return (minutes / 5) * 100
    }

    // 30分鐘週期內的進度
    const cycleProgress = minutes % 30
    return (cycleProgress / 30) * 100
  })

  // 計算預計達成下個分數的時間
  const estimatedNextScoreTime = computed(() => {
    if (!dailyScoreStore.startTime) return null

    const minutesNeeded = minutesToNextScore.value
    const estimatedTime = new Date(dailyScoreStore.startTime.getTime() + (workDurationMinutes.value + minutesNeeded) * 60 * 1000)
    return estimatedTime
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
    isRecording: computed(() => dailyScoreStore.isRecording),
    startTime: computed(() => dailyScoreStore.startTime),
    endTime: computed(() => dailyScoreStore.endTime),
    toggleTimer,
    workDuration,
    workDurationMinutes,
    score,
    minutesToNextScore,
    progressPercentage,
    estimatedNextScoreTime,
    formatTime,
    todayTotalScore: computed(() => dailyScoreStore.todayScore) // 新增：暴露今日總分
  }
}
