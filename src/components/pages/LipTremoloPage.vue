<template>
  <ToggleButton
    formkey="lipTremolo"
    :text="['查看顫唇練習紀錄', '新增顫唇練習紀錄']"
  >
    <template #form>
      <LipTremoloAddForm />
    </template>

    <LipTremoloChart />

  </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import LipTremoloAddForm from '@/components/lipTremolo/LipTremoloAddForm.vue';
import LipTremoloChart from '@/components/lipTremolo/LipTremoloChart.vue';
</script>

