import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useToggleButton } from './useToggleButton'

export interface Todo {
  id: string
  title: string
  description: string
  period: 'daily' | 'weekly' | 'monthly'
  streak: number
  lastCompleted: Date | null
  nextDue: Date | null
  isActive: boolean
}

interface NewTodo {
  title: string
  description: string
  period: 'daily' | 'weekly' | 'monthly'
}

// 響應式數據
const todos = ref<Todo[]>([])
const currentTodoIndex = ref(0) // 當前顯示的 todo 索引
const newTodo = reactive<NewTodo>({
  title: '',
  description: '',
  period: 'daily'
})

export function useTodo() {
  const { toggleForm } = useToggleButton('todo');
  const currentTodo = computed(() => todos.value[currentTodoIndex.value])
  const isLastTodo = computed(() => currentTodoIndex.value === todos.value.length - 1)
  const isFirstTodo = computed(() => currentTodoIndex.value === 0)

  const handleNext = () => {
    if (isLastTodo.value) return
    currentTodoIndex.value++
  }
  const handlePrev = () => {
    if (isFirstTodo.value) return
    currentTodoIndex.value--
  }
  const handleAddTodo = () => {
    const { title, description, period } = newTodo
    if (!title.trim()) return
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      title: title,
      description: description,
      period: period,
      streak: 0,
      lastCompleted: null,
      nextDue: null,
      isActive: false
    }
    todos.value.push(newTodoItem)
    toggleForm()
    resetNewTodo()
    currentTodoIndex.value = todos.value.length - 1
    saveTodos()
  }

  const completeTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    const now = new Date()

    if (todo.isActive && todo.nextDue && now <= todo.nextDue) {
      todo.streak++
    } else {
      todo.streak = 1
    }

    todo.lastCompleted = now
    todo.nextDue = new Date(now.getTime() + getPeriodMs(todo.period))
    todo.isActive = true

    saveTodos()
  }
  const resetNewTodo = () => {
    newTodo.title = ''
    newTodo.description = ''
    newTodo.period = 'daily'
  }
  const saveTodos = () => {
    localStorage.setItem('periodic-todos', JSON.stringify(todos.value))
  }
  const deleteTodo = (id: string) => {
    const todoIndex = todos.value.findIndex(t => t.id === id)
    if (todoIndex === -1) return

    todos.value = todos.value.filter(t => t.id !== id)

    // 調整當前索引
    if (currentTodoIndex.value >= todoIndex && currentTodoIndex.value > 0) {
      currentTodoIndex.value--
    }

    saveTodos()
  }
  const getPeriodMs = (period: 'daily' | 'weekly' | 'monthly'): number => {
    switch (period) {
      case 'daily': return 24 * 60 * 60 * 1000 * 1.2
      case 'weekly': return 7 * 24 * 60 * 60 * 1000 * 1.2
      case 'monthly': return 30 * 24 * 60 * 60 * 1000 * 1.2
    }
  }

  const loadTodos = () => {
    const saved = localStorage.getItem('periodic-todos')
    if (saved) {
      const parsed = JSON.parse(saved)
      todos.value = parsed.map((todo: any) => ({
        ...todo,
        lastCompleted: todo.lastCompleted ? new Date(todo.lastCompleted) : null,
        nextDue: todo.nextDue ? new Date(todo.nextDue) : null
      }))
    }
  }
  const checkExpiredTodos = () => {
    const now = new Date()
    todos.value.forEach(todo => {
      if (todo.isActive && todo.nextDue && now > todo.nextDue) {
        todo.streak = 0
        todo.isActive = false
        todo.nextDue = null
      }
    })
    saveTodos()
  }
  let intervalId: any = null
  onMounted(() => {
    loadTodos()
    checkExpiredTodos()
    intervalId = setInterval(checkExpiredTodos, 60000)
  })
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  // 計算屬性
  const timeRemaining = computed(() => {
    if (!currentTodo.value.isActive || !currentTodo.value.nextDue) return 0
    return Math.max(0, currentTodo.value.nextDue.getTime() - Date.now())
  })

  const totalPeriodMs = computed(() => getPeriodMs(currentTodo.value.period))

  const progressPercentage = computed(() => {
    if (!currentTodo.value.isActive || !currentTodo.value.nextDue) return 100
    const remaining = timeRemaining.value
    return Math.max(0, (remaining / totalPeriodMs.value) * 100)
  })



  const borderColor = computed(() => {
    if (!currentTodo.value.isActive) return 'border-gray-300'
    if (progressPercentage.value > 50) return 'border-green-500'
    if (progressPercentage.value > 20) return 'border-yellow-500'
    return 'border-red-500'
  })

  const canComplete = computed(() => {
    return !currentTodo.value.isActive || timeRemaining.value > 0
  })

  const completeButtonText = computed(() => {
    if (!currentTodo.value.isActive) return '開始任務'
    if (timeRemaining.value > 0) return '完成任務'
    return '已過期'
  })

  const completeButtonClass = computed(() => {
    if (!canComplete.value) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
    return 'bg-green-500 text-white hover:bg-green-600'
  })
  // 工具函數
  const getPeriodText = (period: 'daily' | 'weekly' | 'monthly'): string => {
    switch (period) {
      case 'daily': return '每日'
      case 'weekly': return '每週'
      case 'monthly': return '每月'
    }
  }

  const circumference = computed(() => 2 * Math.PI * 28)

  const strokeDashoffset = computed(() => {
    return circumference.value - (progressPercentage.value / 100) * circumference.value
  })

  const progressColor = computed(() => {
    if (progressPercentage.value > 50) return '#10b981'
    if (progressPercentage.value > 20) return '#eab308'
    return '#ef4444'
  })

  const progressColorClass = computed(() => {
    if (progressPercentage.value > 50) return 'text-green-500'
    if (progressPercentage.value > 20) return 'text-yellow-500'
    return 'text-red-500'
  })

  const timeTextColor = computed(() => {
    if (progressPercentage.value > 50) return 'text-green-600'
    if (progressPercentage.value > 20) return 'text-yellow-600'
    return 'text-red-600'
  })

  // 格式化函數
  const formatTimeRemaining = (): string => {
    const ms = timeRemaining.value
    if (ms <= 0) return '已過期'

    const days = Math.floor(ms / (24 * 60 * 60 * 1000))
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

    if (days > 0) return `${days}天 ${hours}小時`
    if (hours > 0) return `${hours}小時 ${minutes}分鐘`
    return `${minutes}分鐘`
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return {
    todos,
    currentTodo,
    currentTodoIndex,
    newTodo,
    isLastTodo,
    isFirstTodo,
    handleNext,
    handlePrev,
    handleAddTodo,
    completeTodo,
    resetNewTodo,
    deleteTodo,
    saveTodos,
    getPeriodMs,
    loadTodos,
    checkExpiredTodos,
    timeRemaining,
    totalPeriodMs,
    progressPercentage,
    borderColor,
    canComplete,
    completeButtonText,
    completeButtonClass,
    getPeriodText,
    circumference,
    strokeDashoffset,
    progressColor,
    progressColorClass,
    timeTextColor,
    formatTimeRemaining,
    formatDate,
  }
}
