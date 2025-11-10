import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { ArticleDisplay } from '../component/ArticleDisplay';
import { ArticleList } from '../component/ArticleList';
import { TagList } from '../component/TagList';
import { MonthlyArchiveList } from '../component/MonthlyArchiveList';
import { Header } from '../component/Header';
import { MobileMenu } from '../component/MobileMenu';
import { BLOG_TITLE } from '../constant';
import { articlesAtom, tagsAtom } from '../store';
import { useToggle } from '../hooks/useToggle';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getArticlesByYearMonth, formatYearMonth } from '../util/dateGrouping';

/** 月別アーカイブページのコンポーネント */
export const MonthlyArchive: React.FC = () => {
  const { yearMonth } = useParams<{ yearMonth: string }>();
  const articlesQuery = useAtomValue(articlesAtom);
  const tags = useAtomValue(tagsAtom);
  const articles = articlesQuery.data || [];
  const [isMenuOpen, toggleMenu] = useToggle(false);

  // 指定された年月の記事を取得
  const monthlyArticles = useMemo(() => {
    if (!yearMonth) return [];
    return getArticlesByYearMonth(articles, yearMonth);
  }, [articles, yearMonth]);

  // ページタイトル
  const pageTitle = useMemo(() => {
    if (yearMonth) {
      return `${formatYearMonth(yearMonth)} - ${BLOG_TITLE}`;
    }
    return BLOG_TITLE;
  }, [yearMonth]);

  useDocumentTitle(pageTitle);

  // 年月が指定されていない、または記事が見つからない場合
  if (!yearMonth) {
    return (
      <div className="min-w-[390px] @container">
        <Header onMenuToggle={toggleMenu} />
        <div className="max-w-[1366px] mx-auto px-6 py-6">
          <p>年月が指定されていません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[390px] @container">
      <Header onMenuToggle={toggleMenu} />
      <div className="max-w-[1366px] mx-auto px-6 py-6">
        <div className="@4xl:grid @4xl:grid-cols-[1fr_300px] @4xl:gap-8">
          {/* 中央: 記事表示エリア */}
          <div>
            <h2 className="text-2xl font-bold text-primary-700 mb-6">{formatYearMonth(yearMonth)}</h2>
            {monthlyArticles.length > 0 ? (
              <div>
                {monthlyArticles.map((article, index) => (
                  <React.Fragment key={article.slug}>
                    <ArticleDisplay article={article} />
                    {index < monthlyArticles.length - 1 && <hr className="my-12 border-t-2 border-primary-200" />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p>この月の記事はありません</p>
            )}
          </div>

          {/* 右側: 記事リスト、月別アーカイブ、タグリスト (デスクトップ表示) */}
          <div className="hidden @4xl:block space-y-8">
            <ArticleList selectedArticle={null} />
            <MonthlyArchiveList />
            <TagList />
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} tags={tags} selectedArticle={null} />
    </div>
  );
};
