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
						path: '/'
					});
				});
			}
		}
	});

	let safeSessionPromise: Promise<{ session: any; user: any }> | null = null;

	event.locals.safeGetSession = async () => {
		if (safeSessionPromise) {
			return safeSessionPromise;
		}

		safeSessionPromise = (async () => {
			const {
				data: { session }
			} = await event.locals.supabase.auth.getSession();

			if (!session) {
				return { session: null, user: null };
			}

			// Verifikasi dengan getUser() untuk keamanan (sekaligus menangani auto-refresh token di @supabase/ssr)
			const {
				data: { user },
				error
			} = await event.locals.supabase.auth.getUser();

			if (error || !user) {
				return { session: null, user: null };
			}

			return { session, user };
		})();

		return safeSessionPromise;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return (
				name === 'content-range' ||
				name.startsWith('x-supabase-api-') ||
				name.toLowerCase() === 'sb-access-token'
			);
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
