import React, { useMemo } from 'react';
import type { Article } from '../store';
import { formatDateTime } from '../util/dateFormat';
import { convertMarkdownToSafeHtml, isMarkdownEmpty } from '../util/markdown';
import parse from 'html-react-parser';

interface ArticleDisplayProps {
  article: Article | undefined;
}

export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ article }) => {
  const contentHtml = useMemo(() => {
    if (isMarkdownEmpty(article?.content)) {
      return '';
    }
    return convertMarkdownToSafeHtml(article!.content!);
  }, [article?.content]);

  if (!article) {
    return <p>記事を選択してください</p>;
  }

  if (!contentHtml) {
    return <p>本文がありません</p>;
  }

  return (
    <article className="mb-12">
      <h1 className="text-lg font-bold mb-3 text-primary-700">{article.title}</h1>
      <p className="text-primary-500 mb-4 text-sm font-medium">{formatDateTime(article.date)}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {article.tags.map((tag) => (
          <span key={tag} className="inline-block px-3 py-1 bg-primary-200 text-primary-900 rounded-full text-sm font-medium">
            {tag}
          </span>
        ))}
      </div>
      <div className="article-display prose prose-lg max-w-none text-primary-950">{parse(contentHtml)}</div>
    </article>
  );
};
