import { JSX } from 'react';
import { ArticleList } from './ArticleList';
import { MonthlyArchiveList } from './MonthlyArchiveList';
import { TagList } from './TagList';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedArticle: string | null;
}

/**
 * モバイルメニューコンポーネント
 *
 * モバイル表示時にハンバーガーメニューから開くサイドメニューです。
 * 記事一覧、月別アーカイブ、タグリストを表示します。
 * 背景をクリックするか×ボタンで閉じることができます。
 */
export const MobileMenu = ({ isOpen, onClose, selectedArticle }: MobileMenuProps): JSX.Element => {
  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-[300px] bg-primary-50 shadow-xl overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl">
          ×
        </button>
        <div className="mt-8 space-y-8">
          <ArticleList selectedArticle={selectedArticle} />
          <MonthlyArchiveList />
          <TagList />
        </div>
      </div>
    </div>
  );
};
