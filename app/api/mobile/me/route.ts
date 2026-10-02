import { saveMemberProfile } from "@/lib/member-profile";
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
