<template>
  <ToggleButton
    formkey="todo"
    :text="['查看動作', '新增動作']"
  >
    <template #form>
      <WorkoutAddForm />
    </template>


  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import WorkoutAddForm from '@/components/workout/WorkoutAddForm.vue';
</script>

