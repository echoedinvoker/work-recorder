<template>
  <BaseButton 
    :color="isRecording ? 'red' : 'green'" 
    :text="isRecording ? '結束工作' : '開始工作'" 
    @click="toggleTimer" 
  />
</template>

<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder';
import BaseButton from '@/components/ui/BaseButton.vue';

const {
  toggleTimer,
  isRecording,
} = useRecorder();
</script>
