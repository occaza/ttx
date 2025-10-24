import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase.server';
import { createPayment, generateOrderId } from '$lib/server/pakasir.server';
import type { PaymentMethod } from '$lib/types/pakasir';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { amount, payment_method, user_id } = await request.json();

		if (!amount || amount <= 0) {
			throw error(400, 'Amount harus lebih dari 0');
		}

		if (!payment_method) {
			throw error(400, 'Payment method wajib diisi');
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
			throw error(500, 'Gagal menyimpan transaksi');
		}

		return json({
			success: true,
			transaction,
			payment_data: payment
		});
	} catch (err) {
		console.error('Payment creation error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Terjadi kesalahan saat membuat pembayaran');
	}
};
