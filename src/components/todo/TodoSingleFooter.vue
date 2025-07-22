<template>
  <div class="flex justify-between items-center rounded-lg p-3 flex-shrink-0">
    <button @click="handlePrev" :disabled="currentTodoIndex === 0" :class="[
      'px-4 py-2 rounded-lg transition-colors text-sm',
      currentTodoIndex === 0
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-gray-500 text-white hover:bg-gray-600'
    ]">
      ← 上一個
    </button>

    <!-- 任務計數器 -->
    <div class="text-gray-600 text-sm font-medium">
      {{ currentTodoIndex + 1 }} / {{ todos.length }}
    </div>

    <button @click="handleNext" :disabled="currentTodoIndex === todos.length - 1" :class="[
      'px-4 py-2 rounded-lg transition-colors text-sm',
      currentTodoIndex === todos.length - 1
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-gray-500 text-white hover:bg-gray-600'
    ]">
      下一個 →
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';

const {
  todos,
  currentTodoIndex,
  handleNext,
  handlePrev
} = useTodo();
</script>
