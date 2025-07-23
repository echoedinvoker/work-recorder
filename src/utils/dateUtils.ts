/**
 * 將日期格式化為 YYYY-MM-DD 格式的字串
 * @param date 要格式化的日期，預設為當前日期
 * @returns 格式化後的日期字串 (YYYY-MM-DD)
 */
export const formatDateToKey = (date: Date = new Date()): string => {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    timeZone: 'Asia/Taipei'
  }).replace(/\//g, '-');
};

/**
 * 獲取今日的日期鍵值 (YYYY-MM-DD)
 * @returns 今日的日期鍵值
 */
export const getTodayKey = (): string => {
  return formatDateToKey(new Date());
};

/**
 * 獲取昨日的日期鍵值 (YYYY-MM-DD)
 * @returns 昨日的日期鍵值
 */
export const getYesterdayKey = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToKey(yesterday);
};

/**
 * 獲取指定天數前的日期鍵值 (YYYY-MM-DD)
 * @param daysAgo 要往前推的天數
 * @returns 指定天數前的日期鍵值
 */
export const getDaysAgoKey = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateToKey(date);
};
