import { notFound } from "next/navigation";
import { DepositInfoForm } from "@/components/admin/DepositInfoForm";
import { getDepositSettings } from "@/lib/deposit-settings";
import { assetsHubEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function DepositInfoPage() {
  if (!assetsHubEnabled()) notFound();
  const settings = await getDepositSettings();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Deposit info</h1>
      <p className="mt-2 mb-8 text-mist">
        Bank details, support phone, and deposit instructions shown in the app.
      </p>
      <DepositInfoForm settings={settings} />
    </div>
  );
}
