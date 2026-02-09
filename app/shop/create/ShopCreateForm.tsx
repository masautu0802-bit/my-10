"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createShop } from "@/app/actions/shop";
import BottomNav from "@/app/components/BottomNav";
import { FONT_OPTIONS, DEFAULT_FONT } from "@/app/lib/shop-customization";
import type { Tables } from "@/app/lib/database.types";

interface ColorTheme {
  name: string;
  label: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  isDark?: boolean;
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

export default function ShopCreateForm({
  colorThemes: dbColorThemes,
}: {
  colorThemes: Tables<"color_themes">[];
}) {
  const colorThemes = dbColorThemes.map(convertDbThemeToColorTheme);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedFont, setSelectedFont] = useState(DEFAULT_FONT);
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    if (tags.length >= 3) {
      setError("タグは最大3つまでです");
      return;
    }

    if (tags.includes(trimmedTag)) {
      setError("同じタグは追加できません");
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput("");
    setError("");
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setError("ショップ名を入力してください");
        return;
      }
      setError("");
      setStep(2);
    }
  };

  const handleSkipCustomization = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const result = await createShop({
        name: name.trim(),
        theme: "default",
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        font_family: selectedFont,
        color_theme: {
          primary: selectedTheme.primary,
          secondary: selectedTheme.secondary,
          tertiary: selectedTheme.tertiary,
          quaternary: selectedTheme.quaternary,
          isDark: selectedTheme.isDark || false,
        },
      });
      if (result.error) {
        setError(result.error);
      } else if (result.shopId) {
        router.push(`/cms/shops/${result.shopId}`);
      }
    });
  };

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      <header className="flex items-center justify-between px-6 py-5 bg-bgwarm sticky top-0 z-20">
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else router.push("/shop");
          }}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:scale-105 transition-transform text-text-main border border-sage/50"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back_ios_new
          </span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main">
            新規出店
          </h1>
          <div className="flex gap-1 mt-1">
            <div
              className={`h-1 w-6 rounded-full transition-all ${
                step === 1 ? "bg-sage" : "bg-sage/30"
              }`}
            />
            <div
              className={`h-1 w-6 rounded-full transition-all ${
                step === 2 ? "bg-sage" : "bg-sage/30"
              }`}
            />
          </div>
        </div>
        <Link
          href="/shop"
          className="text-text-muted font-bold text-sm px-2 hover:text-text-main transition-colors"
        >
          キャンセル
        </Link>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-32 overflow-y-auto">
        {step === 1 && (
          <>
            <div className="mt-2">
              <h2 className="text-2xl font-bold text-text-main mb-2">
                基本情報を入力
              </h2>
              <p className="text-sm text-text-muted">
                ショップの基本情報を設定しましょう
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
                ショップ名 <span className="text-coral">*</span>
              </label>
              <input
                className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: My Little Shop"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
                説明文
              </label>
              <textarea
                className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50 resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ショップの紹介文を入力（任意）"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
                タグ（最大3つ）
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white border-2 border-sage rounded-2xl px-5 py-3 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="例: ファッション"
                  disabled={tags.length >= 3}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={tags.length >= 3 || !tagInput.trim()}
                  className="px-5 py-3 bg-sage text-white font-bold rounded-2xl hover:bg-sage/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  追加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 text-text-main border border-sage/30 text-sm font-medium"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-text-muted hover:text-coral transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-coral text-sm font-medium text-center">
                {error}
              </p>
            )}

            <div className="mt-2 pb-4">
              <button
                onClick={handleNextStep}
                className="w-full bg-text-main hover:bg-text-main/90 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-text-main/20 transition-all active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2"
              >
                <span>次へ</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mt-2">
              <h2 className="text-2xl font-bold text-text-main mb-2">
                カスタマイズ
              </h2>
              <p className="text-sm text-text-muted">
                ショップの見た目をカスタマイズ（後から変更可能）
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
                フォント
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {FONT_OPTIONS.slice(0, 6).map((font) => (
                  <label
                    key={font.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
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
                        className="text-text-main font-medium text-sm"
                        style={{ fontFamily: font.value }}
                      >
                        サンプル Sample
                      </div>
                    </div>
                    {selectedFont === font.value && (
                      <span className="material-symbols-outlined text-sage text-xl">
                        check_circle
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
                カラーテーマ ({colorThemes.length}種類)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
                {colorThemes.map((theme) => (
                  <label
                    key={theme.name}
                    className={`flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
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
                    <div className="flex gap-1.5">
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: theme.secondary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: theme.tertiary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: theme.quaternary }}
                      />
                    </div>
                    <div className="text-xs font-medium text-text-main">
                      {theme.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-coral text-sm font-medium text-center">
                {error}
              </p>
            )}

            <div className="mt-2 pb-4 flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full bg-text-main hover:bg-text-main/90 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-text-main/20 transition-all active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      storefront
                    </span>
                    <span>ショップを作成</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSkipCustomization}
                disabled={isPending}
                className="w-full bg-white hover:bg-gray-50 text-text-main font-bold text-base py-3 rounded-2xl border-2 border-border-light transition-all active:scale-[0.98] disabled:opacity-60"
              >
                スキップして作成
              </button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
