import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'

const UNIT = '分數'

const generateMockData = () => {
  const mockData: Record<string, number> = {}
  const today = new Date()

  // 生成過去 7 天的假資料
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateToKey(date)

    // 隨機分數 0-30
    mockData[dateKey] = Math.floor(Math.random() * 31) // 假資料分數範圍 0-30
  }

  return mockData
}

// 檢查是否使用假資料
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyScoreStore = defineStore('dailyScore', () => {

  // 狀態管理
  const isRecording = ref(false)
  const isDisplayingResult = ref(false)
  const startTime = ref<Date | null>(null)
  const endTime = ref<Date | null>(null)

  // 初始化資料 - 根據環境變數決定使用真實或假資料
  const dailyScores = ref<Record<string, number>>(
    useMockData ? generateMockData() : {}
  )

  // 今日總分數
  const todayScore = computed(() => {
    const today = getTodayKey()
    return dailyScores.value[today] || 0
  })

  // 添加分數到今日
  const addScore = (score: number) => {
    const today = getTodayKey()
    dailyScores.value[today] = (dailyScores.value[today] || 0) + Number(score)
  }

  // 重置今日分數 (用於測試或重置)
  const resetTodayScore = () => {
    const today = getTodayKey()
    dailyScores.value[today] = 0
  }

  // 清空所有歷史紀錄
  const clearAllHistory = () => {
    dailyScores.value = {}
  }

  const getScoreByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return dailyScores.value[dateKey] || 0
  }

  return {
    isRecording,
    isDisplayingResult,
    startTime,
    endTime,
    dailyScores,
    todayScore,
    addScore,
    resetTodayScore,
    clearAllHistory,
    useMockData,
    getScoreByDate,
    UNIT
  }
},
  {
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
  }
)
