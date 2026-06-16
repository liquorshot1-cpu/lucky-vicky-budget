"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
  existingUrl?: string | null;
}

export default function ImageUpload({ existingUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(existingUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploadError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요해요.");

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);

      setUploadedUrl(publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드에 실패했어요.");
      setPreview(existingUrl ?? null);
      setUploadedUrl(existingUrl ?? "");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setUploadedUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <p className="block text-sm font-medium text-soil-soft mb-1">
        상품 사진
      </p>

      <input type="hidden" name="image_url" value={uploadedUrl} />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-bark-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="상품 미리보기"
            className="w-full h-52 object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-cream/70 flex flex-col items-center justify-center gap-2">
              <span className="text-2xl animate-pulse">📷</span>
              <p className="text-sm font-bold text-soil">업로드 중...</p>
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-soil/70 text-white rounded-full px-3 py-1 text-xs font-bold hover:bg-soil transition-colors"
              >
                바꾸기
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-soil/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-soil transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-bark-soft bg-cream/40 flex flex-col items-center justify-center gap-1.5 text-soil-soft hover:border-cucumber hover:text-cucumber-dark transition-colors"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium">사진 추가하기</span>
          <span className="text-xs opacity-60">JPG · PNG · WEBP (최대 5 MB)</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError && (
        <p className="mt-2 text-xs text-red-500">{uploadError}</p>
      )}
      {!preview && (
        <p className="mt-1 text-xs text-soil-soft/60">
          사진 없이도 등록할 수 있어요.
        </p>
      )}
    </div>
  );
}
