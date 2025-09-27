import { ref, computed } from "vue"

enum ChartPeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

enum LegendState {
  Hidden = 0,
  Visible = 1,
  WithValues = 2
}

const DayNames: Record<string, string> = {
  0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六'
}

export interface DataProvider {
  left: {
    unit: string,
    data: {
      [name: string]: {
        getValueByDate: (date: Date) => number
        getValueByWeek: (date: Date) => number
        getValueByMonth: (date: Date) => number
      }
    },
    formatValue?: (value: number) => string // 左軸格式化方法
  },
  right?: {
    unit: string,
    data: {
      [name: string]: {
        getValueByDate: (date: Date) => number
        getValueByWeek: (date: Date) => number
        getValueByMonth: (date: Date) => number
      }
    },
    formatValue?: (value: number) => string // 右軸格式化方法
  },
  // 格式化方法
  formatLeftValue: (value: number) => string,
  formatRightValue: (value: number) => string
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

  const leftLegendStates = ref<Record<string, LegendState>>({})
  const rightLegendStates = ref<Record<string, LegendState>>({})

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

  const toggleLeftLegend = (dataName: string) => {
    const currentState = leftLegendStates.value[dataName]
    leftLegendStates.value[dataName] = (currentState + 1) % 3 as LegendState
  }

  const toggleRightLegend = (dataName: string) => {
    const currentState = rightLegendStates.value[dataName]
    rightLegendStates.value[dataName] = (currentState + 1) % 3 as LegendState
  }

  const hasVisibleLeftLegends = computed(() => {
    return Object.values(leftLegendStates.value).some(state => state !== LegendState.Hidden)
  })

  const hasVisibleRightLegends = computed(() => {
    return Object.values(rightLegendStates.value).some(state => state !== LegendState.Hidden)
  })

  const isLeftLegendVisible = (dataName: string) => {
    return leftLegendStates.value[dataName] !== LegendState.Hidden
  }

  const isRightLegendVisible = (dataName: string) => {
    return rightLegendStates.value[dataName] !== LegendState.Hidden
  }

  const shouldShowLeftValues = (dataName: string) => {
    return leftLegendStates.value[dataName] === LegendState.WithValues
  }

  const shouldShowRightValues = (dataName: string) => {
    return rightLegendStates.value[dataName] === LegendState.WithValues
  }

  const formatLeftValue = (value: number): string => {
    return dataProvider.formatLeftValue(value)
  }

  const formatRightValue = (value: number): string => {
    return dataProvider.formatRightValue(value)
  }

  const chartTitle = computed(() => {
    const periodTitles = {
      [ChartPeriod.Day]: '近七日趨勢',
      [ChartPeriod.Week]: '近七週趨勢',
      [ChartPeriod.Month]: '近七月趨勢'
    }
    return periodTitles[period.value]
  })

  // 簡化的數據生成函數
  const generateDataPoint = (date: Date, index: number): LineChartDataPoint => {
    // 根據週期選擇對應的數據獲取方法
    const getValueMethod = {
      [ChartPeriod.Day]: 'getValueByDate',
      [ChartPeriod.Week]: 'getValueByWeek',
      [ChartPeriod.Month]: 'getValueByMonth'
    }[period.value] as keyof DataProvider['left']['data'][string]

    // 獲取左軸數據
    const leftValues: { [name: string]: number } = {}
    Object.keys(dataProvider.left.data).forEach(name => {
      leftValues[name] = dataProvider.left.data[name][getValueMethod](date)
    })

    // 獲取右軸數據
    const rightValues: { [name: string]: number } = {}
    if (dataProvider.right) {
      Object.keys(dataProvider.right.data).forEach(name => {
        rightValues[name] = dataProvider.right!.data[name][getValueMethod](date)
      })
    }

    // 生成標籤
    const { label, dateLabel } = generateLabels(date, index)

    return {
      date,
      label,
      dateLabel,
      leftValues,
      rightValues: dataProvider.right ? rightValues : undefined
    }
  }

  // 生成標籤的輔助函數
  const generateLabels = (date: Date, index: number) => {
    if (period.value === ChartPeriod.Day) {
      const label = index === 0 ? '今天' : index === 1 ? '昨天' : `週${DayNames[date.getDay().toString()]}`
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
      return { label, dateLabel }
    } else if (period.value === ChartPeriod.Week) {
      const label = index === 0 ? '本週' : `${index}週前`
      const startDate = new Date(date)
      startDate.setDate(date.getDate() - 6)
      const dateLabel = `${startDate.getMonth() + 1}/${startDate.getDate()}`
      return { label, dateLabel }
    } else {
      const label = index === 0 ? '本月' : `${index}月前`
      const dateLabel = `${date.getMonth() + 1}月`
      return { label, dateLabel }
    }
  }

  // 簡化的圖表數據生成
  const chartData = computed((): LineChartDataPoint[] => {
    const data: LineChartDataPoint[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      let date: Date

      if (period.value === ChartPeriod.Day) {
        date = new Date(today)
        date.setDate(today.getDate() - i)
      } else if (period.value === ChartPeriod.Week) {
        date = new Date(today)
        date.setDate(today.getDate() - (i * 7))
      } else {
        date = new Date(today)
        date.setMonth(today.getMonth() - i)
        date.setDate(1) // 設為月初
      }

      data.push(generateDataPoint(date, i))
    }

    return data
  })

  const leftYAxisMax = computed(() => {
    const visibleLeftValues = chartData.value.flatMap(item => 
      Object.entries(item.leftValues)
        .filter(([name]) => isLeftLegendVisible(name))
        .map(([, value]) => value)
    )
    const maxValue = Math.max(...visibleLeftValues, 0)
    return Math.ceil(maxValue * 1.2 / 5) * 5 || 10
  })

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

  const toggleChartPeriod = () => {
    if (period.value === ChartPeriod.Day) {
      period.value = ChartPeriod.Week
    } else if (period.value === ChartPeriod.Week) {
      period.value = ChartPeriod.Month
    } else {
      period.value = ChartPeriod.Day
    }
  }

  initializeLegendStates()

  return {
    period,
    chartHeight,
    leftLegendStates,
    rightLegendStates,
    chartTitle,
    chartData,
    leftYAxisMax,
    rightYAxisMax,
    hasVisibleLeftLegends,
    hasVisibleRightLegends,
    toggleChartPeriod,
    toggleLeftLegend,
    toggleRightLegend,
    isLeftLegendVisible,
    isRightLegendVisible,
    shouldShowLeftValues,
    shouldShowRightValues,
    formatLeftValue,  // 左軸格式化方法
    formatRightValue, // 右軸格式化方法
    dataProvider,
    LegendState
  }
}

