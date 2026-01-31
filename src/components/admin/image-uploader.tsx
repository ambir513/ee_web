"use client";

import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CloudUpload } from "lucide-react";
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
  error?: string;
}

/* --------------------------------------------------
 * COMPONENT
 * -------------------------------------------------- */
export function ImageUpload() {
  const [images, setImages] = useState<ImageFile[]>([]);
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
      "http://localhost:5000/api/v1/cloudinary/signature",
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
   * UPLOAD TO CLOUDINARY (PARAMS MUST MATCH SIGNED PARAMS)
   * -------------------------------------------------- */
  const uploadToCloudinary = async (
    img: ImageFile,
    signature: { timestamp: number; signature: string },
  ) => {
    const formData = new FormData();

    formData.append("file", img.file);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("folder", "products"); // 🔥 MUST MATCH BACKEND SIGNING
    formData.append("signature", signature.signature);
    formData.append("api_key", "142188283175534");

    try {
      await fetch("https://api.cloudinary.com/v1_1/ddmr6pt5h/auto/upload", {
        method: "POST",
        body: formData,
      });

      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id ? { ...i, status: "completed", progress: 100 } : i,
        ),
      );
    } catch (err: any) {
      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id ? { ...i, status: "error", error: err.message } : i,
        ),
      );
    }
  };

  /* --------------------------------------------------
   * ADD FILES
   * -------------------------------------------------- */
  const addImages = useCallback(async (files: FileList) => {
    const valid: ImageFile[] = [];
    const errs: string[] = [];

    Array.from(files).forEach((file) => {
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

    setImages((prev) => [...prev, ...valid]);

    const signature = await fetchSignature();

    valid.forEach((img) => uploadToCloudinary(img, signature));
  }, []);

  /* --------------------------------------------------
   * RENDER
   * -------------------------------------------------- */
  return (
    <div className="max-w-4xl">
      {/* PREVIEW GRID */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.preview}
              className="h-[120px] w-full object-cover rounded-md"
            />
          ))}
        </div>
      )}

      {/* DROP ZONE */}
      <Card
        className={cn(
          "border-dashed shadow-none rounded-md transition",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30",
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
      >
        <CardContent className="text-center py-8">
          <CloudUpload className="mx-auto mb-3 size-5" />
          <p className="text-sm mb-3">Drag & drop images or click browse</p>
          <Button
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = "image/*";
              input.onchange = (e: any) => addImages(e.target.files);
              input.click();
            }}
          >
            Browse Files
          </Button>
        </CardContent>
      </Card>

      {/* PROGRESS */}
      {images.map((img) => (
        <Progress key={img.id} value={img.progress} className="mt-3" />
      ))}

      {/* ERRORS */}
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
