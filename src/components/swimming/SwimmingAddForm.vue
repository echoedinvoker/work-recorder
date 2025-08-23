<template>
  <TheForm title="新增游泳紀錄" :handle-submit="handleSubmit">
    <FormInput v-model="distanceValue" type="number" placeholder="輸入里程數(公尺)" />
    <FormInput v-model="durationValue" type="number" placeholder="輸入游泳時間(分鐘)" />
    <div class="grid grid-cols-2 gap-3" v-if="distanceValue && durationValue">
      <BaseButton type="button" color="gray" text="清除" @click="clearInput" />
      <BaseButton type="submit" color="green" text="新增紀錄" />
    </div>
  </TheForm>
</template>

<script setup lang="ts">
import TheForm from '../ui/TheForm.vue';
import FormInput from '../ui/FormInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import { ref } from 'vue';
import { useToggleButton } from '@/composables/useToggleButton';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';

// 分別管理距離和時間的輸入值
const distanceValue = ref<number | undefined>(undefined);
const durationValue = ref<number | undefined>(undefined);

const { toggleForm } = useToggleButton('swimming');
const store = useDailySwimmingStore()

const handleSubmit = () => {
  // 確保兩個值都有輸入
  if (distanceValue.value && durationValue.value) {
    store.addDistance(distanceValue.value, durationValue.value);
    toggleForm();
    clearInput();
  }
};

const clearInput = () => {
  distanceValue.value = undefined;
  durationValue.value = undefined;
};
</script>
