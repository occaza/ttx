import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		console.log('Webhook Received:', payload);

		const { amount, order_id, project, status, payment_method, completed_at, is_sandbox } = payload;

		if (status === 'completed') {
			console.log('Pembayaran berhasil:', {
				order_id,
				amount,
				payment_method,
				completed_at
			});

			// Simpan ke database jika perlu
			// const { error } = await supabase
			//   .from('transactions')
			//   .update({
			//     status: 'completed',
			//     payment_method: payment_method,
			//     completed_at: completed_at
			//   })
			//   .eq('order_id', order_id);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Webhook Error:', error);
		return json({ error: String(error) }, { status: 500 });
	}
};
