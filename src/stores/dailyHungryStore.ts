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
            getValueByWeek: (week: Date) => getMostFrequentLevelByWeek(week),
            getValueByMonth: (month: Date) => getMostFrequentLevelByMonth(month),
            isDiscrete: true,
            discreteValues: [2, 1, 0, -1, -2],
            discreteLabels: {
              2: '很餓',
              1: '偏餓',
              0: '正常',
              [-1]: '偏飽',  // 負數 key 需要用方括號
              [-2]: '很飽'
            } as Record<number, string>
          }
        },
        formatValue: (level: number) => {
          const labels: Record<number, string> = {
            2: '很餓',
            1: '偏餓',
            0: '正常',
            [-1]: '偏飽',
            [-2]: '很飽'
          }
          return labels[level] || ''
        }
      }
    },
    thresholds: []
  })

  // 取得週數
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // 取得該週中出現最多的 level 值
  const getMostFrequentLevelByWeek = (week: Date): number | undefined => {
    const year = week.getFullYear()
    const weekNumber = getWeekNumber(week)
    
    // 收集該週所有的 level 值
    const levelCounts: { [level: number]: number } = {}
    
    Object.entries(baseStore.records.value).forEach(([dateKey, record]) => {
      const recordDate = new Date(dateKey)
      const recordYear = recordDate.getFullYear()
      const recordWeekNumber = getWeekNumber(recordDate)
      
      // 檢查是否屬於同一週
      if (recordYear === year && recordWeekNumber === weekNumber) {
        const level = record.level
        levelCounts[level] = (levelCounts[level] || 0) + 1
      }
    })
    
    // 找出出現次數最多的 level
    let mostFrequentLevel: number | undefined
    let maxCount = 0
    
    Object.entries(levelCounts).forEach(([level, count]) => {
      if (count > maxCount) {
        maxCount = count
        mostFrequentLevel = parseInt(level)
      }
    })
    
    return mostFrequentLevel
  }

  // 取得該月中出現最多的 level 值
  const getMostFrequentLevelByMonth = (month: Date): number | undefined => {
    const year = month.getFullYear()
    const monthNumber = month.getMonth() + 1
    
    // 收集該月所有的 level 值
    const levelCounts: { [level: number]: number } = {}
    
    Object.entries(baseStore.records.value).forEach(([dateKey, record]) => {
      const recordDate = new Date(dateKey)
      const recordYear = recordDate.getFullYear()
      const recordMonth = recordDate.getMonth() + 1
      
      // 檢查是否屬於同一月
      if (recordYear === year && recordMonth === monthNumber) {
        const level = record.level
        levelCounts[level] = (levelCounts[level] || 0) + 1
      }
    })
    
    // 找出出現次數最多的 level
    let mostFrequentLevel: number | undefined
    let maxCount = 0
    
    Object.entries(levelCounts).forEach(([level, count]) => {
      if (count > maxCount) {
        maxCount = count
        mostFrequentLevel = parseInt(level)
      }
    })
    
    return mostFrequentLevel
  }

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
    recordHungryLevel,
    getMostFrequentLevelByWeek,
    getMostFrequentLevelByMonth
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})

