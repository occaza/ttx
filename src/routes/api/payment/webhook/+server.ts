import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase.server';
import { getTransactionDetail } from '$lib/server/pakasir.server';
import type { WebhookPayload } from '$lib/types/pakasir';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload: WebhookPayload = await request.json();

		const { order_id, amount, status, payment_method, completed_at } = payload;

		const { data: existingTransaction } = await supabase
			.from('transactions')
			.select('*')
			.eq('order_id', order_id)
			.single();

		if (!existingTransaction) {
			console.error(`Transaction not found: ${order_id}`);
			throw error(404, 'Transaksi tidak ditemukan');
		}

		if (existingTransaction.amount !== amount) {
			console.error(`Amount mismatch for ${order_id}`);
			throw error(400, 'Amount tidak sesuai');
		}

		const verificationResponse = await getTransactionDetail(order_id, amount);
		const verifiedStatus = verificationResponse.transaction.status;

		if (verifiedStatus !== 'completed') {
			console.error(`Status verification failed for ${order_id}`);
			throw error(400, 'Status pembayaran tidak valid');
		}

		const completedAtDate = new Date(completed_at);

		const { error: updateError } = await supabase
			.from('transactions')
			.update({
				status: 'completed',
				completed_at: completedAtDate.toISOString()
			})
			.eq('order_id', order_id);

		if (updateError) {
			console.error('Database update error:', updateError);
			throw error(500, 'Gagal update transaksi');
		}

		console.log(`Payment completed for ${order_id}`);

		return json({ success: true, message: 'Webhook processed' });
	} catch (err) {
		console.error('Webhook error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Terjadi kesalahan saat memproses webhook');
	}
};
