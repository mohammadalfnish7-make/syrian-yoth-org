"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_MAX_MB = 40;

interface VideoUploaderProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label?: string;
}

export function VideoUploader({
  currentUrl,
  onUpload,
  onRemove,
  label = "فيديو القسم الأول",
}: VideoUploaderProps) {
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

    if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
      setError(`حجم الملف يتجاوز الحد الأقصى (${VIDEO_MAX_MB} ميغابايت).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "videos");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل رفع الفيديو");
      }

      URL.revokeObjectURL(localPreview);
      setPreview(data.url);
      onUpload(data.url);
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setError(err instanceof Error ? err.message : "فشل رفع الفيديو");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!preview) return;

    if (preview.startsWith("/api/uploads/")) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: preview }),
        });
      } catch {
        // Continue with UI update even if delete fails
      }
    }

    setPreview(null);
    onRemove?.();
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-normal text-brand-black/70">
        {label}
      </label>

      {preview ? (
        <div>
          <video
            key={preview}
            src={preview}
            className="w-full max-w-md rounded-lg border border-brand-grey-2 bg-black"
            muted
            playsInline
            controls
            preload="metadata"
          />
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
          className="flex flex-col items-center justify-center w-full max-w-md h-36 border-2 border-dashed border-brand-grey-2 rounded-lg hover:border-brand-purple transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-brand-purple">جاري الرفع...</span>
          ) : (
            <>
              <span className="text-sm text-brand-black/50">{label}</span>
              <span className="text-xs text-brand-black/30 mt-1">
                MP4 — حتى {VIDEO_MAX_MB}MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-brand-orange">{error}</p>}
    </div>
  );
}
