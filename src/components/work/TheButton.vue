<template>
  <BaseButton 
    :color="isRecording ? 'red' : 'green'" 
    :text="isRecording ? '結束工作' : '開始工作'" 
    @click="toggleTimer" 
  />
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue';
import { useWorkRecorder } from '@/composables/useWorkRecorder';

const {
  toggleTimer,
  isRecording,
} = useWorkRecorder()
</script>
