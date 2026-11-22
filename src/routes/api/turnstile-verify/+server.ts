import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyTurnstileToken } from '$lib/server/turnstile.server';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const { token } = await request.json();
		const clientIp = getClientAddress();
		const result = await verifyTurnstileToken(token, clientIp);
		return json(result, { status: result.success ? 200 : 400 });
	} catch (err: any) {
		return json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
	}
};
