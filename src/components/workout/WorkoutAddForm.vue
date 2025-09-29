<template>
  <TheForm title="" :handleSubmit="handleSubmit">
    <div class="grid grid-cols-[1fr_2fr] gap-2 items-center" v-if="workoutStore.activityList.length > 0 && !inputWorkout">
      <span v-if="!selectWorkout" class="text-gray-500 text-md">選擇動作</span>
      <BaseButton v-else 
        type="button" 
        color="gray" 
        text="取消選擇"
        class="!px-3 !py-2 !text-sm !font-normal"
        @click="cancelForm" />
      <FormInput type="select" v-model="selectWorkout" :options="activityOptions"
         />
    </div>
    <template v-if="!selectWorkout">
      <div class="grid grid-cols-[1fr_2fr] gap-2 items-center">
        <span class="text-gray-500 text-md" v-if="!inputWorkout">新增動作</span>
        <BaseButton v-else 
          type="button" 
          color="gray" 
          text="取消新增"
          class="!px-3 !py-2 !text-sm !font-normal"
          @click="cancelForm" />
        <FormInput v-model="inputWorkout" type="text" placeholder="輸入動作名稱" />
      </div>
    </template>
    <div class="grid grid-cols-2 gap-4" v-if="inputWorkout || selectWorkout">
      <FormInput type="number" placeholder="輸入次數" v-model="inputNumber" />
      <FormInput type="number" placeholder="輸入重量" v-model="inputWeight" />
    </div>
    <BaseButton v-if="isAllFieldsFilled" type="submit" color="blue" text="新增紀錄" class="w-full mt-4" />
  </TheForm>

  <!-- 最近記錄清單 -->
  <div v-if="recentSets.length > 0" class="mt-6">
    <h3 class="text-lg font-semibold mb-3 text-gray-700">
      {{ !selectWorkout && !inputWorkout ? '今天的紀錄' : '最近記錄' }}
    </h3>
    <div class="space-y-2">
      <div v-for="(set, index) in recentSets" :key="`${set.date}-${set.activity}-${index}`"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
        @click="fillFormWithSet(set)">
        <!-- 左側：動作名稱（當顯示今天紀錄時） -->
        <div class="flex items-center space-x-4">
          <div v-if="!selectWorkout && !inputWorkout" class="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
            {{ set.activity }}
          </div>
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
import FormInput from '../ui/FormInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import { ref, computed } from 'vue';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { useToggleButton } from '@/composables/useToggleButton';

const inputWorkout = ref('');
const selectWorkout = ref('');
const inputNumber = ref<number | undefined>(undefined);
const inputWeight = ref<number | undefined>(undefined);

const workoutStore = useDailyWorkoutStore();
const { toggleForm } = useToggleButton('workout');

const activityOptions = computed(() =>
  workoutStore.activityList.map(activity => ({
    value: activity,
    label: activity
  }))
);

const isAllFieldsFilled = computed(() => {
  return (inputWorkout.value || selectWorkout.value) && inputNumber.value !== undefined && inputWeight.value !== undefined;
});

const recentSets = computed(() => {
  const currentActivity = selectWorkout.value || inputWorkout.value;

  // 如果沒有選擇動作，顯示今天的所有紀錄
  if (!currentActivity) {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = workoutStore.records[today];
    
    if (!todayRecord) return [];

    const allSets: Array<{ count: number; weight: number; date: string; activity: string }> = [];
    
    Object.entries(todayRecord).forEach(([activity, sets]) => {
      sets.forEach(set => {
        allSets.push({
          ...set,
          date: today,
          activity
        });
      });
    });

    // 按時間順序排序（最新的在前）
    return allSets.reverse();
  }

  // 原有邏輯：顯示特定動作的最近紀錄
  const datesWithActivity: string[] = [];

  Object.entries(workoutStore.records).forEach(([date, dayRecord]) => {
    if (dayRecord[currentActivity] && dayRecord[currentActivity].length > 0) {
      datesWithActivity.push(date);
    }
  });

  const recentDates = datesWithActivity
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 3);

  const allSets: Array<{ count: number; weight: number; date: string; activity: string }> = [];

  recentDates.forEach(date => {
    const dayRecord = workoutStore.records[date];
    if (dayRecord[currentActivity]) {
      dayRecord[currentActivity].forEach(set => {
        allSets.push({
          ...set,
          date,
          activity: currentActivity
        });
      });
    }
  });

  return allSets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 點擊紀錄帶入資料
const fillFormWithSet = (set: { count: number; weight: number; activity: string }) => {
  // 如果當前沒有選擇動作，則設定動作
  if (!selectWorkout.value && !inputWorkout.value) {
    // 檢查是否為已存在的動作
    if (workoutStore.activityList.includes(set.activity)) {
      selectWorkout.value = set.activity;
    } else {
      inputWorkout.value = set.activity;
    }
  }
  
  // 帶入次數和重量
  inputNumber.value = set.count;
  inputWeight.value = set.weight;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return '今天';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }

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
    cancelForm();
  }
};

const cancelForm = () => {
  inputWorkout.value = '';
  selectWorkout.value = '';
  inputNumber.value = undefined;
  inputWeight.value = undefined;
};
</script>

