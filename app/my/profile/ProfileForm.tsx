"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, uploadAvatar } from "@/app/actions/shop";
import Image from "next/image";

export default function ProfileForm({
  initialName,
  initialAvatarUrl,
  initialBio,
}: {
  initialName: string;
  initialAvatarUrl?: string | null;
  initialBio?: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("ファイルサイズは5MB以下にしてください");
      return;
    }

    setAvatarFile(file);
    setError("");

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("表示名を入力してください");
      return;
    }
    setError("");

    // First, upload avatar if changed
    let newAvatarUrl = initialAvatarUrl;
    if (avatarFile) {
      setIsUploading(true);
      const uploadResult = await uploadAvatar(avatarFile);
      setIsUploading(false);

      if (uploadResult.error) {
        setError(uploadResult.error);
        return;
      }
      newAvatarUrl = uploadResult.url;
    }

    startTransition(async () => {
      const result = await updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatar_url: newAvatarUrl,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/my");
      }
    });
  };

  return (
    <>
      {/* Avatar Upload */}
      <div className="flex flex-col gap-4 items-center mb-6">
        <div className="relative group">
          <div className="size-28 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={112}
                height={112}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-sage/20">
                <span className="material-symbols-outlined text-4xl text-sage">
                  person
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 size-10 rounded-full bg-sage text-white flex items-center justify-center shadow-lg hover:bg-sage/90 transition-all border-2 border-white"
          >
            <span className="material-symbols-outlined text-[20px]">
              photo_camera
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-text-muted text-center">
          クリックして画像を変更（最大5MB）
        </p>
      </div>

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

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-text-muted ml-2 uppercase tracking-wider">
            自己紹介
          </label>
          <textarea
            className="w-full bg-white border-2 border-sage rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-text-main focus:ring-0 transition-all placeholder:text-slate-300 text-text-main shadow-sm hover:border-text-main/50 resize-none"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="あなたについて教えてください（任意）"
            maxLength={200}
          />
          <p className="text-xs text-text-muted ml-2">
            {bio.length}/200文字
          </p>
        </div>
      </div>

      {error && (
        <p className="text-coral text-sm font-medium text-center">{error}</p>
      )}

      {/* Save Button */}
      <div className="mt-4 pb-4">
        <button
          onClick={handleSubmit}
          disabled={isPending || isUploading}
          className="w-full bg-text-main hover:bg-text-main/90 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-text-main/20 transition-all active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isPending || isUploading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
              <span>{isUploading ? "アップロード中..." : "保存中..."}</span>
            </>
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
