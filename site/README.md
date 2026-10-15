# RushLink by Cygma Audio website

This directory is the canonical static [RushLink website](https://rush-link.github.io/),
maintained in [rush-link/rush-link.github.io](https://github.com/rush-link/rush-link.github.io).
It has no production build step. The open-source application is maintained in
[Rush-Link/RushLink-App](https://github.com/Rush-Link/RushLink-App). Its
[contribution guide](https://github.com/Rush-Link/RushLink-App/blob/main/CONTRIBUTING.md)
covers application development; website files, contact forms and deployment
configuration are maintained only here.

## Brand assets

RushLink keeps its original stacked RUSH/LINK icon, cyan/blue/violet palette,
typography and layout. A small, thin “by Cygma Audio” credit sits underneath
the original logo, including in the header. `brand.css` only handles that credit
and logo sizing; `styles.css` retains the original presentation.

Deployed artwork is included in `assets/`; the SVG logos contain outlines.
Preserve the existing marks and maker credit when changing artwork. The
application's [third-party notices](https://github.com/Rush-Link/RushLink-App/blob/main/THIRD_PARTY_NOTICES.md)
document its runtime fonts and dependencies. No external brand-kit checkout is
required to preview or contribute to this site.

## Colour modes

The header's colour-theme control offers **System**, **Dark** and **Light** on
both the product and About pages; Privacy has the same control beside its back
link. Dark preserves the original first-visit appearance. System follows
`prefers-color-scheme`, including changes while the page is open. A choice
persists in this browser under `rushlink-site-color-mode` and applies across
page navigation and reloads.

`theme.js` resolves the choice before styles load. `themes.css` adds light surfaces,
contrasting text and controls while preserving RushLink's colour identity and
its existing dark product illustrations. The original dark theme remains the
fallback when JavaScript is unavailable. The choice still works for the current
page if browser storage is blocked. Logo variants follow the resolved theme.
Theme selection does not make network requests.

In light mode, supporting icons, list numbers and helper text sit directly on
their containing card. Inputs, primary actions, semantic badges and the product
illustrations keep their own surfaces and boundaries.

The site validator checks first-visit dark mode, saved choices, cross-page
navigation and live system-theme changes. It also measures text, placeholders
and key interface glyphs against their computed panel surfaces in both modes.

## Contact form

The contact forms in `index.html` and `about.html` submit to `https://formspree.io/f/mdeolqgb` using a standard HTML `POST`, which lets Formspree handle any managed reCAPTCHA check. The recipient's email address is not published in visible links or form actions. LinkedIn remains available beside the forms.

To change the destination, update the form `action` on both pages and the endpoint in `validate-site.mjs`. Use a dashboard-generated Formspree form ID; never include the recipient's email address or a private API key in a public endpoint.

The shared `contact.js` handles the message counter and submission state, blocks submission when no endpoint is configured, and restores controls after returning using Back. `validate-site.mjs` checks validation and native POST submissions with and without JavaScript and checks that published site files contain no recipient email address. Submissions are intercepted locally, so these checks do not send messages or verify email delivery.

## Preview locally

Serve `site/` with any static HTTP server, then open its local URL. A browser can also open `index.html` directly for a quick visual check.

For example, from the repository root:

```sh
python -m http.server 8080 --directory site
```

Before opening a pull request, check desktop and phone layouts in Dark and Light
modes and confirm that navigation and form validation still work. The browser
validator uses Playwright. With Node.js 22.12 or newer installed, prepare its
locked development dependencies and run it from the repository root:

```sh
npm ci
npx playwright install chromium
npm run test:site
```

The validator intercepts contact submissions locally; it does not send enquiries.
Do not submit the live forms while testing. Keep local `node_modules/` and test
output out of pull requests.

## Deployment

The workflow at `.github/workflows/pages.yml` publishes this directory whenever `site/` changes on `main` or `master`. In repository settings, select **GitHub Actions** as the Pages source.

Repository and release links are explicitly configured with `data-repository="rush-link/rush-link.github.io"` on the `<html>` element in `index.html` and `about.html`. Update both values if the public distribution repository ever moves.

Application source and contribution links point directly to
`https://github.com/Rush-Link/RushLink-App`, independently of the installer catalog.
The homepage's **Contribute** section links to the source, contribution guide
and issues, and explains how to help with reports, documentation, code and
hardware verification. Keep these links pointed at the application repository.

The homepage identifies **HeadRush firmware 5.2.0** as the compatibility target
for **RushLink 0.1.3**, and links to the application release notes. These are
separate version numbers. Physical verification covers Flex Prime; Prime and
Core remain unverified on hardware. Download links continue to use the release
catalog configured above, so firmware copy does not change the destination or
claim that a pending build has already been published.

For a newly created repository, enable **Settings → Pages → GitHub Actions** before the first deployment. If the initial push happened earlier, rerun **Deploy RushLink website** once after enabling Pages.

## Download totals

Open the deployed website with `?stats=1`, for example:

```text
https://rush-link.github.io/?stats=1
```

The hidden panel totals `download_count` across public GitHub Release assets. It loads only for that URL and does not track visitors, set cookies, or send analytics. Downloads from untracked external mirrors are not included.

## License

Website code and documentation use the repository's [MIT License](../LICENSE).
Preserve applicable third-party licenses and notices when redistributing assets.
