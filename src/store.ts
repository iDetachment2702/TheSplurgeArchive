import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { getArticleList } from './util/getArticleList';
import { extractUniqueTags } from './util/tagExtractor';

/** 記事情報 */
export interface Article {
  /** スラッグ ※IDとして機能するユニーク文字列 */
  slug: string;
  /** 記事タイトル */
  title: string;
  /** 投稿日（ISO 8601形式） */
  date: string; // ISO 8601形式の日付文字列（例: "2025-11-08T00:00:00.000+09:00"）
  /** タグ */
  tags: string[];
  /** 記事内容（Markdown形式） */
  content?: string;
}

/** 記事リストを取得するQuery Atom */
export const articlesAtom = atomWithQuery(() => ({
  queryKey: ['articles'],
  queryFn: async () => {
    const articles = await getArticleList();
    return articles;
  },
}));

/** タグリストを記事から派生させるAtom */
export const tagsAtom = atom((get) => {
  const articlesQuery = get(articlesAtom);
  if (!articlesQuery.data) return [];
  return extractUniqueTags(articlesQuery.data);
});
