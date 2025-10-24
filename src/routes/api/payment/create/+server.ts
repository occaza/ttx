import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase.server';
import { createPayment, generateOrderId } from '$lib/server/pakasir.server';
import type { PaymentMethod } from '$lib/types/pakasir';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { amount, payment_method, user_id } = body;

		if (!amount || amount <= 0) {
			return json(
				{
					success: false,
					error: 'Amount harus lebih dari 0'
				},
				{ status: 400 }
			);
		}

		if (!payment_method) {
			return json(
				{
					success: false,
					error: 'Payment method wajib diisi'
				},
				{ status: 400 }
			);
		}

		const orderId = generateOrderId();

		const pakasirResponse = await createPayment(orderId, amount, payment_method as PaymentMethod);

		const { payment } = pakasirResponse;

		const expiredAt = new Date(payment.expired_at);

		const { data: transaction, error: dbError } = await supabase
			.from('transactions')
			.insert({
				order_id: payment.order_id,
				user_id: user_id || null,
				amount: payment.amount,
				fee: payment.fee,
				total_payment: payment.total_payment,
				payment_method: payment.payment_method,
				payment_number: payment.payment_number,
				status: 'pending',
				expired_at: expiredAt.toISOString()
			})
			.select()
			.single();

		if (dbError) {
			console.error('Database error:', dbError);
			return json(
				{
					success: false,
					error: 'Gagal menyimpan transaksi',
					details: dbError.message
				},
				{ status: 500 }
			);
		}

		return json({
			success: true,
			transaction,
			payment_data: payment
		});
	} catch (err) {
		console.error('Payment creation error:', err);

		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat pembayaran'
			},
			{ status: 500 }
		);
	}
};
