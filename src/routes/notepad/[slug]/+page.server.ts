import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase.server';

export async function load({ params }) {
	const slug = params.slug;

	if (!/^[a-z0-9]{12}$/.test(slug)) {
		throw error(400, 'Slug harus 12 karakter alfanumerik');
	}

	const { data } = await supabase.from('notepad').select('text').eq('slug', slug).single();

	return { slug, text: data?.text || '' };
}

export const actions = {
	save: async ({ request, params }) => {
		const slug = params.slug;

		if (!/^[a-z0-9]{12}$/.test(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const formData = await request.formData();
		const text = (formData.get('text') || '').toString();

		// Batasi 1MB (sekitar 1 juta karakter)
		if (text.length > 1000000) {
			throw error(400, 'Text terlalu panjang. Maksimal 1MB');
		}

		await supabase.from('notepad').upsert({ slug, text });

		return { ok: true };
	}
};
