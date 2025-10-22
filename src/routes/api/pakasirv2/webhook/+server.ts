import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		console.log('Webhook v2 diterima:', body);

		// Contoh body:
		// {
		//   "amount": 22000,
		//   "order_id": "INV123",
		//   "project": "texy",
		//   "status": "completed",
		//   "payment_method": "qris",
		//   "completed_at": "2024-09-10T08:07:02.819+07:00"
		// }

		// Validasi sederhana
		if (!body.order_id || !body.amount) {
			return json({ error: 'Data webhook tidak lengkap' }, { status: 400 });
		}

		// Di production, kamu bisa tambahkan logika validasi & simpan ke database
		return json({ success: true });
	} catch (err: any) {
		console.error('Webhook error:', err);
		return json({ error: err.message }, { status: 500 });
	}
};
