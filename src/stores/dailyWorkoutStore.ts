import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'
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
  const lastProgressBeforeAdd = ref(0);
  const lastWorkoutIncrement = ref(0);

  const earliestDateKey = computed(() => {
    const dateKeys = Object.keys(dailyWorkouts.value)
    if (dateKeys.length === 0) {
      return getTodayKey()
    }
    return dateKeys.sort()[0]
  })

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    const weightedWeights: { [key: string]: number } = {}
    let currentScore = 0
    let currentDate = new Date(earliestDateKey.value)
    const currentActivities: { [key: string]: number[] } = {}

    while (formatDateToKey(currentDate) <= getTodayKey()) {
      const dateKey = formatDateToKey(currentDate)

      if (dailyWorkouts.value[dateKey]) {

        // collect weights of activities
        Object.entries(dailyWorkouts.value[dateKey]).forEach(([activity, value]) => {
          if (!value) return
          currentActivities[activity] = [...(currentActivities[activity] || []), value]
        })

        const averageWeights: { [activityName: string]: number } = {};

        // 計算每個活動的平均重量（取最後10次記錄）
        Object.keys(currentActivities).forEach((activity) => {
          const activityRecords = currentActivities[activity];
          // 取最後10次記錄，如果不足10次則取所有記錄
          const recentRecords = activityRecords.length > 10
            ? activityRecords.slice(-10)
            : activityRecords;

          // 計算平均值
          if (recentRecords.length > 0) {
            const sum = recentRecords.reduce((acc, weight) => acc + weight, 0);
            averageWeights[activity] = sum / recentRecords.length;
          } else {
            averageWeights[activity] = 0; // 如果沒有記錄，設為0
          }
        });

        // 計算當天各活動的權重
        const todayActivities = Object.keys(dailyWorkouts.value[dateKey]);
        const activityWeightsForDay: { [key: string]: number } = {};

        if (todayActivities.length > 0) {
          // 計算所有活動的平均權重總和
          const totalAverageWeight = todayActivities.reduce((sum, activity) => {
            return sum + (averageWeights[activity] || 0);
          }, 0);

          // 計算權重乘數，使得所有活動的權重平均為1
          const weightMultiplier = todayActivities.length / (totalAverageWeight || 1); // 避免除以零

          // 為每個活動計算權重
          todayActivities.forEach(activity => {
            // 反轉權重計算邏輯：使用倒數關係
            // 如果平均重量為0，則給予一個預設權重
            if (averageWeights[activity] === 0) {
              activityWeightsForDay[activity] = weightMultiplier; // 給予平均權重
            } else {
              // 使用倒數關係：1/平均重量，然後再乘以調整因子
              const inverseWeight = 1 / averageWeights[activity];

              // 計算所有活動的倒數總和，用於標準化
              const totalInverseWeight = todayActivities.reduce((sum, act) => {
                return sum + (averageWeights[act] ? 1 / averageWeights[act] : weightMultiplier);
              }, 0);

              // 標準化權重，使得所有權重的平均值為1
              activityWeightsForDay[activity] = (inverseWeight / totalInverseWeight) * todayActivities.length;
            }
          });

        } else {
          scores[dateKey] = Math.max(0, currentScore - 5);
        }

        // 計算當天的加權後總重量
        todayActivities.forEach(activity => {
          // 獲取當天該活動的原始值
          const activityValue = dailyWorkouts.value[dateKey][activity] || 0;
          // 使用計算出的權重乘以原始值
          const weightedValue = activityValue * (activityWeightsForDay[activity] || 0);
          // 累加到當天總分
          weightedWeights[dateKey] = (weightedWeights[dateKey] || 0) + weightedValue;
        });

        // 計算當天分數
        // 找出之前所有日期的加權後總重量的最大值
        const previousDates = Object.keys(weightedWeights).filter(date => date < dateKey);
        const maxPreviousWeight = previousDates.length > 0
          ? Math.max(...previousDates.map(date => weightedWeights[date] || 0))
          : 0;

        const todayWeightedWeight = weightedWeights[dateKey] || 0;

        // 根據今天的加權總重量與之前最大值的比較來計算分數
        if (todayWeightedWeight > maxPreviousWeight) {
          currentScore += 5;
        } else if (todayWeightedWeight > maxPreviousWeight * 0.9) {
          currentScore += 3;
        } else if (todayWeightedWeight > maxPreviousWeight * 0.8) {
          currentScore += 1;
        } else if (todayWeightedWeight > maxPreviousWeight * 0.7) {
          currentScore -= 1;
        } else {
          currentScore -= 3;
        }

        scores[dateKey] = currentScore;

      } else {
        currentScore = Math.max(0, currentScore - 5)
        scores[dateKey] = currentScore
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }
    return scores
  })


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
    return (todayScore / maxScoreBefore.value) * 100
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
    // 保存添加前的進度
    lastProgressBeforeAdd.value = todayProgress.value || 0;

    const dateKey = formatDateToKey(date);

    // 如果該日期還沒有記錄，先創建一個空物件
    if (!dailyWorkouts.value[dateKey]) {
      dailyWorkouts.value[dateKey] = {};
    }

    if (!dailyWorkouts.value[dateKey][workout]) {
      dailyWorkouts.value[dateKey][workout] = 0; // 初始化運動記錄為 0
    }

    dailyWorkouts.value[dateKey][workout] += Number(count) * Number(weight);

    // 計算添加後的進度
    const currentProgress = todayProgress.value || 0;

    // 計算本次添加的增量
    lastWorkoutIncrement.value = currentProgress - lastProgressBeforeAdd.value;
  }

  // 計算最後一次添加運動的增量
  const todayProgressIncrease = computed(() => {
    // 返回最後一次添加運動的增量
    return lastWorkoutIncrement.value > 0 ? lastWorkoutIncrement.value : 0;
  });

  const resetStore = () => {
    // 重置 dailyWorkouts 為空物件
    dailyWorkouts.value = {};

    // 清除 localStorage 中的相關資料
    if (!useMockData) {
      const storageKey = 'dailyWorkout'; // Pinia 持久化存儲的默認鍵名
      localStorage.removeItem(storageKey);
    }
  };

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
    todayProgressIncrease,
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
