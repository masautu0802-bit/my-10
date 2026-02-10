"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateShop } from "@/app/actions/shop";
import type { Tables } from "@/app/lib/database.types";

export default function ShopEditForm({ shop }: { shop: Tables<"shops"> }) {
  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description || "");
  const [tags, setTags] = useState<string[]>(shop.tags || []);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("ショップ名を入力してください");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await updateShop(shop.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/cms/shops/${shop.id}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
        <p className="text-coral text-sm font-medium text-center">{error}</p>
      )}

      <div className="mt-2 pb-4">
        <button
          type="submit"
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
                save
              </span>
              <span>保存する</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
