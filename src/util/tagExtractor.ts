import type { Article } from '../store';

/**
 * 記事リストから全タグを抽出する（重複なし）
 * @param articles - 全記事リスト
 * @returns 一意なタグのリスト
 */
export const extractUniqueTags = (articles: Article[]): string[] => {
  return Array.from(new Set(articles.flatMap((article) => article.tags)));
};

/**
 * 記事リストからタグとその出現回数を取得する
 * @param articles - 全記事リスト
 * @returns タグと出現回数のマップ
 */
export const getTagCountMap = (articles: Article[]): Map<string, number> => {
  const tagCountMap = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
    }
  }

  return tagCountMap;
};

/**
 * タグを出現回数順にソートする
 * @param tags - タグリスト
 * @param articles - 全記事リスト
 * @returns 出現回数が多い順にソートされたタグリスト
 */
export const sortTagsByCount = (tags: string[], articles: Article[]): string[] => {
  const tagCountMap = getTagCountMap(articles);

  return [...tags].sort((a, b) => {
    const countA = tagCountMap.get(a) || 0;
    const countB = tagCountMap.get(b) || 0;
    return countB - countA;
  });
};

/**
 * 記事が特定のタグを持っているか判定する
 * @param article - 記事
 * @param tag - タグ
 * @returns タグを持っている場合は true
 */
export const hasTag = (article: Article, tag: string): boolean => {
  return article.tags.includes(tag);
};
