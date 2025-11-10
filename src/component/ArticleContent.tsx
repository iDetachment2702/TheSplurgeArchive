import { ArticleDisplay } from './ArticleDisplay';
import { useAtomValue } from 'jotai';
import { Article, articlesAtom } from '../store';
import { Fragment, JSX } from 'react';

interface ArticleContentProps {
  slug: string | undefined;
  currentArticle: Article | undefined;
  tag: string | undefined;
  displayArticles: Article[];
}

/**
 * 記事コンテンツ表示エリア
 *
 * URLパラメータに応じて以下を表示します：
 * - slug指定時: 個別記事を表示（404エラー処理含む）
 * - tag指定時: タグでフィルタされた記事一覧を表示
 * - 未指定時: 最新5件の記事一覧を表示
 */
export const ArticleContent = ({ slug, currentArticle, tag, displayArticles }: ArticleContentProps): JSX.Element => {
  const articles = useAtomValue(articlesAtom).data || [];
  const articleNotFound = Boolean(slug && articles.length > 0 && !currentArticle);

  return (
    <div>
      {articleNotFound ? (
        <div>
          <h2>404 - 記事が見つかりません</h2>
        </div>
      ) : slug ? (
        <ArticleDisplay article={currentArticle} />
      ) : (
        <>
          {tag && <h2>タグ: {tag}</h2>}
          <div>
            {displayArticles.length > 0 ? (
              displayArticles.map((article, index) => (
                <Fragment key={article.slug}>
                  <ArticleDisplay article={article} />
                  {index < displayArticles.length - 1 && <hr className="my-12 border-t-2 border-primary-200" />}
                </Fragment>
              ))
            ) : (
              <p>該当する記事がありません</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
