"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FONT_OPTIONS,
  parseColorTheme,
  type ColorTheme,
} from "@/app/lib/shop-customization";
import type { Tables } from "@/app/lib/database.types";

interface ShopSettingsFormProps {
  shop: Tables<"shops">;
  colorThemes: Tables<"color_themes">[];
}

function convertDbThemeToColorTheme(
  dbTheme: Tables<"color_themes">
): ColorTheme {
  return {
    name: dbTheme.name,
    label: dbTheme.label,
    primary: dbTheme.primary_color,
    secondary: dbTheme.secondary_color,
    tertiary: dbTheme.tertiary_color,
    quaternary: dbTheme.quaternary_color,
    isDark: dbTheme.is_dark || false,
  };
}

export default function ShopSettingsForm({
  shop,
  colorThemes: dbColorThemes,
}: ShopSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const colorThemes = dbColorThemes.map(convertDbThemeToColorTheme);
  const currentColorTheme = parseColorTheme(shop.color_theme);
  const currentFont = shop.font_family || "Noto Sans JP";

  const [selectedFont, setSelectedFont] = useState(currentFont);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(
    currentColorTheme ||
      colorThemes.find(
        (t) =>
          t.primary === currentColorTheme?.primary &&
          t.secondary === currentColorTheme?.secondary
      ) ||
      colorThemes[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const response = await fetch(`/api/shops/${shop.id}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          font_family: selectedFont,
          color_theme: {
            primary: selectedTheme.primary,
            secondary: selectedTheme.secondary,
            tertiary: selectedTheme.tertiary,
            quaternary: selectedTheme.quaternary,
            isDark: selectedTheme.isDark || false,
          },
        }),
      });

      if (response.ok) {
        router.refresh();
        router.push(`/shops/${shop.id}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* フォント選択 */}
      <section className="bg-surface rounded-2xl p-6 border border-border-light shadow-sm">
        <h2 className="text-text-main text-lg font-bold mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-sage">
            font_download
          </span>
          フォント選択
        </h2>
        <p className="text-text-main/70 text-sm mb-4">
          ショップ名の表示フォントを選択できます
        </p>

        <div className="grid grid-cols-1 gap-3">
          {FONT_OPTIONS.map((font) => (
            <label
              key={font.value}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedFont === font.value
                  ? "border-sage bg-sage/10"
                  : "border-border-light bg-white hover:border-sage/30"
              }`}
            >
              <input
                type="radio"
                name="font"
                value={font.value}
                checked={selectedFont === font.value}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="sr-only"
              />
              <div className="flex-1">
                <div
                  className="text-text-main font-medium mb-1"
                  style={{ fontFamily: font.value }}
                >
                  サンプルテキスト Sample Text
                </div>
                <div className="text-text-main/60 text-xs">{font.label}</div>
              </div>
              {selectedFont === font.value && (
                <span className="material-symbols-outlined text-sage text-2xl">
                  check_circle
                </span>
              )}
            </label>
          ))}
        </div>
      </section>

      {/* カラーテーマ選択 */}
      <section className="bg-surface rounded-2xl p-6 border border-border-light shadow-sm">
        <h2 className="text-text-main text-lg font-bold mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-sage">palette</span>
          カラーテーマ
        </h2>
        <p className="text-text-main/70 text-sm mb-4">
          ショップのカラーテーマを選択できます（{colorThemes.length}種類）
        </p>

        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
          {colorThemes.map((theme) => (
            <label
              key={theme.name}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTheme.name === theme.name
                  ? "border-sage bg-sage/10"
                  : "border-border-light bg-white hover:border-sage/30"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={theme.name}
                checked={selectedTheme.name === theme.name}
                onChange={() => setSelectedTheme(theme)}
                className="sr-only"
              />
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
                <div
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.secondary }}
                />
                <div
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.tertiary }}
                />
                <div
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.quaternary }}
                />
              </div>
              <div className="flex-1">
                <div className="text-text-main font-medium">{theme.label}</div>
              </div>
              {selectedTheme.name === theme.name && (
                <span className="material-symbols-outlined text-sage text-2xl">
                  check_circle
                </span>
              )}
            </label>
          ))}
        </div>
      </section>

      {/* 保存ボタン */}
      <div className="sticky bottom-20 z-10">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 rounded-2xl bg-sage text-white font-bold text-lg shadow-lg hover:bg-sage-dark active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
              保存中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">save</span>
              設定を保存
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
