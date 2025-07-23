import { ref, computed } from "vue"

type ChartPeriod = 'day' | 'week' | 'month'

// 定義資料提供者介面
export interface ScoreProvider {
  getScoreByDate: (date: Date) => number
}

const chartHeight = 192
const periodTitles: Record<ChartPeriod, string> = {
  day: '近七日分數趨勢',
  week: '近七週分數趨勢',
  month: '近七月分數趨勢'
}
const dayNames = ['日', '一', '二', '三', '四', '五', '六'] // to format day labels

// 將 currentPeriod 移到函數內部，避免全局共享狀態
export function useChart(scoreProvider: ScoreProvider) {
  const currentPeriod = ref<ChartPeriod>('day')

  // Computed properties
  const chartTitle = computed(() => {
    return periodTitles[currentPeriod.value]
  })
  
  const chartData = computed(() => {
    const data = []
    const today = new Date()

    if (currentPeriod.value === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        // 使用傳入的 scoreProvider 而非硬編碼的 dailyScoreStore
        const score = scoreProvider.getScoreByDate(date)
        const label = i === 0 ? '今天' : i === 1 ? '昨天' : `週${dayNames[date.getDay()]}`
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`

        data.push({
          date,
          score,
          label,
          dateLabel
        })
      }
    } else if (currentPeriod.value === 'week') {
      const date = new Date(today)
      for (let i = 0; i <= 6; i++) {
        let score = 0
        do {
          // 使用傳入的 scoreProvider
          score += scoreProvider.getScoreByDate(date)
          date.setDate(date.getDate() - 1)
        } while (date.getDay() !== 6)

        const label = i === 0 ? '本週' : `${i}週前`
        const dateLabel = `${date.getMonth() + 1}/${date.getDate() + 1}`

        data.unshift({
          date,
          score,
          label,
          dateLabel
        })
      }
    } else {
      // month
      const date = new Date(today)
      for (let i = 0; i <= 6; i++) {
        let score = 0
        let tmpMonth = date.getMonth()
        do {
          tmpMonth = date.getMonth()
          // 使用傳入的 scoreProvider
          score += scoreProvider.getScoreByDate(date)
          date.setDate(date.getDate() - 1)
        } while (date.getMonth() === tmpMonth)

        const label = i === 0 ? '本月' : `${i}月前`
        const dateLabel = `${(date.getMonth() + 2)%12}月`

        data.unshift({
          date,
          score,
          label,
          dateLabel
        })
      }
    }

    return data
  })
  
  const yAxisMax = computed(() => {
    const maxDataScore = Math.max(...chartData.value.map(item => item.score), 0)

    // 根據不同週期設定不同的基準值
    let minMax = 10
    if (currentPeriod.value === 'week') {
      minMax = 50 // 週累積分數基準
    } else if (currentPeriod.value === 'month') {
      minMax = 200 // 月累積分數基準
    }

    const calculatedMax = Math.max(maxDataScore * 1.2, minMax)
    return Math.ceil(calculatedMax / 5) * 5
  })
  
  const tototalScore = computed(() => {
    return chartData.value.reduce((sum, item) => sum + item.score, 0)
  })

  const avgScore = computed(() => {
    const totalScore = chartData.value.reduce((sum, item) => sum + item.score, 0)
    return totalScore ? (totalScore / 7).toFixed(1) : '0.0'
  })
  
  const maxScore = computed(() => {
    return Math.max(...chartData.value.map(item => item.score), 0)
  })

  // Actions
  const toggleChartPeriod = () => {
    if (currentPeriod.value === 'day') {
      currentPeriod.value = 'week'
    } else if (currentPeriod.value === 'week') {
      currentPeriod.value = 'month'
    } else {
      currentPeriod.value = 'day'
    }
  }

  return {
    // Constants
    chartHeight,

    // States
    currentPeriod,

    // Computed properties
    chartTitle,
    chartData,
    yAxisMax,
    tototalScore,
    avgScore,
    maxScore,

    // Actions
    toggleChartPeriod
  }
}

