import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		console.log('=== WEBHOOK RECEIVED ===');
		console.log('Full Payload:', JSON.stringify(payload, null, 2));
		console.log('Request Headers:', Object.fromEntries(request.headers));
		console.log('========================');

		return json({ success: true });
	} catch (error) {
		console.error('Webhook Error:', error);
		return json({ success: true });
	}
};
