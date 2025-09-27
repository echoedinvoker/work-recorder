import { defineStore } from "pinia";
import { ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
import { computed } from "vue";
import {
  SCORING_CONSTANTS,
  getSwimmingScoreChangeByRatio,
} from "@/constants/scoringConstants";

interface SwimmingRecord {
  [date: string]: {
    distance: number; // in meters
    duration: number; // in minutes
  }
}

export const useDailySwimmingStore = defineStore("dailySwimming", () => {
  // constants
  const TITLE = "游泳";

  // states
  const records = ref<SwimmingRecord>({});
  const weightedRecords = ref<{ [date: string]: number }>({});
  const scores = ref<{ [date: string]: number }>({});
  const ratios = ref<{ [date: string]: number }>({});
  const ratioIncrements = ref<{ [date: string]: number }>({});

  // getters
  const firstDateKey = computed<string>(() => {
    const dateKeys = Object.keys(records.value)
    if (dateKeys.length === 0) return getTodayKey()
    return dateKeys.sort()[0]
  })
  const pastRecords = computed<SwimmingRecord>(() => {
    const todayKey = getTodayKey()
    const filteredRecords: SwimmingRecord = {}

    Object.keys(records.value).forEach(dateKey => {
      if (dateKey !== todayKey) {
        filteredRecords[dateKey] = records.value[dateKey]
      }
    })

    return filteredRecords
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
  const addOneRecord = (distance: number, duration: number) => {
    const todayKey = getTodayKey();

    // 更新 records
    if (records.value[todayKey]) {
      records.value[todayKey].distance += distance
      records.value[todayKey].duration += duration
    } else {
      records.value[todayKey] = { distance, duration }
    }

    let weightedRecord = 0
    const speed = distance / duration // 平均速度 (m/min),

    if (speed >= 30) {
      weightedRecord = distance * 1.2 // 高於或等於30 m/min，給予1.2倍權重
    } else if (speed >= 25) {
      weightedRecord = distance * 1.0 // 介於25至30 m/min，給予1.0倍權重
    } else if (speed >= 20) {
      weightedRecord = distance * 0.8 // 介於20至25 m/min，給予0.8倍權重
    } else {
      weightedRecord = distance * 0.5 // 低於20 m/min，給予0.5倍權重
    }

    if (weightedRecords.value[todayKey]) {
      weightedRecords.value[todayKey] += weightedRecord
    } else {
      weightedRecords.value[todayKey] = weightedRecord
    }

    if (maxPastWeightedRecord.value === 0) {
      scores.value[todayKey] = SCORING_CONSTANTS.SWIMMING.INITIAL_SCORE
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

    const scoreChange = getSwimmingScoreChangeByRatio(ratio)
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
    records.value = {}
    weightedRecords.value = {}
    scores.value = {}
    ratios.value = {}
    ratioIncrements.value = {}
  }

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
      distance: 1000, // 1000公尺
      duration: 40    // 40分鐘，速度 25 m/min
    },
    "2025-09-24": {
      distance: 1200, // 1200公尺  
      duration: 45    // 45分鐘，速度 26.7 m/min
    },
    "2025-09-25": {
      distance: 1500, // 1500公尺
      duration: 50    // 50分鐘，速度 30 m/min
    }
  };

  weightedRecords.value = {
    ...weightedRecords.value,
    "2025-09-23": 1000,  // 25 m/min，1.0倍權重：1000 * 1.0 = 1000
    "2025-09-24": 1200,  // 26.7 m/min，1.0倍權重：1200 * 1.0 = 1200  
    "2025-09-25": 1800   // 30 m/min，1.2倍權重：1500 * 1.2 = 1800
  };

  scores.value = {
    ...scores.value,
    "2025-09-23": 70,   // 游泳初始分數
    "2025-09-24": 78,   // 進步了8分
    "2025-09-25": 88    // 持續進步，增加10分
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
    firstDateKey,
    pastRecords,
    pastWeightedRecords,
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
    addOneRecord,
    getScoreByDate,
    getScoreByWeek,
    getScoreByMonth,
    getWeightedRecordByDate,
    getWeightedRecordByWeek,
    getWeightedRecordByMonth,
    clearAllHistory,

    // for chart
    left: {
      unit: "分",
      data: {
        '分數': {
          getValueByDate: getScoreByDate,
          getValueByWeek: getScoreByWeek,
          getValueByMonth: getScoreByMonth
        }
      }
    },
    right: {
      unit: '公尺',
      data: {
        '加權里程數': {
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

