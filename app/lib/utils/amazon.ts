/** URLからASINを抽出する（Phase 2 Creators API で使用） */
export function extractAsin(amazonUrl: string): string | null {
  // /dp/ASIN
  const dpMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1];
  // /gp/product/ASIN
  const gpMatch = amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) return gpMatch[1];
  // /gp/aw/d/ASIN (モバイル)
  const awMatch = amazonUrl.match(/\/gp\/aw\/d\/([A-Z0-9]{10})/i);
  if (awMatch) return awMatch[1];
  // /ASIN/ パターン (URLパス内)
  const pathMatch = amazonUrl.match(/\/([A-Z0-9]{10})(?:[/?#]|$)/i);
  if (pathMatch) return pathMatch[1];
  return null;
}
