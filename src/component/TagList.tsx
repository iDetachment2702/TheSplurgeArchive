import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { tagsAtom } from '../store';
import { JSX } from 'react';

/**
 * タグリストコンポーネント
 *
 * 全記事から抽出されたタグを一覧表示します。
 * タグをクリックすると、そのタグが付いた記事の一覧が表示されます。
 */
export const TagList = (): JSX.Element => {
  const tags = useAtomValue(tagsAtom);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary-700 mb-6">タグ</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            to={`/tag/${tag}`}
            className="inline-block px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium border border-primary-300 transition-all hover:bg-primary-200 hover:border-primary-400 hover:shadow-sm"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
};
