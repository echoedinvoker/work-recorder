<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">冥想紀錄</h1>
      <!-- 清空歷史紀錄按鈕 -->
      <button
        @click="showConfirmDialog = true"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
      >
        清空歷史紀錄
      </button>
    </div>
    <MeditationButton />
    <MeditationResultDisplay />
    <MeditationRecordingDisplay />
    <MeditationChart />

    <!-- 確認對話框 - 使用更高的 z-index -->
    <div
      v-if="showConfirmDialog"
      @keydown.esc="showConfirmDialog = false"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <!-- 標題 -->
        <h2 class="text-xl font-bold mb-4 text-gray-800">確認清空歷史紀錄</h2>
        
        <!-- 訊息內容 -->
        <p class="text-gray-600 mb-6">此操作將永久刪除所有冥想紀錄，無法復原。確定要繼續嗎？</p>
        
        <!-- 按鈕區域 -->
        <div class="flex justify-end gap-3">
          <button
            @click="showConfirmDialog = false"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
          >
            取消
          </button>
          <button
            @click="handleClearHistory"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MeditationButton from '@/components/meditation/MeditationButton.vue';
import MeditationResultDisplay from '@/components/meditation/MeditationResultDisplay.vue';
import MeditationRecordingDisplay from '@/components/meditation/MeditationRecordingDisplay.vue';
import MeditationChart from '@/components/meditation/MeditationChart.vue';
import { useDailyMeditationStore } from '@/stores/dailyMeditationStore'

const meditationStore = useDailyMeditationStore()
const showConfirmDialog = ref(false)

// 處理清空歷史紀錄
const handleClearHistory = () => {
  meditationStore.clearAllHistory() // 清空所有歷史紀錄
  showConfirmDialog.value = false // 關閉對話框
}
</script>

