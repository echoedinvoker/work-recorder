<template>
  <div v-if="todos.length === 0" class="text-gray-500 mt-8 mx-auto text-center">
    還沒有任何任務，開始新增第一個吧！
  </div>
  <div v-else class="flex-1 flex flex-col">
    <TodoItem :todo="currentTodo" @complete="completeTodo" @delete="deleteTodo" />
    <TodoSingleFooter />
  </div>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';
import TodoItem from '@/components/todo/TodoItem.vue';
import TodoSingleFooter from '@/components/todo/TodoSingleFooter.vue';

const {
  todos,
  currentTodo,
  completeTodo,
  deleteTodo,
} = useTodo();
</script>
