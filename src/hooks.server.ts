import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
			'frame-src https://challenges.cloudflare.com',
			"style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
			"img-src 'self' data: https:",
			"connect-src 'self' https://challenges.cloudflare.com"
		].join('; ')
	);

	// Hapus warning Permissions-Policy
	response.headers.set('Permissions-Policy', 'interest-cohort=(), browsing-topics=()');

	return response;
};
