<template>
  <div class="bg-white rounded-lg shadow-md p-6 border-l-4" :class="borderColor">
    <div class="h-full flex flex-col gap-3 items-start justify-between">
      <TodoItemContent />
      <TodoItemActions />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';
import TodoItemContent from '@/components/todo/TodoItemContent.vue';
import TodoItemActions from '@/components/todo/TodoItemActions.vue';

const {
  borderColor
} = useTodo()

</script>
