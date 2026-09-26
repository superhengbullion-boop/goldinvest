import { PortalProfileForm } from "@/components/PortalProfileForm";
import { getMember } from "@/lib/member-session";

export default async function PortalProfilePage() {
  const member = await getMember();
  if (!member) return null;

  return (
    <section>
      <h2 className="font-display text-2xl text-gold">Profile</h2>
      <p className="mt-2 text-sm text-mist">Update your account details.</p>
      <PortalProfileForm
        member={{
          memberId: member.memberId,
          username: member.username,
          fullName: member.fullName,
          phone: member.phone,
          email: member.email,
        }}
      />
    </section>
  );
}
