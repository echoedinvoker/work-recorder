<template>
  <div class="min-h-screen">
    <div class="max-w-md mx-auto pt-8 pb-8 px-6 text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
      
      <!-- 頁面指示器 -->
      <PageIndicator 
        :pages="pages" 
        :current-page-index="currentPageIndex"
        @go-to-page="goToPage"
      />

      <!-- 滑動容器 -->
      <div 
        class="overflow-x-hidden"
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
            class="w-full flex-shrink-0 min-h-fit"
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

