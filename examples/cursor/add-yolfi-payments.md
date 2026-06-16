# Add Yolfi Payments With Cursor

Use package examples as editable inputs:

```bash
npx -y @yolfi/agent paylinks:create --json examples/paylink.one-time.json
```

Cursor should inspect the app before editing, preserve existing billing/webhook structure, and ask the user for wallet and pricing decisions. Payment success must be verified through Yolfi payment status or webhook events, not redirect alone.
