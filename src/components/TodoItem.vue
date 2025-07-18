<template>
  <div class="bg-white rounded-lg shadow-md p-6 border-l-4" :class="borderColor">
    <div class="flex flex-col items-start justify-between">
      <div class="flex-1">
        <!-- 任務標題和描述 -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ todo.title }}</h3>
          <p v-if="todo.description" class="text-gray-600 mt-1">{{ todo.description }}</p>
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span class="px-2 py-1 bg-gray-100 rounded-full">{{ getPeriodText(todo.period) }}</span>
            <span class="flex items-center gap-1">
              連續 {{ todo.streak }} 次
              <!-- 火焰顯示區域 -->
              <span class="flex items-center">
                <span v-if="todo.streak <= 10" class="text-orange-500">
                  {{ '🔥'.repeat(todo.streak) }}
                </span>
                <span v-else-if="todo.streak <= 50" class="text-orange-500 flex items-center">
                  {{ '🔥'.repeat(10) }}
                  <span class="ml-1 text-xs bg-orange-100 text-orange-700 px-1 rounded">
                    +{{ todo.streak - 10 }}
                  </span>
                </span>
                <span v-else class="text-orange-500 flex items-center">
                  🔥🔥🔥
                  <span class="ml-1 text-xs bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded-full font-bold">
                    {{ todo.streak }}
                  </span>
                </span>
              </span>
            </span>
          </div>
        </div>

        <!-- 時間顯示 -->
        <div v-if="todo.isActive && todo.nextDue" class="mb-4">
          <div class="flex items-center gap-4">
            <!-- 圓形進度條 -->
            <div class="relative w-16 h-16">
              <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <!-- 背景圓 -->
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" stroke-width="4" />
                <!-- 進度圓 -->
                <circle cx="32" cy="32" r="28" fill="none" :stroke="progressColor" stroke-width="4"
                  stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset"
                  class="transition-all duration-300" />
              </svg>
              <!-- 中心文字 -->
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-semibold" :class="progressColorClass">
                  {{ Math.round(progressPercentage) }}%
                </span>
              </div>
            </div>

            <!-- 時間文字 -->
            <div>
              <div class="text-sm text-gray-600">剩餘時間</div>
              <div class="text-lg font-semibold" :class="timeTextColor">
                {{ formatTimeRemaining() }}
              </div>
              <div class="text-xs text-gray-500">
                截止：{{ formatDate(todo.nextDue) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 未開始狀態 -->
        <div v-else-if="!todo.isActive" class="mb-4">
          <div class="flex items-center gap-2 text-gray-500">
            <span class="w-4 h-4 rounded-full border-2 border-gray-300"></span>
            <span>點擊完成按鈕開始第一次任務</span>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="flex gap-2 ml-4">
        <button @click="$emit('complete', todo.id)" :disabled="!canComplete"
          class="px-4 py-2 rounded-lg font-medium transition-colors" :class="completeButtonClass">
          {{ completeButtonText }}
        </button>
        <button @click="$emit('delete', todo.id)"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          刪除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

interface Props {
  todo: Todo
}

interface Emits {
  (e: 'complete', id: string): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 工具函數
const getPeriodText = (period: 'daily' | 'weekly' | 'monthly'): string => {
  switch (period) {
    case 'daily': return '每日'
    case 'weekly': return '每週'
    case 'monthly': return '每月'
  }
}

const getPeriodMs = (period: 'daily' | 'weekly' | 'monthly'): number => {
  switch (period) {
    case 'daily': return 24 * 60 * 60 * 1000
    case 'weekly': return 7 * 24 * 60 * 60 * 1000
    case 'monthly': return 30 * 24 * 60 * 60 * 1000
  }
}

// 計算屬性
const timeRemaining = computed(() => {
  if (!props.todo.isActive || !props.todo.nextDue) return 0
  return Math.max(0, props.todo.nextDue.getTime() - Date.now())
})

const totalPeriodMs = computed(() => getPeriodMs(props.todo.period))

const progressPercentage = computed(() => {
  if (!props.todo.isActive || !props.todo.nextDue) return 100
  const remaining = timeRemaining.value
  return Math.max(0, (remaining / totalPeriodMs.value) * 100)
})

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

const borderColor = computed(() => {
  if (!props.todo.isActive) return 'border-gray-300'
  if (progressPercentage.value > 50) return 'border-green-500'
  if (progressPercentage.value > 20) return 'border-yellow-500'
  return 'border-red-500'
})

const canComplete = computed(() => {
  return !props.todo.isActive || timeRemaining.value > 0
})

const completeButtonText = computed(() => {
  if (!props.todo.isActive) return '開始任務'
  if (timeRemaining.value > 0) return '完成任務'
  return '已過期'
})

const completeButtonClass = computed(() => {
  if (!canComplete.value) {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }
  return 'bg-green-500 text-white hover:bg-green-600'
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
</script>

