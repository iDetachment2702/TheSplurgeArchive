import type { Article } from '../store';
import { parseDate } from './dateFormat';
import { createAppError, isAppError } from './error';
import { fetchAndDecompressGzip } from './decompressGzip';

interface ManifestFile {
  name: string;
  slug: string;
}

interface Manifest {
  files: ManifestFile[];
  compressed: boolean;
  timestamp: string;
}

/**
 * ファイル名から日付を抽出（yyyy-mm-dd形式）
 */
const extractDateFromFilename = (filename: string): string => {
  // yyyy-mm-dd または yyyy_mm_dd 形式の日付を抽出
  const dateMatch = filename.match(/^(\d{4})[-_](\d{2})[-_](\d{2})/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  return '';
};

/**
 * Front Matterをパースして記事オブジェクトを作成
 */
const parseFrontMatter = (text: string, slug: string): Article | null => {
  const frontMatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontMatterMatch) {
    return null;
  }

  const frontMatter = frontMatterMatch[1];
  const content = frontMatterMatch[2];

  if (!frontMatter || !content) {
    return null;
  }

  const titleMatch = frontMatter.match(/title:\s*(.+)/);
  const tagsMatch = frontMatter.match(/tags:\s*\[(.+)\]/);

  // ファイル名から日付を抽出
  const date = extractDateFromFilename(slug);

  return {
    slug,
    title: titleMatch?.[1] ?? 'No Title',
    date,
    tags: tagsMatch?.[1]?.split(',').map((t) => t.trim()) ?? [],
    content: content.trim(),
  };
};

/**
 * 開発環境: import.meta.globで直接Markdownを読み込む
 */
const getArticleListDev = async (): Promise<Article[]> => {
  const articleModules = import.meta.glob<string>('/article/*.md', {
    query: '?raw',
    import: 'default',
  });

  const loadedArticles: Article[] = [];
  const failedArticles: string[] = [];

  for (const [path, loadModule] of Object.entries(articleModules)) {
    try {
      const text = await loadModule();
      const fileName = path.split('/').pop();
      if (!fileName) {
        console.error(`Invalid path: ${path}`);
        continue;
      }

      const slug = fileName.replace('.md', '');

      const article = parseFrontMatter(text, slug);

      if (article) {
        loadedArticles.push(article);
      } else {
        failedArticles.push(fileName);
        console.error(`Failed to parse article front matter: ${path}`);
      }
    } catch (error: unknown) {
      const fileName = path.split('/').pop() ?? path;
      failedArticles.push(fileName);
      console.error(`Failed to load article: ${path}`, error);
    }
  }

  if (loadedArticles.length === 0) {
    throw createAppError(
      'ARTICLE_LOAD_FAILED',
      new Error('No articles could be loaded'),
      failedArticles.length > 0 ? `失敗した記事: ${failedArticles.join(', ')}` : undefined
    );
  }

  return loadedArticles;
};

/**
 * 本番環境: gzip圧縮されたファイルを読み込む
 */
const getArticleListProd = async (): Promise<Article[]> => {
  try {
    // マニフェストファイルを取得
    const baseUrl = import.meta.env.BASE_URL;
    const manifestUrl = `${baseUrl}articles/manifest.json`;

    const manifestResponse = await fetch(manifestUrl);
    if (!manifestResponse.ok) {
      throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
    }

    const manifest: Manifest = await manifestResponse.json();

    // 各gzipファイルを並行して読み込み
    const articlePromises = manifest.files.map(async (file): Promise<Article | null> => {
      try {
        const gzipUrl = `${baseUrl}articles/${file.name}.gz`;
        const text = await fetchAndDecompressGzip(gzipUrl);
        const article = parseFrontMatter(text, file.slug);

        if (!article) {
          console.error(`Failed to parse article: ${file.name}`);
          return null;
        }

        return article;
      } catch (error) {
        console.error(`Failed to load article: ${file.name}`, error);
        return null;
      }
    });

    const results = await Promise.all(articlePromises);
    const loadedArticles = results.filter((article): article is Article => article !== null);

    if (loadedArticles.length === 0) {
      throw createAppError('ARTICLE_LOAD_FAILED', new Error('No articles could be loaded from gzip files'));
    }

    return loadedArticles;
  } catch (error: unknown) {
    if (isAppError(error)) {
      throw error;
    }
    throw createAppError('ARTICLE_LOAD_FAILED', error);
  }
};

/**
 * article以下のmdファイルを取得する
 * 開発環境: 直接Markdownファイルを読み込む
 * 本番環境: gzip圧縮されたファイルを読み込む
 */
export const getArticleList = async (): Promise<Article[]> => {
  try {
    const isDev = import.meta.env.DEV;
    const articles = isDev ? await getArticleListDev() : await getArticleListProd();

    // 作成日時の降順にソート
    articles.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    return articles;
  } catch (error: unknown) {
    if (isAppError(error)) {
      throw error;
    }
    throw createAppError('ARTICLE_LOAD_FAILED', error);
  }
};
