<template>
  <div class="flex flex-col space-y-4">
    <div class="flex justify-center">
      <!-- 正常狀態的按鈕 -->
      <BaseButton 
        v-if="!showConfirmation"
        :color="buttonColor"
        :text="buttonText"
        :class="{ 
          'pointer-events-none opacity-75 cursor-default': isRecordedToday,
          'shadow-none border-none bg-gray-100 text-gray-700': isRecordedToday 
        }"
        @click="handleButtonClick" 
      />
      
      <!-- 確認狀態的按鈕組 -->
      <div v-else class="flex flex-col items-center space-y-3">
        <!-- 警告提示 -->
        <div class="text-red-600 text-sm font-medium text-center">
          ⚠️ 此操作不可逆，確定要記錄嗎？
        </div>
        
        <!-- 確認按鈕組 -->
        <div class="flex space-x-3">
          <!-- 取消按鈕 (叉叉) -->
          <button 
            @click="cancelConfirmation"
            class="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            title="取消"
          >
            ✕
          </button>
          
          <!-- 確認按鈕 (勾勾) -->
          <button 
            @click="confirmAction"
            class="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            title="確認記錄"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue';
import { computed, ref } from 'vue';
import { getTodayKey } from '@/utils/dateUtils';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';

const store = useDailyEarlySleepStore();

// 控制確認狀態的響應式變數
const showConfirmation = ref(false);

// 獲取當前時間的分鐘數 (例如 21:30 = 21*60+30 = 1290)
const getCurrentTimeInMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// 檢查今天是否已記錄
const isRecordedToday = computed(() => {
  const todayKey = getTodayKey();
  return !!store.records[todayKey];
});

// 按鈕顏色邏輯
const buttonColor = computed(() => {
  return isRecordedToday.value ? 'green' : 'blue';
});

// 按鈕文字邏輯
const buttonText = computed(() => {
  if (isRecordedToday.value) {
    const todayKey = getTodayKey();
    const bedtimeMinutes = store.records[todayKey];
    const hours = Math.floor(bedtimeMinutes / 60);
    const minutes = bedtimeMinutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return `已記錄 ${timeString}`;
  }
  return '記錄上床時間';
});

// 處理按鈕點擊
const handleButtonClick = () => {
  if (!isRecordedToday.value) {
    // 顯示確認界面
    showConfirmation.value = true;
  }
};

// 取消確認
const cancelConfirmation = () => {
  showConfirmation.value = false;
};

// 確認執行動作
const confirmAction = () => {
  // 記錄上床時間
  store.recordBedtime(getCurrentTimeInMinutes());
  // 隱藏確認界面
  showConfirmation.value = false;
};
</script>

