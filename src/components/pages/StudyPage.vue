<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">學習紀錄</h1>
      <!-- 清空歷史紀錄按鈕 -->
      <button
        @click="showConfirmDialog = true"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
      >
        清空歷史紀錄
      </button>
    </div>
    <TheButton />
    <ResultDisplay />
    <RecordingDisplay />
    <ScoreDisplay />
    <ScoreChart />

    <pre>{{ scoreStore.dailyScores }}</pre>

    <!-- 確認對話框 -->
    <ConfirmDialog
      :is-open="showConfirmDialog"
      title="確認清空歷史紀錄"
      message="此操作將永久刪除所有學習紀錄，無法復原。確定要繼續嗎？"
      @confirm="handleClearHistory"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheButton from '@/components/TheButton.vue'
import ResultDisplay from '@/components/ResultDisplay.vue'
import RecordingDisplay from '@/components/RecordingDisplay.vue'
import ScoreDisplay from '@/components/ScoreDisplay.vue'
import ScoreChart from '@/components/ScoreChart.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useDailyScoreStore } from '@/stores/dailyScore'

const scoreStore = useDailyScoreStore()
const showConfirmDialog = ref(false)

// 處理清空歷史紀錄
const handleClearHistory = () => {
  scoreStore.clearAllHistory() // 清空所有歷史紀錄
  showConfirmDialog.value = false // 關閉對話框
}
</script>

