import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Document from '@/models/Document';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { uploadRequestSchema } from '@/lib/validators';
import { isValidFileType } from '@/lib/utils';
import type { UploadApiResponse } from 'cloudinary';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// GET - Fetch documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const tagsRaw = searchParams.get('tags');
    const tags = tagsRaw ? tagsRaw.split(',') : [];
    const isTemporary = searchParams.get('isTemporary');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    let query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (type) query.type = type;
    if (Array.isArray(tags) && tags.length > 0) query.tags = { $in: tags };
    if (isTemporary !== null) query.temporary = isTemporary === 'true';

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const totalCount = await Document.countDocuments(query);

    const documents = await Document.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      documents,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
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
    await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Log all received form fields
    const formEntries = Array.from(formData.entries());
    console.log('Received form fields:', formEntries);

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
      temporary: formData.get('isTemporary') === 'true',
    };

    // Log parsed documentData
    console.log('Parsed documentData:', documentData);

    try {
      uploadRequestSchema.parse(documentData);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json({ error: 'Invalid document data', details: error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'stashlet',
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.name.replace(/\s+/g, '_')}`,
    }) as UploadApiResponse;

    const now = new Date();

    const document = await Document.create({
      ...documentData,
      fileUrl: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileSize: file.size,
      mimeType: file.type,
      fileName: file.name,
      createdAt: now,
      updatedAt: now,
      issueDate: documentData.issueDate ? new Date(documentData.issueDate) : null,
      expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : null,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
