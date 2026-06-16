import assert from 'node:assert/strict';
import test from 'node:test';
import { YolfiClient, normalizeYolfiError } from '../src/client.js';
import { signWebhookPayload, verifyWebhookSignature } from '../src/webhooks.js';

function jsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}

test('YolfiClient maps paylink creation to the existing private endpoint with bearer auth', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiKey: 'agent-api-key',
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { id: 'paylink-1' } });
    },
  });

  const result = await client.createPaylink({ name: 'Premium', price: '19', currency: 'USD' });

  assert.equal(result.data.id, 'paylink-1');
  assert.equal(calls[0].url, 'https://app.local/api/private/paylinks/create');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer agent-api-key');
  assert.equal(calls[0].options.body, JSON.stringify({ name: 'Premium', price: '19', currency: 'USD' }));
});

test('YolfiClient calls agent registration without bearer auth', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { apiKey: 'one-time-key' } });
    },
  });

  const result = await client.registerAgent({
    agentName: 'Codex',
    projectName: 'Space Shop',
    integrationIntent: 'accept_payments',
  });

  assert.equal(result.data.apiKey, 'one-time-key');
  assert.equal(calls[0].url, 'https://app.local/api/auth/agent/register');
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test('YolfiClient maps public payment creation to the public payments endpoint', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiKey: 'agent-api-key',
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { id: 'payment-1' } });
    },
  });

  await client.createPayment({ paylinkId: 'paylink-1', network: 'ARB', symbol: 'USDC' });

  assert.equal(calls[0].url, 'https://app.local/api/public/payments');
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test('normalizeYolfiError keeps backend code, message, details, and raw response', () => {
  const normalized = normalizeYolfiError({ success: false, code: 11002, message: 'missing price' });

  assert.deepEqual(normalized, {
    success: false,
    code: 11002,
    message: 'missing price',
    details: undefined,
    raw: { success: false, code: 11002, message: 'missing price' },
  });
});

test('webhook helper signs and verifies current Yolfi base64 HMAC signatures', () => {
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment.confirmed' });
  const signature = signWebhookPayload(payload, 'agent-api-key');

  assert.equal(verifyWebhookSignature(payload, signature, 'agent-api-key'), true);
  assert.equal(verifyWebhookSignature(payload, signature, 'wrong-secret'), false);
});
