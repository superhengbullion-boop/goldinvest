import Link from 'next/link';
import {PortalProfileForm} from '@/components/PortalProfileForm';
import {getMember} from '@/lib/member-session';

export default async function PortalPage() {
	const member = await getMember();
	if (!member) return null;

	return (
		<div className='mx-[5%] py-12'>
			<p className='text-xs uppercase tracking-[0.3em] text-gold'>
				Member portal
			</p>
			<h1 className='mt-3 font-display text-4xl text-gold'>My account</h1>
			<p className='mt-4 text-sm'>
				<Link href='/rates' className='text-gold hover:underline'>
					View rates
				</Link>
			</p>
			<PortalProfileForm
				member={{
					memberId: member.memberId,
					username: member.username,
					fullName: member.fullName,
					phone: member.phone,
					email: member.email,
				}}
			/>
		</div>
	);
}
