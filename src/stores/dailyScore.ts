import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const generateMockData = () => {
  const mockData: Record<string, number> = {}
  const today = new Date()
  
  // 生成過去 7 天的假資料
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'Asia/Taipei'
    }).replace(/\//g, '-')
    
    // 隨機分數 0-100
    mockData[dateKey] = Math.floor(Math.random() * 101)
  }
  
  return mockData
}

// 檢查是否使用假資料
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyScoreStore = defineStore('dailyScore', () => {

  // 狀態管理
  const isRecording = ref(false)
  const startTime = ref<Date | null>(null)
  const endTime = ref<Date | null>(null)

  // 初始化資料 - 根據環境變數決定使用真實或假資料
  const dailyScores = ref<Record<string, number>>(
    useMockData ? generateMockData() : {}
  )
  
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
    resetTodayScore,
    useMockData
  }
}, {
  persist: useMockData ? false : { // 不使用假資料時啟用持久化存儲
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
