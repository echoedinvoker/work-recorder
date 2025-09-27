import { defineStore } from "pinia";
import { useActivityStore } from '@/composables/useActivityStore'
import { 
  SCORING_CONSTANTS, 
  getSwimmingScoreChangeByRatio 
} from "@/constants/scoringConstants";
import { getTodayKey } from "@/utils/dateUtils";

interface SwimmingRecord {
  distance: number; // in meters
  duration: number; // in minutes
}

export const useDailySwimmingStore = defineStore("dailySwimming", () => {
  // 游泳特定的加權記錄計算邏輯
  const calculateSwimmingWeightedRecord = (record: SwimmingRecord): number => {
    const speed = record.distance / record.duration // m/min

    if (speed >= 30) {
      return record.distance * 1.2
    } else if (speed >= 25) {
      return record.distance * 1.0
    } else if (speed >= 20) {
      return record.distance * 0.8
    } else {
      return record.distance * 0.5
    }
  }

  // 使用通用 composable
  const baseStore = useActivityStore<SwimmingRecord>({
    title: "游泳",
    initialScore: SCORING_CONSTANTS.SWIMMING.INITIAL_SCORE,
    absencePenalty: SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY,
    getScoreChange: getSwimmingScoreChangeByRatio,
    calculateWeightedRecord: calculateSwimmingWeightedRecord,
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
        unit: '公尺',
        data: {
          '加權里程數': {
            getValueByDate: (date: Date) => baseStore.getWeightedRecordByDate(date),
            getValueByWeek: (week: Date) => baseStore.getWeightedRecordByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getWeightedRecordByMonth(month)
          }
        }
      }
    },
    thresholds: SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS
  })

  // 游泳特定的方法
  const addOneRecord = (distance: number, duration: number) => {
    const todayKey = getTodayKey()
    
    // 更新記錄
    if (baseStore.records.value[todayKey]) {
      baseStore.records.value[todayKey].distance += distance
      baseStore.records.value[todayKey].duration += duration
    } else {
      baseStore.records.value[todayKey] = { distance, duration }
    }

    // 計算並更新加權記錄和分數
    const weightedRecord = calculateSwimmingWeightedRecord({ distance, duration })
    baseStore.updateScoreAndRatio(weightedRecord)
  }

  // Mock data
  // baseStore.records.value = {
  //   "2025-09-23": { distance: 1000, duration: 40 },
  //   "2025-09-24": { distance: 1200, duration: 45 },
  //   "2025-09-25": { distance: 1500, duration: 50 }
  // }
  //
  // baseStore.weightedRecords.value = {
  //   "2025-09-23": 1000,
  //   "2025-09-24": 1200,
  //   "2025-09-25": 1800
  // }
  //
  // baseStore.scores.value = {
  //   "2025-09-23": 70,
  //   "2025-09-24": 78,
  //   "2025-09-25": 88
  // }

  return {
    ...baseStore,
    // 游泳特定的方法
    addOneRecord
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})

