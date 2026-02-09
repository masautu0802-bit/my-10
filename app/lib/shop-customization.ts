// ショップカスタマイズのための定数定義

export interface ColorTheme {
  name: string;
  label: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  isDark?: boolean; // ダークテーマかどうか（テキスト色を白にする）
}

export interface FontOption {
  value: string;
  label: string;
  category: "gothic" | "mincho" | "english";
}

// フォントオプション（10種類）
export const FONT_OPTIONS: FontOption[] = [
  {
    value: "Noto Sans JP",
    label: "Noto Sans JP（標準ゴシック）",
    category: "gothic",
  },
  {
    value: "Zen Maru Gothic",
    label: "Zen Maru Gothic（丸ゴシック）",
    category: "gothic",
  },
  {
    value: "M PLUS Rounded 1c",
    label: "M PLUS Rounded（可愛い丸ゴシック）",
    category: "gothic",
  },
  {
    value: "Kosugi Maru",
    label: "Kosugi Maru（やわらか丸ゴシック）",
    category: "gothic",
  },
  {
    value: "Zen Kaku Gothic New",
    label: "Zen Kaku Gothic（モダン角ゴシック）",
    category: "gothic",
  },
  {
    value: "Sawarabi Gothic",
    label: "Sawarabi Gothic（スッキリゴシック）",
    category: "gothic",
  },
  {
    value: "Shippori Mincho",
    label: "Shippori Mincho（和風明朝）",
    category: "mincho",
  },
  {
    value: "Zen Old Mincho",
    label: "Zen Old Mincho（伝統的明朝）",
    category: "mincho",
  },
  {
    value: "Poppins",
    label: "Poppins（モダン英字）",
    category: "english",
  },
  {
    value: "Playfair Display",
    label: "Playfair Display（エレガント）",
    category: "english",
  },
];

// カラーテーマオプション
export const COLOR_THEMES: ColorTheme[] = [
  {
    name: "warm-pastel",
    label: "ウォームパステル",
    primary: "#FFDCDC",
    secondary: "#FFF2EB",
    tertiary: "#FFE8CD",
    quaternary: "#FFD6BA",
  },
  {
    name: "cool-mint",
    label: "クールミント",
    primary: "#D4F1F4",
    secondary: "#B6E5E5",
    tertiary: "#A8DCD9",
    quaternary: "#8BCBCE",
  },
  {
    name: "lavender-dream",
    label: "ラベンダードリーム",
    primary: "#E8D5F2",
    secondary: "#F5E6FF",
    tertiary: "#DBC4E8",
    quaternary: "#C9B0D9",
  },
  {
    name: "peach-cream",
    label: "ピーチクリーム",
    primary: "#FFE5D0",
    secondary: "#FFF0E0",
    tertiary: "#FFD8B8",
    quaternary: "#FFC8A0",
  },
  {
    name: "sage-green",
    label: "セージグリーン",
    primary: "#D8E9D0",
    secondary: "#E8F3E5",
    tertiary: "#C8DFC0",
    quaternary: "#B8D5B0",
  },
  {
    name: "rose-gold",
    label: "ローズゴールド",
    primary: "#F8D7DA",
    secondary: "#FDE8EA",
    tertiary: "#F0C8CC",
    quaternary: "#E8B8BE",
  },
  {
    name: "sky-blue",
    label: "スカイブルー",
    primary: "#D0E8F5",
    secondary: "#E0F2FB",
    tertiary: "#C0DFEF",
    quaternary: "#B0D5E8",
  },
  {
    name: "lemon-sorbet",
    label: "レモンソルベ",
    primary: "#FFF8DC",
    secondary: "#FFFAED",
    tertiary: "#FFEECC",
    quaternary: "#FFE4B8",
  },
  {
    name: "urban-night",
    label: "アーバンナイト",
    primary: "#222831",
    secondary: "#393E46",
    tertiary: "#948979",
    quaternary: "#DFD0B8",
    isDark: true,
  },
  {
    name: "ocean-breeze",
    label: "オーシャンブリーズ",
    primary: "#F2EFE7",
    secondary: "#9ACBD0",
    tertiary: "#48A6A7",
    quaternary: "#006A71",
  },
  {
    name: "soft-romance",
    label: "ソフトロマンス",
    primary: "#9ECAD6",
    secondary: "#748DAE",
    tertiary: "#F5CBCB",
    quaternary: "#FFEAEA",
  },
  {
    name: "dreamy-purple",
    label: "ドリーミーパープル",
    primary: "#FFF2E0",
    secondary: "#C0C9EE",
    tertiary: "#A2AADB",
    quaternary: "#898AC4",
  },
  {
    name: "natural-earth",
    label: "ナチュラルアース",
    primary: "#F9F8F6",
    secondary: "#EFE9E3",
    tertiary: "#D9CFC7",
    quaternary: "#C9B59C",
  },
  {
    name: "nautical-gold",
    label: "ノーティカルゴールド",
    primary: "#F5EEDC",
    secondary: "#27548A",
    tertiary: "#183B4E",
    quaternary: "#DDA853",
  },
  {
    name: "fresh-garden",
    label: "フレッシュガーデン",
    primary: "#FFA725",
    secondary: "#FFF5E4",
    tertiary: "#C1D8C3",
    quaternary: "#6A9C89",
  },
  {
    name: "bold-contrast",
    label: "ボールドコントラスト",
    primary: "#FE7743",
    secondary: "#EFEEEA",
    tertiary: "#273F4F",
    quaternary: "#000000",
  },
  {
    name: "vintage-navy",
    label: "ヴィンテージネイビー",
    primary: "#F8F0E5",
    secondary: "#EADBC8",
    tertiary: "#DAC0A3",
    quaternary: "#0F2C59",
  },
];

// デフォルトテーマ
export const DEFAULT_COLOR_THEME = COLOR_THEMES[0];
export const DEFAULT_FONT = FONT_OPTIONS[0].value;

// ヘルパー関数：HEX色から明度を計算（0-255）
export function getLuminance(hexColor: string): number {
  // #を除去
  const hex = hexColor.replace("#", "");

  // RGB値を取得
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 相対輝度を計算（YIQ formula）
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// ヘルパー関数：背景色に対して適切なテキスト色を返す
export function getContrastTextColor(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  // 128を閾値として、明るい背景には暗い文字、暗い背景には明るい文字
  return luminance > 128 ? "#2C3E50" : "#FFFFFF";
}

// ヘルパー関数：テーマを名前で取得
export function getThemeByName(name: string): ColorTheme | undefined {
  return COLOR_THEMES.find((theme) => theme.name === name);
}

// ヘルパー関数：フォントを値で取得
export function getFontByValue(value: string): FontOption | undefined {
  return FONT_OPTIONS.find((font) => font.value === value);
}

// ヘルパー関数：色テーマオブジェクトを取得（DBから取得したJSONデータ用）
export function parseColorTheme(
  colorThemeData: unknown
): ColorTheme | undefined {
  if (!colorThemeData || typeof colorThemeData !== "object") {
    return DEFAULT_COLOR_THEME;
  }

  const data = colorThemeData as Record<string, unknown>;

  if (
    typeof data.primary === "string" &&
    typeof data.secondary === "string" &&
    typeof data.tertiary === "string" &&
    typeof data.quaternary === "string"
  ) {
    const primary = data.primary as string;
    const secondary = data.secondary as string;
    const tertiary = data.tertiary as string;
    const quaternary = data.quaternary as string;

    // 既存のテーマから一致するものを探す
    const matchingTheme = COLOR_THEMES.find(
      (theme) =>
        theme.primary.toLowerCase() === primary.toLowerCase() &&
        theme.secondary.toLowerCase() === secondary.toLowerCase() &&
        theme.tertiary.toLowerCase() === tertiary.toLowerCase() &&
        theme.quaternary.toLowerCase() === quaternary.toLowerCase()
    );

    if (matchingTheme) {
      return matchingTheme;
    }

    return {
      name: "custom",
      label: "カスタム",
      primary,
      secondary,
      tertiary,
      quaternary,
      isDark: typeof data.isDark === "boolean" ? data.isDark : false,
    };
  }

  return DEFAULT_COLOR_THEME;
}
