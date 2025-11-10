import { describe, it, expect } from 'vitest';
import {
  extractYearMonths,
  getYearMonthFromDate,
  getArticlesByYearMonth,
  formatYearMonth,
  groupArticlesByMonth,
  getArticleCountByYearMonth,
} from './dateGrouping';
import type { Article } from '../store';

const mockArticles: Article[] = [
  {
    slug: 'article-1',
    title: 'Article 1',
    date: '2025-01-15T00:00:00.000+09:00',
    tags: ['tag1'],
    content: 'Content 1',
  },
  {
    slug: 'article-2',
    title: 'Article 2',
    date: '2025-01-20T00:00:00.000+09:00',
    tags: ['tag2'],
    content: 'Content 2',
  },
  {
    slug: 'article-3',
    title: 'Article 3',
    date: '2025-02-05T00:00:00.000+09:00',
    tags: ['tag1'],
    content: 'Content 3',
  },
  {
    slug: 'article-4',
    title: 'Article 4',
    date: '2024-12-25T00:00:00.000+09:00',
    tags: ['tag2'],
    content: 'Content 4',
  },
  {
    slug: 'article-5',
    title: 'Article 5',
    date: '2024-12-31T00:00:00.000+09:00',
    tags: ['tag1'],
    content: 'Content 5',
  },
];

describe('dateGrouping', () => {
  describe('getYearMonthFromDate', () => {
    it('日付文字列から年月を抽出できる', () => {
      expect(getYearMonthFromDate('2025-01-15T00:00:00.000+09:00')).toBe('2025-01');
    });

    it('異なる月を処理できる', () => {
      expect(getYearMonthFromDate('2025-02-05T00:00:00.000+09:00')).toBe('2025-02');
      expect(getYearMonthFromDate('2024-12-25T00:00:00.000+09:00')).toBe('2024-12');
    });

    it('1桁の月をゼロパディングできる', () => {
      expect(getYearMonthFromDate('2025-01-01T00:00:00.000+09:00')).toBe('2025-01');
      expect(getYearMonthFromDate('2025-09-01T00:00:00.000+09:00')).toBe('2025-09');
    });

    it('月の境界を処理できる', () => {
      expect(getYearMonthFromDate('2025-01-31T23:59:59.000+09:00')).toBe('2025-01');
      expect(getYearMonthFromDate('2025-02-01T00:00:00.000+09:00')).toBe('2025-02');
    });

    it('異なる年を処理できる', () => {
      expect(getYearMonthFromDate('2023-05-15T00:00:00.000+09:00')).toBe('2023-05');
      expect(getYearMonthFromDate('2024-05-15T00:00:00.000+09:00')).toBe('2024-05');
      expect(getYearMonthFromDate('2025-05-15T00:00:00.000+09:00')).toBe('2025-05');
    });
  });

  describe('extractYearMonths', () => {
    it('記事からユニークな年月を抽出できる', () => {
      const result = extractYearMonths(mockArticles);
      expect(result).toEqual(['2025-02', '2025-01', '2024-12']);
    });

    it('空の記事配列の場合は空配列を返す', () => {
      const result = extractYearMonths([]);
      expect(result).toEqual([]);
    });

    it('同じ月の記事を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
        {
          slug: 'article-2',
          title: 'Article 2',
          date: '2025-01-15T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
      ];
      const result = extractYearMonths(articles);
      expect(result).toEqual(['2025-01']);
    });

    it('年月を降順にソートできる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2024-01-01T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
        {
          slug: 'article-2',
          title: 'Article 2',
          date: '2025-06-01T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
        {
          slug: 'article-3',
          title: 'Article 3',
          date: '2024-12-01T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
      ];
      const result = extractYearMonths(articles);
      expect(result).toEqual(['2025-06', '2024-12', '2024-01']);
    });

    it('単一の記事を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-03-15T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
      ];
      const result = extractYearMonths(articles);
      expect(result).toEqual(['2025-03']);
    });
  });

  describe('getArticlesByYearMonth', () => {
    it('指定した年月の記事を取得できる', () => {
      const result = getArticlesByYearMonth(mockArticles, '2025-01');
      expect(result).toHaveLength(2);
      expect(result.map((a) => a.slug)).toEqual(['article-2', 'article-1']);
    });

    it('記事を日付の降順にソートできる', () => {
      const result = getArticlesByYearMonth(mockArticles, '2024-12');
      expect(result).toHaveLength(2);
      expect(result[0]?.slug).toBe('article-5'); // 12-31
      expect(result[1]?.slug).toBe('article-4'); // 12-25
    });

    it('存在しない年月の場合は空配列を返す', () => {
      const result = getArticlesByYearMonth(mockArticles, '2023-05');
      expect(result).toEqual([]);
    });

    it('空の記事配列の場合は空配列を返す', () => {
      const result = getArticlesByYearMonth([], '2025-01');
      expect(result).toEqual([]);
    });

    it('月内の単一の記事を処理できる', () => {
      const result = getArticlesByYearMonth(mockArticles, '2025-02');
      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe('article-3');
    });
  });

  describe('formatYearMonth', () => {
    it('年月を表示用にフォーマットできる', () => {
      expect(formatYearMonth('2025-01')).toBe('2025年1月');
    });

    it('異なる月を処理できる', () => {
      expect(formatYearMonth('2025-12')).toBe('2025年12月');
      expect(formatYearMonth('2024-06')).toBe('2024年6月');
    });

    it('月の先頭のゼロを削除できる', () => {
      expect(formatYearMonth('2025-01')).toBe('2025年1月');
      expect(formatYearMonth('2025-09')).toBe('2025年9月');
    });

    it('2桁の月を処理できる', () => {
      expect(formatYearMonth('2025-10')).toBe('2025年10月');
      expect(formatYearMonth('2025-11')).toBe('2025年11月');
      expect(formatYearMonth('2025-12')).toBe('2025年12月');
    });
  });

  describe('groupArticlesByMonth', () => {
    it('記事を月ごとにグループ化できる', () => {
      const result = groupArticlesByMonth(mockArticles);
      expect(result).toHaveLength(3);
      expect(result[0]?.yearMonth).toBe('2025-02');
      expect(result[0]?.articles).toHaveLength(1);
      expect(result[1]?.yearMonth).toBe('2025-01');
      expect(result[1]?.articles).toHaveLength(2);
      expect(result[2]?.yearMonth).toBe('2024-12');
      expect(result[2]?.articles).toHaveLength(2);
    });

    it('空の記事配列の場合は空配列を返す', () => {
      const result = groupArticlesByMonth([]);
      expect(result).toEqual([]);
    });

    it('グループを年月の降順にソートできる', () => {
      const result = groupArticlesByMonth(mockArticles);
      expect(result[0]?.yearMonth).toBe('2025-02');
      expect(result[1]?.yearMonth).toBe('2025-01');
      expect(result[2]?.yearMonth).toBe('2024-12');
    });

    it('各グループ内で記事を日付の降順にソートできる', () => {
      const result = groupArticlesByMonth(mockArticles);
      const jan2025 = result.find((g) => g.yearMonth === '2025-01');
      expect(jan2025).toBeDefined();
      expect(jan2025!.articles[0]?.slug).toBe('article-2'); // 01-20
      expect(jan2025!.articles[1]?.slug).toBe('article-1'); // 01-15
    });

    it('単一の月を処理できる', () => {
      const articles: Article[] = [
        {
          slug: 'article-1',
          title: 'Article 1',
          date: '2025-01-01T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
        {
          slug: 'article-2',
          title: 'Article 2',
          date: '2025-01-15T00:00:00.000+09:00',
          tags: [],
          content: '',
        },
      ];
      const result = groupArticlesByMonth(articles);
      expect(result).toHaveLength(1);
      expect(result[0]?.yearMonth).toBe('2025-01');
      expect(result[0]?.articles).toHaveLength(2);
    });
  });

  describe('getArticleCountByYearMonth', () => {
    it('特定の年月の記事をカウントできる', () => {
      expect(getArticleCountByYearMonth(mockArticles, '2025-01')).toBe(2);
      expect(getArticleCountByYearMonth(mockArticles, '2025-02')).toBe(1);
      expect(getArticleCountByYearMonth(mockArticles, '2024-12')).toBe(2);
    });

    it('存在しない年月の場合は0を返す', () => {
      expect(getArticleCountByYearMonth(mockArticles, '2023-05')).toBe(0);
    });

    it('空の記事配列の場合は0を返す', () => {
      expect(getArticleCountByYearMonth([], '2025-01')).toBe(0);
    });

    it('単一の記事を処理できる', () => {
      expect(getArticleCountByYearMonth(mockArticles, '2025-02')).toBe(1);
    });
  });
});
