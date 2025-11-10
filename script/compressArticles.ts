import { readdir, writeFile, mkdir } from 'fs/promises';
import { createGzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pipe = promisify(pipeline);

async function compressArticles() {
  const articleDir = path.join(__dirname, '../article');
  const outputDir = path.join(__dirname, '../dist/articles');

  console.log('📦 Compressing articles...');

  // 出力ディレクトリを作成
  await mkdir(outputDir, { recursive: true });

  // articleディレクトリ内の全.mdファイルを取得
  const files = await readdir(articleDir);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  console.log(`Found ${mdFiles.length} markdown files`);

  // 各ファイルをgzip圧縮
  for (const file of mdFiles) {
    const inputPath = path.join(articleDir, file);
    const outputPath = path.join(outputDir, `${file}.gz`);

    await pipe(createReadStream(inputPath), createGzip(), createWriteStream(outputPath));

    console.log(`✓ Compressed: ${file} → ${file}.gz`);
  }

  // ファイルリストをJSON形式で保存（メタデータとして使用）
  const manifest = {
    files: mdFiles.map((file) => ({
      name: file,
      slug: file.replace('.md', ''),
    })),
    compressed: true,
    timestamp: new Date().toISOString(),
  };

  await writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`✅ Compression complete! Total files: ${mdFiles.length}`);
}

compressArticles().catch((error) => {
  console.error('❌ Compression failed:', error);
  process.exit(1);
});
