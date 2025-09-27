import { useActivityStore } from "@/composables/useActivityStore";
import { defineStore } from "pinia";
import { 
  SCORING_CONSTANTS, 
} from "@/constants/scoringConstants";
import { formatDateToKey, getTodayKey } from "@/utils/dateUtils";

interface NoSugarRecord {
  level: number; // 戒糖程度，範圍 -2 到 2
}

export const useDailyNoSugarStore = defineStore("dailyNoSugar", () => {
  const baseStore = useActivityStore<NoSugarRecord>({
    title: "飲控",
    initialScore: SCORING_CONSTANTS.COMMON.DEFAULT_SUCCESS_BONUS,
    absencePenalty: SCORING_CONSTANTS.COMMON.DEFAULT_DAILY_PENALTY,
    getScoreChange: () => 0,
    calculateWeightedRecord: () => 0,
    chartConfig: {
      left: {
        unit: "分",
        data: {
          '分數': {
            getValueByDate: (date: Date) => baseStore.getScoreByDate(date),
            getValueByWeek: (week: Date) => baseStore.getScoreByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getScoreByMonth(month)
          }
        }
      },
      right: {
        unit: "程度",
        data: {
          '飲控狀況': {
            getValueByDate: (date: Date) => baseStore.getRawRecordByDate(date)?.level,
            getValueByWeek: (week: Date) => baseStore.getWeightedRecordByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getWeightedRecordByMonth(month)
          }
        },
        formatValue: (level: number) => {
          switch(level) {
            case 2: return '嚴守紀律';
            case 1: return '大致遵守';
            case -1: return '偶爾放縱';
            case -2: return '完全失控';
            default: return '';
          }
        }
      }
    },
    thresholds: []
  })

  const recordNoSugarLevel = (level: number) => {
    const todayKey = getTodayKey()
    baseStore.records.value[todayKey] = { level }

    // 填補缺失的分數記錄
    const lastScoreDateKey = Object.keys(baseStore.scores.value)
      .filter(key => key !== todayKey)
      .sort()
      .pop()

    if (lastScoreDateKey) {
      let startScore = baseStore.scores.value[lastScoreDateKey]
      for (let date = new Date(lastScoreDateKey); formatDateToKey(date) < todayKey; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateToKey(date)
        if (!baseStore.scores.value[dateKey]) {
          baseStore.scores.value[dateKey] = Math.max(
            SCORING_CONSTANTS.COMMON.MIN_SCORE,
            startScore + SCORING_CONSTANTS.COMMON.DEFAULT_DAILY_PENALTY
          )
        }
      }
    } else {
      // 設置昨日分數0
      const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
      baseStore.scores.value[yesterdayKey] = 0;
    }

    const lastDateKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    const scoreChange = level * 5 // 每個戒糖等級變化對應5分變化
    const baseScore = baseStore.scores.value[lastDateKey] || 0

    baseStore.scores.value[todayKey] = Math.max(
      SCORING_CONSTANTS.COMMON.MIN_SCORE,
      baseScore + scoreChange
    )
  }

  return {
    ...baseStore,
    recordNoSugarLevel
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})

