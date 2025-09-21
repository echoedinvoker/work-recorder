<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- 顯示目前的飢餓程度 -->
    <button 
      class="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg text-white transition-all duration-300"
      :class="getColorClass(currentLevel)"
      @click="toggleScroller"
    >
      {{ getCurrentLevelText() }}
    </button>
    
    <!-- 簡單的選擇器，只在需要時顯示 -->
    <div v-if="showScroller" class="flex flex-col space-y-2 rounded-lg shadow-lg overflow-hidden">
      <button 
        v-for="(level, text) in hungryLevels" 
        :key="text"
        class="px-8 py-3 text-lg font-semibold text-white transition-all duration-300"
        :class="[
          getColorClass(level),
          { 'scale-105': currentLevel === level }
        ]"
        @click="selectLevel(level)"
      >
        {{ text }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyHungryStore } from '@/stores/dailyHungryStore';
import { ref, onMounted } from 'vue';

const store = useDailyHungryStore();

// 定義飢餓程度對應的數值
const hungryLevels = {
  '很餓': 2,
  '餓': 1,
  '無感': undefined,
  '飽': -2,
  '很飽': -3
};

// 將 undefined 轉換為 0 以便於計算
const getLevelValue = (level: number | undefined) => level === undefined ? 0 : level;

// 根據 level 獲取對應的顏色類別
const getColorClass = (level: number | undefined) => {
  if (level === 2) return 'bg-red-500 hover:bg-red-600';
  if (level === 1) return 'bg-orange-500 hover:bg-orange-600';
  if (level === undefined) return 'bg-gray-500 hover:bg-gray-600';
  if (level === -2) return 'bg-blue-500 hover:bg-blue-600';
  if (level === -3) return 'bg-green-500 hover:bg-green-600';
  return 'bg-gray-500 hover:bg-gray-600';
};

// 當前選中的飢餓程度
const currentLevel = ref<number | undefined>(store.todayResult);
const showScroller = ref(false);

// 獲取當前飢餓程度的文字描述
const getCurrentLevelText = () => {
  for (const [text, level] of Object.entries(hungryLevels)) {
    if (level === currentLevel.value) {
      return text;
    }
  }
  return '無感'; // 默認值
};

// 切換選擇器的顯示/隱藏
const toggleScroller = () => {
  showScroller.value = !showScroller.value;
};

// 選擇飢餓程度
const selectLevel = (level: number | undefined) => {
  currentLevel.value = level;
  store.recordResult(getLevelValue(level));
  showScroller.value = false; // 選擇後隱藏選擇器
};

// 組件掛載時初始化
onMounted(() => {
  currentLevel.value = store.todayResult;
});
</script>

<style scoped>
.hungry-scroller {
  touch-action: none; /* 防止移動設備上的默認觸摸行為 */
}

.scroller-container {
  background-color: rgba(0, 0, 0, 0.1);
}

.scroller-indicator {
  top: 50%;
  transform: translateY(-50%);
}

.scroller-item {
  height: 56px; /* 與 itemHeight 變量保持一致 */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

