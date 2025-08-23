import { defineStore } from "pinia";
import { ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'

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

  const BASE_DISTANCE = 1500
  const BASE_DURATION = 60

  const addDistance = (distance: number, duration: number) => {
    const baseSpeed = BASE_DISTANCE / BASE_DURATION
    const actualSpeed = distance / duration
    const speedRatio = actualSpeed / baseSpeed
    const adjustedDistance = distance * speedRatio

    const today = getTodayKey()
    dailySwimmingDistance.value[today] = (dailySwimmingDistance.value[today] || 0) + Number(adjustedDistance)
  }

  const getScoreByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return dailySwimmingDistance.value[dateKey] || 0;
  }

  const clearAllHistory = () => {
    dailySwimmingDistance.value = {}
  }

  return {
    dailySwimmingDistance,
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

