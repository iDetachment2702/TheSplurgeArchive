import React, { useEffect, useState } from 'react';
import { Header } from '../component/Header';
import { ERROR_DEFINITIONS, type ErrorCode } from '../util/error';

interface ErrorData {
  message: string;
  code: ErrorCode;
  stack?: string;
}

/** エラー時に表示する /error のコンポーネント */
export const ErrorPage: React.FC = () => {
  const [errorData, setErrorData] = useState<ErrorData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // セッションストレージからエラー情報を取得
    const savedError = sessionStorage.getItem('lastError');
    if (savedError) {
      try {
        const parsed = JSON.parse(savedError) as ErrorData;
        setErrorData(parsed);

        // エラー情報をクリア
        sessionStorage.removeItem('lastError');
      } catch (e) {
        console.error('Failed to parse error data:', e);
      }
    }

    // ページタイトルを設定
    document.title = 'エラー - 散財行為記録保管所';
  }, []);

  const displayMessage = errorData?.message || ERROR_DEFINITIONS.UNKNOWN_ERROR.message;

  return (
    <div className="min-w-[390px]">
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
      <div className="max-w-[1366px] mx-auto px-6 py-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-4">エラーが発生しました</h2>
          <p className="text-primary-900">{displayMessage}</p>
          {errorData?.stack && (
            <details className="mb-4">
              <summary className="cursor-pointer text-red-600">詳細を見る</summary>
              <pre className="whitespace-pre-wrap mt-2 text-sm text-red-800">{errorData.stack}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};
