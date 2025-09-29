<template>
  <div 
    class="max-w-md mx-auto p-6 text-center"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- 功能列表 -->
    <NavigationBar 
      :previous-activity-name="previousActivityName"
      @show-usage="showUsageModal = true"
      @show-clear-dialog="showConfirmDialog = true"
      @export-records="handleExportRecords"
      @import-records="handleImportRecords"
    />

    <!-- 滑動指示器 -->
    <PageIndicator />

    <!-- 使用說明 Modal -->
    <UsageModal 
      :show="showUsageModal"
      :usage-instruction="currentUsageInstruction"
      @close="showUsageModal = false"
    />

    <!-- 確認對話框 -->
    <ConfirmDialog
      :is-open="showConfirmDialog"
      :title="'確認清除資料'"
      :message="confirmDialogMessage"
      @confirm="clearData"
      @cancel="showConfirmDialog = false"
    />

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
import NavigationBar from './components/ui/NavigationBar.vue';
import UsageModal from './components/ui/UsageModal.vue';
import PageIndicator from './components/ui/PageIndicator.vue';
import ConfirmDialog from './components/ui/ConfirmDialog.vue';

const router = useRouter();
const route = useRoute();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

// 記錄上一個活動頁面
const previousActivityRoute = ref<string | null>(null);

// Modal 狀態
const showUsageModal = ref(false);
const showConfirmDialog = ref(false);

// 使用說明相關
const currentUsageInstruction = computed(() => {
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
  return route
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

// 觸控相關變數
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50;
const transitionName = ref('slide-left');

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

// 確認對話框訊息
const confirmDialogMessage = computed(() => {
  if (route.name === 'overview') {
    return '此操作將清除所有 localStorage 中的記錄，包括所有日期的分數資料。此操作無法復原，確定要繼續嗎？';
  }
  const currentRoute = routes.find(r => r.name === route.name);
  const pageTitle = currentRoute?.meta?.title || '當前頁面';
  return `此操作將清除${pageTitle}的所有歷史記錄資料。此操作無法復原，確定要繼續嗎？`;
});

// methods
const handleExportRecords = () => {
  const currentRouteName = route.name as keyof typeof routeStoreMap;
  const store = routeStoreMap[currentRouteName];
  
  if (store && typeof store.exportRecordsToJson === 'function') {
    store.exportRecordsToJson();
  } else {
    console.error('無法找到對應的 store 或匯出方法');
  }
};
const handleImportRecords = (importData: any) => {
  const currentRouteName = route.name as keyof typeof routeStoreMap;
  const store = routeStoreMap[currentRouteName];
  
  if (store && typeof store.importRecordsFromJson === 'function') {
    const result = store.importRecordsFromJson(importData);
    
    if (result.success) {
      alert('匯入成功！');
    } else {
      alert(`匯入失敗：${result.message}`);
    }
  } else {
    console.error('無法找到對應的 store 或匯入方法');
    alert('匯入失敗：無法找到對應的處理方法');
  }
};

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

