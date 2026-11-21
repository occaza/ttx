import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Logout menyeluruh:
 * 1. Clear session di browser (scope: local agar instan dan tidak hang)
 * 2. Clear cookies via endpoint /logout di server
 * 3. Clear document.cookie di browser secara eksplisit
 * 4. Redirect ke /login
 */
export async function handleLogout() {
	try {
		const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
		await supabase.auth.signOut({ scope: 'local' });
	} catch (e) {
		console.warn('Browser signOut error:', e);
	}

	try {
		await fetch('/logout', { method: 'POST' });
	} catch (e) {
		console.warn('Server logout error:', e);
	}

	// Hapus cookie sisi client juga agar tidak ada token menggantung
	if (typeof document !== 'undefined') {
		document.cookie.split(';').forEach((c) => {
			const name = c.split('=')[0].trim();
			if (name.includes('sb-') || name.includes('supabase') || name.includes('auth-token')) {
				document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
			}
		});
	}

	window.location.href = '/login';
}
