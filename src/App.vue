<template>
  <div class="max-w-md mx-auto mt-8 p-6 text-center" :class="{ 'keyboard-active': isKeyboardActive }">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
    
    <!-- 頁面指示器 -->
    <PageIndicator 
      :pages="pages" 
      :current-page-index="currentPageIndex"
      @go-to-page="goToPage"
    />

    <!-- 滑動容器 -->
    <div 
      class="overflow-hidden"
      :class="{ 'keyboard-container': isKeyboardActive }"
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
import { ref, onMounted, onUnmounted } from 'vue'
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

// 鍵盤狀態檢測
const isKeyboardActive = ref(false)
let initialViewportHeight = 0

// 檢測虛擬鍵盤狀態
const handleViewportChange = () => {
  const currentHeight = window.visualViewport?.height || window.innerHeight
  const heightDifference = initialViewportHeight - currentHeight
  
  // 如果高度差超過 150px，認為是鍵盤彈出
  isKeyboardActive.value = heightDifference > 150
}

onMounted(() => {
  // 記錄初始視窗高度
  initialViewportHeight = window.visualViewport?.height || window.innerHeight
  
  // 監聽視窗大小變化
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange)
  } else {
    window.addEventListener('resize', handleViewportChange)
  }
})

onUnmounted(() => {
  // 清理事件監聽器
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportChange)
  } else {
    window.removeEventListener('resize', handleViewportChange)
  }
})
</script>

<style scoped>
/* 鍵盤激活時的樣式調整 */
.keyboard-active {
  /* 當鍵盤彈出時，減少上邊距避免內容被推得太高 */
  margin-top: 2rem;
}

.keyboard-container {
  /* 確保容器在鍵盤彈出時保持適當的高度 */
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 平滑過渡效果 */
.max-w-md {
  transition: margin-top 0.3s ease-out;
}
</style>

