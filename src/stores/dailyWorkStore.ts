import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'

const UNIT = '分數'
const TARGET = 6 
const SECONDARY_TARGET = 4 // 次要目標分數

const generateMockData = () => {
  const mockData: Record<string, number> = {}
  const today = new Date()

  // 生成過去 7 天的假資料
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateToKey(date)

    // 隨機分數 0-8
    mockData[dateKey] = Math.floor(Math.random() * 9)
  }

  return mockData
}

// 檢查是否使用假資料
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyWorkStore = defineStore('dailyWork', () => {
  // 狀態管理
  const isRecording = ref(false)
  const isDisplayingResult = ref(false)
  const startTime = ref<Date | null>(null)
  const endTime = ref<Date | null>(null)
  const lastProgressBeforeAdd = ref(0);
  const lastScoreIncrement = ref(0);

  // 初始化資料 - 根據環境變數決定使用真實或假資料
  const dailyScores = ref<Record<string, number>>(
    useMockData ? generateMockData() : {}
  )

  const earliestDateKey = computed(() => {
    const dateKeys = Object.keys(dailyScores.value)
    if (dateKeys.length === 0) {
      return getTodayKey()
    }
    return dateKeys.sort()[0]
  })

  const todayProgress = computed(() => {
    const todayKey = getTodayKey()
    const todayScore = dailyScores.value[todayKey]
    return (todayScore/TARGET) * 100
  })

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    let currentScore = 0
    let currentDate = new Date(earliestDateKey.value)
    while (formatDateToKey(currentDate) <= getTodayKey()) {
      const dateKey = formatDateToKey(currentDate)
      if (dailyScores.value[dateKey] === undefined || dailyScores.value[dateKey] < SECONDARY_TARGET) {
        currentScore = Math.max(0, currentScore - 1)
      } else if (dailyScores.value[dateKey] < TARGET) {
        currentScore += 1
      } else {
        currentScore += 2
      }
      scores[dateKey] = currentScore
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return scores
  })

  // 今日總分數
  const todayScore = computed(() => {
    const today = getTodayKey()
    return dailyScores.value[today] || 0
  })

  // 添加分數到今日
  const addScore = (score: number) => {
    // 保存添加前的進度
    lastProgressBeforeAdd.value = todayProgress.value || 0;

    const today = getTodayKey()
    dailyScores.value[today] = (dailyScores.value[today] || 0) + Number(score)

    // 計算添加後的進度
    const currentProgress = todayProgress.value || 0;
    
    // 計算本次添加的增量
    lastScoreIncrement.value = currentProgress - lastProgressBeforeAdd.value;
  }

  const todayProgressIncrease = computed(() => {
    // 返回最後一次添加分數的增量
    return lastScoreIncrement.value > 0 ? lastScoreIncrement.value : 0;
  });

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
    todayProgress,
    todayProgressIncrease,
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

