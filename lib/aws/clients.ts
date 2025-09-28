import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { LambdaClient } from '@aws-sdk/client-lambda';

function resolveAwsRegion() {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error('AWS_REGION environment variable is not set.');
  }
  return region;
}

function resolveAwsCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (accessKeyId && secretAccessKey) {
    return sessionToken
      ? { accessKeyId, secretAccessKey, sessionToken }
      : { accessKeyId, secretAccessKey };
  }

  // Fallback to default credential provider chain (e.g., IAM roles)
  return undefined;
}

const sharedConfig = {
  region: resolveAwsRegion(),
  credentials: resolveAwsCredentials(),
};

declare global {
  // eslint-disable-next-line no-var
  var __awsClients: {
    s3?: S3Client;
    dynamo?: DynamoDBClient;
    document?: DynamoDBDocumentClient;
    lambda?: LambdaClient;
  } | undefined;
}

const globalClients = globalThis.__awsClients ?? {};
if (!globalThis.__awsClients) {
  globalThis.__awsClients = globalClients;
}

export function getS3Client() {
  if (!globalClients.s3) {
    globalClients.s3 = new S3Client(sharedConfig);
  }
  return globalClients.s3;
}

export function getDynamoClient() {
  if (!globalClients.dynamo) {
    globalClients.dynamo = new DynamoDBClient(sharedConfig);
  }
  return globalClients.dynamo;
}

export function getDocumentClient() {
  if (!globalClients.document) {
    const client = getDynamoClient();
    globalClients.document = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        convertClassInstanceToMap: true,
        removeUndefinedValues: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }
  return globalClients.document;
}

export function getLambdaClient() {
  if (!globalClients.lambda) {
    globalClients.lambda = new LambdaClient(sharedConfig);
  }
  return globalClients.lambda;
}
