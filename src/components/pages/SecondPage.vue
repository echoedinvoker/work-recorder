<template>
  <div class="flex flex-col h-screen max-w-4xl mx-auto p-4">
    <!-- 新增任務按鈕 - 固定在頂部 -->
    <div class="flex justify-center mb-4 flex-shrink-0">
      <button
        @click="showAddForm = !showAddForm"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        {{ showAddForm ? '取消新增' : '新增任務' }}
      </button>
    </div>

    <!-- 內容區域 - 可滾動 -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- 新增 Todo 表單 -->
      <div v-if="showAddForm" class="bg-white rounded-lg shadow-md p-4 mb-4 flex-shrink-0">
        <h2 class="text-xl font-bold text-gray-800 mb-3">新增週期性任務</h2>
        <form @submit.prevent="addTodo" class="space-y-3">
          <div>
            <input
              v-model="newTodo.title"
              type="text"
              placeholder="任務標題"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div>
            <textarea
              v-model="newTodo.description"
              placeholder="任務描述（可選）"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows="2"
            ></textarea>
          </div>
          <div class="flex gap-3">
            <select
              v-model="newTodo.period"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="daily">每日</option>
              <option value="weekly">每週</option>
              <option value="monthly">每月</option>
            </select>
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              新增任務
            </button>
          </div>
        </form>
      </div>

      <!-- 單一 Todo 檢視 -->
      <div v-if="!showAddForm" class="flex-1 flex flex-col min-h-0">
        <div v-if="todos.length === 0" class="flex-1 flex items-center justify-center text-gray-500">
          還沒有任何任務，開始新增第一個吧！
        </div>
        <div v-else class="flex-1 flex flex-col">
          <!-- 當前任務顯示 - 佔據剩餘空間 -->
            <TodoItem
              :todo="currentTodo"
              @complete="completeTodo"
              @delete="deleteTodo"
            />
          
          <!-- 底部導航區域 - 固定在底部 -->
          <div class="flex justify-between items-center bg-gray-50 rounded-lg p-3 flex-shrink-0">
            <button
              @click="previousTodo"
              :disabled="currentTodoIndex === 0"
              :class="[
                'px-4 py-2 rounded-lg transition-colors text-sm',
                currentTodoIndex === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              ]"
            >
              ← 上一個
            </button>
            
            <!-- 任務計數器 -->
            <div class="text-gray-600 text-sm font-medium">
              {{ currentTodoIndex + 1 }} / {{ todos.length }}
            </div>
            
            <button
              @click="nextTodo"
              :disabled="currentTodoIndex === todos.length - 1"
              :class="[
                'px-4 py-2 rounded-lg transition-colors text-sm',
                currentTodoIndex === todos.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              ]"
            >
              下一個 →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
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
const currentTodoIndex = ref(0) // 當前顯示的 todo 索引
const showAddForm = ref(false) // 控制新增表單顯示
const newTodo = reactive<NewTodo>({
  title: '',
  description: '',
  period: 'daily'
})

// 計算屬性：當前顯示的 todo
const currentTodo = computed(() => {
  return todos.value[currentTodoIndex.value]
})

// 監聽 todos 變化，確保索引不超出範圍
watch(todos, (newTodos) => {
  if (newTodos.length === 0) {
    currentTodoIndex.value = 0
  } else if (currentTodoIndex.value >= newTodos.length) {
    currentTodoIndex.value = newTodos.length - 1
  }
}, { deep: true })

// 導航函數
const previousTodo = () => {
  if (currentTodoIndex.value > 0) {
    currentTodoIndex.value--
  }
}

const nextTodo = () => {
  if (currentTodoIndex.value < todos.value.length - 1) {
    currentTodoIndex.value++
  }
}

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
  
  // 重置表單並隱藏
  newTodo.title = ''
  newTodo.description = ''
  newTodo.period = 'daily'
  showAddForm.value = false
  
  saveTodos()
  
  // 新增後顯示新增的任務
  currentTodoIndex.value = todos.value.length - 1
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
  const todoIndex = todos.value.findIndex(t => t.id === id)
  if (todoIndex === -1) return
  
  todos.value = todos.value.filter(t => t.id !== id)
  
  // 調整當前索引
  if (currentTodoIndex.value >= todoIndex && currentTodoIndex.value > 0) {
    currentTodoIndex.value--
  }
  
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
</script>

