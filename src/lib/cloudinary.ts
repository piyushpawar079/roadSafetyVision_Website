// ===========================================
// CLOUDINARY CONFIGURATION
// Handles image uploads to Cloudinary
// ===========================================

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 * @param imageData - Base64 string (with or without data URI prefix) or URL
 * @param folder - Folder path in Cloudinary
 * @returns Upload result with URL
 */
export async function uploadToCloudinary(
  imageData: string,
  folder: string = 'violations'
): Promise<CloudinaryUploadResult> {
  try {
    // Ensure the data has proper prefix for base64
    let uploadData = imageData;
    
    // If it's base64 without prefix, add it
    if (!imageData.startsWith('data:') && !imageData.startsWith('http')) {
      uploadData = `data:image/jpeg;base64,${imageData}`;
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(uploadData, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      // Add timestamp to make URLs unique
      public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary in parallel
 * @param images - Array of {name, data} objects
 * @param folder - Folder path
 * @returns Object with image names as keys and URLs as values
 */
export async function uploadMultipleImages(
  images: Array<{ name: string; data: string | null }>,
  folder: string
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  const uploadPromises = images.map(async (image) => {
    if (!image.data) {
      results[image.name] = null;
      return;
    }

    try {
      const result = await uploadToCloudinary(image.data, folder);
      results[image.name] = result.secure_url;
    } catch (error) {
      console.error(`Failed to upload ${image.name}:`, error);
      results[image.name] = null;
    }
  });

  await Promise.all(uploadPromises);
  return results;
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs
 */
export async function deleteMultipleFromCloudinary(
  publicIds: string[]
): Promise<{ success: string[]; failed: string[] }> {
  const results = { success: [] as string[], failed: [] as string[] };

  await Promise.all(
    publicIds.map(async (publicId) => {
      const success = await deleteFromCloudinary(publicId);
      if (success) {
        results.success.push(publicId);
      } else {
        results.failed.push(publicId);
      }
    })
  );

  return results;
}

export default cloudinary;