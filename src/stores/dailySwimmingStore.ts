import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { computed } from "vue";

const UNIT = '里程數(公尺)'

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
  const lastProgressBeforeAdd = ref(0);
  const lastSwimmingIncrement = ref(0);

  const maxScoreBefore = computed(() => {
    const beforeScores = Object.values(dailySwimmingDistance.value).slice(0, -1)
    return Math.max(...beforeScores)
  })

  const todayProgress = computed(() => {
    const todayKey = getTodayKey()
    const todayScore = dailySwimmingDistance.value[todayKey]
    return (todayScore / maxScoreBefore.value) * 100
  })

  const accDailySwimmingDistance = computed(() => {
    const scores: { [key: string]: number } = {}
    Object.entries(dailySwimmingDistance.value).reduce((acc, cur, ind, arr) => {
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

  const BASE_DISTANCE = 1500
  const BASE_DURATION = 60

  const addDistance = (distance: number, duration: number) => {
    // 保存添加前的進度
    lastProgressBeforeAdd.value = todayProgress.value || 0;

    const baseSpeed = BASE_DISTANCE / BASE_DURATION
    const actualSpeed = distance / duration
    const speedRatio = actualSpeed / baseSpeed
    const adjustedDistance = distance * speedRatio

    const today = getTodayKey()
    dailySwimmingDistance.value[today] = (dailySwimmingDistance.value[today] || 0) + Number(adjustedDistance)

    // 計算添加後的進度
    const currentProgress = todayProgress.value || 0;

    // 計算本次添加的增量
    lastSwimmingIncrement.value = currentProgress - lastProgressBeforeAdd.value;
  }

  // 計算最後一次添加游泳的增量
  const todayProgressIncrease = computed(() => {
    // 返回最後一次添加游泳的增量
    return lastSwimmingIncrement.value > 0 ? lastSwimmingIncrement.value : 0;
  });

  const getScoreByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return accDailySwimmingDistance.value[dateKey] || 0;
  }

  const clearAllHistory = () => {
    dailySwimmingDistance.value = {}
  }

  onMounted(() => {
    const todayKey = getTodayKey()
    if (dailySwimmingDistance.value[todayKey] === undefined) {
      dailySwimmingDistance.value[todayKey] = 0
    }
  })

  return {
    dailySwimmingDistance,
    addDistance,
    accDailySwimmingDistance,
    getScoreByDate,
    clearAllHistory,
    todayProgress,
    todayProgressIncrease,
    UNIT
  };
},
  {
    persist: useMockData ? false : { // 不使用假資料時啟用持久化存儲
      serializer: {
        serialize: (state: any) => {
          return JSON.stringify({
            ...state,
            startTime: state.startTime?.toISOString() || null,
            endTime: state.endTime?.toISOString() || null
          })
        },
        deserialize: (value: any) => {
          const parsed = JSON.parse(value)
          return {
            ...parsed,
            startTime: parsed.startTime ? new Date(parsed.startTime) : null,
            endTime: parsed.endTime ? new Date(parsed.endTime) : null
          }
        }
      }
    }
  } as any
)

