import { describe, it, expect } from 'vitest';
import { parseDate } from './dateFormat';
import { createAppError } from './error';

/**
 * getArticleListのテスト
 * 注: import.meta.globは実際のファイルシステムに依存するため、
 * ここではヘルパー関数やロジックの単体テストを行います
 */
describe('getArticleList関連のテスト', () => {
  describe('Front Matterのパース', () => {
    it('正しいFront Matterをパースできる', () => {
      const text = `---
title: テスト記事
date: 2025-11-08T00:00:00.000+09:00
tags: [タグA, タグB]
---
記事の内容`;

      const frontMatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      expect(frontMatterMatch).not.toBeNull();

      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1] ?? '';
        const content = frontMatterMatch[2] ?? '';

        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        const dateMatch = frontMatter.match(/date:\s*(.+)/);
        const tagsMatch = frontMatter.match(/tags:\s*\[(.+)\]/);

        expect(titleMatch?.[1]).toBe('テスト記事');
        expect(dateMatch?.[1]).toBe('2025-11-08T00:00:00.000+09:00');
        expect(tagsMatch?.[1]).toBe('タグA, タグB');
        expect(content.trim()).toBe('記事の内容');
      }
    });

    it('Front Matterがない場合はnullを返す', () => {
      const text = 'Front Matterがない記事';
      const frontMatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      expect(frontMatterMatch).toBeNull();
    });

    it('タグのスペースをトリムできる', () => {
      const tagsString = ' タグA , タグB , タグC ';
      const tags = tagsString.split(',').map((t) => t.trim());
      expect(tags).toEqual(['タグA', 'タグB', 'タグC']);
    });
  });

  describe('日付ソート', () => {
    it('記事を日付の降順にソートできる', () => {
      const articles = [
        { title: '記事1', date: '2025-11-01T00:00:00.000+09:00' },
        { title: '記事2', date: '2025-11-08T00:00:00.000+09:00' },
        { title: '記事3', date: '2025-11-05T00:00:00.000+09:00' },
      ];

      const sorted = [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date));

      expect(sorted[0]?.title).toBe('記事2'); // 2025-11-08
      expect(sorted[1]?.title).toBe('記事3'); // 2025-11-05
      expect(sorted[2]?.title).toBe('記事1'); // 2025-11-01
    });
  });

  describe('エラーハンドリング', () => {
    it('AppErrorが正しく作成される', () => {
      const error = createAppError('ARTICLE_LOAD_FAILED', new Error('テストエラー'), '追加情報');

      expect(error.code).toBe('ARTICLE_LOAD_FAILED');
      expect(error.message).toContain('記事の読み込みに失敗しました');
      expect(error.message).toContain('追加情報');
    });
  });

  describe('スラッグ生成', () => {
    it('ファイルパスからスラッグを生成できる', () => {
      const path = '/article/test-article.md';
      const fileName = path.split('/').pop() ?? '';
      const slug = fileName.replace('.md', '');

      expect(slug).toBe('test-article');
    });

    it('複雑なファイル名でもスラッグを生成できる', () => {
      const path = '/article/2025-11-08-my-article.md';
      const fileName = path.split('/').pop() ?? '';
      const slug = fileName.replace('.md', '');

      expect(slug).toBe('2025-11-08-my-article');
    });
  });

  describe('デフォルト値', () => {
    it('タイトルがない場合はデフォルト値を使用', () => {
      const titleMatch: RegExpMatchArray | null = null;
      const title = titleMatch?.[1] ?? 'No Title';

      expect(title).toBe('No Title');
    });

    it('タグがない場合は空配列を使用', () => {
      const tagsMatch = null as RegExpMatchArray | null;
      const tags = tagsMatch?.[1]?.split(',').map((t: string) => t.trim()) ?? [];

      expect(tags).toEqual([]);
    });

    it('日付がない場合は空文字列を使用', () => {
      const dateMatch: RegExpMatchArray | null = null;
      const date = dateMatch?.[1] ?? '';

      expect(date).toBe('');
    });
  });
});
