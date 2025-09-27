import { ref, computed } from "vue"

enum ChartPeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

// 圖例顯示狀態枚舉
enum LegendState {
  Hidden = 0,    // 隱藏
  Visible = 1,   // 顯示
  WithValues = 2 // 顯示並顯示數值
}

const DayNames: Record<string, string> = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六'
}

export interface DataProvider {
  left: {
    unit: string,
    data: {
      [name: string]: {
        getValueByDate: (date: Date) => number
      }
    }
  },
  right?: {
    unit: string,
    data: {
      [name: string]: {
        getValueByDate: (date: Date) => number
      }
    }
  }
}

export interface LineChartDataPoint {
  date: Date
  label: string
  dateLabel: string
  leftValues: { [name: string]: number }
  rightValues?: { [name: string]: number }
}

export function useLineChart(dataProvider: DataProvider) {
  const period = ref<ChartPeriod>(ChartPeriod.Day)
  const chartHeight = 240

  // 圖例狀態管理（使用數字表示狀態）
  const leftLegendStates = ref<Record<string, LegendState>>({})
  const rightLegendStates = ref<Record<string, LegendState>>({})

  // 初始化圖例狀態（預設為顯示狀態）
  const initializeLegendStates = () => {
    Object.keys(dataProvider.left.data).forEach(name => {
      if (!(name in leftLegendStates.value)) {
        leftLegendStates.value[name] = LegendState.Visible
      }
    })
    
    if (dataProvider.right) {
      Object.keys(dataProvider.right.data).forEach(name => {
        if (!(name in rightLegendStates.value)) {
          rightLegendStates.value[name] = LegendState.Visible
        }
      })
    }
  }

  // 切換左軸圖例狀態（循環：顯示 -> 顯示數值 -> 隱藏 -> 顯示）
  const toggleLeftLegend = (dataName: string) => {
    const currentState = leftLegendStates.value[dataName]
    leftLegendStates.value[dataName] = (currentState + 1) % 3 as LegendState
  }

  // 切換右軸圖例狀態
  const toggleRightLegend = (dataName: string) => {
    const currentState = rightLegendStates.value[dataName]
    rightLegendStates.value[dataName] = (currentState + 1) % 3 as LegendState
  }

  // 檢查左軸是否有任何可見圖例
  const hasVisibleLeftLegends = computed(() => {
    return Object.values(leftLegendStates.value).some(state => state !== LegendState.Hidden)
  })

  // 檢查右軸是否有任何可見圖例
  const hasVisibleRightLegends = computed(() => {
    return Object.values(rightLegendStates.value).some(state => state !== LegendState.Hidden)
  })

  // 檢查左軸圖例是否可見
  const isLeftLegendVisible = (dataName: string) => {
    return leftLegendStates.value[dataName] !== LegendState.Hidden
  }

  // 檢查右軸圖例是否可見
  const isRightLegendVisible = (dataName: string) => {
    return rightLegendStates.value[dataName] !== LegendState.Hidden
  }

  // 檢查左軸圖例是否顯示數值
  const shouldShowLeftValues = (dataName: string) => {
    return leftLegendStates.value[dataName] === LegendState.WithValues
  }

  // 檢查右軸圖例是否顯示數值
  const shouldShowRightValues = (dataName: string) => {
    return rightLegendStates.value[dataName] === LegendState.WithValues
  }

  // 計算圖表標題
  const chartTitle = computed(() => {
    const periodTitles = {
      [ChartPeriod.Day]: '近七日趨勢',
      [ChartPeriod.Week]: '近七週趨勢',
      [ChartPeriod.Month]: '近七月趨勢'
    }
    return periodTitles[period.value]
  })

  // 生成圖表數據
  const chartData = computed((): LineChartDataPoint[] => {
    const data: LineChartDataPoint[] = []
    const today = new Date()

    if (period.value === ChartPeriod.Day) {
      // 日視圖：顯示過去7天
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        
        const leftValues: { [name: string]: number } = {}
        Object.keys(dataProvider.left.data).forEach(name => {
          leftValues[name] = dataProvider.left.data[name].getValueByDate(date)
        })

        const rightValues: { [name: string]: number } = {}
        if (dataProvider.right) {
          Object.keys(dataProvider.right.data).forEach(name => {
            rightValues[name] = dataProvider.right!.data[name].getValueByDate(date)
          })
        }

        const label = i === 0 ? '今天' : i === 1 ? '昨天' : `週${DayNames[date.getDay().toString()]}`
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`

        data.push({
          date,
          label,
          dateLabel,
          leftValues,
          rightValues: dataProvider.right ? rightValues : undefined
        })
      }
    } else if (period.value === ChartPeriod.Week) {
      // 週視圖：顯示過去7週
      for (let i = 6; i >= 0; i--) {
        const endDate = new Date(today)
        endDate.setDate(today.getDate() - (i * 7))
        
        const startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - 6)

        // 累積一週的數據
        const leftValues: { [name: string]: number } = {}
        Object.keys(dataProvider.left.data).forEach(name => {
          leftValues[name] = 0
        })

        const rightValues: { [name: string]: number } = {}
        if (dataProvider.right) {
          Object.keys(dataProvider.right.data).forEach(name => {
            rightValues[name] = 0
          })
        }

        // 累積7天的數據
        for (let d = 0; d < 7; d++) {
          const currentDate = new Date(startDate)
          currentDate.setDate(startDate.getDate() + d)

          Object.keys(dataProvider.left.data).forEach(name => {
            leftValues[name] += dataProvider.left.data[name].getValueByDate(currentDate)
          })

          if (dataProvider.right) {
            Object.keys(dataProvider.right.data).forEach(name => {
              rightValues[name] += dataProvider.right!.data[name].getValueByDate(currentDate)
            })
          }
        }

        const label = i === 0 ? '本週' : `${i}週前`
        const dateLabel = `${startDate.getMonth() + 1}/${startDate.getDate()}`

        data.push({
          date: endDate,
          label,
          dateLabel,
          leftValues,
          rightValues: dataProvider.right ? rightValues : undefined
        })
      }
    } else {
      // 月視圖：顯示過去7個月
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setMonth(today.getMonth() - i)
        date.setDate(1) // 設為月初

        const leftValues: { [name: string]: number } = {}
        Object.keys(dataProvider.left.data).forEach(name => {
          leftValues[name] = 0
        })

        const rightValues: { [name: string]: number } = {}
        if (dataProvider.right) {
          Object.keys(dataProvider.right.data).forEach(name => {
            rightValues[name] = 0
          })
        }

        // 累積整個月的數據
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        for (let d = 1; d <= daysInMonth; d++) {
          const currentDate = new Date(date.getFullYear(), date.getMonth(), d)

          Object.keys(dataProvider.left.data).forEach(name => {
            leftValues[name] += dataProvider.left.data[name].getValueByDate(currentDate)
          })

          if (dataProvider.right) {
            Object.keys(dataProvider.right.data).forEach(name => {
              rightValues[name] += dataProvider.right!.data[name].getValueByDate(currentDate)
            })
          }
        }

        const label = i === 0 ? '本月' : `${i}月前`
        const dateLabel = `${date.getMonth() + 1}月`

        data.push({
          date,
          label,
          dateLabel,
          leftValues,
          rightValues: dataProvider.right ? rightValues : undefined
        })
      }
    }

    return data
  })

  // 計算左軸最大值（只考慮可見的圖例）
  const leftYAxisMax = computed(() => {
    const visibleLeftValues = chartData.value.flatMap(item => 
      Object.entries(item.leftValues)
        .filter(([name]) => isLeftLegendVisible(name))
        .map(([, value]) => value)
    )
    const maxValue = Math.max(...visibleLeftValues, 0)
    return Math.ceil(maxValue * 1.2 / 5) * 5 || 10
  })

  // 計算右軸最大值（只考慮可見的圖例）
  const rightYAxisMax = computed(() => {
    if (!dataProvider.right) return 0
    
    const visibleRightValues = chartData.value.flatMap(item => 
      item.rightValues ? Object.entries(item.rightValues)
        .filter(([name]) => isRightLegendVisible(name))
        .map(([, value]) => value) : []
    )
    const maxValue = Math.max(...visibleRightValues, 0)
    return Math.ceil(maxValue * 1.2 / 5) * 5 || 10
  })

  // 切換圖表週期
  const toggleChartPeriod = () => {
    if (period.value === ChartPeriod.Day) {
      period.value = ChartPeriod.Week
    } else if (period.value === ChartPeriod.Week) {
      period.value = ChartPeriod.Month
    } else {
      period.value = ChartPeriod.Day
    }
  }

  // 初始化圖例狀態
  initializeLegendStates()

  return {
    // 狀態
    period,
    chartHeight,
    leftLegendStates,
    rightLegendStates,
    
    // 計算屬性
    chartTitle,
    chartData,
    leftYAxisMax,
    rightYAxisMax,
    hasVisibleLeftLegends,
    hasVisibleRightLegends,
    
    // 方法
    toggleChartPeriod,
    toggleLeftLegend,
    toggleRightLegend,
    isLeftLegendVisible,
    isRightLegendVisible,
    shouldShowLeftValues,
    shouldShowRightValues,
    
    // 常數
    dataProvider,
    LegendState
  }
}

