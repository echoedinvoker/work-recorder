import { defineStore } from "pinia";
import { computed } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { useActivityStore } from '@/composables/useActivityStore'
import {
  SCORING_CONSTANTS,
  getWorkoutScoreChange
} from '../constants/scoringConstants';
import mockData from "@/data/mockWorkoutData.json";
import type { Ref } from "vue";

interface WorkoutRecord {
  [activity: string]: {
    id?: number;
    count: number;
    weight: number;
  }[];
}

export const useDailyWorkoutStore = defineStore("dailyWorkout", () => {
  const updateRecord = (
    records: Ref<{ [date: string]: WorkoutRecord }>,
    activity: string,
    count: number,
    weight: number,
    dateKey: string = getTodayKey()
  ) => {
    if (!records.value[dateKey]) {
      records.value[dateKey] = {}
    }
    if (!records.value[dateKey][activity]) {
      records.value[dateKey][activity] = []
    }
    const id = new Date().getTime()
    records.value[dateKey][activity].push({ id, count, weight })
  }
  const calculateFromRecords = (
    records: Ref<{ [date: string]: WorkoutRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    scores: Ref<{ [date: string]: number }>,
    ratios: Ref<{ [date: string]: number }>,
    ratioIncrements: Ref<{ [date: string]: number }>,
    todayKey: string = getTodayKey()
  ) => {
    const allActivityWeights = calculateActivityWeights(
      records,
      todayKey
    )
    recalculateAllWeightedRecords(
      records,
      weightedRecords,
      allActivityWeights
    )
    recalculateAllScores(
      todayKey,
      records,
      weightedRecords,
      scores,
      ratios,
      ratioIncrements,
      allActivityWeights
    )
  }

  // 使用通用 composable
  const baseStore = useActivityStore<WorkoutRecord>({
    title: '重訓',
    initialScore: SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE,
    absencePenalty: SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY,
    getScoreChange: getWorkoutScoreChange,
    calculateWeightedRecord: () => 0, // 重訓的計算邏輯較複雜，在下面單獨處理
    updateRecord,
    calculateFromRecords,
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

  // getters
  const activityList = computed(() => {
    const activities = new Set<string>()
    Object.values(baseStore.records.value).forEach(dayRecord => {
      Object.keys(dayRecord).forEach(activity => activities.add(activity))
    })
    return Array.from(activities)
  })
  const pastAverageWeightByActivity = computed<{ [activity: string]: number }>(() => {
    const pastActivityWeights: { [activity: string]: number[] } = {}

    Object.values(baseStore.pastRecords.value).forEach(dayRecord => {
      Object.entries(dayRecord).forEach(([activity, sets]) => {
        if (!pastActivityWeights[activity]) {
          pastActivityWeights[activity] = []
        }
        sets.forEach(set => {
          for (let i = 0; i < set.count; i++) {
            pastActivityWeights[activity].push(Number(set.weight))
          }
        })
      })
    })

    const pastAverageWeights: { [activity: string]: number } = {}
    Object.entries(pastActivityWeights).forEach(([activity, weights]) => {
      pastAverageWeights[activity] = weights.reduce((sum, w) => sum + w, 0) / weights.length
    })

    return pastAverageWeights
  })
  const pastAvgWeight = computed(() => {
    const weights = Object.values(pastAverageWeightByActivity.value)
    if (weights.length === 0) return 0
    return weights.reduce((sum, w) => sum + w, 0) / weights.length
  })
  const activityWeights = computed<{ [activity: string]: number }>(() => {
    const activities = Object.keys(pastAverageWeightByActivity.value)

    if (activities.length === 0) return {}

    const maxWeight = Math.max(...Object.values(pastAverageWeightByActivity.value))
    const weights: { [activity: string]: number } = {}

    // 先計算原始權重
    activities.forEach(activity => {
      const avgWeight = pastAverageWeightByActivity.value[activity]
      weights[activity] = avgWeight > 0 ? maxWeight / avgWeight : maxWeight
    })

    // 計算權重總和並正規化，使平均權重為1
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    const avgWeight = totalWeight / activities.length

    // 將所有權重除以平均權重，使整體平均為1
    Object.keys(weights).forEach(activity => {
      weights[activity] = weights[activity] / avgWeight
    })

    return weights
  })
  const sortedRecentRecords = computed(() => {
    // 取近10天紀錄
    const sortedRecordsByDate: { [date: string]: WorkoutRecord } = {}
    Object.keys(baseStore.records.value).sort((a, b) => (a < b ? 1 : -1)).slice(0, 10).forEach(dateKey => {
      sortedRecordsByDate[dateKey] = baseStore.records.value[dateKey]
    })
    const sortedRecords: { date: string; id: number; activity: string; count: number; weight: number }[] = []
    Object.entries(sortedRecordsByDate).forEach(([date, dayRecord]) => {
      Object.entries(dayRecord).forEach(([activity, sets]) => {
        sets.forEach(set => {
          sortedRecords.push({
            date,
            id: set.id || 0,
            activity,
            count: set.count,
            weight: set.weight
          })
        })
      })
    })
    sortedRecords.sort((a, b) => {
      if (a.date === b.date) {
        return b.id - a.id
      }
      return a.date < b.date ? 1 : -1
    })
    // turn date key to '今天', '昨天' if applicable
    const todayKey = getTodayKey()
    const yesterdayKey = formatDateToKey(new Date(new Date().getTime() - 24 * 60 * 60 * 1000))
    sortedRecords.forEach(record => {
      if (record.date === todayKey) {
        record.date = '今天'
      } else if (record.date === yesterdayKey) {
        record.date = '昨天'
      }
    })
    return sortedRecords
  })
  const sortedTodayRecords = computed(() => {
    if (!baseStore.todayRecords.value) return []

    const sortedRecords: { id: number; activity: string; count: number; weight: number; date: string }[] = []

    Object.entries(baseStore.todayRecords.value).forEach(([activity, sets]) => {
      sets.forEach(set => {
        sortedRecords.push({
          id: set.id || 0,
          activity,
          count: set.count,
          weight: set.weight,
          date: '今天'
        })
      })
    })

    sortedRecords.sort((a, b) => {
      return b.id - a.id
    })

    return sortedRecords
  })

  // methods

  // helper functions
  const calculateActivityWeights = (
    records: Ref<{ [date: string]: WorkoutRecord }>,
    todayKey: string
  ) => {
    const allActivityWeights = { ...activityWeights.value }
    const todayRecords = records.value[todayKey]
    const newActivityList = Object.keys(todayRecords).filter(act => !allActivityWeights[act])

    const newActivityAvgWeightPerRep: { [activity: string]: number } = {}
    newActivityList.forEach(act => {
      const actSum = todayRecords[act].reduce((sum, set) => sum + set.count * set.weight, 0)
      const actCount = todayRecords[act].reduce((sum, set) => {
        return Number(sum) + Number(set.count)
      }, 0)
      const avgWeightPerRep = actCount > 0 ? actSum / actCount : 0
      newActivityAvgWeightPerRep[act] = avgWeightPerRep
    })

    const isAnyHistoryRecord = Object.keys(pastAverageWeightByActivity.value).length > 0

    if (isAnyHistoryRecord) {
      // 有歷史記錄，使用過去平均重量計算新動作權重
      const pastAvgWeightValue = pastAvgWeight.value > 0 ? pastAvgWeight.value : 1
      newActivityList.forEach(act => {
        const avgWeightPerRep = newActivityAvgWeightPerRep[act]
        const newActWeight = avgWeightPerRep > 0 ? pastAvgWeightValue / avgWeightPerRep : 1
        allActivityWeights[act] = newActWeight
      })
    } else {
      // 沒有歷史記錄，使用新動作的平均重量計算權重，並正規化
      const totalNewAvgWeight = Object.values(newActivityAvgWeightPerRep).reduce((sum, w) => sum + w, 0)
      const avgNewAvgWeight = totalNewAvgWeight / newActivityList.length
      newActivityList.forEach(act => {
        const avgWeightPerRep = newActivityAvgWeightPerRep[act]
        const newActWeight = avgWeightPerRep > 0 ? avgNewAvgWeight / avgWeightPerRep : 1
        allActivityWeights[act] = newActWeight
      })
    }

    return allActivityWeights
  }
  const recalculateAllWeightedRecords = (
    records: Ref<{ [date: string]: WorkoutRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    allActivityWeights: { [activity: string]: number }
  ) => {
    Object.entries(records.value).forEach(([dateKey, dayRecord]) => {
      let weightedRecord = 0
      Object.entries(dayRecord).forEach(([act, sets]) => {
        const actWeight = allActivityWeights[act] || 1
        sets.forEach(set => {
          weightedRecord += set.count * set.weight * actWeight
        })
      })
      weightedRecords.value[dateKey] = weightedRecord
    })
  }
  const recalculateAllScores = (
    todayKey: string,
    records: Ref<{ [date: string]: WorkoutRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    scores: Ref<{ [date: string]: number }>,
    ratios: Ref<{ [date: string]: number }>,
    ratioIncrements: Ref<{ [date: string]: number }>,
    allActivityWeights: { [activity: string]: number }
  ) => {
    const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    const earlistDateKeyFromRecords = Object.keys(records.value).sort()[0]

    if (earlistDateKeyFromRecords === getTodayKey()) {
      baseStore.scores.value[yesterdayKey] = SCORING_CONSTANTS.COMMON.MIN_SCORE
      baseStore.scores.value[todayKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
      return
    }

    for (let date = new Date(earlistDateKeyFromRecords); formatDateToKey(date) <= todayKey; date.setDate(date.getDate() + 1)) {
      const dateKey = formatDateToKey(date)
      const yesterdayKey = formatDateToKey(new Date(date.getTime() - 24 * 60 * 60 * 1000))

      // 當天無記錄 - 扣分
      if (!baseStore.records.value[dateKey]) {
        const yesterdayScore = scores.value[yesterdayKey] || SCORING_CONSTANTS.COMMON.MIN_SCORE
        baseStore.scores.value[dateKey] = Math.max(
          SCORING_CONSTANTS.COMMON.MIN_SCORE,
          yesterdayScore + SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY
        )
        continue
      }

      if (!records.value[yesterdayKey]) {
        scores.value[dateKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
        continue
      }

      calculateScoreBasedOnHistory(
        records,
        weightedRecords,
        scores,
        ratios,
        ratioIncrements,
        dateKey,
        yesterdayKey,
        todayKey,
        allActivityWeights
      )
    }
  }
  const calculateScoreBasedOnHistory = (
    records: Ref<{ [date: string]: WorkoutRecord }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    scores: Ref<{ [date: string]: number }>,
    ratios: Ref<{ [date: string]: number }>,
    ratioIncrements: Ref<{ [date: string]: number }>,
    dateKey: string,
    yesterdayKey: string,
    todayKey: string,
    allActivityWeights: { [activity: string]: number }
  ) => {
    const pastRecords: { [key: string]: WorkoutRecord } = {}
    Object.keys(records.value).filter(key => key < dateKey).forEach(key => {
      pastRecords[key] = records.value[key]
    })

    const pastWeightedRecords: { [key: string]: number } = {}
    Object.entries(pastRecords).forEach(([dKey, dayRecord]) => {
      let weightedRecord = 0
      Object.entries(dayRecord).forEach(([act, sets]) => {
        const actWeight = allActivityWeights[act] || 1
        sets.forEach(set => {
          weightedRecord += set.count * set.weight * actWeight
        })
      })
      pastWeightedRecords[dKey] = weightedRecord
    })

    const maxPastWeightedRecord = Math.max(...Object.values(pastWeightedRecords), 0)

    if (maxPastWeightedRecord === 0) {
      scores.value[dateKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
      return
    }

    const ratio = weightedRecords.value[dateKey] / maxPastWeightedRecord

    if (dateKey === todayKey) {
      ratioIncrements.value[todayKey] = ratio - (ratios.value[todayKey] || 0)
      ratios.value[todayKey] = ratio
    }

    const scoreChange = getWorkoutScoreChange(ratio)
    const yesterdayScore = scores.value[yesterdayKey] || SCORING_CONSTANTS.COMMON.MIN_SCORE

    baseStore.scores.value[dateKey] = Math.max(
      SCORING_CONSTANTS.COMMON.MIN_SCORE,
      yesterdayScore + scoreChange
    )
  }

  // Mock data
  baseStore.records.value = mockData

  return {
    ...baseStore,
    // 重訓特定的 computed
    activityList,
    pastAverageWeightByActivity,
    activityWeights,
    sortedRecentRecords,
    sortedTodayRecords
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})

