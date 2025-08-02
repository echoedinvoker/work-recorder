<template>
  <TheForm 
    title="新增冥想紀錄"
    :handleSubmit="handleSubmit"
  >
    <FormInput
      v-model="date"
      label="日期"
      type="date"
      :max="today"
      required
    />
    <FormInput
      v-model="duration"
      label="時間 (分鐘)"
      type="number"
      min="1"
      required
    />
    <FormInput
      v-model="notes"
      label="備註"
      type="text"
    />
  </TheForm>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDailyMeditationStore } from '@/stores/dailyMeditationStore';
import TheForm from '@/components/ui/TheForm.vue';
import FormInput from '@/components/ui/FormInput.vue';

// 獲取今天的日期，格式為 YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];
const date = ref(today);
const duration = ref('');
const notes = ref('');

const { addMeditationRecord } = useDailyMeditationStore();

const handleSubmit = () => {
  // 添加冥想記錄
  addMeditationRecord({
    date: date.value,
    duration: Number(duration.value),
    notes: notes.value
  });
  
  // 重置表單
  date.value = today;
  duration.value = '';
  notes.value = '';
};
</script>

