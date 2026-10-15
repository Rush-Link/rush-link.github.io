(() => {
  const root = document.documentElement;
  const storageKey = "rushlink-site-color-mode";
  const system = window.matchMedia("(prefers-color-scheme: light)");
  const validMode = (mode) => ["dark", "light", "system"].includes(mode) ? mode : "dark";
  let preference = "dark";
  try { preference = validMode(localStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }

  function applyTheme() {
    const theme = preference === "system" ? (system.matches ? "light" : "dark") : preference;
    root.dataset.colorMode = preference;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4f8fc" : "#070b11");
    document.querySelectorAll("[data-theme-select]").forEach((select) => {
      select.value = preference;
      select.title = `Colour theme: ${preference}${preference === "system" ? ` (${theme})` : ""}`;
    });
    document.querySelectorAll("[data-theme-dark][data-theme-light]").forEach((element) => {
      element.setAttribute(element.tagName === "SOURCE" ? "srcset" : "src", element.dataset[theme === "light" ? "themeLight" : "themeDark"]);
    });
  }

  // Resolve the preference before styles paint, including on navigation and reload.
  applyTheme();
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.querySelectorAll("[data-theme-select]").forEach((select) => {
      select.addEventListener("change", () => {
        preference = validMode(select.value);
        try { localStorage.setItem(storageKey, preference); } catch { /* The choice still works for this page. */ }
        applyTheme();
      });
    });
  });
  system.addEventListener("change", () => { if (preference === "system") applyTheme(); });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      preference = validMode(event.newValue);
      applyTheme();
    }
  });
})();
