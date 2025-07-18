<template>
  <div class="app-container">
    <div class="content-wrapper">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
      
      <!-- 頁面指示器 -->
      <PageIndicator 
        :pages="pages" 
        :current-page-index="currentPageIndex"
        @go-to-page="goToPage"
      />

      <!-- 滑動容器 -->
      <div 
        class="page-container"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div 
          class="page-slider"
          :style="{ transform: `translateX(-${currentPageIndex * 100}%)` }"
        >
          <!-- 動態渲染頁面 -->
          <div 
            v-for="(page, index) in pages" 
            :key="index"
            class="page-item"
          >
            <component :is="pageComponents[page.component as keyof typeof pageComponents]" />
          </div>
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
  width: 100%;
  max-width: 28rem; /* max-w-md */
  margin: 0 auto;
  padding: 1.5rem;
  text-align: center;
  /* 移除高度限制，讓內容可以自然延伸 */
}

.content-wrapper {
  width: 100%;
}

.page-container {
  overflow: hidden;
  width: 100%;
}

.page-slider {
  display: flex;
  transition: transform 0.3s ease-out;
  width: 100%;
}

.page-item {
  width: 100%;
  flex-shrink: 0;
}

/* 基本盒模型設定 */
* {
  box-sizing: border-box;
}
</style>

