import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	let next = url.searchParams.get('next') ?? '/dashboard';
	const error = url.searchParams.get('error');
	const errorDescription = url.searchParams.get('error_description');

	// Pastikan next tidak redirect kembali ke auth routes
	if (
		next.startsWith('/login') ||
		next.startsWith('/register') ||
		next.startsWith('/forgot-password')
	) {
		next = '/dashboard';
	}

	// Jika ada error dari provider OAuth (misal dibatalkan user)
	if (error) {
		console.error('[auth/callback] OAuth provider error:', error, errorDescription);
		const message = errorDescription || error;
		throw redirect(303, `/login?error=${encodeURIComponent(message)}`);
	}

	if (code) {
		const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
		if (!exchangeError) {
			// Cegah open-redirect
			const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
			throw redirect(303, safeNext);
		}

		console.error('[auth/callback] exchangeCodeForSession error:', exchangeError);
		throw redirect(303, `/login?error=${encodeURIComponent(exchangeError.message)}`);
	}

	throw redirect(303, '/login');
};
