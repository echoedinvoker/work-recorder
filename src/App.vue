<template>
  <div class="max-w-md mx-auto mt-8 p-6 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
    
    <!-- 頁面指示器 -->
    <PageIndicator 
      :pages="pages" 
      :current-page-index="currentPageIndex"
      @go-to-page="goToPage"
    />

    <!-- 滑動容器 -->
    <div 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        class="flex transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(-${currentPageIndex * 100}%)` }"
      >
        <!-- 動態渲染頁面 -->
        <div 
          v-for="(page, index) in pages" 
          :key="index"
          class="w-full flex-shrink-0"
        >
          <component :is="pageComponents[page.component as keyof typeof pageComponents]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageNavigation, type PageConfig } from '@/composables/usePageNavigation'
import PageIndicator from '@/components/ui/PageIndicator.vue'

// 導入頁面組件
import HomePage from '@/components/pages/HomePage.vue'
import SecondPage from '@/components/pages/SecondPage.vue'
import ThirdPage from '@/components/pages/ThirdPage.vue'

// 頁面配置
const pages: PageConfig[] = [
  { name: '主頁面', component: 'HomePage' },
  { name: '頁面 2', component: 'SecondPage' },
  { name: '頁面 3', component: 'ThirdPage' }
]

// 頁面組件映射
const pageComponents = {
  HomePage,
  SecondPage,
  ThirdPage
}

// 使用頁面導航 composable
const {
  currentPageIndex,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  goToPage
} = usePageNavigation(pages)
</script>

<style scoped>
.app-container {
  /* 設置容器高度為視窗高度 */
  height: 100vh;
  max-width: 28rem; /* max-w-md */
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  /* 啟用移動端滾動 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滾動 */
}

.swipe-container {
  /* 讓滑動容器佔用剩餘空間 */
  flex: 1;
  overflow: hidden;
  /* 確保觸摸事件正常工作 */
  touch-action: pan-x;
}

.page-content {
  width: 100%;
  flex-shrink: 0;
  /* 允許頁面內容滾動 */
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滾動 */
}

/* 全域樣式調整 */
:deep(body) {
  /* 防止整個頁面的橡皮筋效果 */
  overscroll-behavior: none;
}

/* 確保在移動端有適當的最小高度 */
@media (max-height: 600px) {
  .app-container {
    min-height: 100vh;
  }
}
</style>
