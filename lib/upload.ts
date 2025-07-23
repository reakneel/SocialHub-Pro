import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from './prisma';
import { FileType } from '@prisma/client';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per upload
  }
});

export class FileUploadService {
  static async processUploadedFile(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    const fileType = file.mimetype.startsWith('image/') ? FileType.IMAGE : FileType.VIDEO;
    
    let processedPath = file.path;
    
    // Process images
    if (fileType === FileType.IMAGE) {
      processedPath = await this.processImage(file.path);
    }

    // Save file record to database
    const fileRecord = await prisma.fileUpload.create({
      data: {
        userId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: processedPath,
        type: fileType
      }
    });

    return fileRecord.id;
  }

  static async processImage(filePath: string): Promise<string> {
    const outputPath = filePath.replace(/\.[^/.]+$/, '_processed.webp');
    
    await sharp(filePath)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Remove original file
    await fs.unlink(filePath);
    
    return outputPath;
  }

  static async getFileUrl(fileId: string): Promise<string | null> {
    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return null;
    }

    // In production, this would return a CDN URL
    return `/api/files/${fileId}`;
  }

  static async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const file = await prisma.fileUpload.findFirst({
      where: { 
        id: fileId,
        userId 
      }
    });

    if (!file) {
      return false;
    }

    try {
      // Delete physical file
      await fs.unlink(file.path);
      
      // Delete database record
      await prisma.fileUpload.delete({
        where: { id: fileId }
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static async getUserFiles(
    userId: string,
    type?: FileType,
    limit: number = 20,
    offset: number = 0
  ) {
    const files = await prisma.fileUpload.findMany({
      where: {
        userId,
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return files.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      type: file.type,
      url: `/api/files/${file.id}`,
      createdAt: file.createdAt
    }));
  }

  static async validateFileAccess(fileId: string, userId: string): Promise<boolean> {
    const file = await prisma.fileUpload.findFirst({
      where: { 
        id: fileId,
        userId 
      }
    });

    return !!file;
  }

  static getFileTypeFromMime(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return FileType.VIDEO;
    } else {
      return FileType.DOCUMENT;
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}