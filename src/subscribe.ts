import { PuppeteerLaunchOptions } from "puppeteer";
import { login } from "./login";
import { sleep } from "./sleep";

export async function subscribe(
  email: string,
  password: string,
  pricingUrl: string,
  options: PuppeteerLaunchOptions = { headless: "new" }
) {
  const { page, browser } = await login(email, password, options);

  try {
    await page.goto(pricingUrl);

    const free = await page.waitForSelector("h2 ::-p-text($0.00)");
    if (!free) throw new Error("Couldn't find a free plan");

    const fsButton = await page.waitForSelector("button ::-p-text(Subscribe)");
    if (!fsButton) throw new Error("Couldn't find subscribe button");
    await fsButton.click();

    let acButton;
    try {
      acButton = await page.waitForSelector("button ::-p-text(Add Card >)", {
        timeout: 2000,
      });
    } catch (error) {}
    if (acButton) throw new Error("Subscription requires a credit card");

    const ssButton = await page.waitForSelector("button ::-p-text(Subscribe)");
    if (!ssButton) throw new Error("Couldn't find the second subscribe button");

    await sleep(2000);
    await ssButton.click();

    const hs = await page.waitForSelector(
      "h2 ::-p-text(Subscription Created Successfully)"
    );
    if (!hs) throw new Error("Couldn't subscribe to API");

    await page.close();
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}
