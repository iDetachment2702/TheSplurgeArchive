/**
 * アプリケーションエラーの型定義
 */

/** 定義済みエラー一覧 */
export const ERROR_DEFINITIONS = {
  ARTICLE_LOAD_FAILED: {
    code: 'ARTICLE_LOAD_FAILED',
    message: '記事の読み込みに失敗しました。ページを再読み込みしてください。',
  },
  ARTICLE_PARSE_FAILED: {
    code: 'ARTICLE_PARSE_FAILED',
    message: '記事の解析に失敗しました。記事のフォーマットが正しくない可能性があります。',
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '予期しないエラーが発生しました。',
  },
} as const;

/** エラーコードの型 */
export type ErrorCode = keyof typeof ERROR_DEFINITIONS;

/** アプリケーションエラーの型 */
export interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly originalError?: unknown;
}

/**
 * アプリケーションエラーを作成
 */
export function createAppError(code: ErrorCode, originalError?: unknown, additionalInfo?: string): AppError {
  const definition = ERROR_DEFINITIONS[code];
  const message = additionalInfo ? `${definition.message} ${additionalInfo}` : definition.message;

  return {
    code,
    message,
    originalError,
  };
}

/**
 * エラー情報を文字列化
 */
export function formatAppError(error: AppError): string {
  return `[${error.code}] ${error.message}`;
}

/**
 * エラーがAppErrorかどうかを判定
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AppError).code === 'string' &&
    typeof (error as AppError).message === 'string'
  );
}
