const contactForm = document.querySelector("[data-contact-form]");
const messageField = contactForm?.elements.namedItem("message");
const messageCount = document.querySelector("[data-message-count]");
const contactStatus = document.querySelector("[data-contact-status]");

function updateMessageCount() {
  if (messageField instanceof HTMLTextAreaElement && messageCount) {
    messageCount.textContent = String(messageField.value.length);
  }
}

messageField?.addEventListener("input", updateMessageCount);
updateMessageCount();

// Use the browser's native POST so Formspree can run its managed reCAPTCHA
// flow. The endpoint rejects custom AJAX unless a custom captcha key is set.
contactForm?.addEventListener("submit", () => {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const submitLabel = contactForm.querySelector("[data-submit-label]");
  submitButton?.setAttribute("disabled", "");
  contactForm.setAttribute("aria-busy", "true");
  if (submitLabel) submitLabel.textContent = "Opening secure form…";
  if (contactStatus) {
    contactStatus.hidden = false;
    contactStatus.className = "contact-form__status success";
  }
});
