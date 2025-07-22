<template>
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800">{{ todo.title }}</h3>
      <p v-if="todo.description" class="text-gray-600 mt-1">{{ todo.description }}</p>
      <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
        <span class="px-2 py-1 bg-gray-100 rounded-full">{{ getPeriodText(todo.period) }}</span>
        <span class="flex items-center gap-1">
          連續 {{ todo.streak }} 次
          <!-- 火焰顯示區域 -->
          <span class="grid grid-cols-5">
            <span v-if="todo.streak <= 10" v-for="_, ind in Array.from({ length: todo.streak })" :key="ind"
              class="text-sm"> 🔥 </span>
            <span v-else v-for="_, i in Array.from({ length: 10 })" :key="i" class="text-sm"> 🔥 </span>
          </span>
          <span v-if="todo.streak > 10" class="text-sm"> +{{ todo.streak - 10 }} </span>
        </span>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';
  
const {
  currentTodo: todo,
  getPeriodText,
} = useTodo()
</script>
