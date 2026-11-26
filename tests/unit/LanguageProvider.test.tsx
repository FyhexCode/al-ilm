import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// The provider caches the locale at module level; load a fresh copy per test.
async function setup() {
  vi.resetModules();
  const { LanguageProvider } = await import("@/lib/i18n/LanguageProvider");
  const { useLanguage } = await import("@/lib/i18n/useLanguage");
  const { useT } = await import("@/lib/i18n/useT");

  function Probe() {
    const { locale, setLocale } = useLanguage();
    const t = useT();
    return (
      <>
        <p data-testid="locale">{locale}</p>
        <p data-testid="home">{t("nav.home")}</p>
        <button onClick={() => setLocale("id")}>to-id</button>
        <button onClick={() => setLocale("en")}>to-en</button>
      </>
    );
  }
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  );
}

describe("LanguageProvider", () => {
  it("defaults to English", async () => {
    await setup();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("home")).toHaveTextContent("Home");
    expect(document.documentElement.lang).toBe("en");
  });

  it("switches language, translates, persists, and updates <html lang>", async () => {
    await setup();
    await userEvent.click(screen.getByText("to-id"));
    expect(screen.getByTestId("locale")).toHaveTextContent("id");
    expect(screen.getByTestId("home")).toHaveTextContent("Beranda");
    expect(localStorage.getItem("al-ilm-locale")).toBe("id");
    expect(document.documentElement.lang).toBe("id");
    await userEvent.click(screen.getByText("to-en"));
    expect(document.documentElement.lang).toBe("en");
  });

  it("restores the saved language on load", async () => {
    localStorage.setItem("al-ilm-locale", "id");
    await setup();
    expect(screen.getByTestId("locale")).toHaveTextContent("id");
    expect(document.documentElement.lang).toBe("id");
  });

  it("ignores an invalid saved value", async () => {
    localStorage.setItem("al-ilm-locale", "fr");
    await setup();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });

  it("follows a language change made in another tab", async () => {
    await setup();
    act(() => {
      localStorage.setItem("al-ilm-locale", "id");
      window.dispatchEvent(new StorageEvent("storage", { key: "al-ilm-locale" }));
    });
    expect(screen.getByTestId("locale")).toHaveTextContent("id");
  });
});
