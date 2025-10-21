import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPakasirTransaction } from '$lib/server/supabase.server';

export const POST: RequestHandler = async ({ request }) => {
	const { orderId, amount } = await request.json();

	try {
		const payment = await createPakasirTransaction(orderId, amount, 'qris');
		return json(payment);
	} catch (error) {
		console.error(error);
		return json({ error: 'Gagal membuat transaksi' }, { status: 500 });
	}
};
