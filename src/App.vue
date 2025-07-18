<template>
  <div 
    class="app-container"
    :class="{ 'keyboard-active': keyboardState.isActive }"
    :style="containerStyles"
  >
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
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

// 鍵盤狀態管理
const keyboardState = reactive({
  isActive: false,
  initialHeight: 0,
  currentHeight: 0,
  threshold: 150 // 鍵盤檢測閾值
})

// 重置滾動位置的函數
const resetScrollPosition = () => {
  // 強制重置整個頁面的滾動位置
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  
  // 重置所有可滾動元素
  const scrollableElements = document.querySelectorAll('[data-scrollable]')
  scrollableElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.scrollTop = 0
    }
  })
}

// 處理視窗變化
const handleViewportChange = () => {
  const currentHeight = window.visualViewport?.height || window.innerHeight
  const heightDiff = keyboardState.initialHeight - currentHeight
  
  keyboardState.currentHeight = currentHeight
  
  if (heightDiff > keyboardState.threshold) {
    // 鍵盤彈出
    if (!keyboardState.isActive) {
      keyboardState.isActive = true
    }
  } else {
    // 鍵盤收起
    if (keyboardState.isActive) {
      keyboardState.isActive = false
      
      // 延遲重置滾動位置，確保視窗完全恢復
      setTimeout(() => {
        resetScrollPosition()
      }, 100)
      
      // 再次確保重置（雙重保險）
      setTimeout(() => {
        resetScrollPosition()
      }, 300)
    }
  }
}

// 計算容器樣式
const containerStyles = computed(() => {
  if (keyboardState.isActive) {
    return {
      height: `${keyboardState.currentHeight}px`,
      maxHeight: `${keyboardState.currentHeight}px`,
      overflow: 'hidden'
    }
  }
  return {
    minHeight: '100vh'
  }
})

// 處理頁面可見性變化（當用戶切換應用時）
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 頁面重新可見時，重置滾動位置
    setTimeout(() => {
      resetScrollPosition()
    }, 100)
  }
}

onMounted(() => {
  // 記錄初始視窗高度
  keyboardState.initialHeight = window.visualViewport?.height || window.innerHeight
  keyboardState.currentHeight = keyboardState.initialHeight
  
  // 監聽視窗變化
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange)
  } else {
    window.addEventListener('resize', handleViewportChange)
  }
  
  // 監聽頁面可見性變化
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 監聽焦點事件（額外保險）
  window.addEventListener('focus', () => {
    setTimeout(resetScrollPosition, 100)
  })
})

onUnmounted(() => {
  // 清理事件監聽器
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportChange)
  } else {
    window.removeEventListener('resize', handleViewportChange)
  }
  
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', resetScrollPosition)
})
</script>

<style scoped>
.app-container {
  position: relative;
  width: 100%;
  max-width: 28rem; /* max-w-md */
  margin: 0 auto;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease-out;
}

.keyboard-active {
  margin-top: 1rem; /* 鍵盤激活時減少上邊距 */
  padding-top: 1rem;
}

.content-wrapper {
  width: 100%;
  height: 100%;
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

/* 確保在鍵盤激活時的樣式 */
.keyboard-active .page-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 防止內容溢出 */
* {
  box-sizing: border-box;
}
</style>

