import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { uploadRequestSchema } from '@/lib/validators';
import { isValidFileType, getFileExtension } from '@/lib/utils';
import {
  createDocument,
  listDocuments,
  mapToApiDocument,
  type DocumentFilters,
  type DocumentRecord,
} from '@/lib/document-repository';
import { uploadBufferToS3, buildPublicUrl, S3_BUCKET } from '@/lib/aws/s3';
import { triggerResizeLambda } from '@/lib/aws/lambda';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PAGE_LIMIT = 12;
const MAKE_PUBLIC_UPLOAD = process.env.AWS_S3_FORCE_PUBLIC_READ === 'true';
const THUMBNAIL_PREFIX = process.env.AWS_S3_THUMBNAIL_PREFIX || 'thumbnails';

// GET - Fetch documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const pageParam = Number(searchParams.get('page'));
    const limitParam = Number(searchParams.get('limit'));
    const filters: DocumentFilters = {
      search: searchParams.get('search') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      isTemporary:
        searchParams.get('isTemporary') !== null
          ? searchParams.get('isTemporary') === 'true'
          : undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      sortBy: (searchParams.get('sortBy') as DocumentFilters['sortBy']) ?? undefined,
      sortOrder: (searchParams.get('sortOrder') as DocumentFilters['sortOrder']) ?? undefined,
      page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
      limit:
        Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_PAGE_LIMIT,
    };

    const result = await listDocuments(filters);

    return NextResponse.json({
      documents: result.items.map(mapToApiDocument),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST - Upload document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds 10MB limit:', file.size);
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    if (!isValidFileType(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const documentData = {
      title: formData.get('title') as string,
      type: formData.get('type') as string,
      customType: formData.get('customType') ? (formData.get('customType') as string) : "",
      description: formData.get('description') ? (formData.get('description') as string) : "",
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      issueDate: formData.get('issueDate') ? (formData.get('issueDate') as string) : null,
      expiryDate: formData.get('expiryDate') ? (formData.get('expiryDate') as string) : null,
      isTemporary: formData.get('isTemporary') === 'true',
    };

    try {
      uploadRequestSchema.parse(documentData);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json({ error: 'Invalid document data', details: error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const documentId = randomUUID();
    const fileExtension = getFileExtension(file.name) || file.type.split('/').pop() || 'bin';
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `documents/${documentId}/${sanitizedFileName || `${documentId}.${fileExtension}`}`;

    const { url: fileUrl, isPublic: isPublicObject } = await uploadBufferToS3({
      key: objectKey,
      body: buffer,
      contentType: file.type,
      makePublic: MAKE_PUBLIC_UPLOAD,
      cacheControl: 'public, max-age=31536000, immutable',
    });

    const now = new Date().toISOString();
    const isImage = file.type.startsWith('image/');
    const thumbnailKey = isImage ? `${THUMBNAIL_PREFIX}/${documentId}.jpg` : null;
    const thumbnailUrl =
      thumbnailKey && isPublicObject ? buildPublicUrl(thumbnailKey) : fileUrl;

    const record: DocumentRecord = {
      id: documentId,
      title: documentData.title,
      type: documentData.type,
      customType: documentData.customType || null,
      description: documentData.description || null,
      tags: Array.isArray(documentData.tags) ? documentData.tags : [],
      issueDate: documentData.issueDate ? new Date(documentData.issueDate).toISOString() : null,
      expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate).toISOString() : null,
      fileUrl,
      thumbnailUrl,
      s3Key: objectKey,
      thumbnailKey,
      fileSize: file.size,
      mimeType: file.type,
      fileName: file.name,
      isTemporary: documentData.isTemporary ?? false,
      createdAt: now,
      updatedAt: now,
    };

    await createDocument(record);

    if (isImage && thumbnailKey) {
      await triggerResizeLambda({
        bucket: S3_BUCKET,
        key: objectKey,
        targetKey: thumbnailKey,
        contentType: file.type,
      });
    }

    return NextResponse.json(mapToApiDocument(record), { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
