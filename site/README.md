# RushLink website

This directory is a dependency-free static GitHub Pages site.

## Contact form

`index.html` and `about.html` submit enquiries through a standard HTML `POST` to the configured Formspree endpoint. Native submission lets Formspree handle any managed reCAPTCHA check. The shared `contact.js` provides the message counter and a hand-off state while the browser opens Formspree, and restores the controls when a visitor returns using Back.

No Formspree package, API key or build step is required. To change the destination, update the form `action` in both `index.html` and `about.html`, plus the endpoint in `validate-site.mjs`. The endpoint is public by design and must never contain a private API key.

Both forms use the owner-supplied endpoint `https://formspree.io/f/matcygal@gmail.com`. Delivery has not been verified. Formspree's current documentation calls for a dashboard-generated form ID rather than an email address in the URL: https://help.formspree.io/articles/troubleshooting/phasing-out-legacy-forms-email-urls/. If the supplied endpoint shows a setup error, replace it in both pages with the active endpoint from the form's Integration tab. Direct email links are also available beside both forms.

`validate-site.mjs` checks browser validation and intercepts form submissions locally; it does not send messages or prove Formspree delivery.

## Preview locally

Serve `site/` with any static HTTP server, then open its local URL. A browser can also open `index.html` directly for a quick visual check.

## Deployment

The workflow at `.github/workflows/pages.yml` publishes this directory whenever `site/` changes on `main` or `master`. In repository settings, select **GitHub Actions** as the Pages source.

Repository and release links are explicitly configured with `data-repository="rush-link/rush-link.github.io"` on the `<html>` element in `index.html` and `about.html`. Update both values if the public distribution repository ever moves.

For a newly created repository, enable **Settings → Pages → GitHub Actions** before the first deployment. If the initial push happened earlier, rerun **Deploy RushLink website** once after enabling Pages.

## Download totals

Open the deployed website with `?stats=1`, for example:

```text
https://rush-link.github.io/?stats=1
```

The hidden panel totals `download_count` across public GitHub Release assets. It loads only for that URL and does not track visitors, set cookies, or send analytics. Downloads from untracked external mirrors are not included.
