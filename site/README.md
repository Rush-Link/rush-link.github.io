# RushLink website

This directory is a dependency-free static GitHub Pages site.

## Contact form

`about.html` submits opportunity enquiries through a standard HTML `POST` to the configured Formspree endpoint. This is intentional: the form currently uses Formspree's managed reCAPTCHA flow, which rejects custom AJAX submissions unless reCAPTCHA is disabled or configured with a custom key. `about.js` adds a hand-off state while the browser opens Formspree's secure confirmation response.

No Formspree package, API key or build step is required. To change the destination, update the form `action` in `about.html`. The endpoint is public by design and must never contain a private API key.

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
