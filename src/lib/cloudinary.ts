import { api } from "./api";

interface CloudinarySignature {
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
  apiKey: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Upload an image to Cloudinary using signed upload
 * @param file - The file to upload
 * @param folder - The folder to upload to (e.g., 'avatars', 'products')
 * @param queryClient - TanStack Query client for authentication
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "avatars",
  queryClient?: any
): Promise<string> {
  try {
    // Step 1: Get signature from backend
    const signatureResponse = await api.get(
      `/cloudinary/signature?folder=${folder}`,
      { queryClient }
    );

    if (!signatureResponse.status) {
      throw new Error("Failed to get upload signature");
    }

    const signatureData = signatureResponse.data as CloudinarySignature;
    const { timestamp, signature, cloudName, apiKey } = signatureData;

    console.log("Cloudinary config:", { cloudName, folder, timestamp });

    // Step 2: Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);

    // Step 3: Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    console.log("Uploading to:", cloudinaryUrl);

    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    console.log("Upload response status:", uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Cloudinary error response:", errorText);
      throw new Error(`Failed to upload image to Cloudinary: ${uploadResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const responseText = await uploadResponse.text();
    console.log("Cloudinary response:", responseText.substring(0, 200));

    let result: CloudinaryUploadResponse;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Cloudinary response:", responseText.substring(0, 500));
      throw new Error("Invalid response from Cloudinary");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): string | null {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return "Please select an image file";
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Image size must be less than ${maxSizeMB}MB`;
  }

  return null;
}
