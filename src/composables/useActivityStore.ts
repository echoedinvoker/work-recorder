import { ref, computed } from 'vue'
import { formatDateToKey, getTodayKey } from '@/utils/dateUtils'
import { SCORING_CONSTANTS } from '@/constants/scoringConstants'

interface BaseActivityStoreOptions<T> {
  title: string
  initialScore: number
  absencePenalty: number
  getScoreChange: (ratio: number) => number
  calculateWeightedRecord: (record: T) => number
  chartConfig: {
    left: {
      unit: string
      data: Record<string, any>
      formatValue?: (value: number) => string // 左軸專用格式化方法
    }
    right?: {
      unit: string
      data: Record<string, any>
      formatValue?: (value: number) => string // 右軸專用格式化方法
    }
  }
  thresholds: any
}

export function useActivityStore<T>(options: BaseActivityStoreOptions<T>) {
  // States
  const records = ref<{ [date: string]: T }>({})
  const weightedRecords = ref<{ [date: string]: number }>({})
  const scores = ref<{ [date: string]: number }>({})
  const ratios = ref<{ [date: string]: number }>({})
  const ratioIncrements = ref<{ [date: string]: number }>({})

  // Computed - Basic
  const firstDateKey = computed<string>(() => {
    const dateKeys = Object.keys(records.value)
    if (dateKeys.length === 0) return getTodayKey()
    return dateKeys.sort()[0]
  })
  const pastRecords = computed<{ [date: string]: T }>(() => {
    const todayKey = getTodayKey()
    const filteredRecords: { [date: string]: T } = {}

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
    const sortedDates = Object.keys(scores.value).sort().reverse()

    if (sortedDates.length < 2) return 0

    let consecutiveDays = 0

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = sortedDates[i]
      const previousDate = sortedDates[i + 1]

      const currentScore = scores.value[currentDate]
      const previousScore = scores.value[previousDate]

      if (currentScore > previousScore) {
        consecutiveDays++
      } else {
        break
      }
    }

    return consecutiveDays
  })
  const weeklyScores = computed<{ [weekKey: string]: number }>(() => {
    const weekly: { [weekKey: string]: number } = {}

    Object.entries(scores.value).forEach(([dateKey, score]) => {
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const weekNumber = getWeekNumber(date)
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

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
  const weeklyWeightedRecord = computed<{ [weekKey: string]: number }>(() => {
    const weekly: { [weekKey: string]: number } = {}

    Object.entries(weightedRecords.value).forEach(([dateKey, weightedRecord]) => {
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const weekNumber = getWeekNumber(date)
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

      weekly[weekKey] = (weekly[weekKey] || 0) + weightedRecord
    })

    return weekly
  })
  const monthlyScores = computed<{ [monthKey: string]: number }>(() => {
    const monthly: { [monthKey: string]: number } = {}

    Object.entries(scores.value).forEach(([dateKey, score]) => {
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`

      monthly[monthKey] = (monthly[monthKey] || 0) + score
    })

    return monthly
  })
  const consecutiveMonthlyGrowth = computed<number>(() => {
    const monthKeys = Object.keys(monthlyScores.value).sort().reverse()

    if (monthKeys.length < 2) return 0

    let consecutiveMonths = 0

    for (let i = 0; i < monthKeys.length - 1; i++) {
      const currentMonth = monthKeys[i]
      const previousMonth = monthKeys[i + 1]

      const currentScore = monthlyScores.value[currentMonth]
      const previousScore = monthlyScores.value[previousMonth]

      if (currentScore > previousScore) {
        consecutiveMonths++
      } else {
        break
      }
    }

    return consecutiveMonths
  })
  const monthlyWeightedRecord = computed<{ [monthKey: string]: number }>(() => {
    const monthly: { [monthKey: string]: number } = {}

    Object.entries(weightedRecords.value).forEach(([dateKey, weightedRecord]) => {
      const date = new Date(dateKey)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`

      monthly[monthKey] = (monthly[monthKey] || 0) + weightedRecord
    })

    return monthly
  })
  const scoreDiffFromYesterday = computed<number | null>(() => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    return scoreDiffBetweenDates(yesterday, today)
  })

  // Methods
  const updateScoreAndRatio = (additionalWeightedRecord: number) => {
    const todayKey = getTodayKey()

    // 更新加權記錄
    weightedRecords.value[todayKey] =
      (weightedRecords.value[todayKey] || 0) + additionalWeightedRecord

    // 如果沒有歷史記錄，使用初始分數
    if (maxPastWeightedRecord.value === 0) {
      scores.value[todayKey] = options.initialScore
      return
    }

    // 填補缺失的分數記錄
    const lastScoreDateKey = Object.keys(scores.value)
      .filter(key => key !== todayKey)
      .sort()
      .pop()

    if (lastScoreDateKey) {
      let startScore = scores.value[lastScoreDateKey]
      for (let date = new Date(lastScoreDateKey); formatDateToKey(date) < todayKey; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateToKey(date)
        if (!scores.value[dateKey]) {
          scores.value[dateKey] = Math.max(
            SCORING_CONSTANTS.COMMON.MIN_SCORE,
            startScore + options.absencePenalty
          )
        }
      }
    } else {
      // 設置昨日分數0
      const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
      scores.value[yesterdayKey] = 0;
    }

    // 計算比例和分數變化
    const ratio = weightedRecords.value[todayKey] / maxPastWeightedRecord.value
    ratioIncrements.value[todayKey] = ratio - (ratios.value[todayKey] || 0)
    ratios.value[todayKey] = ratio

    const lastDateKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    const scoreChange = options.getScoreChange(ratio)
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
    const year = week.getFullYear()
    const weekNumber = getWeekNumber(week)
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`
    return weeklyScores.value[weekKey] || 0
  }
  const getScoreByMonth = (month: Date): number => {
    const year = month.getFullYear()
    const monthNumber = month.getMonth() + 1
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`
    return monthlyScores.value[monthKey] || 0
  }
  const getWeightedRecordByWeek = (week: Date): number => {
    const year = week.getFullYear()
    const weekNumber = getWeekNumber(week)
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`
    return weeklyWeightedRecord.value[weekKey] || 0
  }
  const getWeightedRecordByMonth = (month: Date): number => {
    const year = month.getFullYear()
    const monthNumber = month.getMonth() + 1
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`
    return monthlyWeightedRecord.value[monthKey] || 0
  }
  const formatLeftValue = (value: number): string => {
    if (options.chartConfig.left.formatValue) {
      return options.chartConfig.left.formatValue(value)
    }
    // 默認格式化邏輯
    return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toString()
  }
  const formatRightValue = (value: number): string => {
    if (options.chartConfig.right?.formatValue) {
      return options.chartConfig.right.formatValue(value)
    }
    // 默認格式化邏輯
    return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toString()
  }

  const clearAllHistory = () => {
    records.value = {}
    weightedRecords.value = {}
    scores.value = {}
    ratios.value = {}
    ratioIncrements.value = {}
  }

  // Helper functions
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }
  const scoreDiffBetweenDates = (startDate: Date, endDate: Date): number | null => {
    const startKey = formatDateToKey(startDate)
    const endKey = formatDateToKey(endDate)

    if (!(startKey in scores.value) || !(endKey in scores.value)) {
      return null
    }

    return scores.value[endKey] - scores.value[startKey]
  }

  return {
    // Constants
    TITLE: options.title,

    // States
    records,
    weightedRecords,
    scores,
    ratios,
    ratioIncrements,

    // Computed
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
    scoreDiffFromYesterday,

    // Methods
    updateScoreAndRatio,
    getScoreByDate,
    getScoreByWeek,
    getScoreByMonth,
    getWeightedRecordByDate,
    getWeightedRecordByWeek,
    getWeightedRecordByMonth,
    formatLeftValue,
    formatRightValue,
    clearAllHistory,

    // Chart config
    left: options.chartConfig.left,
    right: options.chartConfig.right,
    thresholds: options.thresholds
  }
}

