import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FileUploadService } from '@/lib/upload';
import { 
  withAuth, 
  withErrorHandling, 
  withLogging, 
  withPerformanceMonitoring,
  withMiddleware 
} from '@/lib/middleware';

// Validation schema
const uploadQuerySchema = z.object({
  type: z.enum(['image', 'video', 'document']).optional(),
  folder: z.string().optional()
});

async function uploadFile(
  request: NextRequest,
  user: any
) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  const validatedParams = uploadQuerySchema.parse(queryParams);

  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload and process file
    const uploadedFile = await FileUploadService.uploadFile(
      file,
      user.sub,
      validatedParams.type,
      validatedParams.folder
    );

    return NextResponse.json({
      file: uploadedFile,
      message: 'File uploaded successfully'
    }, { status: 201 });

  } catch (error: any) {
    if (error.message.includes('File too large')) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 413 }
      );
    }
    
    if (error.message.includes('Invalid file type')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      );
    }

    throw error;
  }
}

async function getUserFiles(
  request: NextRequest,
  user: any
) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'image' | 'video' | 'document' | null;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const files = await FileUploadService.getUserFiles(
    user.sub,
    type,
    page,
    limit
  );

  return NextResponse.json(files);
}

async function deleteFile(
  request: NextRequest,
  user: any
) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID is required' },
      { status: 400 }
    );
  }

  try {
    await FileUploadService.deleteFile(fileId, user.sub);
    
    return NextResponse.json({
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('access denied')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    throw error;
  }
}

// Export handlers with middleware
export const POST = withMiddleware(
  (request: NextRequest) => withAuth(request, uploadFile),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const GET = withMiddleware(
  (request: NextRequest) => withAuth(request, getUserFiles),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const DELETE = withMiddleware(
  (request: NextRequest) => withAuth(request, deleteFile),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);