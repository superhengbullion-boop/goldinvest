const TELEGRAM_API = "https://api.telegram.org";
const MAX_TEXT = 4000;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function clip(value: string, max = MAX_TEXT) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export async function notifyTelegramContact(enquiry: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const text = clip(
    [
      "<b>New Super Heng Bullion enquiry</b>",
      "",
      `<b>Name:</b> ${escapeHtml(enquiry.name)}`,
      `<b>Email:</b> ${escapeHtml(enquiry.email)}`,
      `<b>Phone:</b> ${escapeHtml(enquiry.phone)}`,
      "",
      escapeHtml(enquiry.message),
    ].join("\n"),
  );

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[telegram] sendMessage failed (${response.status}): ${detail}`);
  }
}
