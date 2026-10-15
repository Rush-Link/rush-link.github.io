import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const siteUrl = pathToFileURL(path.resolve("site/index.html")).href;
const browser = await chromium.launch({ headless: true });

async function validateBrand(page) {
  await page.evaluate(() => document.fonts.ready);
  assert.match(await page.title(), /RushLink by Cygma Audio/);
  assert.equal(await page.locator('meta[name="theme-color"]').getAttribute("content"), "#070b11");
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /RushLink by Cygma Audio/);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()), "#05080d");
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim()), "#63e9e7");
  assert.deepEqual(await page.locator("img").evaluateAll((images) => images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src)), [], "all brand and preview images should load");
  const headerBrand = page.getByRole("link", { name: "RushLink by Cygma Audio home", exact: true });
  if (await headerBrand.count()) {
    assert.equal(await headerBrand.locator("small").innerText(), "by Cygma Audio");
    assert.equal(await headerBrand.locator("small").isVisible(), true);
    assert.ok(await headerBrand.locator("small").evaluate((element) => parseFloat(getComputedStyle(element).fontSize) >= 12), "the company credit must remain readable");
    assert.ok(await headerBrand.locator("small").evaluate((element) => parseFloat(getComputedStyle(element).fontWeight) <= 400), "the maker credit should stay delicate");
    assert.equal(await headerBrand.innerText(), "by Cygma Audio", "the original logo should not have a repeated RushLink wordmark beside it");
    const mark = await headerBrand.locator("img").boundingBox();
    const caption = await headerBrand.locator("small").boundingBox();
    assert.ok(caption.y >= mark.y + mark.height - 1, "the maker credit belongs underneath the mark");
    assert.equal(await page.locator(".footer-brand img").getAttribute("alt"), "RushLink by Cygma Audio");
    assert.match(await page.locator(".footer-meta").innerText(), /Cygma Audio/);
  }
}

async function validateOpenSourceHero(page, viewport, mode) {
  const hero = page.locator(".hero-copy");
  assert.match(await hero.locator(".hero-lead").innerText(), /free, open-source HeadRush companion/);
  assert.match(await hero.locator(".hero-kicker").innerText(), /For HeadRush firmware 5\.2\.0/i);
  const firmwareTarget = await hero.locator(".hero-kicker").boundingBox();
  assert.ok(firmwareTarget && firmwareTarget.x >= 0
    && firmwareTarget.x + firmwareTarget.width <= viewport.width + 1,
  `${mode}: the firmware target fits in the ${viewport.width}px hero`);
  const links = [
    ["Free & open source", "https://github.com/Rush-Link/RushLink-App"],
    ["MIT License", "https://github.com/Rush-Link/RushLink-App/blob/main/LICENSE"],
  ];
  for (const [label, href] of links) {
    const link = hero.getByRole("link", { name: label, exact: true });
    assert.equal(await link.getAttribute("href"), href);
    assert.equal(await link.isVisible(), true, `${mode}: ${label} is visible in the hero`);
    const box = await link.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= viewport.width + 1
      && box.y >= 0 && box.y + box.height <= viewport.height + 1,
    `${mode}: ${label} fits in the initial ${viewport.width}px viewport`);
  }
}

async function validateViewport(name, viewport) {
  const page = await browser.newPage({ colorScheme: "dark", viewport });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto(siteUrl, { waitUntil: "load" });
  await page.waitForTimeout(350);
  await validateBrand(page);
  await validateOpenSourceHero(page, viewport, "dark");
  const theme = page.getByRole("combobox", { name: "Colour theme", exact: true });
  await theme.selectOption("light");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await validateOpenSourceHero(page, viewport, "light");
  await theme.selectOption("dark");

  assert.match(await page.title(), /RushLink/);
  assert.equal(await page.locator("h1").innerText(), "Shape tones.\nOwn the stage.");
  assert.equal(await page.locator("#tonemod").count(), 1);
  assert.equal(await page.locator("#stagehand").count(), 1);
  assert.equal(await page.locator("#change-history").count(), 1);
  assert.equal(await page.locator("#support").count(), 1);
  assert.equal(await page.locator("#maker").count(), 1);
  assert.equal(await page.locator("main > section").last().getAttribute("id"), "contact");
  assert.equal(await page.locator("#contact [data-contact-form]").count(), 1);
  assert.equal(await page.locator("#docs-tonemod").count(), 1);
  assert.equal(await page.locator("#docs-stagehand").count(), 1);
  assert.equal(await page.locator("#docs-history").count(), 1);
  assert.equal(await page.locator('[aria-label="Animated RushLink application preview"]').count(), 1);
  assert.equal(await page.getByText("TONEMOD · AUDITION WORKSPACE", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Prime family connected", { exact: true }).count(), 1);
  assert.equal(await page.getByText("14-slot rig editing", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Flex Prime · Prime · Core", { exact: true }).first().isVisible(), true);
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /targeting firmware 5\.2\.0[\s\S]*Flex Prime[\s\S]*Prime and Core still need physical verification/);
  assert.match(await page.locator("#download").innerText(), /RushLink 0\.1\.3 targets HeadRush firmware 5\.2\.0/);
  assert.match(await page.locator("#download").innerText(), /Prime and Core still need physical verification/);
  assert.equal(await page.locator(".download-release-notes a").getAttribute("href"), "https://github.com/Rush-Link/RushLink-App/blob/main/docs/releases/0.1.3.md");
  assert.equal(await page.getByText(/Prime and Core remain planned capability profiles/i).count(), 0);
  assert.equal(await page.getByText(/Flex Prime is the current physical contract target/i).count(), 0);
  assert.equal(await page.getByRole("heading", { name: /If RushLink earns a place in your setup/i }).count(), 1);
  assert.equal(await page.getByRole("heading", { name: /The editor I wanted did not exist/i }).count(), 1);
  assert.equal(await page.getByText("OPEN TO THE RIGHT OPPORTUNITY", { exact: true }).count(), 0);
  assert.equal(await page.locator(".maker-capabilities article").count(), 4);
  const testEvidence = page.locator(".maker-evidence > span").first();
  assert.equal(await testEvidence.locator("b").innerText(), "Tests");
  assert.equal(await testEvidence.locator("small").textContent(), "and coverage gates");
  assert.equal(await page.getByText(/Completely optional\. Any amount helps/i).count(), 1);
  assert.equal(await page.locator(".support-share").getAttribute("href"), "#contact");
  const supportLinks = page.locator('a[href="https://ko-fi.com/mattc_"]');
  assert.equal(await supportLinks.count(), 8);
  assert.deepEqual((await supportLinks.allTextContents()).map((label) => label.trim()), [
    "Buy me a coffee", "Buy me a coffee on Ko-fi", "Help RushLink grow on Ko-fi",
    "Buy me a coffee on Ko-fi", "Back the next release on Ko-fi", "Support RushLink on Ko-fi",
    "Ko-fiBuy me a coffee", "Buy me a coffee",
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
    await page.locator("[data-menu-button]").click();
    await page.setViewportSize({ width: Math.max(821, viewport.height), height: viewport.width });
    await page.waitForFunction(() => !document.body.classList.contains("menu-open"));
    assert.notEqual(await page.locator("body").evaluate((element) => getComputedStyle(element).overflow), "hidden");
    await page.setViewportSize(viewport);
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
await validateViewport("small phone", { width: 320, height: 800 });

async function validateAboutViewport(name, viewport) {
  const page = await browser.newPage({ colorScheme: "dark", viewport });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto(pathToFileURL(path.resolve("site/about.html")).href, { waitUntil: "load" });
  await page.waitForTimeout(350);
  await validateBrand(page);

  assert.match(await page.title(), /Engineer & Product Designer/);
  assert.equal(await page.getByRole("heading", { name: /I build useful software/i }).count(), 1);
  assert.equal(await page.getByText("LOOKING FOR NEW OPPORTUNITIES", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Open Oct 2026", { exact: true }).count(), 0);
  assert.doesNotMatch(await page.locator(".about-hero").innerText(), /September|October|network automation|\u2014/i);
  assert.match(await page.locator(".about-hero__open").innerText(), /current role is wrapping up soon/);
  assert.equal(await page.locator('a[href="https://ko-fi.com/mattc_"]').count(), 2);
  assert.equal(await page.locator(".experience-card").count(), 4);
  assert.deepEqual(await page.locator("main > section").evaluateAll((sections) => sections.map((section) => section.id)), [
    "story", "career", "work", "experience", "contact",
  ]);
  assert.equal(await page.locator(".career-entry").count(), 0, "the About page must not fall back to a job-by-job timeline");
  assert.equal(await page.getByRole("heading", { name: /I’ve followed the work that needed doing/i }).count(), 1);
  assert.equal(await page.locator(".career-story__copy p").count(), 3);
  assert.equal(await page.locator(".career-story__principles").count(), 0, "generic portfolio principles should stay removed");
  assert.equal(await page.locator(".career-story__closing").getByText(/not trying to force that experience into one perfect job title/i).count(), 1);
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
  assert.equal(await page.locator("[data-contact-form]").getAttribute("action"), "https://formspree.io/f/mdeolqgb");
  assert.equal(await page.locator("[data-contact-form]").getAttribute("method"), "POST");
  assert.equal(await page.locator('[name="name"]').getAttribute("required"), "");
  assert.equal(await page.locator('[name="email"]').getAttribute("type"), "email");
  assert.equal(await page.locator('[name="message"]').getAttribute("maxlength"), "3000");


  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(horizontalOverflow <= 1, `${name} has ${horizontalOverflow}px horizontal overflow`);
  assert.deepEqual(runtimeErrors, [], `${name} runtime errors: ${runtimeErrors.join(" | ")}`);
  await page.close();
}

await validateAboutViewport("about desktop", { width: 1440, height: 1000 });
await validateAboutViewport("about tablet", { width: 820, height: 1080 });
await validateAboutViewport("about phone", { width: 390, height: 844 });

// Check every published text file, including documentation and this script.
for (const file of readdirSync("site", { recursive: true })) {
  if (!/\.(?:html|js|mjs|md|css|txt)$/.test(file)) continue;
  const source = readFileSync(path.join("site", file), "utf8");
  assert.doesNotMatch(source, /[a-z0-9._%+-]+@gmail\.com/i, `${file}: recipient email must not be published`);
  assert.doesNotMatch(source, /href=["']mailto:/i, `${file}: direct email links must not be published`);
}

// Intercept the native POST so validation never sends an actual enquiry.
async function validateContactSubmission(file, topic, source, javaScriptEnabled) {
  const page = await browser.newPage({ colorScheme: "dark", viewport: { width: 1440, height: 1000 }, javaScriptEnabled });
  const endpoint = "https://formspree.io/f/mdeolqgb";
  const submissions = [];
  await page.route(endpoint, async (route) => {
    const request = route.request();
    submissions.push({
      method: request.method(),
      fields: Object.fromEntries(new URLSearchParams(request.postData() ?? "")),
    });
    await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Form accepted</title><h1>Thanks</h1>" });
  });
  await page.goto(pathToFileURL(path.resolve(`site/${file}`)).href, { waitUntil: "load" });
  const form = page.locator("[data-contact-form]");
  assert.equal(await form.getAttribute("action"), endpoint);
  assert.equal(await form.getAttribute("method"), "POST");
  await form.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".contact-shell")).opacity === "1");
  await form.locator('button[type="submit"]').click();
  assert.equal(submissions.length, 0, `${file}: empty form must not submit`);
  await form.locator('[name="name"]').fill("Test Person");
  await form.locator('[name="email"]').fill("invalid-email");
  await form.locator('[name="topic"]').selectOption({ label: topic });
  const message = "I would like to discuss a RushLink improvement.";
  await form.locator('[name="message"]').fill(message);
  await form.locator('[name="consent"]').check();
  await form.locator('button[type="submit"]').click();
  assert.equal(submissions.length, 0, `${file}: invalid email must not submit`);
  await form.locator('[name="email"]').fill("test@example.com");
  await form.locator('[name="consent"]').uncheck();
  await form.locator('button[type="submit"]').click();
  assert.equal(submissions.length, 0, `${file}: consent is required`);
  await form.locator('[name="consent"]').check();
  if (javaScriptEnabled) {
    assert.equal(await form.locator("[data-message-count]").innerText(), String(message.length));
  }
  await Promise.all([
    page.waitForURL(endpoint),
    form.locator('button[type="submit"]').click(),
  ]);
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].method, "POST");
  assert.equal(submissions[0].fields.name, "Test Person");
  assert.equal(submissions[0].fields.email, "test@example.com");
  assert.equal(submissions[0].fields.topic, topic);
  assert.equal(submissions[0].fields.message, message);
  assert.equal(submissions[0].fields.source, source);
  assert.equal(submissions[0].fields.consent, "on");
  assert.equal(submissions[0].fields._gotcha, "");
  assert.equal(await page.getByRole("heading", { name: "Thanks" }).count(), 1);
  await page.goBack({ waitUntil: "load" });
  assert.equal(await form.locator('button[type="submit"]').isEnabled(), true);
  assert.equal(await form.locator("[data-submit-label]").innerText(), "Send enquiry");
  assert.equal(await form.getAttribute("aria-busy"), null);
  assert.equal(await form.locator("[data-contact-status]").isHidden(), true);
  await page.close();
}

for (const javaScriptEnabled of [true, false]) {
  await validateContactSubmission("index.html", "Bug report", "RushLink homepage", javaScriptEnabled);
  await validateContactSubmission("about.html", "Permanent role", "RushLink Hire Me page", javaScriptEnabled);
}

const statsPage = await browser.newPage({ colorScheme: "dark", viewport: { width: 1280, height: 900 } });
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

const privacyPage = await browser.newPage({ colorScheme: "dark", viewport: { width: 820, height: 1000 } });
await privacyPage.goto(pathToFileURL(path.resolve("site/privacy.html")).href, { waitUntil: "load" });
await validateBrand(privacyPage);
assert.equal(await privacyPage.getByRole("heading", { name: "Privacy, kept clear." }).count(), 1);
assert.match(await privacyPage.getByText(/not included in installers/i).innerText(), /not included in installers/i);
assert.match(await privacyPage.getByText(/website enquiries/i).innerText(), /website enquiries/i);
await privacyPage.close();

const { validateThemes } = await import(pathToFileURL(path.resolve("site/validate-theme.mjs")).href);
await validateThemes(browser);
await browser.close();
console.log("RushLink by Cygma Audio website validation passed at desktop, tablet and phone sizes.");
