import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase.server';
import { signClosed, tripayPost } from '$lib/server/tripay';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { method, amount, orderId, email, name } = await request.json();
	const merchantRef = orderId;

	// 1. simpan ke tabel payments (tanpa user_id)
	const { data, error } = await supabase
		.from('payments')
		.insert({
			merchant_ref: merchantRef,
			amount,
			status: 'UNPAID'
		})
		.select()
		.single();

	if (error) return json({ error: error.message }, { status: 500 });

	// 2. request ke TriPay
	const signature = signClosed({
		merchantCode: process.env.VITE_TRIPAY_MERCHANT_CODE!,
		merchantRef,
		amount
	});

	const body = {
		method,
		merchant_ref: merchantRef,
		amount,
		customer_name: name,
		customer_email: email,
		order_items: [{ sku: orderId, name: 'Order ' + orderId, price: amount, quantity: 1 }],
		signature,
		expired_time: Math.floor(Date.now() / 1000) + 24 * 3600
	};

	const tri = await tripayPost('/transaction/create', body);
	if (!tri.success) return json({ error: tri.message }, { status: 500 });

	return json({
		ok: true,
		ref: tri.data.reference,
		code: tri.data.pay_code,
		qris: tri.data.qr_string,
		expiry: tri.data.expired_time
	});
};
