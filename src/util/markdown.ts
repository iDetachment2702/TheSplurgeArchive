import { marked } from 'marked';
import DOMPurify from 'dompurify';

// markedのセキュリティ設定
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Markdownをサニタイズ済みHTMLに変換する
 * @param markdownContent - 変換するMarkdown文字列
 * @returns サニタイズ済みのHTML文字列、エラー時は空文字列
 */
export const convertMarkdownToSafeHtml = (markdownContent: string): string => {
  try {
    const result = marked.parse(markdownContent, { async: false });

    // 型ガード: Promiseでないことを確認
    if (typeof result === 'string') {
      // DOMPurifyでサニタイズしてXSS攻撃を防ぐ
      return DOMPurify.sanitize(result);
    }

    console.error('Unexpected Promise returned from marked.parse');
    return '';
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return '';
  }
};

/**
 * Markdownコンテンツが空かどうかを判定する
 * @param content - 判定するMarkdown文字列
 * @returns 空の場合はtrue
 */
export const isMarkdownEmpty = (content: string | undefined): boolean => {
  return !content || content.trim() === '';
};
