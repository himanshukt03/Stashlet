import { Buffer } from 'node:buffer';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { getLambdaClient } from './clients';

const FUNCTION_NAME = process.env.AWS_RESIZE_LAMBDA_FUNCTION_NAME;

export async function triggerResizeLambda(payload: Record<string, unknown>) {
  if (!FUNCTION_NAME) {
    console.warn('AWS_RESIZE_LAMBDA_FUNCTION_NAME is not set. Skipping Lambda invocation.');
    return;
  }

  const client = getLambdaClient();

  try {
    await client.send(
      new InvokeCommand({
        FunctionName: FUNCTION_NAME,
        InvocationType: 'Event',
        Payload: Buffer.from(JSON.stringify(payload)),
      })
    );
  } catch (error) {
    console.error('Failed to invoke Lambda function', error);
  }
}
