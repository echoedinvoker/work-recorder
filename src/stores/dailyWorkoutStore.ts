import { defineStore } from "pinia";
import { computed } from "vue";
import { getTodayKey } from '../utils/dateUtils'
import { useActivityStore } from '@/composables/useActivityStore'
import {
  SCORING_CONSTANTS,
  getWorkoutScoreChange
} from '../constants/scoringConstants';

interface WorkoutRecord {
  [activity: string]: {
    count: number;
    weight: number;
  }[];
}

export const useDailyWorkoutStore = defineStore("dailyWorkout", () => {
  // 使用通用 composable
  const baseStore = useActivityStore<WorkoutRecord>({
    title: '重訓',
    initialScore: SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE,
    absencePenalty: SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY,
    getScoreChange: getWorkoutScoreChange,
    calculateWeightedRecord: () => 0, // 重訓的計算邏輯較複雜，在下面單獨處理
    chartConfig: {
      left: {
        unit: '分',
        data: {
          '分數': {
            getValueByDate: (date: Date) => baseStore.getScoreByDate(date),
            getValueByWeek: (week: Date) => baseStore.getScoreByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getScoreByMonth(month)
          }
        }
      },
      right: {
        unit: '公斤',
        data: {
          '加權運動量': {
            getValueByDate: (date: Date) => baseStore.getWeightedRecordByDate(date),
            getValueByWeek: (week: Date) => baseStore.getWeightedRecordByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getWeightedRecordByMonth(month)
          }
        }
      }
    },
    thresholds: SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS
  })

  // 重訓特定的 computed
  const averageWeightByActivity = computed<{ [activity: string]: number }>(() => {
    const activityWeights: { [activity: string]: number[] } = {}

    Object.values(baseStore.pastRecords.value).forEach(dayRecord => {
      Object.entries(dayRecord).forEach(([activity, sets]) => {
        if (!activityWeights[activity]) {
          activityWeights[activity] = []
        }
        sets.forEach(set => {
          for (let i = 0; i < set.count; i++) {
            activityWeights[activity].push(set.weight)
          }
        })
      })
    })

    const averageWeights: { [activity: string]: number } = {}
    Object.entries(activityWeights).forEach(([activity, weights]) => {
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      const averageWeight = weights.length ? Math.round(totalWeight / weights.length) : 0
      averageWeights[activity] = averageWeight
    })

    return averageWeights
  })

  const activityWeights = computed<{ [activity: string]: number }>(() => {
    const averages = averageWeightByActivity.value
    const activities = Object.keys(averages)

    if (activities.length === 0) return {}

    const maxWeight = Math.max(...Object.values(averages))
    const weights: { [activity: string]: number } = {}

    activities.forEach(activity => {
      const avgWeight = averages[activity]
      weights[activity] = avgWeight > 0 ? maxWeight / avgWeight : maxWeight
    })

    return weights
  })

  const activityList = computed<string[]>(() => {
    const activitiesSet = new Set<string>()
    Object.values(baseStore.records.value).forEach(dayRecord => {
      Object.keys(dayRecord).forEach(activity => {
        activitiesSet.add(activity)
      })
    })
    return Array.from(activitiesSet)
  })

  const todayActivityList = computed<string[]>(() => {
    const todayKey = getTodayKey()
    return baseStore.records.value[todayKey] ? Object.keys(baseStore.records.value[todayKey]) : []
  })

  const normalizedTodayActivityWeights = computed<{ [activity: string]: number }>(() => {
    const todayActivities = todayActivityList.value
    const weights = activityWeights.value
    let noWeightedActivities = 0

    if (todayActivities.length === 0) return {}

    const todayWeights: { [activity: string]: number } = {}
    todayActivities.forEach(activity => {
      if (weights[activity]) {
        todayWeights[activity] = weights[activity]
      } else {
        noWeightedActivities += 1
      }
    })

    const totalWeight = Object.values(todayWeights).reduce((sum, weight) => sum + weight, 0)
    const normalizedWeights: { [activity: string]: number } = {}
    const targetTotal = todayActivities.length - noWeightedActivities

    todayActivities.forEach(activity => {
      normalizedWeights[activity] = (todayWeights[activity] / totalWeight) * targetTotal
    })

    todayActivities.forEach(activity => {
      if (!normalizedWeights[activity]) {
        normalizedWeights[activity] = 1
      }
    })

    return normalizedWeights
  })

  // 重訓特定的方法
  const addOneSet = (activity: string, count: number, weight: number) => {
    const todayKey = getTodayKey()

    // 更新記錄
    if (!baseStore.records.value[todayKey]) {
      baseStore.records.value[todayKey] = {}
    }
    if (!baseStore.records.value[todayKey][activity]) {
      baseStore.records.value[todayKey][activity] = []
    }
    baseStore.records.value[todayKey][activity].push({ count, weight })

    // 計算加權記錄並更新分數
    const weightedRecord = count * weight * normalizedTodayActivityWeights.value[activity]
    baseStore.updateScoreAndRatio(weightedRecord)
  }

  // Mock data
  // baseStore.records.value = {
  //   "2025-09-23": {
  //     "深蹲": [
  //       { count: 12, weight: 60 },
  //       { count: 10, weight: 65 },
  //       { count: 8, weight: 70 }
  //     ],
  //     "臥推": [
  //       { count: 10, weight: 50 },
  //       { count: 8, weight: 55 },
  //       { count: 6, weight: 60 }
  //     ],
  //     "硬舉": [
  //       { count: 8, weight: 80 },
  //       { count: 6, weight: 85 },
  //       { count: 5, weight: 90 }
  //     ],
  //     "肩推": [
  //       { count: 12, weight: 30 },
  //       { count: 10, weight: 32 },
  //       { count: 8, weight: 35 }
  //     ]
  //   },
  //   "2025-09-24": {
  //     "深蹲": [
  //       { count: 15, weight: 55 },
  //       { count: 12, weight: 60 },
  //       { count: 10, weight: 65 }
  //     ],
  //     "引體向上": [
  //       { count: 8, weight: 0 },
  //       { count: 6, weight: 5 },
  //       { count: 5, weight: 10 }
  //     ],
  //     "划船": [
  //       { count: 12, weight: 45 },
  //       { count: 10, weight: 50 },
  //       { count: 8, weight: 55 }
  //     ],
  //     "二頭彎舉": [
  //       { count: 15, weight: 15 },
  //       { count: 12, weight: 17 },
  //       { count: 10, weight: 20 }
  //     ]
  //   },
  //   "2025-09-25": {
  //     "臥推": [
  //       { count: 12, weight: 45 },
  //       { count: 10, weight: 50 },
  //       { count: 8, weight: 55 }
  //     ],
  //     "硬舉": [
  //       { count: 10, weight: 75 },
  //       { count: 8, weight: 80 },
  //       { count: 6, weight: 85 }
  //     ],
  //     "三頭下壓": [
  //       { count: 15, weight: 25 },
  //       { count: 12, weight: 30 },
  //       { count: 10, weight: 32 }
  //     ],
  //     "腿推": [
  //       { count: 20, weight: 100 },
  //       { count: 18, weight: 110 },
  //       { count: 15, weight: 120 }
  //     ]
  //   }
  // }
  //
  // baseStore.weightedRecords.value = {
  //   "2025-09-23": 2850, // 根據動作計算的加權總量
  //   "2025-09-24": 2420,
  //   "2025-09-25": 3180
  // }
  //
  // baseStore.scores.value = {
  //   "2025-09-23": 85,
  //   "2025-09-24": 78,
  //   "2025-09-25": 92
  // }

  return {
    ...baseStore,
    // 重訓特定的 computed
    averageWeightByActivity,
    activityWeights,
    activityList,
    todayActivityList,
    normalizedTodayActivityWeights,
    // 重訓特定的方法
    addOneSet
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})

