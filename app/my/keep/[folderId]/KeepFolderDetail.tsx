"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  removeItemFromKeepFolder,
  deleteKeepFolder,
  renameKeepFolder,
} from "@/app/actions/keep";

type FolderItem = {
  id: string;
  name: string;
  image_url: string | null;
  price_range: string | null;
  shop_name: string | null;
};

type Folder = {
  id: string;
  name: string;
  items: FolderItem[];
};

export default function KeepFolderDetail({ folder }: { folder: Folder }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleRename() {
    if (!editName.trim() || editName.trim() === folder.name) {
      setIsEditing(false);
      setEditName(folder.name);
      return;
    }
    startTransition(async () => {
      await renameKeepFolder(folder.id, editName.trim());
      setIsEditing(false);
    });
  }

  function handleRemoveItem(itemId: string) {
    startTransition(async () => {
      await removeItemFromKeepFolder(folder.id, itemId);
    });
  }

  function handleDeleteFolder() {
    startTransition(async () => {
      await deleteKeepFolder(folder.id);
      router.push("/my");
    });
  }

  return (
    <main className="flex-1 overflow-y-auto pb-24">
      {/* Folder actions */}
      <div className="px-4 py-3 flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              autoFocus
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(folder.name);
                }
              }}
            />
            <button
              onClick={handleRename}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-sage hover:bg-sage/90 transition-colors"
            >
              保存
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-main/50">
              {folder.items.length}件の商品
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                title="フォルダ名を変更"
              >
                <span className="material-symbols-outlined text-[18px] text-text-main/50">
                  edit
                </span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                title="フォルダを削除"
              >
                <span className="material-symbols-outlined text-[18px] text-coral/70">
                  delete
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Items grid */}
      {folder.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-main/60">
          <span className="material-symbols-outlined text-[48px] mb-4">
            inventory_2
          </span>
          <p className="text-sm font-medium">商品がありません</p>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3">
          {folder.items.map((item) => (
            <div
              key={item.id}
              className="relative bg-white rounded-xl overflow-hidden shadow-soft border border-text-main/5"
            >
              <Link href={`/items/${item.id}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
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
                <div className="p-3">
                  <h4 className="text-xs font-bold text-text-main truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs font-semibold text-text-main/70 mt-1">
                    {item.price_range || "価格未設定"}
                  </p>
                  {item.shop_name && (
                    <p className="text-[10px] text-text-main/40 mt-1 truncate">
                      {item.shop_name}
                    </p>
                  )}
                </div>
              </Link>
              {/* Remove from folder button */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={isPending}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                title="フォルダから削除"
              >
                <span className="material-symbols-outlined text-[16px] text-coral/70">
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 mx-8 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-text-main mb-2">
              フォルダを削除しますか？
            </h3>
            <p className="text-sm text-text-main/60 mb-5">
              「{folder.name}」を削除します。商品自体は削除されません。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-text-main/60 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteFolder}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-coral hover:bg-coral/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
