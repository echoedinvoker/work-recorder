<template>
  <ToggleButton
    formkey="aaa"
    :text="['查看練習紀錄', '新增練習紀錄']"
  >
    <template #form>
      <AaaAddForm />
    </template>

    <AaaChart />

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import AaaAddForm from '@/components/aaa/AaaAddForm.vue';
import AaaChart from '@/components/aaa/AaaChart.vue';
</script>

