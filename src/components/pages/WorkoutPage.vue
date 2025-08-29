<template>
  <ToggleButton
    formkey="workout"
    :text="['查看重訓紀錄', '新增重訓紀錄']"
  >
    <template #form>
      <WorkoutAddForm />
    </template>

    <WorkoutProgressBar :percentage="scorePercentage" />

    <WorkoutChart />

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import WorkoutAddForm from '@/components/workout/WorkoutAddForm.vue';
import WorkoutChart from '@/components/workout/WorkoutChart.vue';
import WorkoutProgressBar from '@/components/workout/WorkoutProgressBar.vue';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { computed } from 'vue';

const dailyWorkoutStore = useDailyWorkoutStore();
const scorePercentage = computed(() => dailyWorkoutStore.scorePercentage);
</script>
