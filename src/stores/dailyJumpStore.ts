import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { computed } from "vue";
import { calculateScore } from "@/utils/calculateScore";

const UNIT = '次數'

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

export const useDailyJumpStore = defineStore("dailyJump", () => {
  const dailyJumpCounts = ref<Record<string, number>>(useMockData ? generateMockData() : {});
  const lastProgressBeforeAdd = ref(0);
  const lastJumpIncrement = ref(0);
  const scoreMap = new Map<number, number>([
    [1.0, 6], [0.9, 4], [0.8, 2], [0.7, -3]
  ]);

  const maxScoreBefore = computed(() => {
    const beforeScores = Object.values(dailyJumpCounts.value).slice(0, -1)
    return Math.max(...beforeScores)
  })

  const todayProgress = computed(() => {
    const todayKey = getTodayKey()
    const todayScore = dailyJumpCounts.value[todayKey]
    return (todayScore / maxScoreBefore.value) * 100
  })

  const accDailyJumpCounts = computed(() => {
    const scores: { [key: string]: number } = {};

    Object.entries(dailyJumpCounts.value).reduce((acc, cur, ind, arr) => {
      const slicedArray = arr.slice(0, ind);
      const values = slicedArray.map(v => v[1]);
      const maxValue = slicedArray.length === 0 ? 0 : Math.max(...values);

      const value = calculateScore(cur[1], maxValue, acc, scoreMap);
      scores[cur[0]] = value;
      return value;
    }, 0);

    return scores;
  })

  const addCounts = (counts: number) => {
    lastProgressBeforeAdd.value = todayProgress.value || 0;

    const today = getTodayKey()
    dailyJumpCounts.value[today] = (dailyJumpCounts.value[today] || 0) + Number(counts)

    const currentProgress = todayProgress.value || 0;

    lastJumpIncrement.value = currentProgress - lastProgressBeforeAdd.value;
  }

  const todayProgressIncrease = computed(() => {
    return lastJumpIncrement.value > 0 ? lastJumpIncrement.value : 0;
  });

  const getScoreByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return accDailyJumpCounts.value[dateKey] || 0;
  }

  const clearAllHistory = () => {
    dailyJumpCounts.value = {}
  }

  onMounted(() => {
    const todayKey = getTodayKey()
    if (dailyJumpCounts.value[todayKey] === undefined) {
      dailyJumpCounts.value[todayKey] = 0
    }
  })

  return {
    dailyJumpCounts,
    addCounts,
    accDailyJumpCounts,
    getScoreByDate,
    clearAllHistory,
    todayProgress,
    todayProgressIncrease,
    scoreMap,
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

