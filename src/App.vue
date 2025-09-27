<template>
  <div 
    class="max-w-md mx-auto p-6 text-center"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- 功能列表 -->
    <nav class="mb-4">
      <div class="flex justify-center gap-3">
        <!-- Toggle 概覽頁面按鈕 -->
        <button 
          @click="toggleOverview"
          class="px-4 py-2 rounded-full text-sm transition-all border-2 border-blue-500 bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-2"
        >
          <span v-if="!!previousActivityName">
            <!-- 返回活動頁面 -->
            <span class="text-base">←</span>
            {{ previousActivityName }}
          </span>
          <span v-else>
            <!-- 切換到概覽頁面 -->
            <span class="text-base">📊</span>
          </span>
        </button>

        <!-- 使用說明按鈕 (只在非首頁顯示) -->
        <button 
          v-if="$route.path !== '/'"
          @click="showUsageModal = true"
          class="px-4 py-2 rounded-full text-sm transition-all border-2 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-2"
        >
          <span class="text-base">❓</span>
        </button>

        <!-- 清除資料按鈕 -->
        <button 
          @click="showConfirmDialog = true"
          class="px-4 py-2 rounded-full text-sm transition-all border-2 border-red-500 bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-2"
          :title="clearButtonTitle"
        >
          <span class="text-base">🗑️</span>
        </button>
      </div>
    </nav>

    <!-- 滑動指示器 (只顯示活動頁面，排除概要頁面) -->
    <div v-if="navigableRoutes.length > 0 && $route.name !== 'overview'" class="flex justify-center mb-4 space-x-1">
      <div 
        v-for="(route, index) in navigableRoutes" 
        :key="String(route.name)"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="currentRouteIndex === index ? 'bg-blue-500' : 'bg-gray-300'"
      ></div>
    </div>

    <!-- 使用說明 Modal -->
    <div v-if="showUsageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">{{ currentUsageInstruction?.title }}</h3>
          <button 
            @click="showUsageModal = false"
            class="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="currentUsageInstruction">
            <!-- 描述 -->
            <div class="mb-6">
              <p class="text-gray-600 text-left leading-relaxed">
                {{ currentUsageInstruction.description }}
              </p>
            </div>

            <!-- 計分規則 -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-800 mb-3 text-left">計分規則</h4>
              <ul class="space-y-2">
                <li 
                  v-for="rule in currentUsageInstruction.scoringRules" 
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
                  v-for="tip in currentUsageInstruction.tips" 
                  :key="tip"
                  class="text-sm text-gray-600 text-left flex items-start"
                >
                  <span class="text-green-500 mr-2 mt-1">💡</span>
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認對話框 -->
    <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
        <h3 class="text-lg font-bold mb-4 text-gray-800">確認清除資料</h3>
        <p class="text-gray-600 mb-6">{{ confirmDialogMessage }}</p>
        <div class="flex gap-3 justify-end">
          <button 
            @click="showConfirmDialog = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
          <button 
            @click="clearData"
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
import { useDailyNoSugarStore } from './stores/dailyNoSugarStore';
import { useDailyWorkoutStore } from './stores/dailyWorkoutStore';
import { useDailySwimmingStore } from './stores/dailySwimmingStore';
import { useDailyEarlySleepStore } from './stores/dailyEarlySleepStore';
import { useDailyHungryStore } from './stores/dailyHungryStore';
import { getUsageInstructionByRoute } from './utils/usageInstructions';

const router = useRouter();
const route = useRoute();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

// 記錄上一個活動頁面
const previousActivityRoute = ref<string | null>(null);

// 使用說明相關
const showUsageModal = ref(false);
const currentUsageInstruction = computed(() => {
  console.log('Current Route Name:', route.name);
  return getUsageInstructionByRoute(route.name as string);
});

// 可導航的路由（排除 NotFound 和 overview）
const navigableRoutes = computed(() => 
  routes.filter(route => route.name !== 'overview')
);

// 當前路由索引（在可導航路由中的位置）
const currentRouteIndex = computed(() => {
  return navigableRoutes.value.findIndex(r => r.name === route.name);
});

// 上一個活動頁面的名稱
const previousActivityName = computed(() => {
  if (!previousActivityRoute.value) return '';
  const route = routes.find(r => r.name === previousActivityRoute.value);
  return route?.meta?.title || route?.name || '';
});

// 監聽路由變化，記錄活動頁面
watch(() => route.name, (newRouteName, oldRouteName) => {
  // 關閉使用說明 modal
  showUsageModal.value = false;
  
  // 如果從活動頁面切換到概覽頁面，記錄上一個活動頁面
  if (newRouteName === 'overview' && oldRouteName !== 'overview') {
    previousActivityRoute.value = oldRouteName as string;
  }
  // 如果從概覽頁面切換到活動頁面，清除記錄
  else if (oldRouteName === 'overview' && newRouteName !== 'overview') {
    previousActivityRoute.value = null;
  }
});

// Toggle 概覽頁面功能
const toggleOverview = () => {
  if (route.name === 'overview') {
    // 如果在概覽頁面且有記錄的活動頁面，返回該頁面
    if (previousActivityRoute.value) {
      router.push({ name: previousActivityRoute.value });
    }
  } else {
    // 如果在活動頁面，切換到概覽頁面
    router.push({ name: 'overview' });
  }
};

// 觸控相關變數
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50;
const transitionName = ref('slide-left');

const showConfirmDialog = ref(false);

// Store 實例
const noSugarStore = useDailyNoSugarStore();
const workoutStore = useDailyWorkoutStore();
const swimmingStore = useDailySwimmingStore();
const earlySleepStore = useDailyEarlySleepStore();
const hungryStore = useDailyHungryStore();

// 路由名稱與 store 的映射關係
const routeStoreMap = {
  noSugar: noSugarStore,
  workout: workoutStore,
  swimming: swimmingStore,
  earlySleep: earlySleepStore,
  hungry: hungryStore,
} as const;

// 清除按鈕標題
const clearButtonTitle = computed(() => {
  if (route.name === 'overview') {
    return '清除所有資料';
  }
  const currentRoute = routes.find(r => r.name === route.name);
  const pageTitle = currentRoute?.meta?.title || '當前頁面';
  return `清除${pageTitle}資料`;
});

// 確認對話框訊息
const confirmDialogMessage = computed(() => {
  if (route.name === 'overview') {
    return '此操作將清除所有 localStorage 中的記錄，包括所有日期的分數資料。此操作無法復原，確定要繼續嗎？';
  }
  const currentRoute = routes.find(r => r.name === route.name);
  const pageTitle = currentRoute?.meta?.title || '當前頁面';
  return `此操作將清除${pageTitle}的所有歷史記錄資料。此操作無法復原，確定要繼續嗎？`;
});

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
  // 如果在概要頁面，不處理滑動
  if (route.name === 'overview') {
    return;
  }

  const swipeDistance = touchStartX.value - touchEndX.value;
  const currentIndex = currentRouteIndex.value;
  
  // 向左滑動（下一頁）
  if (swipeDistance > minSwipeDistance) {
    transitionName.value = 'slide-left';
    let nextIndex;
    
    if (currentIndex === navigableRoutes.value.length - 1) {
      // 在最後一個活動頁面，切換到第一個活動頁面
      nextIndex = 0;
    } else {
      nextIndex = currentIndex + 1;
    }
    
    const nextRoute = navigableRoutes.value[nextIndex];
    router.push({ name: nextRoute.name });
  }
  // 向右滑動（上一頁）
  else if (swipeDistance < -minSwipeDistance) {
    transitionName.value = 'slide-right';
    let prevIndex;
    
    if (currentIndex === 0) {
      // 在第一個活動頁面，切換到最後一個活動頁面
      prevIndex = navigableRoutes.value.length - 1;
    } else {
      prevIndex = currentIndex - 1;
    }
    
    const prevRoute = navigableRoutes.value[prevIndex];
    router.push({ name: prevRoute.name });
  }
};

// 根據當前頁面清除對應資料
const clearData = () => {
  try {
    if (route.name === 'overview') {
      // 在概覽頁面，清除整個 localStorage
      localStorage.clear();
    } else {
      // 在特定活動頁面，只清除該頁面對應的 store 資料
      const currentRouteName = route.name as keyof typeof routeStoreMap;
      const store = routeStoreMap[currentRouteName];
      
      if (store && typeof store.clearAllHistory === 'function') {
        // 調用 store 的清除方法
        store.clearAllHistory();
        
        // 同時從 localStorage 中移除該 store 的資料
        const storeId = store.$id;
        localStorage.removeItem(storeId);
      }
    }
    
    showConfirmDialog.value = false;
    
    // 如果清除的是整個 localStorage，則重新載入頁面
    if (route.name === 'overview') {
      window.location.reload();
    }
  } catch (error) {
    console.error('清除資料時發生錯誤:', error);
    alert('清除資料時發生錯誤，請重試');
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

