# Add Yolfi Payments With Codex

Ask the user for:

- settlement wallet address;
- product name;
- price and currency;
- one-time or recurring payment type;
- webhook URL if the app backend URL is unknown.

Codex can do automatically:

- inspect the app framework;
- register a Yolfi agent workspace if `YOLFI_API_KEY` is missing;
- configure organization settings;
- create or reuse a paylink;
- add checkout UI/server code;
- add webhook signature verification;
- run tests and report changed files.

Expected verification:

```bash
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent paylinks:list
```
