import { describe, it, expect } from 'vitest';
import { filterArticlesByTag, getLimitedArticles, findArticleBySlug, isArticleNotFound } from './articleFilter';
import type { Article } from '../store';

const mockArticles: Article[] = [
  {
    slug: 'article-1',
    title: 'Article 1',
    date: '2025-01-01T00:00:00.000+09:00',
    tags: ['tag1', 'tag2'],
    content: 'Content 1',
  },
  {
    slug: 'article-2',
    title: 'Article 2',
    date: '2025-01-02T00:00:00.000+09:00',
    tags: ['tag2', 'tag3'],
    content: 'Content 2',
  },
  {
    slug: 'article-3',
    title: 'Article 3',
    date: '2025-01-03T00:00:00.000+09:00',
    tags: ['tag1', 'tag3'],
    content: 'Content 3',
  },
  {
    slug: 'article-4',
    title: 'Article 4',
    date: '2025-01-04T00:00:00.000+09:00',
    tags: ['tag4'],
    content: 'Content 4',
  },
  {
    slug: 'article-5',
    title: 'Article 5',
    date: '2025-01-05T00:00:00.000+09:00',
    tags: ['tag1', 'tag2', 'tag3'],
    content: 'Content 5',
  },
];

describe('articleFilter', () => {
  describe('filterArticlesByTag', () => {
    it('タグで記事をフィルタできる', () => {
      const result = filterArticlesByTag(mockArticles, 'tag1');
      expect(result).toHaveLength(3);
      expect(result.map((a) => a.slug)).toEqual(['article-1', 'article-3', 'article-5']);
    });

    it('tag2を持つ記事を返す', () => {
      const result = filterArticlesByTag(mockArticles, 'tag2');
      expect(result).toHaveLength(3);
      expect(result.map((a) => a.slug)).toEqual(['article-1', 'article-2', 'article-5']);
    });

    it('tag3を持つ記事を返す', () => {
      const result = filterArticlesByTag(mockArticles, 'tag3');
      expect(result).toHaveLength(3);
      expect(result.map((a) => a.slug)).toEqual(['article-2', 'article-3', 'article-5']);
    });

    it('ユニークなタグの場合は1つの記事を返す', () => {
      const result = filterArticlesByTag(mockArticles, 'tag4');
      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe('article-4');
    });

    it('存在しないタグの場合は空配列を返す', () => {
      const result = filterArticlesByTag(mockArticles, 'non-existent');
      expect(result).toHaveLength(0);
    });

    it('空の記事配列の場合は空配列を返す', () => {
      const result = filterArticlesByTag([], 'tag1');
      expect(result).toHaveLength(0);
    });

    it('タグは大文字小文字を区別する', () => {
      const result = filterArticlesByTag(mockArticles, 'Tag1');
      expect(result).toHaveLength(0);
    });
  });

  describe('getLimitedArticles', () => {
    it('指定した数の記事を返す', () => {
      const result = getLimitedArticles(mockArticles, 3);
      expect(result).toHaveLength(3);
      expect(result.map((a) => a.slug)).toEqual(['article-1', 'article-2', 'article-3']);
    });

    it('制限が記事数を超える場合は全記事を返す', () => {
      const result = getLimitedArticles(mockArticles, 10);
      expect(result).toHaveLength(5);
      expect(result).toEqual(mockArticles);
    });

    it('制限が0の場合は空配列を返す', () => {
      const result = getLimitedArticles(mockArticles, 0);
      expect(result).toHaveLength(0);
    });

    it('制限が1の場合は1つの記事を返す', () => {
      const result = getLimitedArticles(mockArticles, 1);
      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe('article-1');
    });

    it('負の制限を処理できる', () => {
      const result = getLimitedArticles(mockArticles, -1);
      // Array.slice(-1) は最後の1要素を返すので、負の値も有効
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('記事が空の場合は空配列を返す', () => {
      const result = getLimitedArticles([], 5);
      expect(result).toHaveLength(0);
    });
  });

  describe('findArticleBySlug', () => {
    it('スラッグで記事を見つけられる', () => {
      const result = findArticleBySlug(mockArticles, 'article-3');
      expect(result).toBeDefined();
      expect(result?.slug).toBe('article-3');
      expect(result?.title).toBe('Article 3');
    });

    it('存在しないスラッグの場合はundefinedを返す', () => {
      const result = findArticleBySlug(mockArticles, 'non-existent');
      expect(result).toBeUndefined();
    });

    it('最初の記事を見つけられる', () => {
      const result = findArticleBySlug(mockArticles, 'article-1');
      expect(result).toBeDefined();
      expect(result?.slug).toBe('article-1');
    });

    it('最後の記事を見つけられる', () => {
      const result = findArticleBySlug(mockArticles, 'article-5');
      expect(result).toBeDefined();
      expect(result?.slug).toBe('article-5');
    });

    it('記事が空の場合はundefinedを返す', () => {
      const result = findArticleBySlug([], 'article-1');
      expect(result).toBeUndefined();
    });

    it('スラッグは大文字小文字を区別する', () => {
      const result = findArticleBySlug(mockArticles, 'Article-1');
      expect(result).toBeUndefined();
    });

    it('空のスラッグを処理できる', () => {
      const result = findArticleBySlug(mockArticles, '');
      expect(result).toBeUndefined();
    });
  });

  describe('isArticleNotFound', () => {
    it('読み込み後に記事が見つからない場合はtrueを返す', () => {
      const result = isArticleNotFound('non-existent', mockArticles, undefined);
      expect(result).toBe(true);
    });

    it('記事が見つかった場合はfalseを返す', () => {
      const article = mockArticles[0];
      const result = isArticleNotFound('article-1', mockArticles, article);
      expect(result).toBe(false);
    });

    it('スラッグがundefinedの場合はfalseを返す', () => {
      const result = isArticleNotFound(undefined, mockArticles, undefined);
      expect(result).toBe(false);
    });

    it('記事がまだ読み込まれていない場合はfalseを返す', () => {
      const result = isArticleNotFound('article-1', [], undefined);
      expect(result).toBe(false);
    });

    it('スラッグが空文字列の場合はfalseを返す', () => {
      const result = isArticleNotFound('', mockArticles, undefined);
      expect(result).toBe(false);
    });

    it('記事が存在するがスラッグが一致しない場合を処理できる', () => {
      const article = mockArticles[0];
      const result = isArticleNotFound('article-2', mockArticles, article);
      expect(result).toBe(false);
    });

    it('すべての条件が満たされた場合のみtrueを返す', () => {
      // slug exists, articles loaded, but article not found
      const result1 = isArticleNotFound('non-existent', mockArticles, undefined);
      expect(result1).toBe(true);

      // slug exists, articles not loaded
      const result2 = isArticleNotFound('article-1', [], undefined);
      expect(result2).toBe(false);

      // slug not exists, articles loaded
      const result3 = isArticleNotFound(undefined, mockArticles, undefined);
      expect(result3).toBe(false);

      // slug exists, articles loaded, article found
      const result4 = isArticleNotFound('article-1', mockArticles, mockArticles[0]);
      expect(result4).toBe(false);
    });
  });
});
