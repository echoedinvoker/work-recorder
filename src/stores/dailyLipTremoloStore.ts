import { defineStore } from "pinia";
import { ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'

const UNIT = '次數'

const generateMockData = () => {
  const mockData: Record<string, number> = {}
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateToKey(date)

    // 隨機次數 0-10
    mockData[dateKey] = Math.floor(Math.random() * 10)
  }

  return mockData
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useLipTremoloCountStore = defineStore("LipTremoloCount", () => {
  // 使用 Record 存儲日期與對應的顫唇練習次數
  const dailyLipTremoloCount = ref<Record<string, number>>(useMockData ? generateMockData() : {});

  // 增加顫唇練習次數的方法
  const addCount = (count: number = 1) => {
    const today = getTodayKey()
    dailyLipTremoloCount.value[today] = (dailyLipTremoloCount.value[today] || 0) + Number(count)
  }

  // 根據日期獲取顫唇練習次數
  const getCountByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return dailyLipTremoloCount.value[dateKey] || 0;
  }

  return {
    dailyLipTremoloCount,
    addCount,
    getCountByDate,
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

