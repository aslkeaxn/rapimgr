## Usage

Create a Rapid API account using a Firefox Relay mask and save the default application's api key

```typescript
// import osecmail from "osecmail";
// import fxrmc from "fxrmc";

const mailboxes = await osecmail.generateRandomMailboxes(1);
const mailbox = mailboxes[0];
const [login, domain] = mailbox.split("@");

const mozillaPassword = "Password123456$";
const mask = await fxrmc(mailbox, mozillaPassword);

const username = login;
const rapidPassword = "Password123456$";
const apiKey = await register(username, mask, rapidPassword, login, domain);
```

Subscribe to an API

```typescript
const email = "...";
const password = "...";
const pricingUrl = "...";
await subscribe(email, password, pricingUrl);
```

## Type Definitions

```typescript
function register(
  username: string,
  mask: string,
  password: string,
  login: string,
  domain: string,
  headless?: false | "new"
): Promise<string>;
```
