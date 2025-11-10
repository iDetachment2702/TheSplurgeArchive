import type { Article } from '../store';

/**
 * 年月を表す型 (例: "2025-01")
 */
export type YearMonth = string;

/**
 * 年月ごとの記事グループ
 */
export interface ArticlesByMonth {
  yearMonth: YearMonth;
  articles: Article[];
}

/**
 * 記事リストから年月のリストを抽出（新しい順）
 * @param articles - 全記事リスト
 * @returns 年月のリスト（降順）
 */
export const extractYearMonths = (articles: Article[]): YearMonth[] => {
  const yearMonthSet = new Set<YearMonth>();

  for (const article of articles) {
    const yearMonth = getYearMonthFromDate(article.date);
    yearMonthSet.add(yearMonth);
  }

  return Array.from(yearMonthSet).sort().reverse();
};

/**
 * 日付文字列から年月を取得 (YYYY-MM形式)
 * @param dateString - ISO 8601形式の日付文字列
 * @returns YYYY-MM形式の文字列
 */
export const getYearMonthFromDate = (dateString: string): YearMonth => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * 指定した年月の記事を取得
 * @param articles - 全記事リスト
 * @param yearMonth - 年月 (YYYY-MM形式)
 * @returns フィルタリングされた記事リスト（新しい順）
 */
export const getArticlesByYearMonth = (articles: Article[], yearMonth: YearMonth): Article[] => {
  return articles
    .filter((article) => getYearMonthFromDate(article.date) === yearMonth)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * 年月を表示用の形式に変換 (例: "2025-01" -> "2025年1月")
 * @param yearMonth - 年月 (YYYY-MM形式)
 * @returns 表示用の文字列
 */
export const formatYearMonth = (yearMonth: YearMonth): string => {
  const [year, month] = yearMonth.split('-');
  if (!year || !month) {
    return yearMonth;
  }
  return `${year}年${parseInt(month, 10)}月`;
};

/**
 * 記事を年月ごとにグループ化
 * @param articles - 全記事リスト
 * @returns 年月ごとにグループ化された記事リスト（新しい順）
 */
export const groupArticlesByMonth = (articles: Article[]): ArticlesByMonth[] => {
  const yearMonths = extractYearMonths(articles);

  return yearMonths.map((yearMonth) => ({
    yearMonth,
    articles: getArticlesByYearMonth(articles, yearMonth),
  }));
};

/**
 * 年月に含まれる記事数を取得
 * @param articles - 全記事リスト
 * @param yearMonth - 年月 (YYYY-MM形式)
 * @returns 記事数
 */
export const getArticleCountByYearMonth = (articles: Article[], yearMonth: YearMonth): number => {
  return getArticlesByYearMonth(articles, yearMonth).length;
};
