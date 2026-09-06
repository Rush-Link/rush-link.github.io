# RushLink website

This directory is a dependency-free static GitHub Pages site.

## Contact form

The contact forms in `index.html` and `about.html` are temporarily disabled so the owner's email address is not exposed in visible links or form actions. Visitors can use the LinkedIn links beside the forms.

To enable submissions, use a dashboard-generated Formspree endpoint with an opaque form ID. Add that URL as the `action` on both forms, remove `aria-disabled` and the controls' `disabled` attributes, and restore the submit label and status copy. Never put the recipient's email address or a private API key in a public endpoint. Keep the standard HTML `POST` to support Formspree's managed reCAPTCHA flow.

The shared `contact.js` handles the message counter and submission state. It blocks submission when no endpoint is configured. `validate-site.mjs` checks that the unavailable forms stay disabled with and without JavaScript and that published site files contain no recipient email address.

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
