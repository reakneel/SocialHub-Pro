import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UploadService } from '@/lib/upload';
import { LogService } from '@/lib/logger';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload files
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 default: uploads
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         format: uri
 *                       filename:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       type:
 *                         type: string
 *       400:
 *         description: Invalid file or upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const results = await UploadService.uploadMultiple(files, user.id, folder);

    // Log upload activity
    await LogService.auditLog({
      userId: user.id,
      action: 'files_uploaded',
      resourceType: 'file',
      resourceId: 'multiple',
      details: { 
        fileCount: files.length, 
        folder,
        results: results.map(r => 'error' in r ? { error: r.error } : { filename: r.filename, size: r.size })
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({ files: results });
  } catch (error) {
    LogService.error('Upload error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}