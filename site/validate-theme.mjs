import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

async function validateContrast(page, file, mode) {
  const contrast = await page.locator(".hero-lead, .download-card>p, .download-release-notes a, .doc-article p, .docs-nav>a, .support-copy>p, .workflow h3, .workflow p, .doc-number, .feature-list li>span, .contact-form label>span:first-child, .contact-form input:not([type=checkbox]), .contact-form select, .contact-form textarea, .footer-meta p, .footer-meta>small, .about-hero__copy>p, .privacy-page>p, .app-window small, .app-window .mock-heading b, .stage-preview-status>span, .history-preview__footer>span, .visual-console small, .visual-console b, .tone-avatar, .cover, .shortcut-grid small, .hero-trust svg, .step-icon svg, .bento-icon svg, .experience-card>svg, .contact-direct svg, .theme-control>svg, .mock-sidebar button svg").evaluateAll((elements) => {
    const luminance = (rgb) => rgb.map((channel) => channel / 255).map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
    const parse = (color) => (color.match(/[\d.]+/g) ?? []).map(Number);
    const blend = (over, under) => over.slice(0, 3).map((value, index) => value * (over[3] ?? 1) + under[index] * (1 - (over[3] ?? 1)));
    const surface = (element) => {
      const chain = [];
      for (let current = element; current; current = current.parentElement) chain.unshift(current);
      let background = [5, 8, 13];
      for (const current of chain) {
        const style = getComputedStyle(current);
        background = blend(parse(style.backgroundColor), background);
        const colors = style.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (colors?.length) background = blend(parse(colors[colors.length - 1]), background);
      }
      return background;
    };
    return elements.flatMap((element) => {
      const backgroundRgb = surface(element);
      const background = luminance(backgroundRgb);
      const glyph = element instanceof SVGElement;
      const measure = (color, text) => {
        const foreground = luminance(blend(parse(color), backgroundRgb));
        return { text: text.slice(0, 60) || element.outerHTML.slice(0, 60), minimum: glyph ? 3 : 4.5, ratio: (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05) };
      };
      const entries = [measure(glyph ? getComputedStyle(element).stroke : getComputedStyle(element).color, element.textContent)];
      if (element.placeholder) entries.push(measure(getComputedStyle(element, "::placeholder").color, element.placeholder));
      return entries;
    });
  });
  for (const entry of contrast) assert.ok(entry.ratio >= entry.minimum, `${file} ${mode}: ${entry.text} has only ${entry.ratio.toFixed(2)}:1 contrast`);
}

export async function validateThemes(browser) {
  const directory = path.resolve("site");
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png" };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const filename = path.resolve(directory, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!filename.startsWith(`${directory}${path.sep}`)) throw new Error("Invalid path");
      const content = await readFile(filename);
      response.writeHead(200, { "Content-Type": types[path.extname(filename)] ?? "application/octet-stream" });
      response.end(content);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const context = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(baseUrl, { waitUntil: "load" });
    const choice = () => page.getByRole("combobox", { name: "Colour theme", exact: true });
    assert.equal(await choice().inputValue(), "dark");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "a first visit retains RushLink's dark presentation even on a light OS");
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim()), "#63e9e7", "dark mode must retain RushLink's cyan identity");
    await page.evaluate(() => localStorage.setItem("rushlink-site-color-mode", "invalid"));
    await page.reload({ waitUntil: "load" });
    assert.equal(await choice().inputValue(), "dark", "an invalid saved preference falls back to dark");

    await choice().selectOption("light");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    await page.reload({ waitUntil: "load" });
    assert.equal(await choice().inputValue(), "light", "an explicit choice survives reload");
    assert.equal(await page.evaluate(() => localStorage.getItem("rushlink-site-color-mode")), "light");

    for (const file of ["about.html", "privacy.html", "index.html"]) {
      await page.goto(`${baseUrl}/${file}`, { waitUntil: "load" });
      assert.equal(await choice().inputValue(), "light", `${file}: preference follows page navigation`);
      assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), "light");
      assert.equal(await page.locator('meta[name="theme-color"]').getAttribute("content"), "#f4f8fc");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${file}: light mode has no phone overflow`);
      assert.deepEqual(await page.locator("img").evaluateAll((images) => images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src)), [], `${file}: light assets load`);
      const logoSrc = await page.locator("img[data-theme-light]").first().getAttribute("src");
      assert.ok(logoSrc?.endsWith("-light.svg"), `${file}: the logo follows light mode`);

      await validateContrast(page, file, "light");
      await choice().selectOption("dark");
      await page.waitForTimeout(50);
      await validateContrast(page, file, "dark");
      await choice().selectOption("light");
    }

    await choice().selectOption("dark");
    await page.emulateMedia({ colorScheme: "light" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "an explicit choice takes priority over the OS");
    await choice().selectOption("system");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await page.reload({ waitUntil: "load" });
    assert.equal(await choice().inputValue(), "system");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "system mode follows changes and survives reload");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
