<template>
  <!-- 滑動指示器 (只顯示活動頁面，排除概要頁面) -->
  <div v-if="navigableRoutes.length > 0 && $route.name !== 'overview'" class="flex justify-center mb-4 space-x-1">
    <div 
      v-for="(route, index) in navigableRoutes" 
      :key="String(route.name)"
      class="w-2 h-2 rounded-full transition-all duration-300"
      :class="currentRouteIndex === index ? 'bg-blue-500' : 'bg-gray-300'"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

// 可導航的路由（排除 NotFound 和 overview）
const navigableRoutes = computed(() => 
  routes.filter(route => route.name !== 'overview')
);

// 當前路由索引（在可導航路由中的位置）
const currentRouteIndex = computed(() => {
  return navigableRoutes.value.findIndex(r => r.name === route.name);
});
</script>

