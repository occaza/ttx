import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Tidak redirect di sini agar guest bisa buka dokumen publik via [slug]
	// Guard login hanya di +page.server.ts (root) dan [slug]/+page.server.ts

	let docs: { id: string; slug: string; title: string; updated_at: string; created_at: string }[] = [];

	if (user) {
		const { data } = await supabaseAdmin
			.from('notepad2_docs')
			.select('id, slug, title, updated_at, created_at')
			.eq('user_id', user.id)
			.order('updated_at', { ascending: false });
		docs = data ?? [];
	}

	return {
		user: user ?? null,
		docs
	};
};
