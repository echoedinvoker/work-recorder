import { ref, computed } from 'vue';
import { useDailyMeditationStore } from '@/stores/dailyMeditationStore';

const currentTime = ref(Date.now());
let intervalId: number | null = null;

export function useMeditationRecorder() {
  const meditationStore = useDailyMeditationStore();

  // 啟動定時器更新當前時間
  const startTimeUpdater = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (meditationStore.isRecording) {
        currentTime.value = Date.now();
      }
    }, 1000);
  };

  // 停止定時器
  const stopTimeUpdater = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // 切換計時器狀態
  const toggleTimer = () => {
    if (!meditationStore.isRecording) {
      // 開始記錄
      meditationStore.startTime = new Date();
      meditationStore.endTime = null;
      meditationStore.isRecording = true;
      currentTime.value = Date.now();
      startTimeUpdater();
    } else {
      // 結束記錄
      meditationStore.endTime = new Date();
      meditationStore.isRecording = false;
      meditationStore.isDisplayingResult = true;
      stopTimeUpdater();

      // 將冥想時間添加到記錄
      if (meditationDurationMinutes.value > 0) {
        meditationStore.addMeditationTime(meditationDurationMinutes.value);
      }
    }
  };

  const disableResultDisplay = () => {
    meditationStore.isDisplayingResult = false;
  };

  // 計算冥想時長（分鐘）
  const meditationDurationMinutes = computed(() => {
    if (!meditationStore.startTime) return 0;

    const endOrNow = meditationStore.endTime
      ? meditationStore.endTime.getTime()
      : currentTime.value;

    return Math.floor((endOrNow - meditationStore.startTime.getTime()) / (1000 * 60));
  });

  // 格式化冥想時長顯示
  const meditationDuration = computed(() => {
    const minutes = meditationDurationMinutes.value;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours} 小時 ${remainingMinutes} 分鐘`;
    }
    return `${minutes} 分鐘`;
  });

  // 格式化時間顯示
  const formatTime = (date: Date | null) => {
    if (!date) return '';

    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Taipei'
    });
  };

  return {
    isRecording: computed(() => meditationStore.isRecording),
    isDisplayingResult: computed(() => meditationStore.isDisplayingResult),
    startTime: computed(() => meditationStore.startTime),
    endTime: computed(() => meditationStore.endTime),
    toggleTimer,
    meditationDuration,
    meditationDurationMinutes,
    formatTime,
    disableResultDisplay,
  };
}

