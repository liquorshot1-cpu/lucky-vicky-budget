"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
  existingUrl?: string | null;
  /** 업로드할 Storage 버킷 (기본: 상품 사진) */
  bucket?: string;
  /** form에 담길 hidden input 이름 (기본: image_url) */
  fieldName?: string;
  /** 위에 보일 라벨 */
  label?: string;
  /** 미리보기 모양 */
  shape?: "rect" | "circle";
}

export default function ImageUpload({
  existingUrl,
  bucket = "product-images",
  fieldName = "image_url",
  label = "상품 사진",
  shape = "rect",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(existingUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCircle = shape === "circle";

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
        .from(bucket)
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

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

  // ── 동그란 프로필 사진 모양 ──
  if (isCircle) {
    return (
      <div>
        <p className="block text-sm font-medium text-soil-soft mb-2">{label}</p>

        <input type="hidden" name={fieldName} value={uploadedUrl} />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-bark-soft bg-leaf-soft flex items-center justify-center hover:border-cucumber transition-colors shrink-0"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="프로필 미리보기" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🧑‍🌾</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-cream/70 flex items-center justify-center">
                <span className="text-xl animate-pulse">📷</span>
              </div>
            )}
          </button>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-cucumber hover:bg-cucumber-dark text-white text-sm font-bold px-3 py-1.5 transition-colors"
            >
              {preview ? "사진 바꾸기" : "사진 올리기"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-soil-soft hover:text-soil"
              >
                사진 빼기
              </button>
            )}
            <span className="text-xs text-soil-soft/60">JPG · PNG · WEBP</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
      </div>
    );
  }

  // ── 기본(네모) 상품 사진 모양 ──
  return (
    <div>
      <p className="block text-sm font-medium text-soil-soft mb-1">{label}</p>

      <input type="hidden" name={fieldName} value={uploadedUrl} />

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
