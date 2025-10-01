import { redirect } from '@sveltejs/kit';

function generateSlug() {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let slug = '';
	for (let i = 0; i < 12; i++) {
		slug += chars[Math.floor(Math.random() * chars.length)];
	}
	return slug;
}

export function load() {
	const slug = generateSlug();
	throw redirect(302, `/notepad/${slug}`);
}
