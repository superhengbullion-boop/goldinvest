const GRAPH_API = "https://graph.facebook.com/v21.0";

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

async function sendTemplateMessage(input: {
  to: string;
  template: string;
  language: string;
  bodyParams: string[];
}) {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneNumberId || !input.template || !input.to) return;

  const response = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "template",
      template: {
        name: input.template,
        language: { code: input.language },
        components: [
          {
            type: "body",
            parameters: input.bodyParams.map((text) => ({
              type: "text",
              text,
            })),
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[whatsapp] template send failed (${response.status}): ${detail}`);
  }
}

export async function notifyWhatsAppOrder(order: {
  orderNo: string;
  totalAmount: string | number;
  metalSummary: string;
  member: {
    fullName: string;
    phone: string;
    memberId: string;
  };
}) {
  const language = process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "en";
  const adminTemplate = process.env.WHATSAPP_TEMPLATE_ADMIN?.trim() || "";
  const customerTemplate = process.env.WHATSAPP_TEMPLATE_CUSTOMER?.trim() || "";
  const adminPhone = digitsOnly(process.env.WHATSAPP_ADMIN_PHONE ?? "");
  const customerPhone = digitsOnly(order.member.phone);
  const total = String(order.totalAmount);

  // Body params: order no, metal summary, total, member name, member phone
  const adminParams = [
    order.orderNo,
    order.metalSummary,
    total,
    order.member.fullName,
    order.member.phone || order.member.memberId,
  ];
  const customerParams = [
    order.orderNo,
    order.metalSummary,
    total,
    order.member.fullName,
    order.member.phone,
  ];

  if (adminPhone && adminTemplate) {
    await sendTemplateMessage({
      to: adminPhone,
      template: adminTemplate,
      language,
      bodyParams: adminParams,
    });
  }

  if (customerPhone && customerTemplate) {
    await sendTemplateMessage({
      to: customerPhone,
      template: customerTemplate,
      language,
      bodyParams: customerParams,
    });
  }
}
