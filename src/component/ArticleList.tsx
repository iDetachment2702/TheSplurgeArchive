import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { articlesAtom } from '../store';
import { formatDateTime } from '../util/dateFormat';

interface ArticleListProps {
  selectedArticle: string | null;
}

/**
 * 記事一覧コンポーネント
 *
 * 全記事のタイトルと投稿日時を一覧表示します。
 * 現在表示中の記事はハイライト表示されます。
 */
export const ArticleList = ({ selectedArticle }: ArticleListProps): JSX.Element => {
  const articles = useAtomValue(articlesAtom).data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary-700 mb-6">記事一覧 ({articles.length}件)</h2>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              to={`/article/${article.slug}`}
              className={`block p-4 rounded-lg border transition-all hover:shadow-md ${
                selectedArticle === article.slug
                  ? 'bg-primary-100 border-primary-400'
                  : 'bg-neutral-50 border-neutral-200 hover:border-primary-300'
              }`}
            >
              <div className="font-semibold text-primary-900 mb-1">{article.title}</div>
              <div className="text-sm text-neutral-600">{formatDateTime(article.date)}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
