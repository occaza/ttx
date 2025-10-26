import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase }, cookies }) => {
	console.log('[API] 🔴 Logout request received');

	try {
		// Sign out dari Supabase dengan timeout
		console.log('[API] Calling supabase.auth.signOut()');

		const signOutPromise = supabase.auth.signOut();
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('SignOut timeout')), 5000)
		);

		try {
			const { error } = await Promise.race([signOutPromise, timeoutPromise]);

			if (error) {
				console.error('[API] SignOut error:', error);
				// Continue anyway untuk clear cookies
			} else {
				console.log('[API] ✅ SignOut successful');
			}
		} catch (timeoutError) {
			console.warn('[API] ⚠️ SignOut timeout, continuing with cookie cleanup');
		}

		// Hapus semua cookies Supabase secara manual
		console.log('[API] 🧹 Clearing cookies...');
		const allCookies = cookies.getAll();
		console.log('[API] Total cookies found:', allCookies.length);

		let deletedCount = 0;
		allCookies.forEach((cookie) => {
			// Hapus semua cookie yang related ke Supabase
			if (
				cookie.name.includes('sb-') ||
				cookie.name.includes('supabase') ||
				cookie.name.includes('auth-token')
			) {
				console.log('[API] 🗑️ Deleting cookie:', cookie.name);
				cookies.delete(cookie.name, { path: '/' });
				deletedCount++;
			}
		});

		console.log('[API] ✅ Deleted cookies:', deletedCount);
		console.log('[API] ✅ Logout successful');

		return json({
			success: true,
			message: 'Logged out successfully',
			deletedCookies: deletedCount
		});
	} catch (e) {
		console.error('[API] ❌ Logout exception:', e);

		// Tetap hapus cookies meski ada error
		const allCookies = cookies.getAll();
		let deletedCount = 0;
		allCookies.forEach((cookie) => {
			if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
				cookies.delete(cookie.name, { path: '/' });
				deletedCount++;
			}
		});

		console.log('[API] ⚠️ Forced cookie deletion:', deletedCount);

		return json({
			success: true, // Return success karena cookies sudah dihapus
			message: 'Logged out with errors',
			error: String(e),
			deletedCookies: deletedCount
		});
	}
};
