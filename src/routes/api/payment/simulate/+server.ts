import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { order_id, amount } = body;

		if (!order_id) {
			return json(
				{
					success: false,
					error: 'Order ID wajib diisi'
				},
				{ status: 400 }
			);
		}

		if (!amount || amount <= 0) {
			return json(
				{
					success: false,
					error: 'Amount harus lebih dari 0'
				},
				{ status: 400 }
			);
		}

		// Simulate payment without calling Pakasir API
		// This is for testing purposes only
		const simulatedResponse = {
			success: true,
			message: 'Payment simulation berhasil (Test Mode)',
			data: {
				order_id,
				amount,
				simulated_at: new Date().toISOString(),
				status: 'simulated',
				note: 'Ini adalah simulasi test. Untuk menggunakan Pakasir API yang sebenarnya, konfigurasikan PAKASIR_API_KEY dan PUBLIC_PAKASIR_SLUG di environment variables.'
			}
		};

		return json(simulatedResponse);
	} catch (err) {
		console.error('Payment simulation error:', err);

		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Terjadi kesalahan saat simulasi pembayaran'
			},
			{ status: 500 }
		);
	}
};
