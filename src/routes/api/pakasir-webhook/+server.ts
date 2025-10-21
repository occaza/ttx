import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		console.log('Webhook Payload:', JSON.stringify(payload, null, 2));

		const { amount, order_id, project, status, payment_method, completed_at, is_sandbox } = payload;

		console.log('Parsed Data:', {
			amount,
			order_id,
			project,
			status,
			payment_method,
			completed_at,
			is_sandbox
		});

		if (status === 'completed') {
			console.log('Pembayaran berhasil untuk order:', order_id);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Webhook Error:', error);
		return json({ success: true }, { status: 200 });
	}
};
