<template>
  <h2 class="text-xl font-bold text-gray-800 mb-3">新增週期性任務</h2>
  <form @submit.prevent="handleAddTodo" class="space-y-3">
    <div>
      <input v-model="newTodo.title" type="text" placeholder="任務標題"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        required />
    </div>
    <div>
      <textarea v-model="newTodo.description" placeholder="任務描述（可選）"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        rows="2"></textarea>
    </div>
    <div class="flex gap-3">
      <select v-model="newTodo.period"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
        <option value="daily">每日</option>
        <option value="weekly">每週</option>
        <option value="monthly">每月</option>
      </select>
      <button type="submit"
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
        新增任務
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';

const {
  handleAddTodo,
  newTodo
} = useTodo();
</script>
