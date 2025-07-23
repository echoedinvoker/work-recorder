<template>
  <div class="flex justify-center mb-4 flex-shrink-0">
    <BaseButton
      :color="formStatus ? 'red' : 'green'"
      :text="formStatus ? text[0] : text[1]" @click="toggleForm" />
  </div>
  <!-- 內容區域 - 可滾動 -->
  <div class="flex-1 flex flex-col min-h-0">
    <div v-if="formStatus" class="bg-white rounded-lg shadow-md p-4 mb-4 flex-shrink-0">
      <slot name="form" />
    </div>

    <div v-if="!formStatus" class="flex-1 flex flex-col min-h-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToggleButton } from '../../composables/useToggleButton';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  formkey: string;
  text: string[];
}>();

const {
  formStatus,
  toggleForm,
} = useToggleButton(props.formkey);
</script>
