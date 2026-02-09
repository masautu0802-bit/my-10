"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createItem, uploadItemImage } from "@/app/actions/item";
import BackButton from "@/app/components/BackButton";

export default function NewItemPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const [shopId, setShopId] = useState<string>("");
  const [name, setName] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [ecUrl, setEcUrl] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // paramsを解決
  useState(() => {
    params.then((p) => setShopId(p.shopId));
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ローカルプレビュー表示
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // アップロード
    setIsUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadItemImage(formData);
      if (result.error) {
        setError(result.error);
        setImagePreview("");
        setImageUrl("");
      } else if (result.url) {
        setImageUrl(result.url);
      }
    } catch {
      setError("画像のアップロードに失敗しました");
      setImagePreview("");
      setImageUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("商品名を入力してください");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await createItem({
        shopId,
        name: name.trim(),
        ecUrl: ecUrl.trim() || undefined,
        imageUrl: imageUrl || undefined,
        priceRange: priceRange.trim() || undefined,
        comment: comment.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.itemId) {
        router.push(`/cms/shops/${shopId}`);
      }
    });
  };

  if (!shopId) {
    return (
      <div className="bg-bgwarm min-h-screen flex items-center justify-center">
        <p className="text-text-main">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      <header className="flex items-center justify-between px-6 py-5 bg-bgwarm sticky top-0 z-20">
        <BackButton />
        <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main">
          アイテム登録
        </h1>
        <button
          onClick={() => router.back()}
          className="text-text-muted font-bold text-sm px-2 hover:text-text-main transition-colors"
        >
          キャンセル
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-32 overflow-y-auto">
        {/* 画像アップロード */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            商品画像
          </label>
          {imagePreview ? (
            <div className="relative bg-white border-2 border-sage/30 rounded-2xl p-4 shadow-sm">
              <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={imagePreview}
                  alt="商品画像プレビュー"
                  className="w-full h-full object-cover"
                />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
                  <div className="flex items-center gap-2 text-text-main">
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                    <span className="font-semibold text-sm">アップロード中...</span>
                  </div>
                </div>
              )}
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white shadow-md text-text-muted hover:text-coral transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border-2 border-dashed border-sage rounded-2xl px-5 py-10 flex flex-col items-center gap-3 hover:border-text-main/50 transition-all text-text-muted"
            >
              <span className="material-symbols-outlined text-[36px]">
                add_photo_alternate
              </span>
              <span className="text-sm font-semibold">
                タップして画像を選択
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* 商品名 */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            商品名 <span className="text-coral">*</span>
          </label>
          <input
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="商品名を入力してください"
          />
        </div>

        {/* 価格帯 */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            価格
          </label>
          <input
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="例: ¥3,000"
          />
        </div>

        {/* 購入リンク */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            購入リンク
          </label>
          <input
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
            type="url"
            value={ecUrl}
            onChange={(e) => setEcUrl(e.target.value)}
            placeholder="https://www.amazon.co.jp/..."
          />
          <p className="text-xs text-text-muted ml-2">
            Amazon等の購入ページURL（任意）
          </p>
        </div>

        {/* コメント */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            コメント
          </label>
          <textarea
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50 resize-none"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="この商品についてのコメント（任意）"
          />
        </div>

        {error && (
          <div className="bg-coral/10 border border-coral/30 rounded-2xl p-4">
            <p className="text-coral text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-2 pb-4">
          <button
            onClick={handleSubmit}
            disabled={isPending || isUploading || !name.trim()}
            className="w-full bg-text-main hover:bg-text-main/90 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-text-main/20 transition-all active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  add_shopping_cart
                </span>
                <span>アイテムを登録</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
