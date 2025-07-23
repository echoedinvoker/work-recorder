<template>
  <ToggleButton
    formkey="workout"
    :text="['查看動作', '新增動作']"
  >
    <template #form>
      <WorkoutAddForm />
    </template>

    <WorkoutChart />

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import WorkoutAddForm from '@/components/workout/WorkoutAddForm.vue';
import WorkoutChart from '@/components/workout/WorkoutChart.vue';
</script>

