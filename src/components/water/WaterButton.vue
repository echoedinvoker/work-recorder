<template>
  <div class="space-y-4">
    <div class="flex flex-col space-y-4">
      <FormInput 
        v-model="waterAmount" 
        type="number" 
        placeholder="輸入喝水量(毫升)" 
      />
      
      <BaseButton 
        color="blue" 
        text="記錄喝水" 
        @click="addWaterRecord" 
        :disabled="!waterAmount || waterAmount <= 0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue';
import FormInput from '@/components/ui/FormInput.vue';
import { useWaterRecorder } from '@/composables/useWaterRecorder';

const {
  waterAmount,
  addWaterRecord
} = useWaterRecorder();
</script>

