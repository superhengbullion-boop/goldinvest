import { assetsHubNotFound } from "@/lib/feature-flags";
import { saveLocale, saveMemberProfile, savePersonalDetails } from "@/lib/member-profile";
import { loadMember } from "@/lib/member-session";
import { badRequest, memberFromRequest, toMobileProfile, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  return Response.json(toMobileProfile(member));
}

export async function PATCH(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const body = await readJsonObject(request);
  if (!body) return badRequest("Username and full name are required.");

  if (body.section === "personal" || (typeof body.locale === "string" && body.fullName == null)) {
    const hidden = assetsHubNotFound();
    if (hidden) return hidden;
  }

  if (body.section === "personal") {
    const result = await savePersonalDetails({
      id: member.id,
      email: String(body.email ?? ""),
      fullName: String(body.fullName ?? ""),
      phone: String(body.phone ?? ""),
      address: String(body.address ?? ""),
      companyName: String(body.companyName ?? ""),
      registrationNo: String(body.registrationNo ?? ""),
    });
    if ("error" in result) return badRequest(result.error ?? "Could not save.");
    const updated = await loadMember(member.id);
    if (!updated) return unauthorized();
    return Response.json(toMobileProfile(updated));
  }

  if (typeof body.locale === "string" && body.fullName == null) {
    const result = await saveLocale(member.id, body.locale);
    if ("error" in result) return badRequest(result.error ?? "Could not save.");
    const updated = await loadMember(member.id);
    if (!updated) return unauthorized();
    return Response.json(toMobileProfile(updated));
  }

  const result = await saveMemberProfile({
    id: member.id,
    username: String(body.username ?? ""),
    fullName: String(body.fullName ?? ""),
    password: body.password == null ? "" : String(body.password),
    confirmPassword: body.confirmPassword == null ? "" : String(body.confirmPassword),
  });
  if ("error" in result) return badRequest(result.error);

  const updated = await loadMember(member.id);
  if (!updated) return unauthorized();
  return Response.json(toMobileProfile(updated));
}
