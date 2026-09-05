export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function waitForGrecaptcha(timeoutMs = 4000) {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.grecaptcha) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (window.grecaptcha) {
        window.clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(timer);
        resolve(false);
      }
    }, 50);
  });
}

export async function executeRecaptcha(action: string) {
  if (!RECAPTCHA_SITE_KEY) return "";
  const ready = await waitForGrecaptcha();
  if (!ready || !window.grecaptcha) return "";

  return new Promise<string>((resolve) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(""));
    });
  });
}
