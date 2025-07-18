<template>
  <!-- 調整容器高度計算方式 -->
  <div class="min-h-screen flex flex-col max-w-4xl mx-auto p-6" :style="containerStyle">
    <!-- 模式切換按鈕 - 固定在頂部 -->
    <div class="flex justify-center space-x-4 mb-6 flex-shrink-0">
      <button
        @click="currentView = 'add'"
        :class="[
          'px-6 py-2 rounded-lg transition-colors',
          currentView === 'add' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        新增任務
      </button>
      <button
        @click="currentView = 'list'"
        :class="[
          'px-6 py-2 rounded-lg transition-colors',
          currentView === 'list' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        任務列表
      </button>
    </div>

    <!-- 可滾動的內容區域 -->
    <div class="flex-1 overflow-y-auto space-y-6" ref="scrollContainer">
      <!-- 新增 Todo 表單 -->
      <div v-if="currentView === 'add'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">新增週期性任務</h2>
        <form @submit.prevent="addTodo" class="space-y-4">
          <div>
            <input
              v-model="newTodo.title"
              type="text"
              placeholder="任務標題"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
          </div>
          <div>
            <textarea
              v-model="newTodo.description"
              placeholder="任務描述（可選）"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            ></textarea>
          </div>
          <div class="flex gap-4">
            <select
              v-model="newTodo.period"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">每日</option>
              <option value="weekly">每週</option>
              <option value="monthly">每月</option>
            </select>
            <button
              type="submit"
              class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              新增任務
            </button>
          </div>
        </form>
      </div>

      <!-- Todo 列表 -->
      <div v-if="currentView === 'list'" class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">我的週期性任務</h2>
        <div v-if="todos.length === 0" class="text-center py-8 text-gray-500">
          還沒有任何任務，開始新增第一個吧！
        </div>
        <!-- Todo 項目容器 - 可滾動 -->
        <div v-else class="space-y-4 max-h-96 overflow-y-auto pr-2">
          <TodoItem
            v-for="todo in todos"
            :key="todo.id"
            :todo="todo"
            @complete="completeTodo"
            @delete="deleteTodo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import TodoItem from '../TodoItem.vue'

// 類型定義
interface Todo {
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
const currentView = ref<'add' | 'list'>('list') // 控制顯示模式
const newTodo = reactive<NewTodo>({
  title: '',
  description: '',
  period: 'daily'
})

// 工具函數
const getPeriodMs = (period: 'daily' | 'weekly' | 'monthly'): number => {
  switch (period) {
    case 'daily': return 24 * 60 * 60 * 1000
    case 'weekly': return 7 * 24 * 60 * 60 * 1000
    case 'monthly': return 30 * 24 * 60 * 60 * 1000
  }
}

// 新增 Todo
const addTodo = () => {
  if (!newTodo.title.trim()) return

  const todo: Todo = {
    id: Date.now().toString(),
    title: newTodo.title,
    description: newTodo.description,
    period: newTodo.period,
    streak: 0,
    lastCompleted: null,
    nextDue: null,
    isActive: false
  }

  todos.value.push(todo)
  
  // 重置表單
  newTodo.title = ''
  newTodo.description = ''
  newTodo.period = 'daily'
  
  saveTodos()
  
  // 新增後自動切換到列表視圖
  currentView.value = 'list'
}

// 完成 Todo
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

// 刪除 Todo
const deleteTodo = (id: string) => {
  todos.value = todos.value.filter(t => t.id !== id)
  saveTodos()
}

// 本地存儲
const saveTodos = () => {
  localStorage.setItem('periodic-todos', JSON.stringify(todos.value))
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

// 檢查過期任務
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

// 定時器
let intervalId: number | null = null

// 新增：處理鍵盤和滾動
const scrollContainer = ref<HTMLElement>()
const isKeyboardVisible = ref(false)

// 動態計算容器樣式
const containerStyle = computed(() => {
  if (isKeyboardVisible.value) {
    // 鍵盤顯示時使用視窗高度
    const viewportHeight = window.visualViewport?.height || window.innerHeight
    return {
      height: `${viewportHeight - 100}px` // 減去一些邊距
    }
  }
  return {}
})

// 處理輸入框焦點事件
const handleInputFocus = () => {
  isKeyboardVisible.value = true
  // 延遲滾動到輸入框位置
  setTimeout(() => {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && scrollContainer.value) {
      activeElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }, 300)
}

const handleInputBlur = () => {
  // 延遲重置，避免快速切換輸入框時的閃爍
  setTimeout(() => {
    if (!document.activeElement || 
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      isKeyboardVisible.value = false
      // 重置滾動位置
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0
      }
    }
  }, 100)
}

// 監聽視窗變化
const handleViewportChange = () => {
  const initialHeight = window.screen.height
  const currentHeight = window.visualViewport?.height || window.innerHeight
  const heightDifference = initialHeight - currentHeight
  
  // 如果高度差超過 150px，認為是鍵盤彈出
  if (heightDifference > 150) {
    isKeyboardVisible.value = true
  } else {
    isKeyboardVisible.value = false
    // 鍵盤收起時重置滾動位置
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
    }
  }
}

onMounted(() => {
  loadTodos()
  checkExpiredTodos()
  intervalId = setInterval(checkExpiredTodos, 60000)
  
  // 監聽視窗變化
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange)
  } else {
    window.addEventListener('resize', handleViewportChange)
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  
  // 清理事件監聽器
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportChange)
  } else {
    window.removeEventListener('resize', handleViewportChange)
  }
})
</script>

