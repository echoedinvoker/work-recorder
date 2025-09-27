import { defineStore } from "pinia";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { ref, computed } from "vue";

const UNIT = '分數'

const generateMockData = () => {
  const mockData: Record<string, number> = {}
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]

    // 隨機生成分數 (-3, -2, -1, 0, 1, 2, 3)
    const score = Math.floor(Math.random() * 7) - 3
    mockData[dateKey] = score
  }

  return mockData
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyHungryStore = defineStore("dailyHungry", () => {
  const dailyHungryResults = ref<Record<string, number>>(useMockData ? generateMockData() : {});

  const todayResult = computed(() => {
    const today = getTodayKey();
    return dailyHungryResults.value[today];
  })

  const recordResult = (score: number | undefined) => {
    const today = getTodayKey();
    if (score === undefined) {
      delete dailyHungryResults.value[today];
    } else {
      dailyHungryResults.value[today] = score;
    }
  }

  const earliestDateKey = computed(() => {
    const dateKeys = Object.keys(dailyHungryResults.value)
    if (dateKeys.length === 0) {
      return getTodayKey()
    }
    return dateKeys.sort()[0]
  })

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    let currentScore = 0
    let currentDate = new Date(earliestDateKey.value)
    while (formatDateToKey(currentDate) <= getTodayKey()) {
      const dateKey = formatDateToKey(currentDate)
      if (dailyHungryResults.value[dateKey]) {
        currentScore = Math.max(0, currentScore + dailyHungryResults.value[dateKey])
      } else {
        currentScore = Math.max(0, currentScore - 1)
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

  const getScoreByDate = (date: Date): number => {
    const dateKey = formatDateToKey(date);
    return accDailyScore.value[dateKey] || 0;
  };
  const clearAllHistory = () => {
    dailyHungryResults.value = {};
  }

  return {
    dailyHungryResults,
    todayResult,
    recordResult,
    accDailyScore,
    scoreDifference,
    getScoreByDate,
    clearAllHistory,
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
