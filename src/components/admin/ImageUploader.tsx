"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type UploadCategory =
  | "news"
  | "partners"
  | "programs"
  | "focus-areas"
  | "site"
  | "logos"
  | "managers";

interface ImageUploaderProps {
  category: UploadCategory;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  labelAr?: string;
  labelEn?: string;
  className?: string;
}

export function ImageUploader({
  category,
  currentUrl,
  onUpload,
  onRemove,
  label = "رفع صورة",
  labelAr,
  labelEn,
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل رفع الصورة");
      }

      setPreview(data.url);
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!preview) return;

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: preview }),
      });
    } catch {
      // Continue with UI update even if delete fails
    }

    setPreview(null);
    onRemove?.();
  }

  const displayLabelAr = labelAr ?? label;
  const displayLabelEn = labelEn ?? label;

  return (
    <div className={`space-y-3 ${className}`}>
      {(labelAr || label) && (
        <label className="block text-sm font-normal text-brand-black/70">
          <span className="content-ar">{displayLabelAr}</span>
          <span className="content-en">{displayLabelEn}</span>
        </label>
      )}

      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-brand-grey-2">
            <Image
              src={preview}
              alt="معاينة"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-brand-purple hover:underline disabled:opacity-50"
            >
              تغيير
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="text-sm text-brand-orange hover:underline disabled:opacity-50"
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-brand-grey-2 rounded-lg hover:border-brand-purple transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-brand-purple">جاري الرفع...</span>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-brand-grey-2 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-brand-black/50">
                <span className="content-ar">{displayLabelAr}</span>
                <span className="content-en">{displayLabelEn}</span>
              </span>
              <span className="text-xs text-brand-black/30 mt-1">
                <span className="content-ar">JPEG, PNG, WebP — حتى 5MB</span>
                <span className="content-en">JPEG, PNG, WebP — up to 5MB</span>
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-brand-orange">{error}</p>
      )}
    </div>
  );
}
