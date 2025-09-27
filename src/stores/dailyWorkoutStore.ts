import { defineStore } from "pinia";
import { ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { computed } from "vue";
import { 
  SCORING_CONSTANTS, 
  getWorkoutScoreChange 
} from '../constants/scoringConstants';

interface WorkoutRecord {
  [date: string]: {
    [activity: string]: {
      count: number;
      weight: number;
    }[];
  };
}

export const useDailyWorkoutStore = defineStore("dailyWorkout", () => {
  const TITLE = '重訓';

  const records = ref<WorkoutRecord>({});
  const weightedRecords = ref<{ [date: string]: number }>({});
  const scores = ref<{ [date: string]: number }>({});
  const ratios = ref<{ [date: string]: number }>({});
  const ratioIncrements = ref<{ [date: string]: number }>({});

  const firstDateKey = computed<string>(() => {
    const dateKeys = Object.keys(records.value)
    if (dateKeys.length === 0) return getTodayKey()
    return dateKeys.sort()[0]
  })
  const pastRecords = computed<WorkoutRecord>(() => {
    const todayKey = getTodayKey()
    const filteredRecords: WorkoutRecord = {}

    Object.keys(records.value).forEach(dateKey => {
      if (dateKey !== todayKey) {
        filteredRecords[dateKey] = records.value[dateKey]
      }
    })

    return filteredRecords
  })
  const averageWeightByActivity = computed<{ [activity: string]: number }>(() => {
    const activityWeights: { [activity: string]: number[] } = {}

    Object.values(pastRecords.value).forEach(dayRecord => {
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

    // 找出最大平均重量
    const maxWeight = Math.max(...Object.values(averages))

    // 使用反比例計算權重：權重 = 最大重量 / 當前重量
    const weights: { [activity: string]: number } = {}

    activities.forEach(activity => {
      const avgWeight = averages[activity]
      // 避免除以零，如果重量為0則給予最大權重
      weights[activity] = avgWeight > 0 ? maxWeight / avgWeight : maxWeight
    })

    return weights
  })
  const activityList = computed<string[]>(() => {
    const activitiesSet = new Set<string>()
    Object.values(records.value).forEach(dayRecord => {
      Object.keys(dayRecord).forEach(activity => {
        activitiesSet.add(activity)
      })
    })
    return Array.from(activitiesSet)
  })
  const todayActivityList = computed<string[]>(() => {
    const todayKey = getTodayKey()
    return records.value[todayKey] ? Object.keys(records.value[todayKey]) : []
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
  const pastWeightedRecords = computed<{ [date: string]: number }>(() => {
    const todayKey = getTodayKey()
    const filteredWeights: { [date: string]: number } = {}

    Object.keys(weightedRecords.value).forEach(dateKey => {
      if (dateKey !== todayKey) {
        filteredWeights[dateKey] = weightedRecords.value[dateKey]
      }
    })

    return filteredWeights
  })
  const maxPastWeightedRecord = computed<number>(() => {
    const pastWeights = Object.values(pastWeightedRecords.value)
    if (pastWeights.length === 0) return 0
    return Math.max(...pastWeights)
  })
  const todayRatio = computed<number>(() => {
    const todayKey = getTodayKey()
    return ratios.value[todayKey] || 0
  })
  const todayRatioIncrement = computed<number>(() => {
    const todayKey = getTodayKey()
    return ratioIncrements.value[todayKey] || 0
  })
  const consecutiveScoreGrowthDays = computed<number>(() => {
    const sortedDates = Object.keys(scores.value).sort().reverse() // 從最新日期開始

    if (sortedDates.length < 2) return 0 // 需要至少兩天的資料才能比較

    let consecutiveDays = 0

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = sortedDates[i]
      const previousDate = sortedDates[i + 1]

      const currentScore = scores.value[currentDate]
      const previousScore = scores.value[previousDate]

      // 檢查當前分數是否大於前一天
      if (currentScore > previousScore) {
        consecutiveDays++
      } else {
        break // 一旦不是增長就停止計算
      }
    }

    return consecutiveDays
  })
  const weeklyScores = computed<{ [weekKey: string]: number }>(() => {
    const weekly: { [weekKey: string]: number } = {}

    Object.entries(scores.value).forEach(([dateKey, score]) => {
      // 將日期轉換為週的標識 (例如: "2025-W39")
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const weekNumber = getWeekNumber(date)
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

      // 累加該週的分數
      weekly[weekKey] = (weekly[weekKey] || 0) + score
    })

    return weekly
  })
  const consecutiveWeeklyGrowth = computed<number>(() => {
    const weekKeys = Object.keys(weeklyScores.value).sort().reverse()

    if (weekKeys.length < 2) return 0

    let consecutiveWeeks = 0

    for (let i = 0; i < weekKeys.length - 1; i++) {
      const currentWeek = weekKeys[i]
      const previousWeek = weekKeys[i + 1]

      const currentScore = weeklyScores.value[currentWeek]
      const previousScore = weeklyScores.value[previousWeek]

      if (currentScore > previousScore) {
        consecutiveWeeks++
      } else {
        break
      }
    }

    return consecutiveWeeks
  })
  const monthlyScores = computed<{ [monthKey: string]: number }>(() => {
    const monthly: { [monthKey: string]: number } = {}

    Object.entries(scores.value).forEach(([dateKey, score]) => {
      // 將日期轉換為月的標識 (例如: "2025-10")
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // getMonth() 返回 0-11，所以要 +1
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`

      // 累加該月的分數
      monthly[monthKey] = (monthly[monthKey] || 0) + score
    })

    return monthly
  })
  const consecutiveMonthlyGrowth = computed<number>(() => {
    // 取得所有月份鍵值並按時間排序（最新的在前）
    const monthKeys = Object.keys(monthlyScores.value).sort().reverse()

    // 需要至少兩個月的資料才能比較
    if (monthKeys.length < 2) return 0

    let consecutiveMonths = 0

    // 從最新月份開始往前比較
    for (let i = 0; i < monthKeys.length - 1; i++) {
      const currentMonth = monthKeys[i]
      const previousMonth = monthKeys[i + 1]

      const currentScore = monthlyScores.value[currentMonth]
      const previousScore = monthlyScores.value[previousMonth]

      // 檢查當前月份分數是否大於前一個月
      if (currentScore > previousScore) {
        consecutiveMonths++
      } else {
        break // 一旦不是增長就停止計算
      }
    }

    return consecutiveMonths
  })
  const weeklyWeightedRecord = computed<{ [weekKey: string]: number }>(() => {
    const weekly: { [weekKey: string]: number } = {}

    Object.entries(weightedRecords.value).forEach(([dateKey, weightedRecord]) => {
      // 將日期轉換為週的標識 (例如: "2025-W39")
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const weekNumber = getWeekNumber(date)
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

      // 累加該週的加權運動量
      weekly[weekKey] = (weekly[weekKey] || 0) + weightedRecord
    })

    return weekly
  })
  const monthlyWeightedRecord = computed<{ [monthKey: string]: number }>(() => {
    const monthly: { [monthKey: string]: number } = {}

    Object.entries(weightedRecords.value).forEach(([dateKey, weightedRecord]) => {
      // 將日期轉換為月的標識 (例如: "2025-10")
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // getMonth() 返回 0-11，所以要 +1
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`

      // 累加該月的加權運動量
      monthly[monthKey] = (monthly[monthKey] || 0) + weightedRecord
    })

    return monthly
  })

  // methods
  const addOneSet = (activity: string, count: number, weight: number) => {
    const todayKey = getTodayKey()
    if (!records.value[todayKey]) {
      records.value[todayKey] = {}
    }
    if (!records.value[todayKey][activity]) {
      records.value[todayKey][activity] = []
    }
    records.value[todayKey][activity].push({ count, weight })

    weightedRecords.value[todayKey] =
      (weightedRecords.value[todayKey] || 0) +
      count * weight * normalizedTodayActivityWeights.value[activity]

    if (maxPastWeightedRecord.value === 0) {
      scores.value[todayKey] = SCORING_CONSTANTS.WORKOUT.INITIAL_SCORE
      return
    }

    const lastScoreDateKey = Object.keys(scores.value).filter(key => key !== todayKey).sort().pop()
    // filling scores from lastScoreDateKey to todayKey - 1
    if (lastScoreDateKey) {
      let startScore = scores.value[lastScoreDateKey]
      for (let date = new Date(lastScoreDateKey); formatDateToKey(date) < todayKey; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateToKey(date)
        if (!scores.value[dateKey]) {
          scores.value[dateKey] = Math.max(
            SCORING_CONSTANTS.COMMON.MIN_SCORE, 
            startScore + SCORING_CONSTANTS.WORKOUT.ABSENCE_PENALTY
          )
        }
      }
    }

    const ratio = weightedRecords.value[todayKey] / maxPastWeightedRecord.value
    ratioIncrements.value[todayKey] = ratio - (ratios.value[todayKey] || 0)
    ratios.value[todayKey] = ratio
    const lastDateKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))

    const scoreChange = getWorkoutScoreChange(ratio)
    const baseScore = scores.value[lastDateKey] || 0
    scores.value[todayKey] = Math.max(
      SCORING_CONSTANTS.COMMON.MIN_SCORE,
      baseScore + scoreChange
    )
  }
  const getScoreByDate = (date: Date): number => {
    const dateKey = formatDateToKey(date)
    return scores.value[dateKey] || 0
  }
  const getWeightedRecordByDate = (date: Date): number => {
    const dateKey = formatDateToKey(date)
    return weightedRecords.value[dateKey] || 0
  }
  const getScoreByWeek = (week: Date): number => {
    // 計算指定日期所在週的週數標識
    const year = week.getFullYear()
    const weekNumber = getWeekNumber(week)
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

    // 從 weeklyScores computed 中取得該週的總分數
    return weeklyScores.value[weekKey] || 0
  }
  const getScoreByMonth = (month: Date): number => {
    // 計算指定日期所在月份的月份標識
    const year = month.getFullYear()
    const monthNumber = month.getMonth() + 1 // getMonth() 返回 0-11，所以要 +1
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`

    // 從 monthlyScores computed 中取得該月的總分數
    return monthlyScores.value[monthKey] || 0
  }
  const getWeightedRecordByWeek = (week: Date): number => {
    // 計算指定日期所在週的週數標識
    const year = week.getFullYear()
    const weekNumber = getWeekNumber(week)
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

    // 從 weeklyWeightedRecord computed 中取得該週的總加權運動量
    return weeklyWeightedRecord.value[weekKey] || 0
  }
  const getWeightedRecordByMonth = (month: Date): number => {
    // 計算指定日期所在月份的月份標識
    const year = month.getFullYear()
    const monthNumber = month.getMonth() + 1 // getMonth() 返回 0-11，所以要 +1
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`

    // 從 monthlyWeightedRecord computed 中取得該月的總加權運動量
    return monthlyWeightedRecord.value[monthKey] || 0
  }
  const clearAllHistory = () => {
    records.value = {};
    weightedRecords.value = {};
    scores.value = {};
    ratios.value = {};
    ratioIncrements.value = {};
  };

  // helper functions
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // mock data
  records.value = {
    ...records.value,
    "2025-09-23": {
      "伏地挺身": [
        { count: 15, weight: 0 },
        { count: 12, weight: 0 },
        { count: 10, weight: 0 }
      ],
      "深蹲": [
        { count: 20, weight: 40 },
        { count: 18, weight: 40 },
        { count: 15, weight: 40 }
      ],
      "臥推": [
        { count: 8, weight: 60 },
        { count: 6, weight: 60 },
        { count: 5, weight: 60 }
      ]
    },
    "2025-09-24": {
      "伏地挺身": [
        { count: 18, weight: 0 },
        { count: 15, weight: 0 },
        { count: 12, weight: 0 }
      ],
      "引體向上": [
        { count: 8, weight: 0 },
        { count: 6, weight: 0 },
        { count: 5, weight: 0 }
      ],
      "硬舉": [
        { count: 5, weight: 80 },
        { count: 5, weight: 80 },
        { count: 4, weight: 80 }
      ],
      "肩推": [
        { count: 10, weight: 30 },
        { count: 8, weight: 30 },
        { count: 6, weight: 30 }
      ]
    },
    "2025-09-25": {
      "深蹲": [
        { count: 22, weight: 45 },
        { count: 20, weight: 45 },
        { count: 18, weight: 45 }
      ],
      "臥推": [
        { count: 10, weight: 65 },
        { count: 8, weight: 65 },
        { count: 6, weight: 65 }
      ],
      "划船": [
        { count: 12, weight: 50 },
        { count: 10, weight: 50 },
        { count: 8, weight: 50 }
      ],
      "二頭彎舉": [
        { count: 15, weight: 15 },
        { count: 12, weight: 15 },
        { count: 10, weight: 15 }
      ]
    }
  };
  weightedRecords.value = {
    ...weightedRecords.value,
    "2025-09-23": 2850,  // 基於運動組合計算的加權分數
    "2025-09-24": 3200,  // 較高強度的訓練日
    "2025-09-25": 3450   // 最高強度的訓練日
  };
  scores.value = {
    ...scores.value,
    "2025-09-23": 75,   // 良好的開始分數
    "2025-09-24": 85,   // 進步了10分
    "2025-09-25": 95    // 持續進步，接近滿分
  };

  return {
    // constants
    TITLE,

    // states
    records,
    weightedRecords,
    scores,
    ratios,
    ratioIncrements,

    // getters
    pastRecords,
    firstDateKey,
    averageWeightByActivity,
    activityWeights,
    activityList,
    todayActivityList,
    normalizedTodayActivityWeights,
    maxPastWeightedRecord,
    ratio: todayRatio,
    ratioIncrement: todayRatioIncrement,
    consecutiveScoreGrowthDays,
    weeklyScores,
    consecutiveWeeklyGrowth,
    monthlyScores,
    consecutiveMonthlyGrowth,
    weeklyWeightedRecord,
    monthlyWeightedRecord,

    // methods
    addOneSet,
    getScoreByDate,
    getScoreByWeek,
    getScoreByMonth,
    getWeightedRecordByDate,
    getWeightedRecordByWeek,
    getWeightedRecordByMonth,
    clearAllHistory,

    // for chart
    left: {
      unit: '分',
      data: {
        '分數': {
          getValueByDate: getScoreByDate,
          getValueByWeek: getScoreByWeek,
          getValueByMonth: getScoreByMonth
        }
      }
    },
    right: {
      unit: '公斤',
      data: {
        '加權運動量': {
          getValueByDate: getWeightedRecordByDate,
          getValueByWeek: getWeightedRecordByWeek,
          getValueByMonth: getWeightedRecordByMonth
        }
      }
    },

    // for progress bar
    thresholds: SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS
  };
},
  {
    persist: {
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
