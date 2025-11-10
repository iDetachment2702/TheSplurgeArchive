import type { Article } from '../store';

/**
 * タグでフィルタリングした記事リストを返す
 * @param articles - 全記事リスト
 * @param tag - フィルタリングするタグ
 * @returns フィルタリングされた記事リスト
 */
export const filterArticlesByTag = (articles: Article[], tag: string): Article[] => {
  return articles.filter((article) => article.tags.includes(tag));
};

/**
 * 指定された件数の記事を取得する
 * @param articles - 全記事リスト
 * @param limit - 取得件数
 * @returns 指定件数分の記事リスト
 */
export const getLimitedArticles = (articles: Article[], limit: number): Article[] => {
  return articles.slice(0, limit);
};

/**
 * slugから記事を検索する
 * @param articles - 全記事リスト
 * @param slug - 検索するスラッグ
 * @returns 見つかった記事、または undefined
 */
export const findArticleBySlug = (articles: Article[], slug: string): Article | undefined => {
  return articles.find((article) => article.slug === slug);
};

/**
 * 記事が存在しないかどうかを判定する（記事読み込み完了後のみ有効）
 * @param slug - 検索するスラッグ
 * @param articles - 全記事リスト
 * @param currentArticle - 現在の記事（検索結果）
 * @returns 記事が見つからない場合は true
 */
export const isArticleNotFound = (slug: string | undefined, articles: Article[], currentArticle: Article | undefined): boolean => {
  return Boolean(slug && articles.length > 0 && !currentArticle);
};
