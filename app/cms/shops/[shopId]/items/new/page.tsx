"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createItem, fetchAmazonProductImage } from "@/app/actions/item";

export default function NewItemPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const [shopId, setShopId] = useState<string>("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [name, setName] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [autoFetchedTitle, setAutoFetchedTitle] = useState<string>("");
  const [autoFetchedPrice, setAutoFetchedPrice] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // paramsを解決
  useState(() => {
    params.then((p) => setShopId(p.shopId));
  });

  const handleFetchPreview = async () => {
    if (!amazonUrl.trim()) {
      setError("Amazon URLを入力してください");
      return;
    }

    setIsLoadingPreview(true);
    setError("");
    setFetchError("");

    try {
      const result = await fetchAmazonProductImage(amazonUrl.trim());

      if ("error" in result) {
        setFetchError(result.error);
        setPreviewImage("");
        setAutoFetchedTitle("");
        setAutoFetchedPrice("");
      } else {
        setPreviewImage(result.imageUrl);
        setAutoFetchedTitle(result.title);
        setAutoFetchedPrice(result.price || "");
        if (!name.trim()) {
          setName(result.title);
        }
        if (!priceRange.trim() && result.price) {
          setPriceRange(result.price);
        }
        setFetchError("");
        setManualMode(false);
      }
    } catch {
      setFetchError("画像の取得に失敗しました");
      setPreviewImage("");
      setAutoFetchedTitle("");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleManualMode = () => {
    setManualMode(true);
    setFetchError("");
    setError("");
  };

  const handleSubmit = () => {
    if (!amazonUrl.trim()) {
      setError("Amazon URLを入力してください");
      return;
    }

    if (manualMode && !name.trim()) {
      setError("手動入力モードでは商品名は必須です");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await createItem({
        shopId,
        amazonUrl: amazonUrl.trim(),
        name: name.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
        comment: comment.trim() || undefined,
        imageUrl: manualMode ? imageUrl.trim() || undefined : undefined,
        manualMode,
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
        <Link
          href={`/cms/shops/${shopId}`}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:scale-105 transition-transform text-text-main border border-sage/50"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back_ios_new
          </span>
        </Link>
        <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main">
          アイテム登録
        </h1>
        <Link
          href={`/cms/shops/${shopId}`}
          className="text-text-muted font-bold text-sm px-2 hover:text-text-main transition-colors"
        >
          キャンセル
        </Link>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-32 overflow-y-auto">
        {/* Amazon URL */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            Amazon URL <span className="text-coral">*</span>
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
              type="url"
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
              placeholder="https://www.amazon.co.jp/..."
            />
            <button
              type="button"
              onClick={handleFetchPreview}
              disabled={isLoadingPreview || !amazonUrl.trim()}
              className="px-5 py-4 bg-sage text-white font-bold rounded-2xl hover:bg-sage/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
            >
              {isLoadingPreview ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              ) : (
                "取得"
              )}
            </button>
          </div>
          <p className="text-xs text-text-muted ml-2">
            Amazon商品ページのURLを入力して「取得」をクリックすると、画像とタイトルが自動取得されます
          </p>
        </div>

        {/* 取得失敗時の選択肢 */}
        {fetchError && !manualMode && (
          <div className="bg-coral/10 border border-coral/30 rounded-2xl p-4 space-y-3">
            <p className="text-coral text-sm font-medium text-center">
              {fetchError}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleManualMode}
                className="flex-1 bg-sage text-white font-bold text-sm py-3 rounded-xl hover:bg-sage/90 transition-all"
              >
                手動で入力して登録
              </button>
              <Link
                href={`/cms/shops/${shopId}`}
                className="flex-1 bg-white text-text-muted font-bold text-sm py-3 rounded-xl border border-sage/30 hover:bg-gray-50 transition-all text-center"
              >
                キャンセル
              </Link>
            </div>
          </div>
        )}

        {/* 手動入力モード表示 */}
        {manualMode && (
          <div className="bg-sage/10 border border-sage/30 rounded-2xl p-4">
            <p className="text-sage text-sm font-medium text-center">
              手動入力モード: 商品情報を直接入力してください
            </p>
          </div>
        )}

        {/* プレビュー画像 */}
        {previewImage && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
              プレビュー
            </label>
            <div className="bg-white border-2 border-sage/30 rounded-2xl p-4 shadow-sm">
              <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={previewImage}
                  alt="商品画像プレビュー"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 space-y-1">
                {autoFetchedTitle && (
                  <p className="text-sm text-text-main font-medium text-center">
                    {autoFetchedTitle}
                  </p>
                )}
                {autoFetchedPrice && (
                  <p className="text-lg text-text-main font-bold text-center">
                    {autoFetchedPrice}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 画像URL（手動モード時のみ） */}
        {manualMode && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
              画像URL
            </label>
            <input
              className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="画像URLを入力（任意）"
            />
          </div>
        )}

        {/* 商品名 */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            商品名 {manualMode && <span className="text-coral">*</span>}
          </label>
          <input
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={manualMode ? "商品名を入力してください" : "自動取得されたタイトルを使用（空欄可）"}
          />
        </div>

        {/* 価格帯 */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            価格帯
          </label>
          <input
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="例: ¥3,000 - ¥5,000"
          />
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
            disabled={isPending || !amazonUrl.trim() || (!manualMode && !previewImage && !fetchError)}
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
