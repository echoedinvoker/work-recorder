<template>
  <div class="grid grid-cols-2 gap-2 self-center">
    <button @click="completeTodo(todo.id)" :disabled="!canComplete"
      class="px-4 py-4 rounded-lg font-medium transition-colors" :class="completeButtonClass">
      {{ completeButtonText }}
    </button>
    <button @click="deleteTodo(todo.id)"
      class="px-4 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
      刪除
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';

const {
  currentTodo: todo,
  completeTodo,
  deleteTodo,
  completeButtonText,
  completeButtonClass,
  canComplete,
} = useTodo()
  
</script>
