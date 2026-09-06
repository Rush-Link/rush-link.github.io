# RushLink website

This directory is a dependency-free static GitHub Pages site.

## Contact form

The contact forms in `index.html` and `about.html` submit to `https://formspree.io/f/mdeolqgb` using a standard HTML `POST`, which lets Formspree handle any managed reCAPTCHA check. The recipient's email address is not published in visible links or form actions. LinkedIn remains available beside the forms.

To change the destination, update the form `action` on both pages and the endpoint in `validate-site.mjs`. Use a dashboard-generated Formspree form ID; never include the recipient's email address or a private API key in a public endpoint.

The shared `contact.js` handles the message counter and submission state, blocks submission when no endpoint is configured, and restores controls after returning using Back. `validate-site.mjs` checks validation and native POST submissions with and without JavaScript and checks that published site files contain no recipient email address. Submissions are intercepted locally, so these checks do not send messages or verify email delivery.

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
