import assert from 'node:assert/strict';
import test from 'node:test';
import { createMcpCapabilities } from '../src/mcp.js';

test('MCP capabilities expose yolfi-api tools and yolfi-knowledge resources', () => {
  const capabilities = createMcpCapabilities();

  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_webhooks_verify'));
  assert.ok(capabilities.resources.some((resource) => resource.uri === 'yolfi://docs/agent-quickstart'));
  assert.ok(capabilities.prompts.some((prompt) => prompt.name === 'integrate_yolfi_payments'));
});

test('destructive MCP tools are clearly marked', () => {
  const capabilities = createMcpCapabilities();
  const disableTool = capabilities.tools.find((tool) => tool.name === 'yolfi_paylinks_disable');

  assert.ok(disableTool.description.includes('destructive'));
  assert.equal(disableTool.inputSchema.properties.confirm.const, true);
});
