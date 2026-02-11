"use client";

import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* --------------------------------------------------
 * TYPES
 * -------------------------------------------------- */
interface ImageFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  uploadedUrl?: string;
  error?: string;
}

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  initialImages?: string[];
}

/* --------------------------------------------------
 * COMPONENT
 * -------------------------------------------------- */
export function ImageUpload({
  onImagesChange,
  maxImages = 5,
  initialImages = [],
}: ImageUploadProps) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialImages);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  /* --------------------------------------------------
   * VALIDATION
   * -------------------------------------------------- */
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Only image files allowed";
    if (file.size > 10 * 1024 * 1024) return "Max file size is 10MB";
    return null;
  };

  /* --------------------------------------------------
   * FETCH SIGNATURE (MATCHES BACKEND)
   * -------------------------------------------------- */
  const fetchSignature = async (): Promise<{
    timestamp: number;
    signature: string;
  }> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/cloudinary/signature?folder=products`,
      { credentials: "include" },
    );

    if (!res.ok) throw new Error("Failed to fetch signature");

    const json = await res.json();

    if (!json?.data?.timestamp || !json?.data?.signature) {
      throw new Error("Invalid signature payload");
    }

    return json.data;
  };

  /* --------------------------------------------------
   * UPDATE PARENT WITH UPLOADED URLS
   * -------------------------------------------------- */
  const updateParent = useCallback(
    (urls: string[]) => {
      setUploadedUrls(urls);
      onImagesChange(urls);
    },
    [onImagesChange],
  );

  /* --------------------------------------------------
   * UPLOAD TO CLOUDINARY (PARAMS MUST MATCH SIGNED PARAMS)
   * -------------------------------------------------- */
  const uploadToCloudinary = async (
    img: ImageFile,
    signature: { timestamp: number; signature: string },
  ): Promise<string | null> => {
    const formData = new FormData();

    formData.append("file", img.file);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("folder", "products");
    formData.append("signature", signature.signature);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "142188283175534");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ddmr6pt5h"}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  /* --------------------------------------------------
   * ADD FILES
   * -------------------------------------------------- */
  const addImages = useCallback(
    async (files: FileList) => {
      const remainingSlots = maxImages - uploadedUrls.length - imageFiles.length;
      if (remainingSlots <= 0) {
        setErrors([`Maximum ${maxImages} images allowed`]);
        return;
      }

      const valid: ImageFile[] = [];
      const errs: string[] = [];

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          const err = validateFile(file);
          if (err) {
            errs.push(`${file.name}: ${err}`);
            return;
          }

          valid.push({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "uploading",
          });
        });

      if (errs.length) setErrors(errs);
      if (!valid.length) return;

      setImageFiles((prev) => [...prev, ...valid]);

      try {
        const signature = await fetchSignature();

        const uploadPromises = valid.map(async (img) => {
          const url = await uploadToCloudinary(img, signature);

          setImageFiles((prev) =>
            prev.map((item) =>
              item.id === img.id
                ? {
                    ...item,
                    status: url ? "completed" : "error",
                    uploadedUrl: url || undefined,
                    progress: 100,
                    error: url ? undefined : "Upload failed",
                  }
                : item,
            ),
          );

          return url;
        });

        const results = await Promise.all(uploadPromises);
        const successfulUrls = results.filter((url): url is string => url !== null);

        if (successfulUrls.length > 0) {
          const newUrls = [...uploadedUrls, ...successfulUrls];
          updateParent(newUrls);
        }

        // Clean up completed uploads from imageFiles after a delay
        setTimeout(() => {
          setImageFiles((prev) =>
            prev.filter((img) => img.status === "uploading"),
          );
        }, 1000);
      } catch (err) {
        console.error("Signature fetch error:", err);
        setErrors(["Failed to initialize upload. Please try again."]);
        setImageFiles((prev) =>
          prev.map((img) =>
            valid.some((v) => v.id === img.id)
              ? { ...img, status: "error", error: "Failed to initialize upload" }
              : img,
          ),
        );
      }
    },
    [uploadedUrls, imageFiles.length, maxImages, updateParent],
  );

  /* --------------------------------------------------
   * REMOVE IMAGE
   * -------------------------------------------------- */
  const removeImage = (url: string) => {
    const newUrls = uploadedUrls.filter((u) => u !== url);
    updateParent(newUrls);
  };

  const removeUploadingImage = (id: string) => {
    setImageFiles((prev) => prev.filter((img) => img.id !== id));
  };

  /* --------------------------------------------------
   * RENDER
   * -------------------------------------------------- */
  return (
    <div className="w-full space-y-4">
      {/* PREVIEW GRID - Uploaded Images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploadedUrls.map((url, index) => (
            <div key={`uploaded-${index}`} className="relative group">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="h-[120px] w-full object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500/90 text-white text-xs rounded">
                ✓
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOADING IMAGES */}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imageFiles.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.preview}
                alt="Uploading"
                className={cn(
                  "h-[120px] w-full object-cover rounded-lg border",
                  img.status === "error"
                    ? "border-destructive opacity-50"
                    : "border-border",
                )}
              />
              {img.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <Loader2 className="size-6 text-white animate-spin" />
                </div>
              )}
              {img.status === "error" && (
                <button
                  type="button"
                  onClick={() => removeUploadingImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="size-3" />
                </button>
              )}
              {img.status === "uploading" && (
                <Progress value={img.progress} className="absolute bottom-2 left-2 right-2 h-1" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* DROP ZONE */}
      {uploadedUrls.length + imageFiles.length < maxImages && (
        <Card
          className={cn(
            "border-dashed shadow-none rounded-lg transition cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-muted-foreground/50",
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addImages(e.dataTransfer.files);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/*";
            input.onchange = (e: any) => addImages(e.target.files);
            input.click();
          }}
        >
          <CardContent className="text-center py-8">
            <CloudUpload className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Drag & drop images or click to browse
            </p>
            <p className="text-xs text-muted-foreground/70">
              {uploadedUrls.length + imageFiles.length}/{maxImages} images •
              Max 10MB per file
            </p>
          </CardContent>
        </Card>
      )}

      {/* ERRORS */}
      {errors.length > 0 && (
        <Alert>
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
