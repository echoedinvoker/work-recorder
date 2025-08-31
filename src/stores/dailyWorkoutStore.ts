import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import { formatDateToKey } from '../utils/dateUtils'
import { computed } from "vue";

const UNIT = '重量(公斤)'

const generateMockData = () => {
  const mockData: Record<string, Record<string, number>> = {};
  const today = new Date();

  // 活動類型列表
  const activityTypes = ['running', 'cycling', 'swimming'];

  // 生成過去 14 天的假資料
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = formatDateToKey(date);

    // 為每天隨機選擇要記錄的活動類型
    mockData[dateKey] = {};

    // 隨機決定今天要記錄哪些活動
    activityTypes.forEach(activity => {
      // 有 70% 的機率會記錄此活動
      if (Math.random() > 0.3) {
        // 根據活動類型設定不同的隨機範圍
        switch (activity) {
          case 'running':
            mockData[dateKey][activity] = Math.floor(Math.random() * 10); // 0-10
            break;
          case 'cycling':
            mockData[dateKey][activity] = Math.floor(Math.random() * 5); // 0-5
            break;
          case 'swimming':
            mockData[dateKey][activity] = Math.floor(Math.random() * 3); // 0-3
            break;
        }
      }
      // 如果沒有通過機率檢查，則不記錄此活動
    });

  }

  return mockData;
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyWorkoutStore = defineStore("dailyWorkout", () => {
  const dailyWorkouts = ref<Record<string, Record<string, number>>>(useMockData ? generateMockData() : {});

  // 計算每個活動的權重
  const activityWeights = computed(() => {
    // 1. 收集所有活動類型
    const activityTypes = new Set<string>();
    Object.values(dailyWorkouts.value).forEach(dayRecord => {
      Object.keys(dayRecord).forEach(activity => {
        activityTypes.add(activity);
      });
    });

    // 2. 計算每個活動的平均值
    const averages: Record<string, number> = {};

    activityTypes.forEach(activity => {
      // 收集特定活動的所有記錄
      const records: number[] = [];
      Object.values(dailyWorkouts.value).forEach(dayRecord => {
        if (dayRecord[activity] !== undefined) {
          records.push(dayRecord[activity]);
        }
      });

      // 取最近十次記錄或所有記錄
      const recentRecords = records.length > 10 ? records.slice(-10) : records;

      // 計算平均值
      if (recentRecords.length > 0) {
        averages[activity] = recentRecords.reduce((sum, val) => sum + val, 0) / recentRecords.length;
      } else {
        averages[activity] = 0; // 如果沒有記錄，設為 0
      }
    });

    // 3. 計算所有活動的總平均值
    const totalAverage = Object.values(averages).reduce((sum, val) => sum + val, 0);
    const averagePerActivity = totalAverage / activityTypes.size;

    // 4. 計算每個活動的調整係數 (adjustment factor)
    const weights: Record<string, number> = {};

    // 如果總和為 0，平均分配權重
    if (totalAverage === 0) {
      const equalWeight = 1 / activityTypes.size;
      activityTypes.forEach(activity => {
        weights[activity] = equalWeight;
      });
    } else {
      // 計算調整係數：平均時間 / 原始時間
      activityTypes.forEach(activity => {
        if (averages[activity] === 0) {
          weights[activity] = 0; // 避免除以零
        } else {
          // 調整係數 = 平均每個活動的時間 / 該活動的平均時間
          weights[activity] = averagePerActivity / averages[activity];
        }
      });
    }

    return weights;
  });

  const dailyScore = computed(() => {
    const scores: Record<string, number> = {};

    // 遍歷每一天的記錄
    Object.entries(dailyWorkouts.value).forEach(([dateKey, activities]) => {
      let dayScore = 0;

      // 計算當天活動的總權重
      const dailyActivities = Object.keys(activities);
      const totalDailyWeight = dailyActivities.reduce((sum, activity) => {
        return sum + (activityWeights.value[activity] || 0);
      }, 0);

      // 只有當總權重大於0時才進行計算
      if (totalDailyWeight > 0) {
        // 遍歷該天的每個活動，並根據當天的權重計算分數
        Object.entries(activities).forEach(([activity, value]) => {
          // 如果該活動有權重，則計算加權分數
          if (activityWeights.value[activity] !== undefined) {
            dayScore += value * activityWeights.value[activity];
          }
        });
      }

      // 四捨五入到整數
      scores[dateKey] = Math.round(dayScore);
    });

    return scores;
  });

  const maxScoreBefore = computed(() => {
    const beforeScores = Object.values(dailyScore.value).slice(0, -1)
    return Math.max(...beforeScores)
  })

  const todayProgress = computed(() => {
    const todayKey = formatDateToKey(new Date());
    const todayScore = dailyScore.value[todayKey]
    return (todayScore/maxScoreBefore.value) * 100
  })

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    Object.entries(dailyScore.value).reduce((acc, cur, ind, arr) => {
      const slicedArray = arr.slice(0, ind);
      const values = slicedArray.map(v => v[1])
      const maxValue = slicedArray.length === 0 ? 0 : Math.max(...values)
      if (slicedArray.length === 0) {
        if (cur[1] > 0) {
          const value = acc + 10
          scores[cur[0]] = value
          return value
        } else {
          scores[cur[0]] = 0
          return 0
        }
      } else if (cur[1] > maxValue) {
        const value = acc + 10
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.9) {
        const value = acc + 5
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.8) {
        const value = acc
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.7) {
        const value = acc >= 5 ? acc - 5 : 0
        scores[cur[0]] = value
        return value
      } else if (cur[1] > maxValue * 0.6) {
        const value = acc >= 10 ? acc - 10 : 0
        scores[cur[0]] = value
        return value
      } else {
        const value = acc >= 15 ? acc - 15 : 0
        scores[cur[0]] = value
        return value
      }
    }, 0)
    return scores
  })

  const workoutOptions = computed(() => {
    // 創建一個 Set 來收集所有不重複的運動類型
    const workoutTypes = new Set<string>();

    // 遍歷所有日期的運動記錄，收集所有運動類型
    Object.values(dailyWorkouts.value).forEach(dayRecord => {
      Object.keys(dayRecord).forEach(workout => {
        workoutTypes.add(workout);
      });
    });

    // 將 Set 轉換為所需的陣列格式，並添加預設選項
    const options = [
      { value: '', label: '選擇動作' },
      // 將每個運動類型轉換為選項物件，並將首字母大寫
      ...Array.from(workoutTypes).map(workout => ({
        value: workout,
        label: workout.charAt(0).toUpperCase() + workout.slice(1)
      }))
    ];

    return options;
  });

  const getScoreByDate = (date: Date) => {
    const dateKey = formatDateToKey(date)
    return accDailyScore.value[dateKey] || 0
  }

  const addWorkout = (workout: string, count: number, weight: number, date: Date = new Date()) => {
    const dateKey = formatDateToKey(date);

    // 如果該日期還沒有記錄，先創建一個空物件
    if (!dailyWorkouts.value[dateKey]) {
      dailyWorkouts.value[dateKey] = {};
    }

    if (!dailyWorkouts.value[dateKey][workout]) {
      dailyWorkouts.value[dateKey][workout] = 0; // 初始化運動記錄為 0
    }

    dailyWorkouts.value[dateKey][workout] += Number(count) * Number(weight);
  }

  const resetStore = () => {
    // 重置 dailyWorkouts 為空物件
    dailyWorkouts.value = {};

    // 清除 localStorage 中的相關資料
    if (!useMockData) {
      const storageKey = 'dailyWorkout'; // Pinia 持久化存儲的默認鍵名
      localStorage.removeItem(storageKey);
    }
  };

  onMounted(() => {
    const todayKey = formatDateToKey(new Date())
    if (dailyWorkouts.value[todayKey] === undefined) {
      dailyWorkouts.value[todayKey] = {}
    }
  })

  return {
    dailyWorkouts,
    activityWeights,
    dailyScore,
    accDailyScore,
    workoutOptions,
    getScoreByDate,
    addWorkout,
    resetStore,
    todayProgress,
    UNIT
  };
},
  {
    persist: useMockData ? false : { // 不使用假資料時啟用持久化存儲
      serializer: {
        serialize: (state) => {
          return JSON.stringify({
            ...state,
            startTime: state.startTime?.toISOString() || null,
            endTime: state.endTime?.toISOString() || null
          })
        },
        deserialize: (value) => {
          const parsed = JSON.parse(value)
          return {
            ...parsed,
            startTime: parsed.startTime ? new Date(parsed.startTime) : null,
            endTime: parsed.endTime ? new Date(parsed.endTime) : null
          }
        }
      }
    }
  }
)
