// src/hooks.server.ts
import { supabase } from '$lib/server/supabase.server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('sb-access-token');

	if (accessToken) {
		const { data, error } = await supabase.auth.getUser(accessToken);
		event.locals.user = data.user ?? null;
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
