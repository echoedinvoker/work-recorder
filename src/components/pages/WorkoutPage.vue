<template>
  <ToggleButton
    formkey="workout"
    :text="['查看重訓紀錄', '新增重訓紀錄']"
  >
    <template #form>
      <WorkoutAddForm />
    </template>

  <LineChart :data-provider="store" /> 

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import WorkoutAddForm from '@/components/workout/WorkoutAddForm.vue';
import LineChart from '../ui/LineChart.vue';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
// import WorkoutChart from '@/components/workout/WorkoutChart.vue';
const store = useDailyWorkoutStore()
</script>

