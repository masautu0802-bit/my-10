// Google Fontsの動的読み込み用ヘルパー

export function getFontUrl(fontFamily: string): string {
  // フォント名をGoogle Fonts URLに変換
  const fontName = fontFamily.replace(/\s+/g, "+");

  // 日本語フォントの場合はサブセットを指定
  const japaneseSubset = "&subset=japanese";
  const weights = ":wght@400;500;600;700;800;900";

  const japaneseFonts = [
    "Noto Sans JP",
    "Zen Maru Gothic",
    "M PLUS Rounded 1c",
    "Kosugi Maru",
    "Zen Kaku Gothic New",
    "Sawarabi Gothic",
    "Shippori Mincho",
    "Zen Old Mincho",
  ];

  const isJapanese = japaneseFonts.some((font) =>
    fontFamily.includes(font.replace(/\s+/g, " "))
  );

  if (isJapanese) {
    return `https://fonts.googleapis.com/css2?family=${fontName}${weights}&display=swap${japaneseSubset}`;
  }

  // 英語フォント
  return `https://fonts.googleapis.com/css2?family=${fontName}${weights}&display=swap`;
}
