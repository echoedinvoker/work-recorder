export function calculateScore(currentValue: number, maxValue: number, previousScore: number, scoreMap: Map<number, number>): number {
  // 如果沒有最大值參考，且當前值大於 0，則加 10 分
  if (maxValue === 0) {
    return currentValue > 0 ? previousScore + 10 : 0;
  }
  
  // 計算比例
  const ratio = currentValue / maxValue;
  
  // 找出適用的評分規則
  let scoreChange = 0;
  for (const [threshold, change] of scoreMap.entries()) {
    if (ratio > threshold) {
      scoreChange = change;
      break;
    }
  }
  
  // 確保分數不會低於 0
  return Math.max(0, previousScore + scoreChange);
}

