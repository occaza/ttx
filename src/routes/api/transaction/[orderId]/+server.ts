import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase.server';
import { getTransactionDetail } from '$lib/server/pakasir.server';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { orderId } = params;

		if (!orderId) {
			return json(
				{
					success: false,
					error: 'Order ID wajib diisi'
				},
				{ status: 400 }
			);
		}

		const { data: transaction, error: dbError } = await supabase
			.from('transactions')
			.select('*')
			.eq('order_id', orderId)
			.single();

		if (dbError || !transaction) {
			return json(
				{
					success: false,
					error: 'Transaksi tidak ditemukan'
				},
				{ status: 404 }
			);
		}

		if (transaction.status === 'pending') {
			try {
				const pakasirData = await getTransactionDetail(orderId, transaction.amount);

				if (pakasirData.transaction.status === 'completed') {
					const completedAt = new Date(pakasirData.transaction.completed_at);

					const { error: updateError } = await supabase
						.from('transactions')
						.update({
							status: 'completed',
							completed_at: completedAt.toISOString()
						})
						.eq('order_id', orderId);

					if (!updateError) {
						transaction.status = 'completed';
						transaction.completed_at = completedAt.toISOString();
					}
				}
			} catch (err) {
				console.error('Error checking Pakasir status:', err);
			}
		}

		return json({
			success: true,
			transaction
		});
	} catch (err) {
		console.error('Transaction detail error:', err);

		return json(
			{
				success: false,
				error:
					err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil detail transaksi'
			},
			{ status: 500 }
		);
	}
};
