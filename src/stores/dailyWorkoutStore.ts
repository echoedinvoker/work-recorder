import { defineStore } from "pinia";
import { computed } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
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
            pastActivityWeights[activity].push(set.weight)
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

    // 計算今日活動權重
    const allActivityWeights = { ...activityWeights.value }
    const todayRecords = baseStore.records.value[todayKey]
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

    // rewrite today weightedRecord
    // let weightedRecord = 0
    // Object.entries(todayRecords).forEach(([act, sets]) => {
    //   const actWeight = allActivityWeights[act] || 1
    //   sets.forEach(set => {
    //     weightedRecord += set.count * set.weight * actWeight
    //   })
    // })
    // baseStore.weightedRecords.value[todayKey] = weightedRecord

    // 改成 rewrite whole weightedRecords
    Object.entries(baseStore.records.value).forEach(([dateKey, dayRecord]) => {
      let weightedRecord = 0
      Object.entries(dayRecord).forEach(([act, sets]) => {
        const actWeight = allActivityWeights[act] || 1
        sets.forEach(set => {
          weightedRecord += set.count * set.weight * actWeight
        })
      })
      baseStore.weightedRecords.value[dateKey] = weightedRecord
    })
    

    // const lastScoreDateKey = Object.keys(baseStore.scores.value)
    //   .filter(key => key !== todayKey)
    //   .sort()
    //   .pop()
    //
    // if (lastScoreDateKey) {
    //   let startScore = baseStore.scores.value[lastScoreDateKey]
    //   for (let date = new Date(lastScoreDateKey); formatDateToKey(date) < todayKey; date.setDate(date.getDate() + 1)) {
    //     const dateKey = formatDateToKey(date)
    //     if (!baseStore.scores.value[dateKey]) {
    //       baseStore.scores.value[dateKey] = Math.max(
    //         SCORING_CONSTANTS.COMMON.MIN_SCORE,
    //         startScore + SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY
    //       )
    //     }
    //   }
    // } else {
    //   // 設置昨日分數0
    //   const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    //   baseStore.scores.value[yesterdayKey] = 0;
    // }
    //
    // // 如果沒有歷史記錄，使用初始分數
    // if (baseStore.maxPastWeightedRecord.value === 0) {
    //   baseStore.scores.value[todayKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
    //   return
    // }
    //
    // // 計算比例和分數變化
    // const ratio = baseStore.weightedRecords.value[todayKey] / baseStore.maxPastWeightedRecord.value
    // baseStore.ratioIncrements.value[todayKey] = ratio - (baseStore.ratios.value[todayKey] || 0)
    // baseStore.ratios.value[todayKey] = ratio
    //
    // const lastDateKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    // const scoreChange = getWorkoutScoreChange(ratio)
    // const baseScore = baseStore.scores.value[lastDateKey] || 0
    //
    // baseStore.scores.value[todayKey] = Math.max(
    //   SCORING_CONSTANTS.COMMON.MIN_SCORE,
    //   baseScore + scoreChange
    // )
    
    const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    
    // 改成 recalculate whole scores
    const earlistDateKeyFromRecords = Object.keys(baseStore.records.value).sort()[0]
    if (earlistDateKeyFromRecords === getTodayKey()) {
      baseStore.scores.value[yesterdayKey] = SCORING_CONSTANTS.COMMON.MIN_SCORE
      baseStore.scores.value[todayKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
      return
    }
    for (let date = new Date(earlistDateKeyFromRecords); formatDateToKey(date) <= todayKey; date.setDate(date.getDate() + 1)) {
      const dateKey = formatDateToKey(date)
      const yesterdayKey = formatDateToKey(new Date(date.getTime() - 24 * 60 * 60 * 1000))

      // 當天無紀錄
      if (!baseStore.records.value[dateKey]) {
        const yesterdayScore = baseStore.scores.value[yesterdayKey] || SCORING_CONSTANTS.COMMON.MIN_SCORE
        baseStore.scores.value[dateKey] = Math.max(
          SCORING_CONSTANTS.COMMON.MIN_SCORE,
          yesterdayScore + SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY
        )
        continue
      }

      // 前一天無紀錄 --> 第一天 --> 給初始分數
      if (!baseStore.records.value[yesterdayKey]) {
        baseStore.scores.value[dateKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
        continue
      }

      // 非第一天有紀錄之日期
      const pastRecords: { [key: string]: WorkoutRecord } = {}
      Object.keys(baseStore.records.value).filter(key => key < dateKey).forEach(key => {
        pastRecords[key] = baseStore.records.value[key]
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
      // 需考量 maxPastWeightedRecord 為 0 的情況 (理論上不會發生，因為有前一天紀錄, 而且紀錄不可能輸入零, 但還是保險起見)
      if (maxPastWeightedRecord === 0) {
        baseStore.scores.value[dateKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
        continue
      }
      const ratio = baseStore.weightedRecords.value[dateKey] / maxPastWeightedRecord
      if (dateKey === todayKey) {
        baseStore.ratioIncrements.value[todayKey] = ratio - (baseStore.ratios.value[todayKey] || 0)
        baseStore.ratios.value[todayKey] = ratio
      }
      const scoreChange = getWorkoutScoreChange(ratio)
      const yesterdayScore = baseStore.scores.value[yesterdayKey] || SCORING_CONSTANTS.COMMON.MIN_SCORE
      baseStore.scores.value[dateKey] = Math.max(
        SCORING_CONSTANTS.COMMON.MIN_SCORE,
        yesterdayScore + scoreChange
      )
    }
  }

  // Mock data
  // baseStore.records.value = {
  //   "2025-09-28": {
  //     "懸吊": [
  //       { count: 13, weight: 70 },
  //       { count: 10, weight: 70 },
  //       { count: 7, weight: 70 },
  //     ],
  //     "硬舉": [
  //       { count: 15, weight: 40 },
  //       { count: 10, weight: 40 },
  //       { count: 7, weight: 40 },
  //     ],
  //     "機械下拉": [
  //       { count: 15, weight: 31.8 },
  //       { count: 10, weight: 31.8 },
  //       { count: 7, weight: 31.8 },
  //     ],
  //     "機械低划船": [
  //       { count: 15, weight: 31.8 },
  //       { count: 10, weight: 31.8 },
  //       { count: 7, weight: 31.8 },
  //     ],
  //     "啞鈴直立二頭彎舉": [
  //       { count: 15, weight: 30 },
  //       { count: 10, weight: 30 },
  //       { count: 7, weight: 30 },
  //     ],
  //   },
    // "2025-09-29": {
    //   "懸吊": [
    //     { count: 15, weight: 70 },
    //     { count: 14, weight: 70 },
    //     { count: 12, weight: 70 }
    //   ],
    //   "單啞鈴肩前束": [
    //     { count: 13, weight: 25 },
    //     { count: 10, weight: 25 },
    //     { count: 8, weight: 25 },
    //   ],
    //   "啞鈴肩中束水平飛鳥": [
    //     { count: 11, weight: 20 },
    //     { count: 9, weight: 20 },
    //     { count: 7, weight: 20 },
    //   ],
    //   "啞鈴肩後束飛鳥": [
    //     { count: 12, weight: 20 },
    //     { count: 9, weight: 20 },
    //     { count: 7, weight: 20 },
    //   ],
    //   "下腹靠背抬腿": [
    //     { count: 14, weight: 30 },
    //     { count: 11, weight: 30 },
    //   ],
    // },
  // }
  // baseStore.weightedRecords.value = {
  //   // "2025-09-28": 4305.2,
  //   // "2025-09-29": 160 
  // }
  // baseStore.scores.value = {
  //   // "2025-09-27": 0,
  //   // "2025-09-28": 10,
  //   // "2025-09-29": 5
  // }

  return {
    ...baseStore,
    // 重訓特定的 computed
    activityList,
    pastAverageWeightByActivity,
    activityWeights,
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

