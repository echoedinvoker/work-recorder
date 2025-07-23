<template>
  <div class="grid grid-cols-2 gap-2 self-center">
    <BaseButton 
      @click="completeTodo(todo.id)" 
      :disabled="!canComplete"
      :color="completeButtonColor"
      :text="completeButtonText"
      class="py-4"
    />
    <BaseButton 
      @click="deleteTodo(todo.id)"
      color="red"
      text="刪除"
      class="py-4"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTodo } from '@/composables/useTodo';
import BaseButton from '@/components/ui/BaseButton.vue';

const {
  currentTodo: todo,
  completeTodo,
  deleteTodo,
  completeButtonText,
  completeButtonClass,
  canComplete,
} = useTodo();

// 根據 completeButtonClass 計算對應的顏色
const completeButtonColor = computed(() => {
  if (completeButtonClass.value.includes('bg-green')) {
    return 'green';
  } else if (completeButtonClass.value.includes('bg-yellow')) {
    return 'yellow';
  } else if (completeButtonClass.value.includes('bg-gray')) {
    return 'gray';
  } else {
    return 'blue'; // 預設顏色
  }
});
</script>

