# PoC Plan: yolfi-agent

## Project Overview

**Name:** yolfi-agent ([@yolfi/agent](https://github.com/yolfinance/yolfi-agent))
**Type:** api-service (MCP server with stdio transport)
**Language:** JavaScript (Node.js 18+)
**License:** MIT
**Dependencies:** Zero external dependencies (Node.js stdlib only)

## PoC Classification

| Field | Value |
|---|---|
| Project type | api-service |
| Deployment model | Job |
| Resource profile | small |
| GPU required | No |
| PVC required | No |
| Needs LLM API | No |
| Needs inference server | No |
| Transport | stdio (JSON-RPC, Content-Length framing + bare newline) |

## Infrastructure Requirements

- **Compute:** 1 CPU core, 128Mi memory (zero-dependency Node.js process)
- **Storage:** None (stateless MCP server)
- **Network:** No inbound ports (stdio-only transport)
- **Secrets:** None required for protocol-level tests (API key only needed for live Yolfi API calls)

## Components

| Component | Language | Entry Point | Port | ML Workload |
|---|---|---|---|---|
| yolfi-agent | JavaScript | `src/cli.js mcp` | None (stdio) | No |

## Test Scenarios

### Scenario 1: MCP Initialize Handshake

- **Type:** cli
- **Description:** Send a JSON-RPC `initialize` request and verify the server returns a valid MCP initialization response with protocol version, capabilities, and server info.
- **Input:** `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"autopoc-test","version":"1.0"}}}`
- **Expected:** Response contains `result.protocolVersion`, `result.capabilities.tools`, and `result.serverInfo.name == "yolfi-agent-kit"`
- **Timeout:** 15s

### Scenario 2: Tools List

- **Type:** cli
- **Description:** Send a JSON-RPC `tools/list` request after initialization and verify the server returns all 13 Yolfi payment tools.
- **Input:** `{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}`
- **Expected:** Response contains `result.tools` array with 13 entries including `yolfi_agent_register`, `yolfi_paylinks_create`, `yolfi_payments_status`, `yolfi_webhooks_verify`
- **Timeout:** 15s

### Scenario 3: Ping Response

- **Type:** cli
- **Description:** Send a JSON-RPC `ping` request and verify the server returns an empty result object.
- **Input:** `{"jsonrpc":"2.0","id":3,"method":"ping"}`
- **Expected:** Response contains `result: {}` (empty object)
- **Timeout:** 10s

## Deployment Strategy

The MCP server communicates over stdio (stdin/stdout) with no network listener. The PoC deploys as a Kubernetes **Job** that:

1. Pipes JSON-RPC messages to the MCP server process via stdin
2. Captures stdout responses
3. Writes results to a ConfigMap for retrieval (since kubectl logs access may be restricted)

## Success Criteria

- All 3 test scenarios pass
- Container builds and runs on OpenShift with UBI base image
- MCP protocol handshake completes within timeout
- Server correctly reports 13 tools in tools/list response
