import pako from 'pako';

/**
 * gzipで圧縮されたデータを解凍
 * @param compressedData gzip圧縮されたバイナリデータ
 * @returns 解凍された文字列
 */
export const decompressGzip = (compressedData: ArrayBuffer): string => {
  try {
    const decompressed = pako.inflate(new Uint8Array(compressedData));
    return new TextDecoder('utf-8').decode(decompressed);
  } catch (error) {
    console.error('Failed to decompress gzip data:', error);
    throw new Error('gzip解凍に失敗しました');
  }
};

/**
 * URLからgzip圧縮されたファイルを取得して解凍
 * @param url gzip圧縮されたファイルのURL
 * @returns 解凍された文字列
 */
export const fetchAndDecompressGzip = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return decompressGzip(arrayBuffer);
};
