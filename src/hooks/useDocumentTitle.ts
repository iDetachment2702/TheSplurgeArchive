import { useEffect } from 'react';

/**
 * ページタイトルを設定するカスタムフック
 * @param title - 設定するタイトル
 */
export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
