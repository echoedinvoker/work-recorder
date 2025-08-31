import { ref, computed, onMounted } from 'vue'
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

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    Object.entries(dailyScores.value).reduce((acc, cur, ind, arr) => {
      const slicedArray = arr.slice(0, ind);
      const values = slicedArray.map(v => v[1])
      const maxValue = slicedArray.length === 0 ? 0 : Math.max(...values)
      if (slicedArray.length === 0) {
        if (cur[1] > 0) {
          const value = acc + 10
          scores[cur[0]] = value
          return value
        } else {
          scores[cur[0]] = 0
          return 0
        }
      } else if (cur[1] > maxValue) {
        const value = acc + 10
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.9) {
        const value = acc + 5
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.8) {
        const value = acc
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.7) {
        const value = acc >= 5 ? acc - 5 : 0
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.6) {
        const value = acc >= 10 ? acc - 10 : 0
        scores[cur[0]] = value
        return value
      } else {
        const value = acc >= 15 ? acc - 15 : 0
        scores[cur[0]] = value
        return value
      }
    }, 0)
    return scores
  })

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
    return accDailyScore.value[dateKey] || 0
  }

  onMounted(() => {
    const today = getTodayKey()
    if (dailyScores.value[today] === undefined) {
      dailyScores.value[today] = 0
    }
  })

  return {
    isRecording,
    isDisplayingResult,
    startTime,
    endTime,
    dailyScores,
    accDailyScore,
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
