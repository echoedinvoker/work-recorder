import { useActivityStore } from "@/composables/useActivityStore";
import { defineStore } from "pinia";
import { 
  SCORING_CONSTANTS, 
} from "@/constants/scoringConstants";
import { formatDateToKey, getTodayKey } from "@/utils/dateUtils";

interface HungryRecord {
  level: number; // 飢餓等級，範圍 -2 到 2
}

export const useDailyHungryStore = defineStore("dailyHungry", () => {
  const baseStore = useActivityStore<HungryRecord>({
    title: "飢餓",
    initialScore: SCORING_CONSTANTS.HUNGRY.INITIAL_SCORE,
    absencePenalty: SCORING_CONSTANTS.HUNGRY.ABSENCE_PENALTY,
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
        unit: "感受",
        data: {
          '飢餓程度': {
            getValueByDate: (date: Date) => baseStore.getRawRecordByDate(date)?.level,
            getValueByWeek: (week: Date) => baseStore.getWeightedRecordByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getWeightedRecordByMonth(month)
          }
        },
        formatValue: (level: number) => {
          switch(level) {
            case 2: return '很餓';
            case 1: return '偏餓';
            case -1: return '偏飽';
            case -2: return '很飽';
            default: return '';
          }
        }
      }
    },
    thresholds: []
  })

  // Helper function: 取得週數
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const recordHungryLevel = (level: number) => {
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
            startScore + SCORING_CONSTANTS.HUNGRY.ABSENCE_PENALTY
          )
        }
      }
    } else {
      // 設置昨日分數0
      const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
      baseStore.scores.value[yesterdayKey] = 0;
    }

    const lastDateKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    const scoreChange = level * 5 // 每個飢餓等級變化對應5分變化
    const baseScore = baseStore.scores.value[lastDateKey] || 0

    baseStore.scores.value[todayKey] = Math.max(
      SCORING_CONSTANTS.COMMON.MIN_SCORE,
      baseScore + scoreChange
    )
  }

  return {
    ...baseStore,
    recordHungryLevel
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})
