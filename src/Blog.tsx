import { JSX, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { ArticleContent } from './component/ArticleContent';
import { ArticleList } from './component/ArticleList';
import { TagList } from './component/TagList';
import { MonthlyArchiveList } from './component/MonthlyArchiveList';
import { Header } from './component/Header';
import { MobileMenu } from './component/MobileMenu';
import { BLOG_TITLE } from './constant';
import { articlesAtom } from './store';
import { useToggle } from './hooks/useToggle';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { filterArticlesByTag, getLimitedArticles, findArticleBySlug } from './util/articleFilter';

/**
 * ブログのメインコンポーネント
 *
 * URLパラメータに応じて記事一覧または個別記事を表示します。
 * デスクトップではサイドバーに記事リスト、月別アーカイブ、タグを表示し、
 * モバイルではメニューボタンから表示します。
 */
export const Blog = (): JSX.Element => {
  const { slug, tag } = useParams<{ slug?: string; tag?: string }>();
  const articlesQuery = useAtomValue(articlesAtom);
  const articles = articlesQuery.data || [];
  const [isMenuOpen, toggleMenu] = useToggle(false);

  // 表示する記事リストを決定
  const displayArticles = useMemo(() => {
    return tag ? filterArticlesByTag(articles, tag) : getLimitedArticles(articles, 5);
  }, [articles, tag]);

  // URLのslugから記事を取得
  const currentArticle = useMemo(() => {
    return slug ? findArticleBySlug(articles, slug) : undefined;
  }, [articles, slug]);

  // ページタイトルを設定
  const pageTitle = useMemo(() => {
    if (slug && currentArticle) {
      return `${currentArticle.title} - ${BLOG_TITLE}`;
    }
    if (tag) {
      return `${tag} - ${BLOG_TITLE}`;
    }
    return BLOG_TITLE;
  }, [slug, tag, currentArticle]);

  useDocumentTitle(pageTitle);

  return (
    <div className="min-w-[390px] @container">
      <Header onMenuToggle={toggleMenu} />
      <div className="max-w-[1366px] mx-auto px-6 py-6">
        <div className="@4xl:grid @4xl:grid-cols-[1fr_300px] @4xl:gap-8">
          {/* 中央: 記事表示エリア */}
          <ArticleContent slug={slug} currentArticle={currentArticle} tag={tag} displayArticles={displayArticles} />

          {/* 右側: 記事リスト、月別アーカイブ、タグリスト (デスクトップ表示) */}
          <div className="hidden @4xl:block space-y-8">
            <ArticleList selectedArticle={slug || null} />
            <MonthlyArchiveList />
            <TagList />
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} selectedArticle={slug || null} />
    </div>
  );
};
