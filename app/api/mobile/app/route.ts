import { appContentResponse, DEFAULT_APP_CONTENT } from "@/lib/app-content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return Response.json(await appContentResponse(request));
  } catch {
    return Response.json({
      logoUrl: "",
      ratesTitle: DEFAULT_APP_CONTENT.ratesTitle,
      infoLabel: DEFAULT_APP_CONTENT.infoLabel,
      buyLabel: DEFAULT_APP_CONTENT.buyLabel,
      sellLabel: DEFAULT_APP_CONTENT.sellLabel,
      lockBuyLabel: DEFAULT_APP_CONTENT.lockBuyLabel,
      lockSellLabel: DEFAULT_APP_CONTENT.lockSellLabel,
      comingSoonLabel: DEFAULT_APP_CONTENT.comingSoonLabel,
    });
  }
}
