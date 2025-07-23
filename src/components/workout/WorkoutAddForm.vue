<template>
  <TheForm title="新增動作" :handleSubmit="handleSubmit">
    <FormInput type="select" v-model="selectWorkout" :options="workoutStore.workoutOptions"
      v-if="workoutStore.workoutOptions.length > 1 && !inputWorkout" />
    <template v-if="!selectWorkout">
      <FormInput v-model="inputWorkout" type="text" placeholder="動作名稱" />
    </template>
    <div class="grid grid-cols-2 gap-4" v-if="inputWorkout || selectWorkout">
      <FormInput type="number" placeholder="次數" v-model="inputNumber" />
      <FormInput type="number" placeholder="重量" v-model="inputWeight" />
    </div>
    <div class="grid grid-cols-2 gap-3" v-if="(inputWorkout || selectWorkout) && inputNumber && inputWeight">
      <BaseButton type="button" color="gray" text="清除"
        @click="() => { inputWorkout = ''; selectWorkout = ''; inputNumber = undefined; inputWeight = undefined; }" />
      <BaseButton type="submit" color="green" text="新增紀錄" />
    </div>
  </TheForm>
</template>

<script setup lang="ts">
import TheForm from '../ui/TheForm.vue';
import FormInput from '../ui/FormInput.vue'; // 引入新的 FormInput 組件
import BaseButton from '../ui/BaseButton.vue';
import { ref } from 'vue';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { useToggleButton } from '@/composables/useToggleButton';

const inputWorkout = ref(''); // 用於綁定輸入框的值
const selectWorkout = ref(''); // 用於綁定下拉選單的值
const inputNumber = ref<number | undefined>(undefined); // 用於綁定次數輸入框的值
const inputWeight = ref<number | undefined>(undefined); // 用於綁定重量輸入框的值

const workoutStore = useDailyWorkoutStore();
const { toggleForm } = useToggleButton('workout');

const handleSubmit = () => {
  const workout = selectWorkout.value || inputWorkout.value;
  
  if (workout && inputNumber.value && inputWeight.value) {
    // 調用 store 的 addWorkout action
    workoutStore.addWorkout(
      workout,
      inputNumber.value,
      inputWeight.value
    );

    toggleForm();
    
    // 清空表單
    inputWorkout.value = '';
    selectWorkout.value = '';
    inputNumber.value = undefined;
    inputWeight.value = undefined;
  }
};
</script>
