const contactForm = document.querySelector("[data-contact-form]");
const messageField = contactForm?.elements.namedItem("message");
const messageCount = document.querySelector("[data-message-count]");
const contactStatus = document.querySelector("[data-contact-status]");
const submitButton = contactForm?.querySelector('button[type="submit"]');
const submitLabel = contactForm?.querySelector("[data-submit-label]");
const defaultSubmitLabel = submitLabel?.textContent;

function updateMessageCount() {
  if (messageField instanceof HTMLTextAreaElement && messageCount) {
    messageCount.textContent = String(messageField.value.length);
  }
}

messageField?.addEventListener("input", updateMessageCount);
updateMessageCount();

// Use the browser's native POST so Formspree can handle any managed reCAPTCHA.
contactForm?.addEventListener("submit", (event) => {
  if (!contactForm.getAttribute("action")) {
    event.preventDefault();
    return;
  }
  submitButton?.setAttribute("disabled", "");
  contactForm.setAttribute("aria-busy", "true");
  if (submitLabel) submitLabel.textContent = "Opening secure form…";
  if (contactStatus) {
    contactStatus.hidden = false;
  }
});

// Restore the form when a visitor returns from Formspree using Back.
window.addEventListener("pageshow", () => {
  if (!contactForm?.getAttribute("action")) return;
  submitButton?.removeAttribute("disabled");
  contactForm?.removeAttribute("aria-busy");
  if (submitLabel) submitLabel.textContent = defaultSubmitLabel;
  if (contactStatus) contactStatus.hidden = true;
  updateMessageCount();
});
