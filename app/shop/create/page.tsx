"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createShop } from "@/app/actions/shop";
import BottomNav from "@/app/components/BottomNav";

const themeOptions = [
  { value: "natural", label: "Natural", color: "bg-[#a2b29f]" },
  { value: "warm", label: "Warm", color: "bg-[#c4956a]" },
  { value: "cool", label: "Cool", color: "bg-[#7a9bb5]" },
  { value: "pop", label: "Pop", color: "bg-[#e07b8f]" },
] as const;

export default function ShopCreatePage() {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<string>("natural");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
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

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("ショップ名を入力してください");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await createShop({
        name: name.trim(),
        theme,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
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
        <Link
          href="/shop"
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:scale-105 transition-transform text-text-main border border-sage/50"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back_ios_new
          </span>
        </Link>
        <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main">
          新規出店
        </h1>
        <Link
          href="/shop"
          className="text-text-muted font-bold text-sm px-2 hover:text-text-main transition-colors"
        >
          キャンセル
        </Link>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-32 overflow-y-auto">
        {/* Shop name */}
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

        {/* Theme selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            テーマ <span className="text-coral">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  theme === opt.value
                    ? "border-text-main bg-white shadow-sm"
                    : "border-transparent bg-white/50 hover:bg-white"
                }`}
              >
                <div className={`size-6 rounded-full ${opt.color}`} />
                <span className="text-sm font-bold text-text-main">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
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

        {/* Tags */}
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
          <p className="text-coral text-sm font-medium text-center">{error}</p>
        )}

        {/* Submit */}
        <div className="mt-2 pb-4">
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
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
