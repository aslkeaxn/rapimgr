import { Page } from "puppeteer";
import { login } from "./login";
import { sleep } from "./utils";

async function navigateToAPIPage(url: string, page: Page) {
  await page.goto(url);
}

async function goToSubscriptionForm(page: Page) {
  const basicDiv = await page.waitForSelector("th div ::-p-text(Basic)");

  if (!basicDiv) {
    throw new Error("Couldn't find basic plan");
  }

  const subscribeButton = await page.waitForSelector(
    "button ::-p-text(Subscribe)"
  );

  if (!subscribeButton) {
    throw new Error("Couldn't find subscribe button");
  }

  await sleep(1000);
  await subscribeButton.click();
}

async function submitForm(page: Page) {
  const subscribeButton = await page.waitForSelector(
    "button ::-p-text(Subscribe)"
  );

  if (!subscribeButton) {
    throw new Error("Couldn't find the 2nd subscribe button");
  }

  await sleep(1000);
  await subscribeButton.click();
  await sleep(5000);
}

export async function subscribe(
  url: string,
  email: string,
  password: string,
  headless: false | "new" = "new"
) {
  const { browser, page } = await login(email, password, headless);

  console.log("Navigating to the API's page...");
  await navigateToAPIPage(url, page);

  console.log("Navigating to the subscription form...");
  await goToSubscriptionForm(page);

  console.log("Finalising subscription...");
  await submitForm(page);

  console.log("Successfully subscribed to the API");

  await page.close();
  await browser.close();
}
