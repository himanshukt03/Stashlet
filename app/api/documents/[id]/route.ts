import { NextRequest, NextResponse } from 'next/server';
import { updateDocumentSchema } from '@/lib/validators';
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  mapToApiDocument,
  type DocumentRecord,
} from '@/lib/document-repository';
import { deleteObjectFromS3 } from '@/lib/aws/s3';

// GET a single document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const document = await getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(mapToApiDocument(document));
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

// PATCH update document
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate update data
    try {
      updateDocumentSchema.parse(data);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid document data' }, { status: 400 });
    }

    const updates: Partial<DocumentRecord> = {
      title: data.title,
      type: data.type,
      customType: data.customType ?? null,
      description: data.description ?? null,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      isTemporary: data.isTemporary,
    };

    if ('issueDate' in data) {
      updates.issueDate = data.issueDate ? new Date(data.issueDate).toISOString() : null;
    }

    if ('expiryDate' in data) {
      updates.expiryDate = data.expiryDate ? new Date(data.expiryDate).toISOString() : null;
    }

    const document = await updateDocument(id, updates);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(mapToApiDocument(document));
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const document = await getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.s3Key) {
      await deleteObjectFromS3(document.s3Key);
    }

    if (document.thumbnailKey) {
      await deleteObjectFromS3(document.thumbnailKey);
    }

    await deleteDocument(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}