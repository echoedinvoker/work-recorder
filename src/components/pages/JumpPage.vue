<template>
  <div class="page-container">
    <div class="space-y-6">
      <ToggleButton formkey="jump" :text="['查看跳繩紀錄', '新增跳繩紀錄']">
        <template #form>
          <JumpAddForm />
        </template>

        <JumpChart />
      </ToggleButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/ui/ToggleButton.vue';
import JumpAddForm from '@/components/jump/JumpAddForm.vue';
import JumpChart from '@/components/jump/JumpChart.vue';
</script>
