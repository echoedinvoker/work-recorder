import { ref, onMounted, onUnmounted } from 'vue'

export interface PageConfig {
  name: string
  component: string
}

export function usePageNavigation(pages: PageConfig[]) {
  const currentPageIndex = ref(0)
  
  // 觸控相關變數
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)
  const minSwipeDistance = 50
  const isHorizontalSwipe = ref(false)

  // 觸控事件處理
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
    isHorizontalSwipe.value = false
  }

  const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    
    const deltaX = Math.abs(currentX - touchStartX.value)
    const deltaY = Math.abs(currentY - touchStartY.value)
    
    // 判斷是否為水平滑動
    if (deltaX > deltaY && deltaX > 10) {
      isHorizontalSwipe.value = true
      // 只有水平滑動時才阻止預設行為
      e.preventDefault()
    }
    // 如果是垂直滑動，不阻止預設行為，讓頁面正常滾動
  }

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.value = e.changedTouches[0].clientX
    touchEndY.value = e.changedTouches[0].clientY
    
    // 只有在水平滑動時才處理頁面切換
    if (isHorizontalSwipe.value) {
      handleSwipe()
    }
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

