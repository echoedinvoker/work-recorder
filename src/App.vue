<template>
  <div 
    class="max-w-md mx-auto p-6 text-center"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
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

    <!-- 滑動指示器 -->
    <div class="flex justify-center mb-4 space-x-1">
      <div 
        v-for="(route, index) in navigableRoutes" 
        :key="String(route.name)"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="currentRouteIndex === index ? 'bg-blue-500' : 'bg-gray-300'"
      ></div>
    </div>

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
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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

const router = useRouter();
const route = useRoute();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

// 可導航的路由（排除 NotFound）
const navigableRoutes = computed(() => routes);

// 當前路由索引
const currentRouteIndex = computed(() => {
  return navigableRoutes.value.findIndex(r => r.name === route.name);
});

// 觸控相關變數
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50;
const transitionName = ref('slide-left');

const showConfirmDialog = ref(false);

// Store 實例
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

// 觸控事件處理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e: TouchEvent) => {
  // 可選：防止頁面滾動（如果需要的話）
  // e.preventDefault();
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX;
  handleSwipe();
};

// 處理滑動邏輯
const handleSwipe = () => {
  const swipeDistance = touchStartX.value - touchEndX.value;
  const currentIndex = currentRouteIndex.value;
  
  // 向左滑動（下一頁）
  if (swipeDistance > minSwipeDistance && currentIndex < navigableRoutes.value.length - 1) {
    transitionName.value = 'slide-left';
    const nextRoute = navigableRoutes.value[currentIndex + 1];
    router.push({ name: nextRoute.name });
  }
  // 向右滑動（上一頁）
  else if (swipeDistance < -minSwipeDistance && currentIndex > 0) {
    transitionName.value = 'slide-right';
    const prevRoute = navigableRoutes.value[currentIndex - 1];
    router.push({ name: prevRoute.name });
  }
};

const clearAllData = () => {
  try {
    localStorage.clear();
    showConfirmDialog.value = false;
    window.location.reload();
  } catch (error) {
    console.error('清除資料時發生錯誤:', error);
    alert('清除資料時發生錯誤，請重試');
  }
};

// 根據路由名稱獲取對應的分數
const getScoreForRoute = (routeName: string) => {
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
      return 0;
  }
};
</script>

<style>
/* 原有的 fade 動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 新增的滑動動畫 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>

