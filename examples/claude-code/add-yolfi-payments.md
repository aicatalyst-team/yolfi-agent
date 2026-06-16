# Add Yolfi Payments With Claude Code

Use the Yolfi MCP server or `npx -y @yolfi/agent`.

Before creating paylinks, ask the user for wallet, price, currency, and payment type. Do not commit secrets. Use existing webhook and entitlement patterns in the app when possible.

Expected target app changes:

- ignored env/config entry for `YOLFI_API_KEY`;
- paylink id stored in env/config;
- checkout UI or server route;
- webhook handler verifying `X-Yolfi-Signature`;
- tests or smoke checks for checkout and webhook behavior.
