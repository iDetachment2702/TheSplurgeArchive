import { Component, ErrorInfo, ReactNode } from 'react';
import { isAppError, type AppError } from '../util/error';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | AppError | null;
}

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントでエラーが発生した場合にキャッチし、/error ページにリダイレクト
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 親コンポーネントに通知
    this.props.onError?.(error, errorInfo);

    // エラー情報をセッションストレージに保存して /error にリダイレクト
    const errorData = {
      message: error.message,
      code: isAppError(error) ? error.code : 'UNKNOWN_ERROR',
      stack: error instanceof Error ? error.stack : undefined,
    };

    sessionStorage.setItem('lastError', JSON.stringify(errorData));

    // /error にリダイレクト
    window.location.href = '/error';
  }

  override render() {
    // エラーが発生した場合は何も表示しない（リダイレクトされるため）
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
