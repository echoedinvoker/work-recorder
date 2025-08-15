<template>
  <div
    v-if="isOpen"
    @keydown.esc="$emit('cancel')"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <!-- 標題 -->
      <h2 class="text-xl font-bold mb-4 text-gray-800">{{ title }}</h2>
      
      <!-- 訊息內容 -->
      <p class="text-gray-600 mb-6">{{ message }}</p>
      
      <!-- 按鈕區域 -->
      <div class="flex justify-end gap-3">
        <button
          @click="$emit('cancel')"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
        >
          取消
        </button>
        <button
          @click="$emit('confirm')"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          確認刪除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定義 props
defineProps<{
  isOpen: boolean
  title: string
  message: string
}>()

// 定義 emits
defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

