import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = originalTitle;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('ドキュメントタイトルを設定できる', () => {
    const title = 'Test Title';
    renderHook(() => useDocumentTitle(title));
    expect(document.title).toBe(title);
  });

  it('タイトルが変更されたときにドキュメントタイトルを更新できる', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Initial Title' },
    });

    expect(document.title).toBe('Initial Title');

    rerender({ title: 'Updated Title' });
    expect(document.title).toBe('Updated Title');
  });

  it('空文字列を処理できる', () => {
    renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe('');
  });

  it('特殊文字を処理できる', () => {
    const title = 'Title with 特殊文字 & <symbols>';
    renderHook(() => useDocumentTitle(title));
    expect(document.title).toBe(title);
  });

  it('長いタイトルを処理できる', () => {
    const title = 'A'.repeat(1000);
    renderHook(() => useDocumentTitle(title));
    expect(document.title).toBe(title);
  });

  it('同じタイトルで複数回再レンダリングできる', () => {
    const title = 'Same Title';
    const { rerender } = renderHook(() => useDocumentTitle(title));
    expect(document.title).toBe(title);

    rerender();
    expect(document.title).toBe(title);

    rerender();
    expect(document.title).toBe(title);
  });

  it('タイトルの急速な変更を処理できる', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Title 1' },
    });

    expect(document.title).toBe('Title 1');

    rerender({ title: 'Title 2' });
    expect(document.title).toBe('Title 2');

    rerender({ title: 'Title 3' });
    expect(document.title).toBe('Title 3');

    rerender({ title: 'Title 4' });
    expect(document.title).toBe('Title 4');
  });

  it('Unicode文字を処理できる', () => {
    const title = 'こんにちは世界 🌍';
    renderHook(() => useDocumentTitle(title));
    expect(document.title).toBe(title);
  });

  it('前後の空白文字がトリミングされる', () => {
    const title = '  Title with spaces  ';
    renderHook(() => useDocumentTitle(title));
    // ブラウザは自動的に前後の空白をトリミングする
    expect(document.title).toBe(title.trim());
  });

  it('改行文字を処理できる', () => {
    const title = 'Title\nwith\nnewlines';
    renderHook(() => useDocumentTitle(title));
    expect(document.title).toBe(title);
  });
});
