import { BLOG_TITLE } from '../constant';
import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="w-full bg-primary-600 py-4 px-6">
      <div className="max-w-[1366px] mx-auto flex justify-between items-center">
        <Link to="/" className="text-secondary-50 text-2xl font-bold hover:opacity-80 transition-opacity">
          {`${BLOG_TITLE}`}
        </Link>

        {/* ハンバーガーメニュー */}
        <button
          onClick={onMenuToggle}
          className="@4xl:hidden text-secondary-50 text-3xl font-bold hover:opacity-80 transition-opacity"
          aria-label="メニュー"
        >
          ☰
        </button>
      </div>
    </header>
  );
};
