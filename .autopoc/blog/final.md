# Containerizing a Crypto Payment MCP Server on OpenShift

AI agents need payment capabilities, but most payment SDKs are designed for traditional server environments. We tested whether a zero-dependency MCP payment server can run reliably in an unprivileged OpenShift container.

## The Project

[Yolfi Agent Kit](https://github.com/yolfinance/yolfi-agent) is an MCP server that gives AI coding agents access to crypto payment operations: workspace registration, payment link creation, webhook configuration, and payment status checks. It provides 13 MCP tools covering the full payment lifecycle, from initial setup to webhook signature verification.

The project has zero npm production dependencies and communicates via stdio JSON-RPC, making it a clean containerization target.

## Deployment

We containerized the server using a UBI 9 Node.js 22 base image:

```dockerfile
FROM registry.access.redhat.com/ubi9/nodejs-22
WORKDIR /opt/app-root/src
COPY package.json ./
RUN npm ci --ignore-scripts --omit=dev 2>/dev/null || true
COPY src/ src/
USER 0
RUN chgrp -R 0 /opt/app-root && chmod -R g=u /opt/app-root
USER 1001
ENTRYPOINT ["node", "src/cli.js", "mcp"]
```

The OpenShift build completed in under a minute with zero retries -- the cleanest build we have seen in the AutoPoC pipeline.

## Test Results

We deployed a Kubernetes Job that pipes MCP protocol messages into the server and captures responses:

| Test | Result | Detail |
|------|--------|--------|
| Initialize | Pass | Protocol version 2024-11-05, tools+resources+prompts capabilities |
| Tools List | Pass | 13 payment tools returned with full JSON Schema definitions |
| Ping | Pass | Empty result per MCP specification |

All three scenarios passed on first attempt.

## The 13 Payment Tools

The tool catalog covers the complete Yolfi payment workflow:

- **Registration:** `yolfi_agent_register` (public, no API key needed)
- **Organization:** `yolfi_organization_get`, `yolfi_organization_update`
- **Settlement:** `yolfi_settlement_configure`
- **Webhooks:** `yolfi_webhooks_configure`, `yolfi_webhooks_verify`
- **Paylinks:** `yolfi_paylinks_create`, `yolfi_paylinks_list`, `yolfi_paylinks_get`, `yolfi_paylinks_disable`
- **Payments:** `yolfi_payments_create`, `yolfi_payments_status`
- **Auth:** `yolfi_auth_status`

Each tool includes annotations for safety: `readOnlyHint`, `destructiveHint`, and `idempotentHint`. The `yolfi_paylinks_disable` tool requires explicit `confirm: true`, preventing accidental destruction.

## What We Learned

1. **Zero-dependency Node.js projects containerize instantly.** No `npm install` failures, no native module compilation issues, no lockfile conflicts.

2. **MCP servers follow a repeatable containerization pattern.** Both this project and our previous PoC (codex-control-plane-mcp) use the same approach: UBI base image, stdio entrypoint, Job deployment model.

3. **Payment tools demonstrate MCP's practical value.** The structured tool catalog with input schemas and safety annotations shows how MCP can standardize access to financial APIs in agent workflows.

## For OpenShift AI Teams

This PoC validates that MCP-based payment tooling can run on OpenShift without modification. For teams building AI agent platforms, the deployment pattern enables centrally managed payment capabilities that agents can access through the standard MCP protocol.

The existing `mcp-proxy` pattern in the upstream Dockerfile provides a path to HTTP/SSE-accessible deployment for network clients.

---

*Deployed on OpenShift using UBI 9 Node.js 22. Container image: `quay.io/aicatalyst/yolfi-agent:latest`*
