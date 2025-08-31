<template>
  <ToggleButton
    formkey="workout"
    :text="['查看重訓紀錄', '新增重訓紀錄']"
  >
    <template #form>
      <WorkoutAddForm />
    </template>

    <ProgressBar :value="todayProgress" />
    <WorkoutChart />

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import WorkoutAddForm from '@/components/workout/WorkoutAddForm.vue';
import WorkoutChart from '@/components/workout/WorkoutChart.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';

const { todayProgress } = useDailyWorkoutStore()
</script>

