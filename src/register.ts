import puppeteer from "puppeteer";
import { sleep } from "./sleep";
import osecmail from "osecmail";

export async function register(
  username: string,
  mask: string,
  password: string,
  login: string,
  domain: string,
  headless: false | "new" = "new"
) {
  const originalMessages = await osecmail.getMessages(login, domain);
  const vmCounts = originalMessages.filter((m) =>
    m.subject.includes("Verification Code")
  ).length;

  const browser = await puppeteer.launch({ headless });
  const pages = await browser.pages();
  const page = pages[0];

  await page.goto("https://rapidapi.com/auth/sign-up");

  await sleep(1000);
  await page.locator("#signup-form_username").fill(username);
  await sleep(1000);
  await page.locator("#signup-form_email").fill(mask);
  await sleep(1000);
  await page.locator("#signup-form_password").fill(password);

  const suButton = await page.waitForSelector("button span ::-p-text(Sign Up)");
  if (!suButton) throw new Error("Couldn't find sign up button");

  await sleep(2000);

  let i = 0;
  let url = page.url();
  while (i < 10 && page.url() === url) {
    i++;
    await suButton.click();
    await sleep(5000);
  }

  if (page.url() === url) throw new Error("Couldn't proceed with sign up");

  let j = 0;
  let code = "";
  while (j < 10) {
    j++;
    await sleep(3000);
    const messages = await osecmail.getMessages(login, domain);
    const vMessages = messages.filter((m) =>
      m.subject.includes("Verification Code")
    );
    if (vMessages.length === vmCounts) continue;
    code = vMessages[0].subject.split(" ")[2];
    break;
  }

  if (code.length === 0) throw new Error("Couldn't get verification code");

  url = page.url();
  await page.locator("input").fill(code);

  let k = 0;
  while (k < 10 && url === page.url()) {
    k++;
    await sleep(1000);
  }

  if (url === page.url()) throw new Error("Couldn't verify account");

  await page.goto("https://rapidapi.com/developer/apps");

  const aButton = await page.waitForSelector(
    "button[data-id*=security-default-application]"
  );
  if (!aButton) throw new Error("Couldn't find authorization button");
  await aButton.click();

  const sButton = await page.waitForSelector(
    'button[class*="ant-btn ant-btn-text ant-btn-icon-only"]'
  );
  if (!sButton) throw new Error("Couldn't find show api key button");
  await sButton.click();

  const span = await page.waitForSelector("td div span");
  if (!span) throw new Error("Couldn't find api key span");

  const apiKey = await span.evaluate((span) => span.textContent);
  if (!apiKey) throw new Error("Couldn't extract api key");

  await page.close();
  await browser.close();

  return apiKey;
}
