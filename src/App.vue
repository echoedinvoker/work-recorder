<template>
  <!-- 完全移除高度限制，讓內容自然流動 -->
  <div class="max-w-md mx-auto p-6 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
    
    <!-- 頁面指示器 -->
    <PageIndicator 
      :pages="pages" 
      :current-page-index="currentPageIndex"
      @go-to-page="goToPage"
    />

    <!-- 滑動容器-->
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
          <component :is="page.component" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageNavigation } from '@/composables/usePageNavigation'
import PageIndicator from '@/components/ui/PageIndicator.vue'


// 使用頁面導航 composable
const {
  currentPageIndex,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  goToPage,
  pages
} = usePageNavigation()
</script>
