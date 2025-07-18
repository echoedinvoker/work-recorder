<template>
  <div class="second-page-container" data-scrollable>
    <!-- 模式切換按鈕 - 固定在頂部 -->
    <div class="mode-switcher">
      <button
        @click="currentView = 'add'"
        :class="[
          'mode-btn',
          currentView === 'add' ? 'mode-btn-active' : 'mode-btn-inactive'
        ]"
      >
        新增任務
      </button>
      <button
        @click="currentView = 'list'"
        :class="[
          'mode-btn',
          currentView === 'list' ? 'mode-btn-active' : 'mode-btn-inactive'
        ]"
      >
        任務列表
      </button>
    </div>

    <!-- 內容區域 -->
    <div class="content-area" data-scrollable>
      <!-- 新增 Todo 表單 -->
      <div v-if="currentView === 'add'" class="form-container">
        <h2 class="form-title">新增週期性任務</h2>
        <form @submit.prevent="addTodo" class="todo-form">
          <div class="input-group">
            <input
              ref="titleInput"
              v-model="newTodo.title"
              type="text"
              placeholder="任務標題"
              class="form-input"
              required
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
          </div>
          <div class="input-group">
            <textarea
              ref="descriptionInput"
              v-model="newTodo.description"
              placeholder="任務描述（可選）"
              class="form-textarea"
              rows="3"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            ></textarea>
          </div>
          <div class="form-actions">
            <select
              v-model="newTodo.period"
              class="form-select"
            >
              <option value="daily">每日</option>
              <option value="weekly">每週</option>
              <option value="monthly">每月</option>
            </select>
            <button
              type="submit"
              class="submit-btn"
            >
              新增任務
            </button>
          </div>
        </form>
      </div>

      <!-- Todo 列表 -->
      <div v-if="currentView === 'list'" class="list-container">
        <h2 class="list-title">我的週期性任務</h2>
        <div v-if="todos.length === 0" class="empty-state">
          還沒有任何任務，開始新增第一個吧！
        </div>
        <div v-else class="todo-list" data-scrollable>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
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

<style scoped>
.second-page-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 使用 viewport height */
  max-height: 100vh;
  overflow: hidden; /* 防止整個容器滾動 */
}

.mode-switcher {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.mode-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.mode-btn-active {
  background-color: #3b82f6;
  color: white;
}

.mode-btn-inactive {
  background-color: #e5e7eb;
  color: #374151;
}

.mode-btn-inactive:hover {
  background-color: #d1d5db;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  /* 移動端滾動優化 */
  -webkit-overflow-scrolling: touch; /* iOS 平滑滾動 */
  overscroll-behavior: contain; /* 防止滾動穿透 */
}

.form-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.todo-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: transparent;
}

.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.submit-btn {
  padding: 0.5rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #2563eb;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%; /* 佔滿可用空間 */
}

.list-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  flex-shrink: 0; /* 標題不縮小 */
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1; /* 佔滿剩餘空間 */
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
  /* 移動端滾動優化 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* 滾動條樣式 */
.todo-list::-webkit-scrollbar {
  width: 4px;
}

.todo-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.todo-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.todo-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 移動端專用樣式 */
@media (max-width: 768px) {
  .content-area {
    /* 確保在移動端有足夠的滾動空間 */
    height: calc(100vh - 120px); /* 減去頂部按鈕的高度 */
  }
  
  .todo-list {
    /* 移除固定高度限制 */
    max-height: none;
  }
}
</style>
