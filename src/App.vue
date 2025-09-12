<template>
  <div class="max-w-md mx-auto p-6 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
    
    <!-- 頁面導航 -->
    <nav class="mb-6">
      <ul class="flex flex-wrap justify-center gap-2">
        <li v-for="route in routes" :key="route.name">
          <router-link 
            :to="{ name: route.name }" 
            class="px-3 py-1 rounded-full text-sm"
            :class="{ 
              'bg-blue-500 text-white': $route.name === route.name,
              'bg-gray-200 text-gray-700 hover:bg-gray-300': $route.name !== route.name
            }"
          >
            {{ route.meta?.title }} <!-- 使用可選鏈操作符 -->
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 路由視圖 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 獲取所有路由配置
const routes = computed(() => {
  return router.options.routes.filter(route => route.meta?.title)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

3. 修改 main.ts 以引入路由：

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

