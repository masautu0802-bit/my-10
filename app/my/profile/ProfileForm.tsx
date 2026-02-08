"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/shop";

export default function ProfileForm({
  initialName,
}: {
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("表示名を入力してください");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await updateProfile({ name: name.trim() });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/my");
      }
    });
  };

  return (
    <>
      {/* Form Fields */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            表示名
          </label>
          <input
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-coral text-sm font-medium text-center">{error}</p>
      )}

      {/* Save Button */}
      <div className="mt-4 pb-4">
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
              <span>変更を保存</span>
              <span className="material-symbols-outlined">auto_awesome</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
