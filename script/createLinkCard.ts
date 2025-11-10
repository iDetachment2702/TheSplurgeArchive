import { readFile, writeFile } from 'fs/promises';
import ogs from 'open-graph-scraper';
import prettier from 'prettier';

interface LinkCardData {
  url: string;
  title: string;
  description: string;
  image?: string;
  favicon?: string;
}

/**
 * 画像URLから最適な商品画像を選択
 */
function selectBestImage(images: Array<{ url: string; width?: number; height?: number }> | undefined): string | undefined {
  if (!images || images.length === 0) return undefined;

  // 小さすぎる画像や特定のパターンを除外
  const filteredImages = images.filter((img) => {
    const minSize = 200;
    // サイズ指定がある場合は200px以上のもの
    if (img.width && img.height) {
      return img.width >= minSize && img.height >= minSize;
    }
    // nav-sprite や広告バナーなどを除外
    if (img.url.includes('nav-sprite') || img.url.includes('SWM') || img.url.includes('_QL70_')) {
      return false;
    }
    return true;
  });

  // フィルタ後の最初の画像、なければ元の配列の最初の画像
  return filteredImages[0]?.url || images[0]?.url;
}

/**
 * HTMLエンティティをエスケープ
 */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * HTMLタグを除去してテキストをサニタイズ
 */
function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  // HTMLタグを除去してエスケープ
  const cleaned = text.replace(/<[^>]*>/g, '').trim();
  return escapeHtml(cleaned);
}

/**
 * Amazonは複数の画像を返すので最良のものを探す
 */
function findBestImage(originalUrls: string[], domain: string): string | undefined {
  if (!originalUrls.length) return undefined;

  if (domain.includes('amazon') || domain.includes('amzn')) {
    const urls = originalUrls.filter((url) => {
      return url.includes('/I/') && url.includes('_SX') && url.includes('_SY');
    });
    return urls[0] || originalUrls[0];
  } else {
    return originalUrls[0];
  }
}

/**
 * open-graph-scraperを使用してURLのメタデータを取得
 */
async function fetchMetadata(url: string): Promise<LinkCardData> {
  try {
    const { result } = await ogs({ url });
    const urlObj = new URL(url);
    const origin = urlObj.origin;
    const domain = urlObj.hostname;

    let image: string | undefined;

    // Amazonの場合、複数画像から最適なものを選択
    if (domain.includes('amazon') || domain.includes('amzn')) {
      const allImageUrls: string[] = [];

      // ogImageから画像URLを収集
      if (result.ogImage) {
        if (Array.isArray(result.ogImage)) {
          allImageUrls.push(...result.ogImage.map((img) => (typeof img === 'string' ? img : img.url)));
        } else {
          allImageUrls.push(typeof result.ogImage === 'string' ? result.ogImage : result.ogImage.url);
        }
      }

      // twitterImageから収集
      if (result.twitterImage) {
        if (Array.isArray(result.twitterImage)) {
          allImageUrls.push(...result.twitterImage.map((img) => (typeof img === 'string' ? img : img.url)));
        } else {
          allImageUrls.push(typeof result.twitterImage === 'string' ? result.twitterImage : result.twitterImage.url);
        }
      }

      console.log(allImageUrls);

      // Primeロゴを除外
      const validImageUrls = allImageUrls.filter(
        (url) => !url.includes('Prime') && !url.includes('prime') && !url.includes('Logo') && !url.includes('logo')
      );

      if (validImageUrls.length > 0) {
        image = findBestImage(validImageUrls, domain);
      } else {
        console.warn(`Amazon Prime logo detected for ${url}, no valid image found`);
      }
    } else {
      // Amazon以外は通常通り
      image = selectBestImage(result.ogImage) || selectBestImage(result.twitterImage);
    }

    return {
      url,
      title: sanitizeText(result.ogTitle || result.twitterTitle || url),
      description: sanitizeText(result.ogDescription || result.twitterDescription),
      image,
      favicon: result.favicon || `${origin}/favicon.ico`,
    };
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return {
      url,
      title: url,
      description: '',
    };
  }
}

/**
 * リンクカードHTMLを生成
 */
function generateLinkCardHTML(data: LinkCardData): string {
  const hostname = new URL(data.url).hostname;

  const imageHTML = data.image
    ? `<div class="link-card-image">
<img src="${escapeHtml(data.image)}" alt="${data.title}" />
</div>`
    : '';

  const faviconHTML = data.favicon ? `<img class="link-card-favicon" src="${escapeHtml(data.favicon)}" alt="" />` : '';

  const descriptionHTML = data.description ? `<div class="link-card-description">${data.description}</div>` : '';

  return `<a href="${escapeHtml(data.url)}" class="link-card" target="_blank" rel="noopener noreferrer">
<div class="link-card-content">
<div class="link-card-text">
<div class="link-card-title">${data.title}</div>
${descriptionHTML}
<div class="link-card-url">
${faviconHTML}
<span>${escapeHtml(hostname)}</span>
</div>
</div>
${imageHTML}
</div>
</a>`
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/**
 * URLが既にリンクカード化されているかチェック
 */
function isLinkCard(markdown: string, url: string): boolean {
  // URLがリンクカードHTMLブロック内にあるかチェック
  const linkCardRegex = new RegExp(`<a[^>]*href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*class="link-card"`);
  return linkCardRegex.test(markdown);
}

/**
 * Markdownから独立したURLを抽出
 */
function extractStandaloneUrls(markdown: string): string[] {
  const urlRegex = /^https:\/\/[^\s<]+$/gm;
  const urls: string[] = [];
  let match;

  while ((match = urlRegex.exec(markdown)) !== null) {
    const url = match[0];
    if (!isLinkCard(markdown, url)) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Markdown内の独立したURLをリンクカードに変換
 */
export async function createLinkCard(markdown: string): Promise<string> {
  const urls = extractStandaloneUrls(markdown);

  if (urls.length === 0) {
    return markdown;
  }

  let result = markdown;

  // すべてのURLのメタデータを並列で取得
  const metadataPromises = urls.map((url) => fetchMetadata(url));
  const metadataList = await Promise.all(metadataPromises);

  // URLをリンクカードに置換
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const metadata = metadataList[i];
    if (!url || !metadata) continue;

    console.log(metadata);
    const linkCardHTML = generateLinkCardHTML(metadata);

    // 独立したURLをリンクカードに置換
    const urlRegex = new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm');
    result = result.replace(urlRegex, linkCardHTML);
  }

  return result;
}

/**
 * ファイルを読み込んでリンクカードに変換し、上書き保存
 */
async function processFile(filePath: string): Promise<void> {
  try {
    console.log(`開始: ${filePath}`);
    const content = await readFile(filePath, 'utf-8');
    const result = await createLinkCard(content);

    // Prettierで整形
    const formatted = await prettier.format(result, {
      parser: 'markdown',
      filepath: filePath,
    });

    await writeFile(filePath, formatted, 'utf-8');
    console.log(`完了: ${filePath}`);
  } catch (error) {
    console.error(`エラー: ${filePath}`, error);
    throw error;
  }
}

/**
 * メイン処理: コマンドライン引数からファイルパスを取得して処理
 */
async function main() {
  const filePaths = process.argv.slice(2);

  if (filePaths.length === 0) {
    process.exit(1);
  }

  // すべてのファイルを並列処理
  await Promise.all(filePaths.map((filePath) => processFile(filePath)));
}

// スクリプトとして実行された場合のみmainを実行
if (require.main === module) {
  main().catch((error) => {
    console.error('実行エラー:', error);
    process.exit(1);
  });
}
