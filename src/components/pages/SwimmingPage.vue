<template>
  <ToggleButton
    formkey="swimming"
    :text="['查看游泳紀錄', '新增游泳紀錄']"
  >
    <template #form>
      <SwimmingAddForm />
    </template>

    <SwimmingChart />

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import SwimmingAddForm from '@/components/swimming/SwimmingAddForm.vue';
import SwimmingChart from '../swimming/SwimmingChart.vue';
</script>

