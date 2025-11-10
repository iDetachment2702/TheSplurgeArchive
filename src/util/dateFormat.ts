import { DateTime } from 'luxon';

const INVALID_DATE_MESSAGE = '不明な日付';

/**
 * ISO文字列を日時文字列に変換
 * @param isoString ISO 8601形式の日付文字列
 * @returns 日時文字列（例: "2025/11/08"）
 */
export const formatDateTime = (isoString: string): string => {
  const dt = DateTime.fromISO(isoString);

  if (!dt.isValid) {
    console.error(`Invalid date: ${isoString}`);
    return INVALID_DATE_MESSAGE;
  }

  return dt.toFormat('yyyy/MM/dd');
};

/**
 * ISO文字列をタイムスタンプに変換
 * @param isoString ISO 8601形式の日付文字列
 * @returns Unixタイムスタンプ（ミリ秒）
 */
export const parseDate = (isoString: string): number => {
  const dt = DateTime.fromISO(isoString);

  if (!dt.isValid) {
    return 0;
  }

  return dt.toMillis();
};
