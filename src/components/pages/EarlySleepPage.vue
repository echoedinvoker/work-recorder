<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">早睡紀錄</h1>
      <!-- 清空歷史紀錄按鈕 -->
      <button
        @click="showConfirmDialog = true"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
      >
        清空歷史紀錄
      </button>
    </div>
    <EarlySleepButton />
    <EarlySleepResultDisplay />
    <EarlySleepChart />

    <!-- 確認對話框 -->
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
        <p class="text-gray-600 mb-6">此操作將永久刪除所有早睡紀錄，無法復原。確定要繼續嗎？</p>
        
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
import EarlySleepButton from '@/components/earlysleep/EarlySleepButton.vue';
import EarlySleepResultDisplay from '@/components/earlysleep/EarlySleepResultDisplay.vue';
import EarlySleepChart from '@/components/earlysleep/EarlySleepChart.vue';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore'

const earlySleepStore = useDailyEarlySleepStore()
const showConfirmDialog = ref(false)

// 處理清空歷史紀錄
const handleClearHistory = () => {
  earlySleepStore.clearAllHistory() // 清空所有歷史紀錄
  showConfirmDialog.value = false // 關閉對話框
}
</script>

