"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { createKeepFolder, addItemToKeepFolder } from "@/app/actions/keep";

type KeepFolder = {
  id: string;
  name: string;
  item_count: number;
};

export default function KeepModal({
  itemId,
  folders,
  onClose,
}: {
  itemId: string;
  folders: KeepFolder[];
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"select" | "create">("select");
  const [newFolderName, setNewFolderName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleAddToFolder(folderId: string) {
    startTransition(async () => {
      const result = await addItemToKeepFolder(folderId, itemId);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("フォルダに追加しました");
        setTimeout(onClose, 800);
      }
    });
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    startTransition(async () => {
      const result = await createKeepFolder(newFolderName.trim(), itemId);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("フォルダを作成しました");
        setTimeout(onClose, 800);
      }
    });
  }

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-[9999]"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-sm font-bold text-text-main">
            {mode === "select" ? "キープフォルダに追加" : "新しいフォルダを作成"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-gray-400">
              close
            </span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg bg-sage/10 text-sage text-xs font-medium text-center">
            {message}
          </div>
        )}

        {mode === "select" ? (
          <div className="px-5 pb-5">
            {/* New folder button */}
            <button
              onClick={() => setMode("create")}
              disabled={isPending}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-sage/30 hover:border-sage/60 hover:bg-sage/5 transition-all"
            >
              <span className="material-symbols-outlined text-sage text-[20px]">
                create_new_folder
              </span>
              <span className="text-sm font-semibold text-text-main">
                新しいフォルダを作成
              </span>
            </button>

            {/* Folder list */}
            {folders.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleAddToFolder(folder.id)}
                    disabled={isPending}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-text-main/50 text-[20px]">
                      folder
                    </span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">
                        {folder.name}
                      </p>
                      <p className="text-[11px] text-text-main/40">
                        {folder.item_count}件
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-sage text-[18px]">
                      add_circle
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 pb-5 space-y-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="フォルダ名を入力"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              autoFocus
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("select");
                  setNewFolderName("");
                }}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-text-main/60 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={isPending || !newFolderName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-sage hover:bg-sage/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "作成中..." : "作成"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
