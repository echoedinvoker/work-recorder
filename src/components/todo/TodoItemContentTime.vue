<template>
  <div v-if="todo.isActive && todo.nextDue" class="mb-4">
    <div class="flex items-center gap-4">
      <!-- 圓形進度條 -->
      <div class="relative w-16 h-16">
        <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
          <!-- 背景圓 -->
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" stroke-width="4" />
          <!-- 進度圓 -->
          <circle cx="32" cy="32" r="28" fill="none" :stroke="progressColor" stroke-width="4" stroke-linecap="round"
            :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset"
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
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';

const {
  currentTodo: todo,
  formatTimeRemaining,
  formatDate,
  progressColor,
  progressColorClass,
  timeTextColor,
  circumference,
  strokeDashoffset,
  progressPercentage
} = useTodo()
</script>
