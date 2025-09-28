import type { Buffer } from 'node:buffer';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from './clients';

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const PUBLIC_CDN_URL = process.env.AWS_S3_PUBLIC_URL_BASE;

if (!BUCKET) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is not set.');
}

export const S3_BUCKET = BUCKET;

export async function uploadBufferToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
  makePublic?: boolean;
}) {
  const { key, body, contentType, cacheControl, makePublic = false } = params;
  const client = getS3Client();

  let shouldBePublic = makePublic;

  const sendPutObject = async (aclEnabled: boolean) => {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
      ACL: aclEnabled ? 'public-read' : undefined,
    });

    await client.send(command);
  };

  try {
    await sendPutObject(shouldBePublic);
  } catch (error) {
    const isAclUnsupported =
      shouldBePublic &&
      error &&
      typeof error === 'object' &&
      ((error as { name?: string }).name === 'AccessControlListNotSupported' ||
        (error as { Code?: string; code?: string }).Code === 'AccessControlListNotSupported' ||
        (error as { Code?: string; code?: string }).code === 'AccessControlListNotSupported' ||
        ((error as { name?: string; message?: string }).name === 'InvalidRequest' &&
          typeof (error as { message?: string }).message === 'string' &&
          (error as { message?: string }).message?.includes('does not allow ACLs')));

    if (isAclUnsupported) {
      console.warn(
        'S3 bucket does not support ACLs. Uploaded object without public-read permissions. Consider setting AWS_S3_FORCE_PUBLIC_READ=false.'
      );
      shouldBePublic = false;
      await sendPutObject(false);
    } else {
      throw error;
    }
  }

  const url = shouldBePublic ? buildPublicUrl(key) : await createPresignedUrl(key);

  return {
    key,
    url,
    isPublic: shouldBePublic,
  };
}

export async function deleteObjectFromS3(key: string) {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function buildPublicUrl(key: string) {
  if (PUBLIC_CDN_URL) {
    return `${PUBLIC_CDN_URL.replace(/\/$/, '')}/${key}`;
  }
  const region = process.env.AWS_REGION;
  return `https://${BUCKET}.s3${region ? `.${region}` : ''}.amazonaws.com/${key}`;
}

export async function createPresignedUrl(key: string, expiresInSeconds = 3600) {
  const client = getS3Client();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
