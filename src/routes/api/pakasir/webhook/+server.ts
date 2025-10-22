// src/routes/api/pakasir/webhook/+server.ts
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const body = await request.json();
	console.log('Webhook diterima:', body);

	// Bisa tambahkan cek sederhana
	if (body.status === 'completed') {
		console.log('Pembayaran selesai untuk order:', body.order_id);
	}

	return json({ success: true });
};
