import { defineStore } from "pinia";
import { useActivityStore } from '@/composables/useActivityStore'
import {
  SCORING_CONSTANTS,
  getSwimmingScoreChangeByRatio
} from "@/constants/scoringConstants";
import { formatDateToKey, getTodayKey } from "@/utils/dateUtils";
import type { Ref } from "vue";

interface SwimmingRecord {
  id?: number;
  distance: number; // in meters
  duration: number; // in minutes
}

export const useDailySwimmingStore = defineStore("dailySwimming", () => {
  const updateRecord = (
    records: Ref<{ [date: string]: SwimmingRecord }>,
    distance: number,
    duration: number,
    dateKey: string = getTodayKey()
  ) => {
    if (!records.value[dateKey]) records.value[dateKey] = { id: Date.now(), distance, duration }
    else {
      records.value[dateKey].distance += distance
      records.value[dateKey].duration += duration
    }
  }
  const calculateFromRecords = (
    records: Ref<{ [date: string]: SwimmingRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    scores: Ref<{ [date: string]: number }>,
    ratios: Ref<{ [date: string]: number }>,
    ratioIncrements: Ref<{ [date: string]: number }>,
    todayKey: string = getTodayKey()
  ) => {
    calculateAllWeightedRecords(records, weightedRecords)
    calcalateAllScores(records, weightedRecords, scores, ratios, ratioIncrements, todayKey)
  }

  // 使用通用 composable
  const baseStore = useActivityStore<SwimmingRecord>({
    title: "游泳",
    initialScore: SCORING_CONSTANTS.SWIMMING.INITIAL_SCORE,
    absencePenalty: SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY,
    getScoreChange: getSwimmingScoreChangeByRatio,
    calculateWeightedRecord: () => 0,
    updateRecord,
    calculateFromRecords,
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

  // helper functions
  const calculateAllWeightedRecords = (
    records: Ref<{ [date: string]: SwimmingRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>
  ) => {
    for (const date in records.value) {
      const record = records.value[date]
      weightedRecords.value[date] = calculateSwimmingWeightedRecord(record)
    }
  }
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
  const calcalateAllScores = (
    records: Ref<{ [date: string]: SwimmingRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    scores: Ref<{ [date: string]: number }>,
    ratios: Ref<{ [date: string]: number }>,
    ratioIncrements: Ref<{ [date: string]: number }>,
    todayKey: string = getTodayKey()
  ) => {
    for (
      let date = new Date(Object.keys(records.value).sort()[0]);
      formatDateToKey(date) <= todayKey;
      date.setDate(date.getDate() + 1)
    ) {
      const yesterday = new Date(date).setDate(date.getDate() - 1)
      const yesterdayKey = formatDateToKey(new Date(yesterday))
      const todayKey = formatDateToKey(date)
      // first day
      if (!scores.value[yesterdayKey]) {
        scores.value[todayKey] = SCORING_CONSTANTS.SWIMMING.INITIAL_SCORE
        ratios.value[todayKey] = 0
        ratioIncrements.value[todayKey] = 0
        continue
      }
      // absence
      if (!records.value[todayKey]) {
        scores.value[todayKey] = Math.max(
          0,
          scores.value[yesterdayKey] + SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY
        )
        ratios.value[todayKey] = 0
        ratioIncrements.value[todayKey] = 0
        continue
      }
      // record exists
      const historicalWeightedRecords = Object.keys(weightedRecords.value)
        .filter(d => d < todayKey)
        .map(d => weightedRecords.value[d])
      const maxHistoricalWeightedRecord = historicalWeightedRecords.length > 0 ?
        Math.max(...historicalWeightedRecords) : 0
      const todayWeightedRecord = weightedRecords.value[todayKey] || 0
      const ratio = maxHistoricalWeightedRecord > 0 ? todayWeightedRecord / maxHistoricalWeightedRecord : 1
      if (ratio >= SCORING_CONSTANTS.SWIMMING.RATIO_THRESHOLDS.EXCELLENT) {
        scores.value[todayKey] = Math.max(
          0,
          scores.value[yesterdayKey] + SCORING_CONSTANTS.SWIMMING.SCORE_CHANGES.EXCELLENT_BONUS
        )
      } else if (ratio >= SCORING_CONSTANTS.SWIMMING.RATIO_THRESHOLDS.GOOD) {
        scores.value[todayKey] = Math.max(
          0,
          scores.value[yesterdayKey] + SCORING_CONSTANTS.SWIMMING.SCORE_CHANGES.GOOD_BONUS
        )
      } else if (ratio >= SCORING_CONSTANTS.SWIMMING.RATIO_THRESHOLDS.FAIR) {
        scores.value[todayKey] = Math.max(
          0,
          scores.value[yesterdayKey] + SCORING_CONSTANTS.SWIMMING.SCORE_CHANGES.FAIR_BONUS
        )
      } else {
        scores.value[todayKey] = Math.max(
          0,
          scores.value[yesterdayKey] + SCORING_CONSTANTS.SWIMMING.SCORE_CHANGES.POOR_PENALTY
        )
      }
      ratios.value[todayKey] = ratio
      ratioIncrements.value[todayKey] = 0
    }
  }

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

