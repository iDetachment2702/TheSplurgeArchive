import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertMarkdownToSafeHtml, isMarkdownEmpty } from './markdown';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

vi.mock('marked');
vi.mock('dompurify');

describe('markdown', () => {
  describe('convertMarkdownToSafeHtml', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('MarkdownをサニタイズされたHTMLに変換できる', () => {
      const markdown = '# Hello World';
      const rawHtml = '<h1>Hello World</h1>';
      const sanitizedHtml = '<h1>Hello World</h1>';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(marked.parse).toHaveBeenCalledWith(markdown, { async: false });
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(rawHtml);
      expect(result).toBe(sanitizedHtml);
    });

    it('危険なHTMLをサニタイズできる', () => {
      const markdown = '<script>alert("xss")</script>';
      const rawHtml = '<script>alert("xss")</script>';
      const sanitizedHtml = '';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(rawHtml);
      expect(result).toBe(sanitizedHtml);
    });

    it('複数行のMarkdownを処理できる', () => {
      const markdown = '# Title\n\nParagraph 1\n\nParagraph 2';
      const rawHtml = '<h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p>';
      const sanitizedHtml = '<h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p>';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe(sanitizedHtml);
    });

    it('コードブロックを処理できる', () => {
      const markdown = '```js\nconst x = 1;\n```';
      const rawHtml = '<pre><code>const x = 1;\n</code></pre>';
      const sanitizedHtml = '<pre><code>const x = 1;\n</code></pre>';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe(sanitizedHtml);
    });

    it('リンクを処理できる', () => {
      const markdown = '[Link](https://example.com)';
      const rawHtml = '<a href="https://example.com">Link</a>';
      const sanitizedHtml = '<a href="https://example.com">Link</a>';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe(sanitizedHtml);
    });

    it('marked.parseがPromiseを返す場合は空文字列を返す', () => {
      const markdown = '# Title';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(marked.parse).mockReturnValue(Promise.resolve('<h1>Title</h1>'));

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected Promise returned from marked.parse');

      consoleErrorSpy.mockRestore();
    });

    it('エラー時は空文字列を返す', () => {
      const markdown = '# Title';
      const error = new Error('Parse error');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(marked.parse).mockImplementation(() => {
        throw error;
      });

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing markdown:', error);

      consoleErrorSpy.mockRestore();
    });

    it('空文字列を処理できる', () => {
      const markdown = '';
      const rawHtml = '';
      const sanitizedHtml = '';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe(sanitizedHtml);
    });

    it('安全なHTMLエンティティを保持できる', () => {
      const markdown = '&lt;tag&gt;';
      const rawHtml = '<p>&lt;tag&gt;</p>';
      const sanitizedHtml = '<p>&lt;tag&gt;</p>';

      vi.mocked(marked.parse).mockReturnValue(rawHtml);
      vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

      const result = convertMarkdownToSafeHtml(markdown);

      expect(result).toBe(sanitizedHtml);
    });
  });

  describe('isMarkdownEmpty', () => {
    it('undefinedの場合はtrueを返す', () => {
      expect(isMarkdownEmpty(undefined)).toBe(true);
    });

    it('空文字列の場合はtrueを返す', () => {
      expect(isMarkdownEmpty('')).toBe(true);
    });

    it('空白のみの場合はtrueを返す', () => {
      expect(isMarkdownEmpty('   ')).toBe(true);
      expect(isMarkdownEmpty('\n\n')).toBe(true);
      expect(isMarkdownEmpty('\t')).toBe(true);
      expect(isMarkdownEmpty('  \n  \t  ')).toBe(true);
    });

    it('空でないコンテンツの場合はfalseを返す', () => {
      expect(isMarkdownEmpty('# Title')).toBe(false);
      expect(isMarkdownEmpty('a')).toBe(false);
      expect(isMarkdownEmpty('  content  ')).toBe(false);
    });

    it('前後に空白があるMarkdownの場合はfalseを返す', () => {
      expect(isMarkdownEmpty('  # Title  ')).toBe(false);
      expect(isMarkdownEmpty('\n# Title\n')).toBe(false);
    });
  });
});
