const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5);

type SiteVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, message: "Unable to verify this request. Please try again later." };
    }
    return { ok: true };
  }

  if (!token) {
    return { ok: false, message: "Please verify you are human and try again." };
  }

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!response.ok) {
    return { ok: false, message: "Please verify you are human and try again." };
  }

  const result = (await response.json()) as SiteVerifyResponse;
  const score = result.score ?? 0;
  const actionMatches = !result.action || result.action === expectedAction;
  const errorCodes = result["error-codes"] ?? [];

  console.error("[recaptcha]", {
    success: result.success,
    score: result.score,
    action: result.action,
    hostname: result.hostname,
    errorCodes,
    tokenLength: token.length,
  });

  if (!result.success) {
    if (
      errorCodes.includes("invalid-input-response") ||
      errorCodes.includes("browser-error") ||
      errorCodes.includes("bad-request")
    ) {
      return {
        ok: false,
        message:
          "reCAPTCHA rejected this domain. In Google reCAPTCHA admin, add this site’s domain (localhost for local testing) and save, then try again.",
      };
    }
    return { ok: false, message: "Unable to verify this request. Please try again." };
  }

  if (!actionMatches || score < MIN_SCORE) {
    return { ok: false, message: "Unable to verify this request. Please try again." };
  }

  return { ok: true };
}
