"use client";

import { useState, useTransition } from "react";
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl p-5 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text-main">
            {mode === "select" ? "キープフォルダに追加" : "新しいフォルダを作成"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-400">
              close
            </span>
          </button>
        </div>

        {message && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-sage/10 text-sage text-sm font-medium text-center">
            {message}
          </div>
        )}

        {mode === "select" ? (
          <div className="space-y-2">
            {/* Create new folder option */}
            <button
              onClick={() => setMode("create")}
              disabled={isPending}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-sage/30 hover:border-sage/60 hover:bg-sage/5 transition-all"
            >
              <span className="material-symbols-outlined text-sage text-[22px]">
                create_new_folder
              </span>
              <span className="text-sm font-semibold text-text-main">
                新しいフォルダを作成
              </span>
            </button>

            {/* Existing folders */}
            {folders.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleAddToFolder(folder.id)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-text-main/60 text-[22px]">
                      folder
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-text-main">
                        {folder.name}
                      </p>
                      <p className="text-xs text-text-main/50">
                        {folder.item_count}件
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">
                      add
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="フォルダ名を入力"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              autoFocus
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setMode("select")}
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
                {isPending ? "作成中..." : "作成して追加"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
