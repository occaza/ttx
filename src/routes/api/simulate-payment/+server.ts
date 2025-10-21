import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { simulatePayment } from '$lib/server/supabase.server';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { orderId, amount } = await request.json();
		const payment = await simulatePayment(orderId, amount);
		return json(payment);
	} catch (error) {
		console.error(error);
		return json({ error: 'Gagal simulasi pembayaran' }, { status: 500 });
	}
};
