import { assetsHubNotFound } from "@/lib/feature-flags";
import { createDeposit, saveDepositProof } from "@/lib/deposits";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = await readJsonObject(request);
    if (!body || body.kind !== "xau") return badRequest("Choose a deposit type.");
    const row = await createDeposit({ memberId: member.id, kind: "xau" });
    return Response.json(row);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Choose a deposit type.");
  }

  const kind = String(form.get("kind") ?? "");
  if (kind === "xau") {
    const row = await createDeposit({ memberId: member.id, kind: "xau" });
    return Response.json(row);
  }
  if (kind !== "fund") return badRequest("Choose a deposit type.");

  const proof = form.get("proof");
  if (!(proof instanceof File) || proof.size === 0) {
    return badRequest("Upload a screenshot of the transfer.");
  }
  try {
    const proofPath = await saveDepositProof(proof);
    const bankAccountId = String(form.get("bankAccountId") ?? "").trim();
    const row = await createDeposit({
      memberId: member.id,
      kind: "fund",
      comment: String(form.get("comment") ?? ""),
      proofPath,
      bankAccountId: bankAccountId || null,
    });
    return Response.json(row);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not save the deposit.");
  }
}
