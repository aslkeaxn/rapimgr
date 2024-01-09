import puppeteer, { Browser, Page } from "puppeteer";
import { sleep } from "./utils";

enum ErrL {
  SIB = "Couldn't find sign in button",
  SI = "Couldn't sign in",
}

async function openBrowser(headless: false | "new" = "new") {
  const browser = await puppeteer.launch({ headless });
  return browser;
}

async function openRapidAPISignInPage(browser: Browser) {
  const pages = await browser.pages();
  const page = pages[0];
  await page.goto("https://rapidapi.com/auth/login");

  return page;
}

async function submitCredentials(page: Page, email: string, password: string) {
  await page.locator("#login-form_email").fill(`${email}`);
  await page.locator("#login-form_password").fill(`${password}`);

  await sleep(1000);

  const signInButton = await page.waitForSelector(
    "button span ::-p-text(Sign In)"
  );

  if (!signInButton) {
    throw new Error(ErrL.SIB);
  }

  let i = 0;
  const url = page.url();

  do {
    i++;
    await signInButton.click();
    await sleep(10000);
  } while (page.url() === url && i < 5);

  if (page.url() === url) {
    throw new Error(ErrL.SI);
  }

  return page;
}

export async function login(
  email: string,
  password: string,
  headless: false | "new" = "new"
) {
  console.log("Starting headless puppeteer browser...");
  const browser = await openBrowser(headless);

  console.log("Navigating to RapidAPI...");
  let page = await openRapidAPISignInPage(browser);

  console.log("Submitting sign in form...");
  page = await submitCredentials(page, email, password);

  console.log("Successfully logged in");

  return { browser, page };
}
