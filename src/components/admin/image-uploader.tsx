"use client";

import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface ImageUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  onImagesChange?: (images: ImageFile[]) => void;
  onUploadComplete?: (images: ImageFile[]) => void;
}

export function ImageUpload({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = "image/*",
  className,
  onImagesChange,
  onUploadComplete,
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "File must be an image";
    if (file.size > maxSize)
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(
        1,
      )}MB`;
    if (images.length >= maxFiles) return `Maximum ${maxFiles} files allowed`;
    return null;
  };

  const fetchSignature = async () => {
    const res = await fetch(
      "http://localhost:5000/api/v1/cloudinary/signature",
    );
    if (!res.ok) throw new Error("Failed to fetch signature");
    return res.json();
  };

  const uploadToCloudinary = async (
    imageFile: ImageFile,
    signatureData: { timestamp: string; signature: string },
  ) => {
    const formData = new FormData();
    formData.append("file", imageFile.file);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("signature", signatureData.signature);
    formData.append("api_key", "142188283175534");

    try {
      await fetch("https://api.cloudinary.com/v1_1/ddmr6pt5h/auto/upload", {
        method: "POST",
        body: formData,
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageFile.id
            ? { ...img, progress: 100, status: "completed" }
            : img,
        ),
      );

      onUploadComplete?.(images);
    } catch (err: any) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageFile.id
            ? { ...img, status: "error", error: err.message }
            : img,
        ),
      );
    }
  };

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const newImages: ImageFile[] = [];
      const newErrors: string[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
          return;
        }

        newImages.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
        });
      });

      if (newErrors.length) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (newImages.length) {
        const updated = [...images, ...newImages];
        setImages(updated);
        onImagesChange?.(updated);

        const signature = await fetchSignature();
        newImages.forEach((img) => uploadToCloudinary(img, signature));
      }
    },
    [images, maxFiles, maxSize, onImagesChange],
  );

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {images.map((img, i) => (
            <Card key={img.id} className="bg-accent/50 shadow-none rounded-md">
              <img
                src={img.preview}
                alt={`Image ${i + 1}`}
                className="h-[120px] w-full object-cover rounded-md"
              />
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <Card
        className={cn(
          "border-dashed shadow-none rounded-md",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addImages(e.dataTransfer.files);
        }}
      >
        <CardContent className="text-center">
          <CloudUpload className="mx-auto mb-3 size-4" />
          <p className="text-sm mb-3">Drag & drop images or click browse</p>
          <Button
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = accept;
              input.onchange = (e: any) => addImages(e.target.files);
              input.click();
            }}
          >
            Browse Files
          </Button>
        </CardContent>
      </Card>

      {/* Progress */}
      {images.map((img) => (
        <Progress key={img.id} value={img.progress} className="mt-3" />
      ))}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="error" className="mt-5">
          <AlertTitle>Upload error</AlertTitle>
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

function formatBytes(bytes: number) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB", "GB"][i]}`;
}
