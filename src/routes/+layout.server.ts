import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	// ✅ Gunakan getUser() untuk verifikasi yang aman
	// Hanya fetch user jika session ada
	let user = null;
	if (session) {
		const {
			data: { user: authenticatedUser }
		} = await supabase.auth.getUser();
		user = authenticatedUser;
	}

	return {
		session,
		user
	};
};
