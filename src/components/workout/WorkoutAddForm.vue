<template>
  <TheForm title="新增動作" :handleSubmit="handleSubmit">
    <FormInput type="select" v-model="selectWorkout" :options="activityOptions"
      v-if="workoutStore.activityList.length > 1 && !inputWorkout" />
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

  <!-- 最近記錄清單 -->
  <div v-if="recentSets.length > 0" class="mt-6">
    <h3 class="text-lg font-semibold mb-3 text-gray-700">最近記錄</h3>
    <div class="space-y-2">
      <div 
        v-for="(set, index) in recentSets" 
        :key="`${set.date}-${index}`"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <!-- 左側：次數和重量 -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <span class="text-lg font-bold text-blue-600">{{ set.count }}</span>
            <span class="text-sm text-gray-500">次</span>
          </div>
          <div class="w-px h-6 bg-gray-300"></div>
          <div class="flex items-center space-x-1">
            <span class="text-lg font-bold text-green-600">{{ set.weight }}</span>
            <span class="text-sm text-gray-500">kg</span>
          </div>
        </div>
        
        <!-- 右側：日期 -->
        <div class="text-sm text-gray-400">
          {{ formatDate(set.date) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TheForm from '../ui/TheForm.vue';
import FormInput from '../ui/FormInput.vue'; // 引入新的 FormInput 組件
import BaseButton from '../ui/BaseButton.vue';
import { ref, computed } from 'vue';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { useToggleButton } from '@/composables/useToggleButton';

const inputWorkout = ref(''); // 用於綁定輸入框的值
const selectWorkout = ref(''); // 用於綁定下拉選單的值
const inputNumber = ref<number | undefined>(undefined); // 用於綁定次數輸入框的值
const inputWeight = ref<number | undefined>(undefined); // 用於綁定重量輸入框的值

const workoutStore = useDailyWorkoutStore();
const { toggleForm } = useToggleButton('workout');

const activityOptions = computed(() => 
  workoutStore.activityList.map(activity => ({
    value: activity,
    label: activity
  }))
);

const recentSets = computed(() => {
  const currentActivity = selectWorkout.value || inputWorkout.value;
  
  if (!currentActivity) return [];
  
  // 收集所有有該動作記錄的日期
  const datesWithActivity: string[] = [];
  
  Object.entries(workoutStore.records).forEach(([date, dayRecord]) => {
    if (dayRecord[currentActivity] && dayRecord[currentActivity].length > 0) {
      datesWithActivity.push(date);
    }
  });
  
  // 按日期排序（最新的在前）並取前 3 個日期
  const recentDates = datesWithActivity
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 3);
  
  // 收集這 3 個日期的所有 sets
  const allSets: Array<{ count: number; weight: number; date: string }> = [];
  
  recentDates.forEach(date => {
    const dayRecord = workoutStore.records[date];
    if (dayRecord[currentActivity]) {
      dayRecord[currentActivity].forEach(set => {
        allSets.push({
          ...set,
          date
        });
      });
    }
  });
  
  // 按日期排序（最新的在前）
  return allSets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 格式化日期顯示
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // 檢查是否為今天
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  }
  
  // 檢查是否為昨天
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  
  // 其他日期顯示月/日格式
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const handleSubmit = () => {
  const workout = selectWorkout.value || inputWorkout.value;
  
  if (workout && inputNumber.value && inputWeight.value) {
    workoutStore.addOneSet(
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
