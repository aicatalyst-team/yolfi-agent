import { createHmac, timingSafeEqual } from 'node:crypto';

export function signWebhookPayload(payload, secret) {
  if (!secret) {
    return '';
  }

  return createHmac('sha256', secret).update(payload, 'utf8').digest('base64');
}

export function verifyWebhookSignature(payload, signature, secret) {
  const expected = signWebhookPayload(payload, secret);
  if (!expected || !signature) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, 'base64');
  const receivedBuffer = Buffer.from(signature, 'base64');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
