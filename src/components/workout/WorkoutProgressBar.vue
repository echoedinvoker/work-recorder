<template>
  <div class="progress-container" v-if="percentage !== null">
    <div class="progress-label">今日表現比例</div>
    <div class="progress-bar-wrapper">
      <div 
        class="progress-bar" 
        :style="{ width: `${Math.min(percentage, 120)}%`, backgroundColor: getBarColor(percentage) }"
      ></div>
      <div class="progress-value">{{ percentage }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 接收百分比作為 prop
const props = defineProps<{
  percentage: number | null;
}>();

// 根據百分比返回不同的顏色
const getBarColor = (percentage: number) => {
  if (percentage > 100) return '#8e44ad'; // 紫色 (101%~120%)
  if (percentage >= 90) return '#27ae60'; // 綠色 (90%~100%)
  if (percentage >= 80) return '#f39c12'; // 橙色 (80%~89%)
  return '#e74c3c'; // 紅色 (<80%)
};
</script>

<style scoped>
.progress-container {
  margin: 20px 0;
  padding: 10px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.progress-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.progress-bar-wrapper {
  height: 24px;
  background-color: #ddd;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease-in-out;
}

.progress-value {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>

