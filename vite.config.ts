import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public', // デフォルトのpublicディレクトリを使用（articleディレクトリはビルドから除外）
  base: '/TheSplurgeArchive/',
});
