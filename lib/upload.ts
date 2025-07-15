import { NextRequest } from 'next/server';
import { supabase } from './supabase';
import sharp from 'sharp';

const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'); // 10MB
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4').split(',');

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export class UploadService {
  static async uploadFile(file: File, userId: string, folder: string = 'uploads'): Promise<UploadResult | { error: string }> {
    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: `File type ${file.type} not allowed` };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${userId}/${folder}/${timestamp}.${extension}`;

      let fileBuffer = Buffer.from(await file.arrayBuffer());

      // Optimize images
      if (file.type.startsWith('image/')) {
        fileBuffer = await this.optimizeImage(fileBuffer, file.type);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (error) {
        console.error('Upload error:', error);
        return { error: 'Failed to upload file' };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filename);

      return {
        url: urlData.publicUrl,
        filename: data.path,
        size: fileBuffer.length,
        type: file.type,
      };
    } catch (error) {
      console.error('Upload service error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async deleteFile(filename: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([filename]);

      return !error;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  private static async optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    try {
      let sharpInstance = sharp(buffer);

      // Get image metadata
      const metadata = await sharpInstance.metadata();

      // Resize if too large
      if (metadata.width && metadata.width > 1920) {
        sharpInstance = sharpInstance.resize(1920, null, {
          withoutEnlargement: true,
        });
      }

      // Convert to appropriate format and compress
      switch (mimeType) {
        case 'image/jpeg':
          return sharpInstance.jpeg({ quality: 85 }).toBuffer();
        case 'image/png':
          return sharpInstance.png({ compressionLevel: 8 }).toBuffer();
        case 'image/webp':
          return sharpInstance.webp({ quality: 85 }).toBuffer();
        default:
          return sharpInstance.jpeg({ quality: 85 }).toBuffer();
      }
    } catch (error) {
      console.error('Image optimization error:', error);
      return buffer;
    }
  }

  static async uploadMultiple(files: File[], userId: string, folder: string = 'uploads'): Promise<(UploadResult | { error: string })[]> {
    const results = await Promise.all(
      files.map(file => this.uploadFile(file, userId, folder))
    );
    return results;
  }
}