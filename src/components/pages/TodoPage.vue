<template>
  <div class="flex flex-col h-screen max-w-4xl mx-auto p-4">
    <!-- 新增任務按鈕 - 固定在頂部 -->
    <div class="flex justify-center mb-4 flex-shrink-0">
      <TodoButton />
    </div>

    <!-- 內容區域 - 可滾動 -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- 新增 Todo 表單 -->
      <div v-if="showAddForm" class="bg-white rounded-lg shadow-md p-4 mb-4 flex-shrink-0">
        <TodoAddForm />
      </div>

      <!-- 單一 Todo 檢視 -->
      <div v-if="!showAddForm" class="flex-1 flex flex-col min-h-0">
        <TodoSingle />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';
import TodoButton from '@/components/todo/TodoButton.vue';
import TodoAddForm from '@/components/todo/TodoAddForm.vue';
import TodoSingle from '@/components/todo/TodoSingle.vue';

const {
  showAddForm,
} = useTodo();
</script>

