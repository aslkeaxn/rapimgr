import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";
import { sleep } from "./sleep";

export async function login(
  email: string,
  password: string,
  options: PuppeteerLaunchOptions = { headless: "new" }
) {
  const browser = await puppeteer.launch(options);

  try {
    const pages = await browser.pages();
    const page = pages[0];

    await page.goto("https://rapidapi.com/auth/login");

    await page.locator("#login-form_email").fill(email);
    await page.locator("#login-form_password").fill(password);

    const siButton = await page.waitForSelector("button ::-p-text(Sign In)");
    if (!siButton) throw new Error("Couldn't find sign in button");

    let i = 0;
    const url = page.url();
    while (i < 10 && page.url() === url) {
      i++;
      await siButton.click();
      await sleep(5000);
    }

    if (page.url() === url) throw new Error("Couldn't sign in");

    return { browser, page };
  } catch (error: any) {
    await browser.close();
    throw new Error(error);
  }
}
