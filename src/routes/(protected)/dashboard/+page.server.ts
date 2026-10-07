import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';
import type { PageServerLoad } from './$types';

const FREE_DOC_LIMIT = 4;

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw redirect(303, '/login');
	}

	// Ambil semua dokumen user dari notepad2
	const { data: docs } = await supabaseAdmin
		.from('notepad2_docs')
		.select('id, slug, title, updated_at')
		.eq('user_id', user.id)
		.order('updated_at', { ascending: false });

	// Ambil profile user jika ada
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	const userTier = (
		profile?.tier ??
		profile?.plan ??
		user.app_metadata?.tier ??
		user.user_metadata?.tier ??
		'free'
	)
		.toString()
		.toLowerCase();

	const userRole = (profile?.role ?? user.app_metadata?.role ?? '')
		.toString()
		.toLowerCase();

	const isPro = userTier === 'pro' || userRole === 'admin';

	return {
		session,
		user,
		profile,
		docs: docs || [],
		docLimit: FREE_DOC_LIMIT,
		isPro
	};
};
