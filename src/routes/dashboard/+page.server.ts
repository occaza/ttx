import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	// ✅ Redirect ke login jika tidak ada session
	if (!session) {
		throw redirect(303, '/login');
	}

	// ✅ Verifikasi user dengan getUser() yang aman
	const {
		data: { user },
		error
	} = await supabase.auth.getUser();

	// ✅ Jika user tidak valid, redirect ke login
	if (error || !user) {
		throw redirect(303, '/login');
	}

	return {
		session,
		user
	};
};
