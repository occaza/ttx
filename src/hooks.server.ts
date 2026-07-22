import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch: event.fetch },
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						...options,
						path: '/',
						// ✅ Tambahkan maxAge untuk kontrol expiry (1 hari = 86400 detik)
						maxAge: 60 * 60 * 24, // 24 jam
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						httpOnly: true
					});
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		// ✅ Verifikasi dengan getUser() untuk keamanan
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			return { session: null, user: null };
		}

		// ✅ Hapus session yang expired
		// Cek apakah session sudah kadaluarsa (tambah buffer 5 menit)
		const expiresAt = session.expires_at;
		const now = Math.floor(Date.now() / 1000);

		let finalSession = session;
		let finalUser = user;

		if (expiresAt && now > expiresAt - 300) {
			// Session akan expired dalam 5 menit, refresh dulu
			const {
				data: { session: refreshedSession }
			} = await event.locals.supabase.auth.refreshSession();
			if (refreshedSession) {
				finalSession = refreshedSession;
			}
		}

		// Hindari Supabase warning "Using the user object as returned from getSession()"
		// SvelteKit serializer akan memicu getter pada finalSession.user
		// Kita override session menjadi plain object menggunakan user yang tervalidasi
		if (!finalUser) {
			return { session: null, user: null };
		}

		const safeSessionObj = {
			access_token: finalSession.access_token,
			refresh_token: finalSession.refresh_token,
			expires_in: finalSession.expires_in,
			expires_at: finalSession.expires_at,
			token_type: finalSession.token_type,
			user: finalUser
		} satisfies import('@supabase/supabase-js').Session;

		return { session: safeSessionObj, user: finalUser };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

// ✅ Auth Guard untuk protected routes
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	const path = event.url.pathname;

	// Protected routes
	const protectedRoutes = ['/dashboard', '/account'];
	const authRoutes = ['/login', '/register', '/forgot-password'];

	// Redirect ke login jika akses protected route tanpa auth
	if (protectedRoutes.some((route) => path.startsWith(route))) {
		if (!session || !user) {
			throw redirect(303, '/login');
		}
	}

	// Redirect ke dashboard jika sudah login tapi akses auth pages
	if (authRoutes.some((route) => path.startsWith(route))) {
		if (session && user) {
			throw redirect(303, '/dashboard');
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
