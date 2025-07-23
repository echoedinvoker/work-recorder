<template>
  <ToggleButton
    formkey="todo"
    :text="['查看任務', '新增任務']"
  >
    <template #form>
      <TodoAddForm />
    </template>

    <TodoSingle />

  </ToggleButton>
</template>

<script setup lang="ts">
import TodoAddForm from '@/components/todo/TodoAddForm.vue';
import TodoSingle from '@/components/todo/TodoSingle.vue';
import ToggleButton from '@/components/ui/ToggleButton.vue';
</script>

