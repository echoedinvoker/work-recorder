<template>
  <TheForm title="新增週期性任務" :handleSubmit="handleAddTodo">
    <div>
      <FormInput type="text" v-model="newTodo.title" placeholder="任務標題" :required="true" />
    </div>
    <div>
      <FormInput type="textarea" v-model="newTodo.description" placeholder="任務描述（可選）" :rows="2" />
    </div>
    <div class="flex gap-3">
      <FormInput type="select" v-model="newTodo.period" :options="periodOptions" />
      <BaseButton type="submit" color="green" text="新增任務" />
    </div>
  </TheForm>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';
import TheForm from '../ui/TheForm.vue';
import FormInput from '../ui/FormInput.vue'; // 引入新的 FormInput 組件
import BaseButton from '../ui/BaseButton.vue';

const {
  handleAddTodo,
  newTodo
} = useTodo();

// 定義下拉選單選項
const periodOptions = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly', label: '每月' }
];
</script>
