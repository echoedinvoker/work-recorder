import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDailyScoreStore = defineStore('dailyScore', () => {
  // 狀態管理
  const isRecording = ref(false)
  const startTime = ref<Date | null>(null)
  const endTime = ref<Date | null>(null)

  // 儲存每日分數記錄 { date: score }
  const dailyScores = ref<Record<string, number>>({})
  
  // 獲取今日日期字串 (YYYY-MM-DD)
  const getTodayKey = () => {
    return new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'Asia/Taipei'
    }).replace(/\//g, '-')
  }
  
  // 今日總分數
  const todayScore = computed(() => {
    const today = getTodayKey()
    return dailyScores.value[today] || 0
  })
  
  // 添加分數到今日
  const addScore = (score: number) => {
    const today = getTodayKey()
    dailyScores.value[today] = (dailyScores.value[today] || 0) + score
  }
  
  // 重置今日分數 (用於測試或重置)
  const resetTodayScore = () => {
    const today = getTodayKey()
    dailyScores.value[today] = 0
  }
  
  return { 
    isRecording,
    startTime,
    endTime,
    dailyScores, 
    todayScore, 
    addScore, 
    resetTodayScore 
  }
}, {
  persist: {
    // 自定義序列化處理 Date 物件
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          startTime: state.startTime?.toISOString() || null,
          endTime: state.endTime?.toISOString() || null
        })
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value)
        return {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
          endTime: parsed.endTime ? new Date(parsed.endTime) : null
        }
      }
    }
  }
})
