## Type Definitions

```typescript
function createAccount(
  mailbox: string,
  username: string,
  email: string,
  password: string,
  headless?: false | "new"
): Promise<string>;

function login(
  email: string,
  password: string,
  headless?: false | "new"
): Promise<{
  browser: Browser;
  page: Page;
}>;

function subscribe(
  url: string,
  email: string,
  password: string,
  headless?: false | "new"
): Promise<void>;
```
