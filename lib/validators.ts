import { z } from 'zod';

// Define document types enum
export const documentTypes = [
  'identification',
  'financial',
  'medical',
  'legal',
  'education',
  'personal',
  'work',
  'custom',
] as const;

// Document schema validation
export const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  type: z.enum(documentTypes),
  customType: z.string().optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  tags: z.array(z.string().max(20, 'Tag is too long')).optional(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  isTemporary: z.boolean().default(false),
});

// Schema for document creation
export const createDocumentSchema = documentSchema.extend({
  file: z.any(),
});

// Schema for document update
export const updateDocumentSchema = documentSchema.partial();

// Schema for document filter
export const documentFilterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(documentTypes).optional(),
  tags: z.array(z.string()).optional(),
  isTemporary: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.enum(['createdAt', 'title', 'type', 'fileSize']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Upload request validation
export const uploadRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(documentTypes),
  customType: z.string().optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  isTemporary: z.boolean().default(false),
});

export type DocumentType = z.infer<typeof documentSchema>;
export type CreateDocumentType = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentType = z.infer<typeof updateDocumentSchema>;
export type DocumentFilterType = z.infer<typeof documentFilterSchema>;
export type UploadRequestType = z.infer<typeof uploadRequestSchema>;