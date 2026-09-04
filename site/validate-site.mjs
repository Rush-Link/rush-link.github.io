import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const siteUrl = pathToFileURL(path.resolve("site/index.html")).href;
const browser = await chromium.launch({ headless: true });

async function validateViewport(name, viewport) {
  const page = await browser.newPage({ viewport });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto(siteUrl, { waitUntil: "load" });
  await page.waitForTimeout(350);

  assert.match(await page.title(), /RushLink/);
  assert.equal(await page.locator("h1").innerText(), "Shape tones.\nOwn the stage.");
  assert.equal(await page.locator("#tonepilot").count(), 1);
  assert.equal(await page.locator("#stagehand").count(), 1);
  assert.equal(await page.locator("#change-history").count(), 1);
  assert.equal(await page.locator("#support").count(), 1);
  assert.equal(await page.locator("#maker").count(), 1);
  assert.equal(await page.locator("#docs-tonepilot").count(), 1);
  assert.equal(await page.locator("#docs-stagehand").count(), 1);
  assert.equal(await page.locator("#docs-history").count(), 1);
  assert.equal(await page.locator('[aria-label="Animated RushLink application preview"]').count(), 1);
  assert.equal(await page.getByText("TONEPILOT · AUDITION WORKSPACE", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Prime family connected", { exact: true }).count(), 1);
  assert.equal(await page.getByText("14-slot rig editing", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Flex Prime · Prime · Core", { exact: true }).first().isVisible(), true);
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /Flex Prime, Prime and Core/);
  assert.equal(await page.getByText(/Prime and Core remain planned capability profiles/i).count(), 0);
  assert.equal(await page.getByText(/Flex Prime is the current physical contract target/i).count(), 0);
  assert.equal(await page.getByRole("heading", { name: /If RushLink earns a place in your setup/i }).count(), 1);
  assert.equal(await page.getByRole("heading", { name: /The editor I wanted did not exist/i }).count(), 1);
  assert.equal(await page.getByText("OPEN TO THE RIGHT OPPORTUNITY", { exact: true }).count(), 0);
  assert.equal(await page.locator(".maker-capabilities article").count(), 4);
  assert.equal(await page.getByText("95%+", { exact: true }).count(), 1);
  assert.equal(await page.getByText(/Completely optional\. Any amount helps/i).count(), 1);
  assert.equal(await page.locator(".support-share").getAttribute("href"), "about.html#contact");
  const supportLinks = page.locator('a[href="https://ko-fi.com/mattc_"]');
  assert.equal(await supportLinks.count(), 4);
  assert.deepEqual((await supportLinks.allTextContents()).map((label) => label.trim()), [
    "Buy me a coffee", "Buy me a coffee on Ko-fi", "Back the next release on Ko-fi", "Buy me a coffee",
  ]);
  for (const link of await supportLinks.all()) {
    assert.equal(await link.getAttribute("target"), "_blank");
    assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
  }
  assert.equal(await page.locator("[data-repository-link]").count(), 0);
  const releaseLinks = page.locator("[data-release-link]");
  assert.equal(await releaseLinks.count(), 5);
  assert.deepEqual(
    await releaseLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    Array(5).fill("https://github.com/rush-link/rush-link.github.io/releases"),
  );
  assert.equal(await page.locator('a[href="privacy.html"]').getAttribute("href"), "privacy.html");
  const hireLinks = page.locator('a[href="about.html"]');
  assert.equal(await hireLinks.count(), 3);
  assert.deepEqual(await hireLinks.allTextContents(), ["Hire Me!", "Hire Me!", "Hire Me!"]);
  assert.equal(await page.getByText(/About & work/i).count(), 0);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(horizontalOverflow <= 1, `${name} has ${horizontalOverflow}px horizontal overflow`);

  if (viewport.width <= 820) {
    await page.locator("[data-menu-button]").click();
    assert.equal(await page.locator("[data-mobile-menu]").getAttribute("class"), "mobile-nav open");
    await page.keyboard.press("Escape");
  } else {
    await page.locator('[data-demo-nav="stagehand"]').click({ force: true });
    assert.equal(await page.locator('[data-demo-nav="stagehand"]').getAttribute("aria-pressed"), "true");
    assert.ok(await page.locator('[data-demo-panel="stagehand"]').evaluate((element) => element.classList.contains("active")));
    await page.locator('[data-demo-tab="stagehand"]').click({ force: true });
    assert.ok(await page.locator('[data-demo-panel="stagehand"]').evaluate((element) => element.classList.contains("active")));
    await page.locator('[data-demo-tab="history"]').click({ force: true });
    assert.ok(await page.locator('[data-demo-panel="history"]').evaluate((element) => element.classList.contains("active")));
  }

  assert.deepEqual(runtimeErrors, [], `${name} runtime errors: ${runtimeErrors.join(" | ")}`);
  await page.close();
}

await validateViewport("desktop", { width: 1440, height: 1000 });
await validateViewport("compact desktop", { width: 1024, height: 900 });
await validateViewport("tablet", { width: 820, height: 1080 });
await validateViewport("phone", { width: 390, height: 844 });

async function validateAboutViewport(name, viewport) {
  const page = await browser.newPage({ viewport });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto(pathToFileURL(path.resolve("site/about.html")).href, { waitUntil: "load" });
  await page.waitForTimeout(350);

  assert.match(await page.title(), /Engineer & Product Designer/);
  assert.equal(await page.getByRole("heading", { name: /I build useful software/i }).count(), 1);
  assert.equal(await page.getByText("LOOKING FOR NEW OPPORTUNITIES", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Open Oct 2026", { exact: true }).count(), 0);
  assert.equal(((await page.locator("body").innerText()).match(/October/g) ?? []).length, 1);
  assert.equal(await page.locator(".experience-card").count(), 4);
  assert.deepEqual(await page.locator("main > section").evaluateAll((sections) => sections.map((section) => section.id)), [
    "story", "career", "work", "experience", "contact",
  ]);
  assert.equal(await page.locator(".career-entry").count(), 0, "the About page must not fall back to a job-by-job timeline");
  assert.equal(await page.getByRole("heading", { name: /I’ve followed the work that needed doing/i }).count(), 1);
  assert.equal(await page.locator(".career-story__copy p").count(), 3);
  assert.equal(await page.locator(".career-story__principles").count(), 0, "generic portfolio principles should stay removed");
  assert.equal(await page.locator(".career-story__closing").getByText(/not trying to force that experience into one perfect job title/i).count(), 1);
  assert.equal(await page.locator(".career-story").getByText(/cost 40% less to run/i).count(), 1);
  assert.match(await page.locator(".career-story").innerText(), /data security[\s\S]*AWS data engineering[\s\S]*network automation/i);
  assert.doesNotMatch(await page.locator(".career-story").innerText(), /OhChat · Full-time|Scopely · Full-time|Spot Ship · Full-time/);
  assert.equal(await page.getByRole("heading", { name: /I wanted a better HeadRush editor/i }).count(), 1);
  assert.doesNotMatch(await page.locator("body").innerText(), /OhChat|Scopely|Cload|Spot Ship|UK Car Park Management|Dropship Spy|D3R/);
  assert.doesNotMatch(await page.locator(".about-hero__copy").innerText(), /EC2|Cisco ISE|ServiceNow|data security/i);
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /experienced software engineer[\s\S]*creator of RushLink/i);
  assert.equal(await page.getByText("Hardware + software systems", { exact: true }).count(), 0);
  assert.equal(await page.locator('a[href="https://www.linkedin.com/in/matcygal"]').count(), 3);
  assert.equal(await page.locator('a[href="https://github.com/matcygal"]').count(), 4);
  assert.equal(await page.locator("[data-contact-form]").count(), 1);
  assert.equal(await page.locator("[data-contact-form]").getAttribute("action"), "https://formspree.io/f/xolpkjqm");
  assert.equal(await page.locator("[data-contact-form]").getAttribute("method"), "POST");
  assert.equal(await page.locator('[name="name"]').getAttribute("required"), "");
  assert.equal(await page.locator('[name="email"]').getAttribute("type"), "email");
  assert.equal(await page.locator('[name="message"]').getAttribute("maxlength"), "3000");

  if (name === "about desktop") {
    let submittedRequest;
    await page.route("https://formspree.io/f/xolpkjqm", async (route) => {
      const request = route.request();
      submittedRequest = {
        method: request.method(),
        fields: Object.fromEntries(new URLSearchParams(request.postData() ?? "")),
      };
      await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Form accepted</title><h1>Thanks</h1>" });
    });
    await page.locator('[name="name"]').fill("Test Person");
    await page.locator('[name="email"]').fill("test@example.com");
    await page.locator('[name="topic"]').selectOption({ label: "Permanent role" });
    await page.locator('[name="message"]').fill("I would like to discuss a product engineering opportunity.");
    await page.locator('[name="consent"]').check();
    await Promise.all([
      page.waitForURL("https://formspree.io/f/xolpkjqm"),
      page.locator("[data-contact-form] button[type=submit]").click(),
    ]);
    assert.equal(submittedRequest?.method, "POST");
    assert.equal(submittedRequest?.fields.email, "test@example.com");
    assert.equal(submittedRequest?.fields.topic, "Permanent role");
    assert.equal(submittedRequest?.fields.message, "I would like to discuss a product engineering opportunity.");
    assert.equal(await page.getByRole("heading", { name: "Thanks" }).count(), 1);
  }

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(horizontalOverflow <= 1, `${name} has ${horizontalOverflow}px horizontal overflow`);
  assert.deepEqual(runtimeErrors, [], `${name} runtime errors: ${runtimeErrors.join(" | ")}`);
  await page.close();
}

await validateAboutViewport("about desktop", { width: 1440, height: 1000 });
await validateAboutViewport("about tablet", { width: 820, height: 1080 });
await validateAboutViewport("about phone", { width: 390, height: 844 });

const statsPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await statsPage.route("https://api.github.com/repos/rush-link/rush-link.github.io/releases?per_page=100", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([
      {
        draft: false,
        tag_name: "rushlink-v0.1.0",
        assets: [{ download_count: 12 }, { download_count: 5 }],
      },
      {
        draft: true,
        tag_name: "rushlink-v0.2.0-draft",
        assets: [{ download_count: 999 }],
      },
    ]),
  });
});
await statsPage.goto(`${siteUrl}?stats=1`, { waitUntil: "load" });
assert.ok(await statsPage.locator("[data-release-stats]").isVisible());
await statsPage.waitForFunction(() => document.querySelector("[data-stat-downloads]")?.textContent === "17");
assert.equal(await statsPage.locator("[data-stat-repository]").innerText(), "rush-link/rush-link.github.io");
assert.equal(await statsPage.locator("[data-stat-downloads]").innerText(), "17");
assert.equal(await statsPage.locator("[data-stat-releases]").innerText(), "1");
assert.equal(await statsPage.locator("[data-stat-latest]").innerText(), "rushlink-v0.1.0");
await statsPage.close();

const privacyPage = await browser.newPage({ viewport: { width: 820, height: 1000 } });
await privacyPage.goto(pathToFileURL(path.resolve("site/privacy.html")).href, { waitUntil: "load" });
assert.equal(await privacyPage.getByRole("heading", { name: "Privacy, kept clear." }).count(), 1);
assert.match(await privacyPage.getByText(/not included in installers/i).innerText(), /not included in installers/i);
assert.match(await privacyPage.getByText(/website enquiries/i).innerText(), /website enquiries/i);
await privacyPage.close();

await browser.close();
console.log("RushLink website validation passed at desktop, tablet and phone sizes.");
