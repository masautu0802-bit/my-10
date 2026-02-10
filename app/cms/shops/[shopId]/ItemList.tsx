"use client";

import { useState } from "react";
import Link from "next/link";
import { reorderItems, deleteItem } from "@/app/actions/item";

type Item = {
  id: string;
  name: string;
  image_url: string | null;
  price_range: string | null;
  order_index: number;
};

export default function ItemList({
  initialItems,
  shopId,
}: {
  initialItems: Item[];
  shopId: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    setIsReordering(true);

    // 新しい順序でorder_indexを更新
    const itemIds = items.map((item) => item.id);
    await reorderItems(shopId, itemIds);

    setDraggedIndex(null);
    setIsReordering(false);
  };

  const handleDeleteClick = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm(itemId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const result = await deleteItem(deleteConfirm);

    if (!result.error) {
      setItems((prev) => prev.filter((item) => item.id !== deleteConfirm));
    }

    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <section className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDragEnd={handleDragEnd}
          className={`group flex items-center gap-4 bg-surface p-3 pr-4 rounded-2xl border shadow-sm hover:shadow-soft transition-all cursor-move ${
            i === 0
              ? "border-sage/30 shadow-soft scale-[1.01] z-10 relative"
              : "border-transparent"
          } ${draggedIndex === i ? "opacity-50" : ""}`}
        >
          <div className="aspect-square rounded-xl size-16 shrink-0 bg-gray-100 border border-gray-100 overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  i === 0
                    ? "bg-sage/20 text-text-main"
                    : "bg-gray-100 text-text-main"
                }`}
              >
                #{i + 1}
              </span>
              {i === 0 && (
                <span className="text-[9px] font-bold text-sage">目玉商品</span>
              )}
            </div>
            <p className="text-text-main text-base font-bold truncate">
              {item.name}
            </p>
            <p className="text-text-main text-sm font-semibold">
              {item.price_range || "価格未設定"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/cms/shops/${shopId}/items/${item.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 p-2 text-gray-300 hover:text-sage transition-colors rounded-lg hover:bg-sage/10"
              title="編集"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </Link>
            <button
              onClick={(e) => handleDeleteClick(item.id, e)}
              className="shrink-0 p-2 text-gray-300 hover:text-coral transition-colors rounded-lg hover:bg-coral/10"
              title="削除"
            >
              <span className="material-symbols-outlined text-[20px]">
                delete
              </span>
            </button>
            <div
              className={`shrink-0 p-2 transition-colors ${
                i === 0
                  ? "bg-sage/20 text-text-main rounded-lg"
                  : "text-gray-300 group-hover:text-sage"
              }`}
            >
              <span className="material-symbols-outlined cursor-move">
                drag_indicator
              </span>
            </div>
          </div>
        </div>
      ))}

      {items.length < 10 && (
        <Link
          href={`/cms/shops/${shopId}/items/new`}
          className="flex items-center justify-center gap-3 bg-surface/50 border-2 border-dashed border-border-light p-4 rounded-2xl h-24 group hover:border-sage transition-all"
        >
          <div className="flex items-center justify-center size-10 rounded-full bg-white text-text-main group-hover:bg-sage group-hover:text-white transition-all transform group-hover:scale-105 shadow-sm">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <span className="text-sm font-bold text-text-main group-hover:text-sage transition-colors">
            枠 #{items.length + 1} を埋める
          </span>
        </Link>
      )}
      <div className="h-8" />

      {isReordering && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-sage text-2xl">
              progress_activity
            </span>
            <span className="text-text-main font-bold">順番を更新中...</span>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-coral/10 rounded-full">
                <span className="material-symbols-outlined text-coral text-2xl">
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">
                  商品を削除
                </h3>
                <p className="text-sm text-text-main/70">
                  この操作は取り消せません
                </p>
              </div>
            </div>
            <p className="text-sm text-text-main mb-6">
              この商品を削除してもよろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-text-main font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-coral text-white font-bold hover:bg-coral/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    削除中...
                  </>
                ) : (
                  "削除"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
