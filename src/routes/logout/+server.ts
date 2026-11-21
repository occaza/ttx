import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase }, cookies }) => {
	console.log('[API] 🔴 Logout request received');

	try {
		// Sign out dari Supabase dengan scope: 'local' agar tidak hang atau gagal jika remote token sudah revoked
		await supabase.auth.signOut({ scope: 'local' });
		console.log('[API] ✅ Local SignOut successful');
	} catch (e) {
		console.warn('[API] ⚠️ SignOut exception:', e);
	}

	// Hapus semua cookies Supabase secara manual dan menyeluruh
	console.log('[API] 🧹 Clearing cookies...');
	const allCookies = cookies.getAll();
	let deletedCount = 0;
	allCookies.forEach((cookie) => {
		if (
			cookie.name.includes('sb-') ||
			cookie.name.includes('supabase') ||
			cookie.name.includes('auth-token')
		) {
			cookies.delete(cookie.name, { path: '/' });
			deletedCount++;
		}
	});

	console.log('[API] ✅ Deleted cookies count:', deletedCount);

	return json({
		success: true,
		message: 'Logged out successfully',
		deletedCookies: deletedCount
	});
};
