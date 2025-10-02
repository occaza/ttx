import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase.server';

export async function load({ params }) {
	const slug = params.slug;

	if (!/^[a-z0-9]{12}$/.test(slug)) {
		throw error(400, 'Slug harus 12 karakter alfanumerik');
	}

	const { data } = await supabase
		.from('notepad')
		.select('text, updated_at')
		.eq('slug', slug)
		.single();

	return {
		slug,
		text: data?.text || '',
		updatedAt: data?.updated_at || null
	};
}

export const actions = {
	save: async ({ request, params }) => {
		const slug = params.slug;

		if (!/^[a-z0-9]{12}$/.test(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const formData = await request.formData();
		const text = (formData.get('text') || '').toString().trim();

		if (!text) {
			throw error(400, 'Text tidak boleh kosong');
		}

		await supabase.from('notepad').upsert({ slug, text, updated_at: new Date().toISOString() });

		return { ok: true };
	}
};
