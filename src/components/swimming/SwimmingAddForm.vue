<template>
  <TheForm title="新增游泳紀錄" :handle-submit="handleSubmit">
    <FormInput v-model="inputValue" type="number" placeholder="輸入里程數(公尺)" />
    <div class="grid grid-cols-2 gap-3" v-if="inputValue">
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

const inputValue = ref<number | undefined>(undefined);

const { toggleForm } = useToggleButton('swimming');
const store = useDailySwimmingStore()

const handleSubmit = () => {
  if (inputValue.value) {
    store.addDistance(inputValue.value);
    toggleForm();
    clearInput();
  }
};

const clearInput = () => {
  inputValue.value = undefined;
};
</script>
