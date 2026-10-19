import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ImageUploadOptions {
  bucket: "doctor-photos" | "gallery-cases";
  file: File;
  altOrCaption: string;
}

export interface ImageUploadResult {
  publicUrl?: string;
  error?: string;
}

/**
 * Validates image file type, size, and mandatory alt text/caption.
 */
export function validateImageFile(file: File, altOrCaption: string): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`;
  }

  if (!altOrCaption || altOrCaption.trim().length < 2) {
    return "A descriptive alt text or caption is required for every uploaded image.";
  }

  return null;
}

/**
 * Uploads an image to the designated Supabase storage bucket.
 * Returns the public URL or an error message.
 */
export async function uploadImage({
  bucket,
  file,
  altOrCaption,
}: ImageUploadOptions): Promise<ImageUploadResult> {
  const validationError = validateImageFile(file, altOrCaption);
  if (validationError) {
    return { error: validationError };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      error: "Supabase storage is not configured yet. Please check your environment variables.",
    };
  }

  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { publicUrl: data.publicUrl };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload image. Please try again.",
    };
  }
}
