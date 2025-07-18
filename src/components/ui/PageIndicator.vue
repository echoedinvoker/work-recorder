<template>
  <div class="flex justify-center space-x-2 mb-4">
    <div 
      v-for="(page, index) in pages" 
      :key="index"
      :class="[
        'w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer',
        currentPageIndex === index ? 'bg-blue-500' : 'bg-gray-300'
      ]"
      @click="$emit('goToPage', index)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { PageConfig } from '@/composables/usePageNavigation'

interface Props {
  pages: PageConfig[]
  currentPageIndex: number
}

defineProps<Props>()

defineEmits<{
  goToPage: [index: number]
}>()
</script>

