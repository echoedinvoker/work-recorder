import { ref, onMounted, onUnmounted } from 'vue'

export interface PageConfig {
  name: string
  component: string
}

export function usePageNavigation(pages: PageConfig[]) {
  const currentPageIndex = ref(0)
  
  // 觸控相關變數
  const touchStartX = ref(0)
  const touchEndX = ref(0)
  const minSwipeDistance = 50

  // 觸控事件處理
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    // 防止頁面滾動
    e.preventDefault()
  }

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.value = e.changedTouches[0].clientX
    handleSwipe()
  }

  // 處理滑動邏輯
  const handleSwipe = () => {
    const swipeDistance = touchStartX.value - touchEndX.value
    
    // 向左滑動（下一頁）
    if (swipeDistance > minSwipeDistance && currentPageIndex.value < pages.length - 1) {
      currentPageIndex.value++
    }
    // 向右滑動（上一頁）
    else if (swipeDistance < -minSwipeDistance && currentPageIndex.value > 0) {
      currentPageIndex.value--
    }
  }

  // 鍵盤導航支援
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentPageIndex.value > 0) {
      currentPageIndex.value--
    } else if (e.key === 'ArrowRight' && currentPageIndex.value < pages.length - 1) {
      currentPageIndex.value++
    }
  }

  // 程式化導航
  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      currentPageIndex.value = index
    }
  }

  const nextPage = () => {
    if (currentPageIndex.value < pages.length - 1) {
      currentPageIndex.value++
    }
  }

  const prevPage = () => {
    if (currentPageIndex.value > 0) {
      currentPageIndex.value--
    }
  }

  // 掛載鍵盤事件
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    currentPageIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    goToPage,
    nextPage,
    prevPage
  }
}

