import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		console.log('=== WEBHOOK RECEIVED ===');
		console.log('Full Payload:', JSON.stringify(payload, null, 2));
		console.log('========================');

		const { amount, order_id, project, status, payment_method, completed_at } = payload;

		if (!amount || !order_id) {
			console.error('Missing required fields: amount or order_id');
			return json({ success: false }, { status: 400 });
		}

		if (status === 'completed') {
			console.log('Payment completed:', {
				order_id,
				amount,
				payment_method,
				completed_at
			});
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Webhook Error:', error);
		return json({ success: true }, { status: 200 });
	}
};
