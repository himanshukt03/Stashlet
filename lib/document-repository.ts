import {
  DescribeTableCommand,
  CreateTableCommand,
  ResourceNotFoundException,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDocumentClient, getDynamoClient } from './aws/clients';

const TABLE_NAME = process.env.AWS_DOCUMENTS_TABLE_NAME;

if (!TABLE_NAME) {
  throw new Error('AWS_DOCUMENTS_TABLE_NAME environment variable is not set.');
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: string;
  customType?: string | null;
  description?: string | null;
  tags?: string[];
  issueDate?: string | null;
  expiryDate?: string | null;
  fileUrl: string;
  thumbnailUrl?: string | null;
  s3Key: string;
  thumbnailKey?: string | null;
  fileSize: number;
  mimeType: string;
  fileName: string;
  isTemporary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilters {
  search?: string;
  type?: string;
  tags?: string[];
  isTemporary?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  sortBy?: keyof DocumentRecord;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const docClient = getDocumentClient();
const dynamoClient = getDynamoClient();

const shouldAutoCreateTable = (() => {
  const flag = process.env.AWS_AUTO_CREATE_TABLE;
  if (typeof flag === 'string') {
    return flag.toLowerCase() === 'true';
  }
  return process.env.NODE_ENV !== 'production';
})();

let ensureTablePromise: Promise<void> | null = null;

async function ensureDocumentsTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      try {
        await dynamoClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        return;
      } catch (error) {
        if (!(error instanceof ResourceNotFoundException)) {
          throw error;
        }
      }

      if (!shouldAutoCreateTable) {
        throw new Error(
          `DynamoDB table "${TABLE_NAME}" does not exist. Create it manually or set AWS_AUTO_CREATE_TABLE=true to auto-provision in non-production environments.`
        );
      }

      await dynamoClient.send(
        new CreateTableCommand({
          TableName: TABLE_NAME,
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST',
        })
      );

      await waitUntilTableExists(
        { client: dynamoClient, maxWaitTime: 60 },
        { TableName: TABLE_NAME }
      );
    })().catch((error) => {
      ensureTablePromise = null;
      throw error;
    });
  }

  return ensureTablePromise;
}

async function scanAllDocuments() {
  await ensureDocumentsTable();
  let items: DocumentRecord[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const { Items, LastEvaluatedKey } = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    if (Items) {
      items = items.concat(Items as DocumentRecord[]);
    }
    lastEvaluatedKey = LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);

  return items;
}

export async function fetchAllDocuments() {
  return scanAllDocuments();
}

export async function createDocument(record: DocumentRecord) {
  await ensureDocumentsTable();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
    })
  );
  return record;
}

export async function getDocumentById(id: string) {
  await ensureDocumentsTable();
  const { Item } = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return (Item as DocumentRecord | undefined) ?? null;
}

export async function updateDocument(id: string, updates: Partial<DocumentRecord>) {
  await ensureDocumentsTable();
  const cleanedEntries = Object.entries(updates).filter(([, value]) => value !== undefined);
  if (!cleanedEntries.length) {
    const current = await getDocumentById(id);
    if (!current) throw new Error('Document not found');
    return current;
  }

  const now = new Date().toISOString();
  const entries = [...cleanedEntries, ['updatedAt', now]] as Array<[string, unknown]>;

  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  entries.forEach(([key, value], index) => {
    const nameKey = `#field${index}`;
    const valueKey = `:value${index}`;
    updateExpressionParts.push(`${nameKey} = ${valueKey}`);
    expressionAttributeNames[nameKey] = key;
    expressionAttributeValues[valueKey] = value;
  });

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return Attributes as DocumentRecord;
}

export async function deleteDocument(id: string) {
  await ensureDocumentsTable();
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
}

export async function listDocuments(filters: DocumentFilters = {}) {
  const {
    search,
    type,
    tags,
    isTemporary,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = filters;

  const items = await scanAllDocuments();
  let filtered = items;

  if (type) {
    filtered = filtered.filter((item) => item.type === type);
  }

  if (typeof isTemporary === 'boolean') {
    filtered = filtered.filter((item) => item.isTemporary === isTemporary);
  }

  if (tags && tags.length > 0) {
    filtered = filtered.filter((item) => {
      if (!item.tags) return false;
      return tags.some((tag) => item.tags?.includes(tag));
    });
  }

  if (startDate || endDate) {
    filtered = filtered.filter((item) => {
      const createdAt = new Date(item.createdAt);
      if (startDate && createdAt < startDate) return false;
      if (endDate && createdAt > endDate) return false;
      return true;
    });
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const haystacks = [item.title, item.description, ...(item.tags ?? [])]
        .filter(Boolean)
        .map((value) => value!.toString().toLowerCase());

      return haystacks.some((value) => value.includes(term));
    });
  }

    const sorted = filtered.sort((a, b) => {
      const rawA = a[sortBy];
      const rawB = b[sortBy];

      const transform = (value: unknown) => {
        if (typeof value === 'number') return value;
        if (value instanceof Date) return value.getTime();
        if (typeof value === 'string') return value;
        return sortOrder === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      };

      const valueA = transform(rawA);
      const valueB = transform(rawB);

      if (valueA === valueB) return 0;

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      }

      return valueA < valueB ? 1 : -1;
    });

  const total = sorted.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = sorted.slice(start, end);

  return {
    items: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function mapToApiDocument(record: DocumentRecord) {
  return {
    ...record,
    thumbnailUrl: record.thumbnailUrl ?? record.fileUrl,
    _id: record.id,
  };
}
