import { describe, it, expect } from 'vitest';
import { extractUniqueTags, getTagCountMap, sortTagsByCount, hasTag } from './tagExtractor';
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

describe('tagExtractor', () => {
  describe('extractUniqueTags', () => {
    it('記事からユニークなタグを抽出できる', () => {
      const result = extractUniqueTags(mockArticles);
      expect(result).toHaveLength(4);
      expect(result).toContain('tag1');
      expect(result).toContain('tag2');
      expect(result).toContain('tag3');
      expect(result).toContain('tag4');
    });

    it('タグがない記事を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: [],
          content: 'Content 1',
        },
      ];
      const result = extractUniqueTags(articles);
      expect(result).toHaveLength(0);
    });

    it('空の記事配列を処理できる', () => {
      const result = extractUniqueTags([]);
      expect(result).toHaveLength(0);
    });

    it('重複したタグを削除できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['tag1', 'tag1', 'tag2'],
          content: 'Content 1',
        },
        {
          slug: 'article-2',
          title: 'Article 2',
          date: '2025-01-02T00:00:00.000+09:00',
          tags: ['tag1', 'tag2'],
          content: 'Content 2',
        },
      ];
      const result = extractUniqueTags(articles);
      expect(result).toHaveLength(2);
      expect(result).toContain('tag1');
      expect(result).toContain('tag2');
    });

    it('単一のタグを持つ記事を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['solo-tag'],
          content: 'Content 1',
        },
      ];
      const result = extractUniqueTags(articles);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('solo-tag');
    });

    it('多数のタグを持つ記事を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
          content: 'Content 1',
        },
      ];
      const result = extractUniqueTags(articles);
      expect(result).toHaveLength(5);
    });
  });

  describe('getTagCountMap', () => {
    it('タグの出現回数をカウントできる', () => {
      const result = getTagCountMap(mockArticles);
      expect(result.get('tag1')).toBe(3); // article-1, article-3, article-5
      expect(result.get('tag2')).toBe(3); // article-1, article-2, article-5
      expect(result.get('tag3')).toBe(3); // article-2, article-3, article-5
      expect(result.get('tag4')).toBe(1); // article-4
    });

    it('空の記事の場合は空のマップを返す', () => {
      const result = getTagCountMap([]);
      expect(result.size).toBe(0);
    });

    it('タグがない記事を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: [],
          content: 'Content 1',
        },
      ];
      const result = getTagCountMap(articles);
      expect(result.size).toBe(0);
    });

    it('単一のタグを正しくカウントできる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['unique'],
          content: 'Content 1',
        },
      ];
      const result = getTagCountMap(articles);
      expect(result.get('unique')).toBe(1);
    });

    it('同じ記事内の重複タグを処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['tag1', 'tag1', 'tag1'],
          content: 'Content 1',
        },
      ];
      const result = getTagCountMap(articles);
      expect(result.get('tag1')).toBe(3);
    });

    it('複数の記事にまたがってタグをカウントできる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['common'],
          content: 'Content 1',
        },
        {
          slug: 'article-2',
          title: 'Article 2',
          date: '2025-01-02T00:00:00.000+09:00',
          tags: ['common'],
          content: 'Content 2',
        },
        {
          slug: 'article-3',
          title: 'Article 3',
          date: '2025-01-03T00:00:00.000+09:00',
          tags: ['common'],
          content: 'Content 3',
        },
      ];
      const result = getTagCountMap(articles);
      expect(result.get('common')).toBe(3);
    });
  });

  describe('sortTagsByCount', () => {
    it('タグをカウントの降順にソートできる', () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4'];
      const result = sortTagsByCount(tags, mockArticles);
      // tag1: 3, tag2: 3, tag3: 3, tag4: 1
      // Same count tags can be in any order, but tag4 should be last
      expect(result[3]).toBe('tag4');
      expect(result.slice(0, 3)).toContain('tag1');
      expect(result.slice(0, 3)).toContain('tag2');
      expect(result.slice(0, 3)).toContain('tag3');
    });

    it('空のタグ配列を処理できる', () => {
      const result = sortTagsByCount([], mockArticles);
      expect(result).toHaveLength(0);
    });

    it('空の記事配列を処理できる', () => {
      const tags = ['tag1', 'tag2'];
      const result = sortTagsByCount(tags, []);
      expect(result).toHaveLength(2);
      // All tags have count 0, so order might be preserved or reversed
      expect(result).toContain('tag1');
      expect(result).toContain('tag2');
    });

    it('異なるカウントを持つタグをソートできる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: ['popular', 'medium', 'rare'],
          content: 'Content 1',
        },
        {
          slug: 'article-2',
          title: 'Article 2',
          date: '2025-01-02T00:00:00.000+09:00',
          tags: ['popular', 'medium'],
          content: 'Content 2',
        },
        {
          slug: 'article-3',
          title: 'Article 3',
          date: '2025-01-03T00:00:00.000+09:00',
          tags: ['popular'],
          content: 'Content 3',
        },
      ];
      const tags = ['rare', 'medium', 'popular'];
      const result = sortTagsByCount(tags, articles);
      expect(result).toEqual(['popular', 'medium', 'rare']);
    });

    it('元のタグ配列を変更しない', () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4'];
      const originalTags = [...tags];
      sortTagsByCount(tags, mockArticles);
      expect(tags).toEqual(originalTags);
    });

    it('記事に存在しないタグを処理できる', () => {
      const tags = ['tag1', 'non-existent'];
      const result = sortTagsByCount(tags, mockArticles);
      expect(result[0]).toBe('tag1');
      expect(result[1]).toBe('non-existent');
    });
  });

  describe('hasTag', () => {
    it('記事がタグを持つ場合はtrueを返す', () => {
      const article = mockArticles[0]!;
      expect(hasTag(article, 'tag1')).toBe(true);
      expect(hasTag(article, 'tag2')).toBe(true);
    });

    it('記事がタグを持たない場合はfalseを返す', () => {
      const article = mockArticles[0]!;
      expect(hasTag(article, 'tag3')).toBe(false);
      expect(hasTag(article, 'non-existent')).toBe(false);
    });

    it('タグがない記事を処理できる', () => {
      const article: Article = {
        slug: 'article-1',
        title: 'Article 1',
        date: '2025-01-01T00:00:00.000+09:00',
        tags: [],
        content: 'Content 1',
      };
      expect(hasTag(article, 'tag1')).toBe(false);
    });

    it('単一のタグを持つ記事を処理できる', () => {
      const article = mockArticles[3]!; // tag4 only
      expect(hasTag(article, 'tag4')).toBe(true);
      expect(hasTag(article, 'tag1')).toBe(false);
    });

    it('複数のタグを持つ記事を処理できる', () => {
      const article = mockArticles[4]!; // tag1, tag2, tag3
      expect(hasTag(article, 'tag1')).toBe(true);
      expect(hasTag(article, 'tag2')).toBe(true);
      expect(hasTag(article, 'tag3')).toBe(true);
      expect(hasTag(article, 'tag4')).toBe(false);
    });

    it('大文字小文字を区別する', () => {
      const article = mockArticles[0]!;
      expect(hasTag(article, 'Tag1')).toBe(false);
      expect(hasTag(article, 'TAG1')).toBe(false);
    });

    it('空文字列のタグを処理できる', () => {
      const article = mockArticles[0]!;
      expect(hasTag(article, '')).toBe(false);
    });
  });
});
