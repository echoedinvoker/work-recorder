<template>
  <button
    @click="showAddForm = !showAddForm"
    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
  >
    {{ showAddForm ? '取消新增' : '新增任務' }}
  </button>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';

const {
  showAddForm,
} = useTodo();
</script>
