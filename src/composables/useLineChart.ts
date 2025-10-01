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
        isDiscrete?: boolean
        discreteValues?: number[]
        discreteLabels?: Record<number, string>
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
        isDiscrete?: boolean
        discreteValues?: number[]
        discreteLabels?: Record<number, string>
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
    }[period.value] as 'getValueByDate' | 'getValueByWeek' | 'getValueByMonth'

    // 獲取左軸數據
    const leftValues: { [name: string]: number } = {}
    Object.keys(dataProvider.left.data).forEach(name => {
      const dataConfig = dataProvider.left.data[name]
      const getValue = dataConfig[getValueMethod]
      if (typeof getValue === 'function') {
        leftValues[name] = getValue(date)
      }
    })

    // 獲取右軸數據
    const rightValues: { [name: string]: number } = {}
    if (dataProvider.right) {
      Object.keys(dataProvider.right.data).forEach(name => {
        const dataConfig = dataProvider.right!.data[name]
        const getValue = dataConfig[getValueMethod]
        if (typeof getValue === 'function') {
          rightValues[name] = getValue(date)
        }
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
      let label: string
      if (index === 0) {
        label = '本週'
      } else if (index === 1) {
        label = '上週'
      } else {
        // 計算週數 (ISO 8601 週數)
        const weekNumber = getWeekNumber(date)
        label = `W${weekNumber}`
      }

      const startDate = new Date(date)
      startDate.setDate(date.getDate() - 6)
      const dateLabel = `${startDate.getMonth() + 1}/${startDate.getDate()}`
      return { label, dateLabel }
    } else {
      let label: string
      if (index === 0) {
        label = '本月'
      } else {
        // 使用英文月份縮寫
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        label = monthNames[date.getMonth()]
      }

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
        // 找到本週的週一
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
        const mondayOfThisWeek = new Date(today)
        mondayOfThisWeek.setDate(today.getDate() - dayOfWeek + 1)

        // 從本週週一往前推 i 週
        date = new Date(mondayOfThisWeek)
        date.setDate(mondayOfThisWeek.getDate() - (i * 7))
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
    // 檢查是否有離散數值
    const hasDiscreteData = Object.values(dataProvider.left.data).some(config => config.isDiscrete)

    if (hasDiscreteData) {
      // 對於離散數值，使用預定義的範圍
      const allDiscreteValues = Object.values(dataProvider.left.data)
        .filter(config => config.isDiscrete && config.discreteValues)
        .flatMap(config => config.discreteValues!)

      if (allDiscreteValues.length > 0) {
        const maxDiscrete = Math.max(...allDiscreteValues)
        const minDiscrete = Math.min(...allDiscreteValues)
        // 為離散數值添加一些邊距
        return Math.max(Math.abs(maxDiscrete), Math.abs(minDiscrete)) + 1
      }
    }

    // 原有的連續數值邏輯
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

    // 檢查是否有離散數值
    const hasDiscreteData = Object.values(dataProvider.right.data).some(config => config.isDiscrete)

    if (hasDiscreteData) {
      const allDiscreteValues = Object.values(dataProvider.right.data)
        .filter(config => config.isDiscrete && config.discreteValues)
        .flatMap(config => config.discreteValues!)

      if (allDiscreteValues.length > 0) {
        const maxDiscrete = Math.max(...allDiscreteValues)
        const minDiscrete = Math.min(...allDiscreteValues)
        return Math.max(Math.abs(maxDiscrete), Math.abs(minDiscrete)) + 1
      }
    }

    // 原有的連續數值邏輯
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

  // helper functions
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  const getDiscreteYPosition = (value: number, discreteValues: number[], axisMax: number) => {
    const sortedValues = [...discreteValues].sort((a, b) => b - a) // 從大到小排序
    const index = sortedValues.indexOf(value)

    if (index === -1) return 50 // 如果找不到值，返回中間位置

    // 將離散值均勻分佈在 Y 軸上
    const step = 100 / (sortedValues.length - 1)
    return index * step
  }

  // 修改現有的位置計算函數
  const getLeftYPosition = (value: number, dataName?: string) => {
    // 檢查是否為離散數值
    if (dataName && dataProvider.left.data[dataName]?.isDiscrete) {
      const config = dataProvider.left.data[dataName]
      if (config.discreteValues) {
        return getDiscreteYPosition(value, config.discreteValues, leftYAxisMax.value)
      }
    }

    // 原有的連續數值邏輯
    const percentage = Math.max(0, Math.min(1, (leftYAxisMax.value - value) / leftYAxisMax.value))
    return percentage * 100
  }

  const getRightYPosition = (value: number, dataName?: string) => {
    // 檢查是否為離散數值
    if (dataName && dataProvider.right?.data[dataName]?.isDiscrete) {
      const config = dataProvider.right.data[dataName]
      if (config.discreteValues) {
        return getDiscreteYPosition(value, config.discreteValues, rightYAxisMax.value)
      }
    }

    // 原有的連續數值邏輯
    const percentage = Math.max(0, Math.min(1, (rightYAxisMax.value - value) / rightYAxisMax.value))
    return percentage * 100
  }

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
    LegendState,
    getLeftYPosition,
    getRightYPosition,
  }
}

