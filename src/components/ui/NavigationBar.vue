<template>
  <nav class="mb-4">
    <div class="flex justify-center gap-3">
      <!-- Toggle 概覽頁面按鈕 -->
      <button 
        @click="toggleOverview"
        class="px-4 py-2 rounded-full text-sm transition-all border-2 border-blue-500 bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-2"
      >
        <span v-if="previousActivityName">
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
        @click="$emit('showUsage')"
        class="px-4 py-2 rounded-full text-sm transition-all border-2 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-2"
      >
        <span class="text-base">❓</span>
      </button>

      <!-- 清除資料按鈕 -->
      <button 
        @click="$emit('showClearDialog')"
        class="px-4 py-2 rounded-full text-sm transition-all border-2 border-red-500 bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-2"
        :title="clearButtonTitle"
      >
        <span class="text-base">🗑️</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Props - 將 previousActivityName 設為可選
interface Props {
  previousActivityName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  previousActivityName: ''
});

// Emits
const emit = defineEmits<{
  showUsage: [];
  showClearDialog: [];
}>();

const router = useRouter();
const route = useRoute();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

// Toggle 概覽頁面功能
const toggleOverview = () => {
  if (route.name === 'overview') {
    // 如果在概覽頁面且有記錄的活動頁面，返回該頁面
    if (props.previousActivityName) {
      // 找到對應的路由名稱
      const targetRoute = routes.find(r => 
        r.meta?.title === props.previousActivityName || r.name === props.previousActivityName
      );
      if (targetRoute) {
        router.push({ name: targetRoute.name });
      }
    }
  } else {
    // 如果在活動頁面，切換到概覽頁面
    router.push({ name: 'overview' });
  }
};

// 清除按鈕標題
const clearButtonTitle = computed(() => {
  if (route.name === 'overview') {
    return '清除所有資料';
  }
  const currentRoute = routes.find(r => r.name === route.name);
  const pageTitle = currentRoute?.meta?.title || '當前頁面';
  return `清除${pageTitle}資料`;
});
</script>

