import { error } from '@sveltejs/kit';
import { kv } from '@vercel/kv';

export async function load({ params }) {
	const slug = params.slug;

	if (!/^[a-z0-9]{12}$/.test(slug)) {
		throw error(400, 'Slug harus 12 karakter alfanumerik');
	}

	const text = (await kv.get(`notepad:${slug}`)) || '';
	return { slug, text };
}

export const actions = {
	save: async ({ request, params }) => {
		const slug = params.slug;

		if (!/^[a-z0-9]{12}$/.test(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const data = await request.formData();
		const text = (data.get('text') || '').toString();
		await kv.set(`notepad:${slug}`, text);
		return { ok: true };
	}
};
