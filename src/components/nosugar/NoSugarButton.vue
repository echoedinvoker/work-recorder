<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- 顯示目前的戒糖程度 -->
    <button 
      v-if="!showConfirmation"
      class="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg text-white transition-all duration-300"
      :class="[
        getColorClass(currentLevel),
        { 
          'pointer-events-none opacity-75 cursor-default shadow-none border-2 border-gray-300': isRecordedToday,
          'hover:scale-105': !isRecordedToday
        }
      ]"
      @click="handleButtonClick"
    >
      {{ getCurrentLevelText() }}
    </button>
    
    <!-- 確認狀態的按鈕組 -->
    <div v-if="showConfirmation" class="flex flex-col items-center space-y-3">
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
    
    <!-- 簡單的選擇器，只在需要時顯示且未記錄時才顯示 -->
    <div v-if="showScroller && !isRecordedToday" class="flex flex-col space-y-2 rounded-lg shadow-lg overflow-hidden">
      <button 
        v-for="(level, text) in noSugarLevels" 
        :key="text"
        class="px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:scale-105"
        :class="[
          getColorClass(level),
          { 'ring-2 ring-white': selectedLevel === level }
        ]"
        @click="selectLevel(level)"
      >
        {{ text }}
      </button>
    </div>

    <!-- 已記錄提示 -->
    <div v-if="isRecordedToday" class="text-center text-sm text-gray-500">
      🔒 今日已記錄，無法修改
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import { getTodayKey } from '@/utils/dateUtils';
import { ref, computed } from 'vue';

const store = useDailyNoSugarStore();

// 定義戒糖程度對應的數值
const noSugarLevels = {
  '嚴守紀律': 2,
  '大致遵守': 1,
  '偶爾放縱': -1,
  '完全失控': -2
};

// 根據 level 獲取對應的顏色類別
const getColorClass = (level: number | undefined) => {
  if (level === 2) return 'bg-green-500 hover:bg-green-600';    // 嚴守紀律 - 綠色
  if (level === 1) return 'bg-blue-500 hover:bg-blue-600';     // 大致遵守 - 藍色
  if (level === -1) return 'bg-orange-500 hover:bg-orange-600'; // 偶爾放縱 - 橘色
  if (level === -2) return 'bg-red-500 hover:bg-red-600';      // 完全失控 - 紅色
  return 'bg-gray-500 hover:bg-gray-600';
};

// 檢查今天是否已記錄
const isRecordedToday = computed(() => {
  const todayKey = getTodayKey();
  return !!store.records[todayKey];
});

// 當前選中的戒糖程度
const currentLevel = ref<number | undefined>(store.records[getTodayKey()]?.level);
const showScroller = ref(false);
const showConfirmation = ref(false);
const selectedLevel = ref<number | undefined>(undefined);

// 獲取當前戒糖程度的文字描述
const getCurrentLevelText = () => {
  if (isRecordedToday.value) {
    for (const [text, level] of Object.entries(noSugarLevels)) {
      if (level === currentLevel.value) {
        return `已記錄: ${text}`;
      }
    }
  }
  
  for (const [text, level] of Object.entries(noSugarLevels)) {
    if (level === currentLevel.value) {
      return text;
    }
  }
  return '選擇飲控程度';
};

// 處理按鈕點擊
const handleButtonClick = () => {
  if (!isRecordedToday.value) {
    toggleScroller();
  }
};

// 切換選擇器的顯示/隱藏
const toggleScroller = () => {
  if (!showConfirmation.value) {
    showScroller.value = !showScroller.value;
  }
};

// 選擇戒糖程度
const selectLevel = (level: number) => {
  selectedLevel.value = level;
  showScroller.value = false;
  showConfirmation.value = true; // 顯示確認界面
};

// 取消確認
const cancelConfirmation = () => {
  showConfirmation.value = false;
  selectedLevel.value = undefined;
  showScroller.value = true; // 重新顯示選擇器
};

// 確認執行動作
const confirmAction = () => {
  if (selectedLevel.value !== undefined) {
    currentLevel.value = selectedLevel.value;
    store.recordNoSugarLevel(selectedLevel.value);
  }
  showConfirmation.value = false;
  selectedLevel.value = undefined;
};
</script>

