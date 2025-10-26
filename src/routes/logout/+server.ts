import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase }, cookies }) => {
	try {
		// Sign out dari Supabase
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error('Logout error:', error);
			return json({ success: false, error: error.message }, { status: 400 });
		}

		// Hapus semua cookies Supabase secara manual
		const cookieNames = [
			'sb-access-token',
			'sb-refresh-token'
			// Nama cookie bisa berbeda tergantung config Supabase Anda
			// Cek di DevTools > Application > Cookies untuk nama pastinya
		];

		cookies.getAll().forEach((cookie) => {
			if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
				cookies.delete(cookie.name, { path: '/' });
			}
		});

		return json({ success: true });
	} catch (e) {
		console.error('Logout exception:', e);
		return json({ success: false, error: String(e) }, { status: 500 });
	}
};
