<template>
  <TheForm title="新增練習紀錄" :handle-submit="handleSubmit">
    <FormInput v-model="inputValue" type="number" placeholder="輸入練習次數" />
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
import { useAaaCountStore } from '@/stores/dailyAaaStore';

const inputValue = ref<number | undefined>(undefined);

const { toggleForm } = useToggleButton('aaa');
const store = useAaaCountStore();

const handleSubmit = () => {
  if (inputValue.value) {
    store.addCount(inputValue.value);
    toggleForm();
    clearInput();
  }
};

const clearInput = () => {
  inputValue.value = undefined;
};
</script>

