/**
 * Cloudinary Direct Upload Utility.
 * Integrates direct client-side uploads with fallback support.
 */

import { cloudinaryConfig } from './config/firebaseAndCloudinary';

/**
 * Uploads a file (image or video) directly to Cloudinary.
 * If Cloudinary is not configured yet (i.e. using placeholders), 
 * it gracefully falls back to local FileReader Data URLs to keep the app functional in preview.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudName, uploadPreset } = cloudinaryConfig;

  const isPlaceholder = 
    !cloudName || 
    !uploadPreset || 
    cloudName === 'dop-portfolio' || 
    uploadPreset === 'portfolio_preset' ||
    cloudName.includes('YOUR_') ||
    uploadPreset.includes('YOUR_');

  if (isPlaceholder) {
    console.warn(
      'Cloudinary cloud storage is using default placeholder parameters. ' +
      'Please configure real credentials in `/src/config/firebaseAndCloudinary.ts` or set VITE_CLOUDINARY_CLOUD_NAME & VITE_CLOUDINARY_UPLOAD_PRESET environment variables. ' +
      'Falling back to local DataURL for preview functionality.'
    );
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('FileReader did not produce any result.'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error occurred.'));
      reader.readAsDataURL(file);
    });
  }

  // Construct standard multi-part upload payload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error('Cloudinary API upload error:', errorMsg);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.secure_url) {
      console.log('Cloudinary upload success:', data.secure_url);
      return data.secure_url;
    }
    
    throw new Error('Cloudinary response did not return a secure_url.');
  } catch (error) {
    console.error('Error during Cloudinary API request:', error);
    throw new Error(
      `Failed to upload to Cloudinary. Please ensure you have configured an 'unsigned upload preset' correctly. Error: ${error instanceof Error ? error.message : error}`
    );
  }
}
