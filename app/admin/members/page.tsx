import Link from 'next/link';
import {createMember, deleteMember} from '@/app/actions/admin';
import {getMembersPage, getRateBooks} from '@/lib/data';

function first(value: string | string[] | undefined) {
	return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function queryString(params: Record<string, string | number | undefined>) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === '') continue;
		search.set(key, String(value));
	}
	const text = search.toString();
	return text ? `?${text}` : '';
}

export default async function AdminMembersPage({
	searchParams,
}: {
	searchParams: Promise<{
		username?: string;
		email?: string;
		phone?: string;
		page?: string;
	}>;
}) {
	const params = await searchParams;
	const username = first(params.username).trim();
	const email = first(params.email).trim();
	const phone = first(params.phone).trim();
	const requestedPage = Math.max(1, Number(params.page) || 1);

	const [{members, total, page, pageCount}, books] = await Promise.all([
		getMembersPage({username, email, phone, page: requestedPage}),
		getRateBooks(),
	]);
	const bookOptions = books.filter((book) => book.isActive);
	const filters = {username, email, phone};

	return (
		<div>
			<h1 className='font-display text-4xl text-gold mb-10'>Members</h1>

			<form
				action={createMember}
				className='mb-10 grid grid-cols-2 gap-4 rounded-xl border border-gold/25 p-6 max-md:grid-cols-1'
			>
				<h2 className='col-span-full font-display text-xl'>Add member</h2>
				<input
					name='username'
					required
					placeholder='Username'
					className='rounded border border-gold/30 bg-ink px-3 py-2'
				/>
				<input
					name='password'
					type='password'
					required
					placeholder='Password'
					className='rounded border border-gold/30 bg-ink px-3 py-2'
				/>
				<input
					name='fullName'
					required
					placeholder='Full name'
					className='rounded border border-gold/30 bg-ink px-3 py-2'
				/>
				<input
					name='phone'
					required
					placeholder='Phone'
					className='rounded border border-gold/30 bg-ink px-3 py-2'
				/>
				<input
					name='email'
					type='email'
					required
					placeholder='Email'
					className='rounded border border-gold/30 bg-ink px-3 py-2'
				/>
				<select
					name='rateBookId'
					className='rounded border border-gold/30 bg-ink px-3 py-2'
				>
					<option value=''>No price book yet</option>
					{bookOptions.map((book) => (
						<option key={book.id} value={book.id}>
							{book.name}
						</option>
					))}
				</select>
				<button type='submit' className='gold-btn justify-self-start'>
					Create member
				</button>
			</form>

			<section className='rounded-xl border border-gold/25 p-6'>
				<div className='mb-5 flex flex-wrap items-end justify-between gap-4'>
					<h2 className='font-display text-xl'>Member list</h2>
					<p className='text-sm text-mist'>
						{total} member{total === 1 ? '' : 's'}
					</p>
				</div>

				<form
					method='get'
					className='mb-6 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1'
				>
					<input
						name='username'
						defaultValue={username}
						placeholder='Username'
						className='rounded border border-gold/30 bg-ink px-3 py-2'
					/>
					<input
						name='email'
						defaultValue={email}
						placeholder='Email'
						className='rounded border border-gold/30 bg-ink px-3 py-2'
					/>
					<input
						name='phone'
						defaultValue={phone}
						placeholder='Phone'
						className='rounded border border-gold/30 bg-ink px-3 py-2'
					/>
					<div className='flex gap-3'>
						<button type='submit' className='gold-btn py-2'>
							Search
						</button>
						<Link
							href='/admin/members'
							className='self-center text-sm text-mist hover:text-gold'
						>
							Clear
						</Link>
					</div>
				</form>

				<div className='overflow-x-auto'>
					<table className='w-full min-w-[56rem] text-left text-sm'>
						<thead className='bg-black text-xs uppercase tracking-[0.14em] text-gold'>
							<tr>
								<th className='px-4 py-3'>Member ID</th>
								<th className='px-4 py-3'>Username</th>
								<th className='px-4 py-3'>Full name</th>
								<th className='px-4 py-3'>Email</th>
								<th className='px-4 py-3'>Phone</th>
								<th className='px-4 py-3'>Price book</th>
								<th className='px-4 py-3'>Status</th>
								<th className='px-4 py-3 text-right'>Actions</th>
							</tr>
						</thead>
						<tbody>
							{members.length === 0 ? (
								<tr>
									<td colSpan={8} className='px-4 py-8 text-center text-mist'>
										No members match these filters.
									</td>
								</tr>
							) : (
								members.map((member) => (
									<tr key={member.id} className='border-t border-gold/15'>
										<td className='px-4 py-3 font-medium text-gold'>
											{member.memberId}
										</td>
										<td className='px-4 py-3'>{member.username}</td>
										<td className='px-4 py-3'>{member.fullName}</td>
										<td className='px-4 py-3'>{member.email}</td>
										<td className='px-4 py-3'>{member.phone}</td>
										<td className='px-4 py-3 text-mist'>
											{member.rateBook?.name ?? '—'}
										</td>
										<td className='px-4 py-3'>
											{member.isActive ? 'Active' : 'Disabled'}
										</td>
										<td className='px-4 py-3'>
											<div className='flex justify-end gap-3'>
												<Link
													href={`/admin/members/${member.id}`}
													className='text-gold hover:underline'
												>
													Edit
												</Link>
												<form action={deleteMember}>
													<input type='hidden' name='id' value={member.id} />
													<button
														type='submit'
														className='text-red-400 hover:underline'
													>
														Delete
													</button>
												</form>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{pageCount > 1 ? (
					<div className='mt-6 flex flex-wrap items-center justify-between gap-3 text-sm'>
						<p className='text-mist'>
							Page {page} of {pageCount}
						</p>
						<div className='flex gap-2'>
							{page > 1 ? (
								<Link
									href={`/admin/members${queryString({...filters, page: page - 1})}`}
									className='rounded border border-gold/30 px-3 py-1.5 hover:border-gold'
								>
									Previous
								</Link>
							) : (
								<span className='rounded border border-gold/10 px-3 py-1.5 text-mist'>
									Previous
								</span>
							)}
							{page < pageCount ? (
								<Link
									href={`/admin/members${queryString({...filters, page: page + 1})}`}
									className='rounded border border-gold/30 px-3 py-1.5 hover:border-gold'
								>
									Next
								</Link>
							) : (
								<span className='rounded border border-gold/10 px-3 py-1.5 text-mist'>
									Next
								</span>
							)}
						</div>
					</div>
				) : null}
			</section>
		</div>
	);
}
