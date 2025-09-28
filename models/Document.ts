import type { DocumentRecord } from '@/lib/document-repository';

/**
 * Legacy Mongoose model shim maintained for backwards compatibility.
 * Use helpers from `@/lib/document-repository` when interacting with documents.
 */

export type Document = DocumentRecord;

export default undefined as unknown as never;