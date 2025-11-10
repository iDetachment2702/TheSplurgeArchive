import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { articlesAtom } from '../store';
import { extractYearMonths, formatYearMonth, getArticleCountByYearMonth } from '../util/dateGrouping';
import { JSX } from 'react';

/**
 * 月別アーカイブリストコンポーネント
 *
 * 記事を月単位でグループ化し、各月の記事数とともに表示します。
 * 新しい月から順に表示されます。
 */
export const MonthlyArchiveList = (): JSX.Element => {
  const articles = useAtomValue(articlesAtom).data || [];
  const yearMonths = extractYearMonths(articles);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary-700 mb-6">月別アーカイブ</h2>
      {yearMonths.length > 0 ? (
        <ul className="space-y-2">
          {yearMonths.map((yearMonth) => {
            const count = getArticleCountByYearMonth(articles, yearMonth);
            return (
              <li key={yearMonth}>
                <Link
                  to={`/archive/${yearMonth}`}
                  className="block px-4 py-2 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium border border-primary-300 transition-all hover:bg-primary-200 hover:border-primary-400 hover:shadow-sm"
                >
                  {formatYearMonth(yearMonth)} ({count})
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-neutral-600">アーカイブはありません</p>
      )}
    </div>
  );
};
