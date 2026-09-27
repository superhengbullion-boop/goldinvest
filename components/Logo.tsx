import Link from 'next/link';

export function Logo({
	className = '',
	src = '/logo.jpg',
	name = 'Super Heng Bullion',
}: {
	className?: string;
	src?: string;
	name?: string;
}) {
	const parts = name.trim().split(/\s+/);
	const lead = parts.slice(0, -1).join(' ');
	const last = parts.at(-1) ?? name;

	return (
		<Link href='/' className={`flex items-center gap-3 ${className}`}>
			<img
				src={src || '/logo.jpg'}
				alt={name}
				className='h-14 w-14 rounded-full object-cover'
			/>
			<span className='font-display text-lg tracking-wide text-ivory max-md:hidden'>
				{lead ? `${lead} ` : null}
				<span className='text-gold'>{last}</span>
			</span>
		</Link>
	);
}
