/**
 * MongoDB support has been removed. Use DynamoDB helpers in `@/lib/document-repository` instead.
 */

export async function connectToDatabase() {
  throw new Error('MongoDB integration has been removed in favor of DynamoDB.');
}