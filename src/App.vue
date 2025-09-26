<template>
  <div class="max-w-md mx-auto p-6 text-center">
    <!-- 導航菜單 -->
    <nav class="mb-8">
      <ul class="flex flex-wrap justify-center gap-2 space-y-2">
        <li v-for="route in routes" :key="String(route.name)">
          <router-link 
            :to="{ name: route.name }" 
            class="px-3 py-1 rounded-full text-sm transition-all"
            :class="[
              // 使用 border 來區分當前頁面
              $route.name === route.name 
                ? 'border-2 border-blue-500 font-bold' 
                : 'border-2 border-transparent',
              // 使用背景色來顯示分數是正數還是負數
              route.name && getScoreForRoute(String(route.name)) > 0 
                ? 'bg-green-100 text-green-800' 
                : route.name && getScoreForRoute(String(route.name)) < 0 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-200 text-gray-700'
            ]"
          >
            {{ route.meta?.title || route.name }}
          </router-link>
        </li>

        <!-- 清除資料按鈕 -->
        <li>
          <button 
            @click="showConfirmDialog = true"
            class="px-3 py-1 rounded-full text-sm transition-all border-2 border-transparent bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1"
            title="清除所有資料"
          >
            <!-- 垃圾桶圖標 (使用 Unicode) -->
            <span class="text-base">🗑️</span>
            <span class="hidden sm:inline">清除</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- 確認對話框 -->
    <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
        <h3 class="text-lg font-bold mb-4 text-gray-800">確認清除資料</h3>
        <p class="text-gray-600 mb-6">此操作將清除所有 localStorage 中的記錄，包括所有日期的分數資料。此操作無法復原，確定要繼續嗎？</p>
        <div class="flex gap-3 justify-end">
          <button 
            @click="showConfirmDialog = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
          <button 
            @click="clearAllData"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            確認清除
          </button>
        </div>
      </div>
    </div>

    <!-- 路由視圖 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDailyScoreStore } from './stores/dailyScore';
import { useDailyNoSugarStore } from './stores/dailyNoSugarStore';
import { useDailyWorkoutStore } from './stores/dailyWorkoutStore';
import { useDailyFaceSportStore } from './stores/dailyFaceSportStore';
import { useDailySwimmingStore } from './stores/dailySwimmingStore';
import { useDailyNoDIYStore } from './stores/dailyNoDIYStore';
import { useDailyEarlySleepStore } from './stores/dailyEarlySleepStore';
import { useDailySingPracticeStore } from './stores/dailySingPracticeStore';
import { useDailyHungryStore } from './stores/dailyHungryStore';
import { useDailyWorkStore } from './stores/dailyWorkStore';
// 根據需要導入其他 store

const router = useRouter();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

const showConfirmDialog = ref(false);

const dailyScoreStore = useDailyScoreStore();
const workStore = useDailyWorkStore();
const noSugarStore = useDailyNoSugarStore();
const workoutStore = useDailyWorkoutStore();
const faceSportStore = useDailyFaceSportStore();
const swimmingStore = useDailySwimmingStore();
const noDIYStore = useDailyNoDIYStore();
const earlySleepStore = useDailyEarlySleepStore();
const singPracticeStore = useDailySingPracticeStore();
const hungryStore = useDailyHungryStore();

const today = new Date();
const yesterday = new Date().setDate(today.getDate() - 1);

const clearAllData = () => {
  try {
    // 清除所有 localStorage
    localStorage.clear();
    
    // 重置所有 store 狀態（如果 store 有重置方法的話）
    // 這裡可以根據您的 store 實現來調用相應的重置方法
    
    // 關閉確認對話框
    showConfirmDialog.value = false;
    
    // 重新載入頁面以確保所有狀態都被重置
    window.location.reload();
  } catch (error) {
    console.error('清除資料時發生錯誤:', error);
    alert('清除資料時發生錯誤，請重試');
  }
};

// 根據路由名稱獲取對應的分數
const getScoreForRoute = (routeName: string) => {
  // 根據不同的路由名稱返回對應 store 的分數
  switch (routeName) {
    case 'study':
      return dailyScoreStore.getScoreByDate(new Date()) - (dailyScoreStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'work':
      return workStore.getScoreByDate(new Date()) - (workStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'noSugar':
      return noSugarStore.getScoreByDate(new Date()) - (noSugarStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'workout':
      return workoutStore.getScoreByDate(new Date()) - (workoutStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'faceSport':
      return faceSportStore.getScoreByDate(new Date()) - (faceSportStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'swimming':
      return swimmingStore.scoreDifference;
    case 'noDIY':
      return noDIYStore.getScoreByDate(new Date()) - (noDIYStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'earlySleep':
      return earlySleepStore.scoreDifference;
    case 'hungry':
      return hungryStore.scoreDifference;
    case 'singPractice':
      return singPracticeStore.getScoreByDate(new Date()) - (singPracticeStore.getScoreByDate(new Date(yesterday)) || 0);
    default:
      return 0; // 默認返回 0
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

