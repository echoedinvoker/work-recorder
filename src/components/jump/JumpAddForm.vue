<template>
  <TheForm title="新增跳繩紀錄" :handle-submit="handleSubmit">
    <FormInput v-model="countsValue" type="number" placeholder="輸入次數" />
    <div class="grid grid-cols-2 gap-3" v-if="countsValue">
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
import { useDailyJumpStore } from '@/stores/dailyJumpStore';

const countsValue = ref<number | undefined>(undefined);

const { toggleForm } = useToggleButton('jump');
const store = useDailyJumpStore()

const handleSubmit = () => {
  if (countsValue.value) {
    store.addCounts(countsValue.value);
    toggleForm();
    clearInput();
  }
};

const clearInput = () => {
  countsValue.value = undefined;
};
</script>
