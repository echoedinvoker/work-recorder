<template>
  <div class="second-page-container">
    <!-- 模式切換按鈕 -->
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
    <div class="content-area">
      <!-- 新增 Todo 表單 -->
      <div v-if="currentView === 'add'" class="form-container">
        <h2 class="form-title">新增週期性任務</h2>
        <form @submit.prevent="addTodo" class="todo-form">
          <div class="input-group">
            <input
              v-model="newTodo.title"
              type="text"
              placeholder="任務標題"
              class="form-input"
              required
            />
          </div>
          <div class="input-group">
            <textarea
              v-model="newTodo.description"
              placeholder="任務描述（可選）"
              class="form-textarea"
              rows="3"
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
        <div v-else class="todo-list">
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
const currentView = ref<'add' | 'list'>('list')
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
  /* 移除高度限制，讓內容自然延伸 */
  padding-bottom: 2rem; /* 底部留白，避免內容貼底 */
}

.mode-switcher {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  /* 移除所有滾動和高度限制 */
}

.form-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
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
}

.list-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
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
  /* 移除所有滾動限制，讓內容自然延伸 */
}
</style>
