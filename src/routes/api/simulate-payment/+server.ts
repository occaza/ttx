import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PAKASIR_API_KEY } from '$env/static/private';
import { PUBLIC_PAKASIR_SLUG } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { orderId, amount } = await request.json();

		console.log('API Key:', PAKASIR_API_KEY ? 'Ada' : 'Tidak ada');
		console.log('Slug:', PUBLIC_PAKASIR_SLUG);
		console.log('Order ID:', orderId);
		console.log('Amount:', amount);

		const response = await fetch('https://app.pakasir.com/api/paymentsimulation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				project: PUBLIC_PAKASIR_SLUG,
				order_id: orderId,
				amount: amount,
				api_key: PAKASIR_API_KEY
			})
		});

		console.log('Response Status:', response.status);

		const data = await response.json();
		console.log('Response Data:', data);

		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}

		return json(data);
	} catch (error) {
		console.error('Error:', error);
		return json({ error: String(error) }, { status: 500 });
	}
};
