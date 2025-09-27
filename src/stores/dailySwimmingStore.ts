import { defineStore } from "pinia";
import { ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { computed } from "vue";

const UNIT = '分數'

const generateMockData = () => {
  const mockData: Record<string, number> = {}
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateToKey(date)

    // 隨機分數 0-30
    mockData[dateKey] = Math.floor(Math.random() * 500)
  }

  return mockData
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailySwimmingStore = defineStore("dailySwimming", () => {
  const dailySwimmingDistance = ref<Record<string, number>>(useMockData ? generateMockData() : {});

  const earliestDateKey = computed(() => {
    const dateKeys = Object.keys(dailySwimmingDistance.value)
    if (dateKeys.length === 0) {
      return getTodayKey()
    }
    return dateKeys.sort()[0]
  })

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    const collectedWeightedDistances: number[] = []
    let currentScore = 0
    let currentDate = new Date(earliestDateKey.value)
    while (formatDateToKey(currentDate) <= getTodayKey()) {
      const dateKey = formatDateToKey(currentDate)
      if (dailySwimmingDistance.value[dateKey]) {
        if (collectedWeightedDistances.length === 0 && dailySwimmingDistance.value[dateKey] >= 1000) {
          currentScore += 3
        } else {
          const maxWeightedDistance = Math.max(...collectedWeightedDistances)
          const ratio = dailySwimmingDistance.value[dateKey] / maxWeightedDistance
          if (ratio >= 1) {
            currentScore += 3
          } else if (ratio >= 0.9) {
            currentScore += 2
          } else if (ratio >= 0.8) {
            currentScore += 1
          } else if (ratio >= 0.7) {
            currentScore += 0
          } else if (ratio >= 0.6) {
            currentScore = Math.max(0, currentScore - 1)
          } else {
            currentScore = Math.max(0, currentScore - 2)
          }
        }
        collectedWeightedDistances.push(dailySwimmingDistance.value[dateKey])
      } else {
        currentScore = Math.max(0, currentScore - 2)
      }
      scores[dateKey] = currentScore
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return scores
  })

  const scoreDifference = computed(() => {
    const scoreEntries = Object.entries(accDailyScore.value);

    // 按日期排序
    scoreEntries.sort((a, b) => a[0].localeCompare(b[0]));

    // 取得最後兩個分數
    const latestScore = scoreEntries[scoreEntries.length - 1][1];
    const previousScore = scoreEntries.length < 2 ? 0 : scoreEntries[scoreEntries.length - 2][1];

    // 計算差距
    return latestScore - previousScore;
  });

  const addDistance = (weightedDistance: number) => {
    const today = getTodayKey()
    dailySwimmingDistance.value[today] = weightedDistance
  }

  const getScoreByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return accDailyScore.value[dateKey] || 0
  }

  const clearAllHistory = () => {
    dailySwimmingDistance.value = {}
  }

  return {
    dailySwimmingDistance,
    accDailyScore,
    scoreDifference,
    addDistance,
    getScoreByDate,
    clearAllHistory,
    UNIT
  };
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

