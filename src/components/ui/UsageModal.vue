<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">{{ usageInstruction?.title }}</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      
      <div class="p-6">
        <div v-if="usageInstruction">
          <!-- 描述 -->
          <div class="mb-6">
            <p class="text-gray-600 text-left leading-relaxed">
              {{ usageInstruction.description }}
            </p>
          </div>

          <!-- 計分規則 -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3 text-left">計分規則</h4>
            <ul class="space-y-2">
              <li 
                v-for="rule in usageInstruction.scoringRules" 
                :key="rule"
                class="text-sm text-gray-600 text-left flex items-start"
              >
                <span class="text-blue-500 mr-2 mt-1">•</span>
                <span>{{ rule }}</span>
              </li>
            </ul>
          </div>

          <!-- 使用技巧 -->
          <div>
            <h4 class="text-md font-semibold text-gray-800 mb-3 text-left">使用技巧</h4>
            <ul class="space-y-2">
              <li 
                v-for="tip in usageInstruction.tips" 
                :key="tip"
                class="text-sm text-gray-600 text-left flex items-center"
              >
                <!-- 使用 Lucide Lightbulb icon 替換 emoji -->
                <Lightbulb class="text-yellow-500 mr-2 flex-shrink-0" :size="16" />
                <span class="flex-1">{{ tip }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb } from 'lucide-vue-next'

interface UsageInstruction {
  title: string;
  description: string;
  scoringRules: string[];
  tips: string[];
}

interface Props {
  show: boolean;
  usageInstruction?: UsageInstruction | null;
}

defineProps<Props>();

defineEmits<{
  close: [];
}>();
</script>

