# Yolfi Agent

Thin SDK, CLI, and MCP adapter for AI coding agents that add Yolfi crypto payments to user apps.

This package does not create a second Yolfi API. It maps agent actions to the existing Yolfi endpoints:

| Agent action | Endpoint |
| --- | --- |
| Register workspace | `POST /api/auth/agent/register` |
| Check account | `GET /api/private/organization/current` |
| Configure organization/webhooks/settlement | `PUT /api/private/organization/current` |
| Create paylink | `POST /api/private/paylinks/create` |
| List paylinks | `GET /api/private/paylinks` |
| Create payment | `POST /api/public/payments` |
| Payment status | `GET /api/public/payments/:id` |

## Install

```bash
npx -y @yolfi/agent help
```

## Register Agent Workspace

```bash
yolfi auth:agent-register \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

The returned `apiKey` is shown once. Store it in an ignored env file as `YOLFI_API_KEY`.

## MCP

```json
{
  "mcpServers": {
    "yolfi-api": {
      "command": "npx",
      "args": ["-y", "@yolfi/agent", "mcp"],
      "env": {
        "YOLFI_API_KEY": "..."
      }
    },
    "yolfi-knowledge": {
      "command": "npx",
      "args": ["-y", "@yolfi/agent", "mcp"]
    }
  }
}
```

## Safety Rules

- Ask the user for settlement wallet addresses.
- Ask the user for product names, price, currency, and recurring interval.
- Do not commit `YOLFI_API_KEY`.
- Do not treat redirects as payment confirmation.
- Verify `X-Yolfi-Signature` on webhook payloads.
- List existing paylinks before creating another paylink after a timeout.
- Require explicit user approval before disabling paylinks.

## Webhook Verification

Yolfi signs the raw JSON payload with HMAC-SHA256 base64 using `X-Yolfi-Signature`.
In v1 the signing secret is the organization API key.

```js
import { verifyWebhookSignature } from '@yolfi/agent';

const valid = verifyWebhookSignature(rawBody, signature, process.env.YOLFI_API_KEY);
```
