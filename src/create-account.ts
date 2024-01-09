import puppeteer, { Browser, Page } from "puppeteer";
import mailnesia from "mailnesia";
import { sleep } from "./utils";

enum ErrCA {
  SUB = "Couldn't find sign up button",
  SU = "Could not sign up",
  VC = "Couldn't get verification code",
  V = "Couldn't verify account",
}

async function openBrowser(headless: false | "new" = "new") {
  const browser = await puppeteer.launch({ headless });
  return browser;
}

async function openRapidAPISignUpPage(browser: Browser) {
  const pages = await browser.pages();
  const rapi = pages[0];
  await rapi.goto("https://rapidapi.com/auth/sign-up/");

  return rapi;
}

async function submitCredentials(
  rapi: Page,
  username: string,
  email: string,
  password: string
) {
  await rapi.locator("#signup-form_username").fill(`${username}`);
  await rapi.locator("#signup-form_email").fill(`${email}`);
  await rapi.locator("#signup-form_password").fill(`${password}`);

  const signUpButton = await rapi.waitForSelector(
    "button span ::-p-text(Sign Up)"
  );

  if (!signUpButton) {
    throw new Error(ErrCA.SUB);
  }

  let i = 0;
  const url = rapi.url();

  do {
    i++;
    await signUpButton.click();
    await sleep(10000);
  } while (rapi.url() === url && i < 5);

  if (rapi.url() === url) {
    throw new Error(ErrCA.SU);
  }
}

async function getVerificationCode(mailbox: string) {
  let i = 0;

  while (i < 5) {
    i++;
    await sleep(10000);

    const emails = await mailnesia.getInbox(mailbox);

    if (emails.length === 0) {
      continue;
    }

    const mozillaEmails = emails.filter((email) => {
      return (
        email.from.includes("support@rapidapi.com") &&
        email.subject.includes("Verification Code: ")
      );
    });

    if (mozillaEmails.length === 0) {
      continue;
    }

    const code = emails[0].subject.split(" ")[2];

    return code;
  }

  throw new Error(ErrCA.VC);
}

async function submitVerificationCode(rapi: Page, code: string) {
  await sleep(2000);
  await rapi.type('input[data-id="0"]', code);
}

async function ascertainSuccess(rapi: Page) {
  let i = 0;

  while (i < 3) {
    i++;
    await sleep(2000);
    if (rapi.url().includes("rapidapi.com/auth/onboarding-questions")) {
      return;
    }
  }

  throw new Error(ErrCA.V);
}

export async function createAccount(
  mailbox: string,
  username: string,
  email: string,
  password: string,
  headless: false | "new" = "new"
) {
  console.log("Starting headless puppeteer browser...");
  const browser = await openBrowser(headless);

  console.log("Navigating to RapidAPI...");
  const rapi = await openRapidAPISignUpPage(browser);

  console.log("Submitting sign up form...");
  await submitCredentials(rapi, username, email, password);

  console.log("Fetching verification code from mailbox...");
  const code = await getVerificationCode(mailbox);

  console.log("Submitting verification code...");
  await submitVerificationCode(rapi, code);

  console.log("Ascertaining success...");
  await ascertainSuccess(rapi);

  console.log("Account successfully created");

  await rapi.close();
  await browser.close();
}
