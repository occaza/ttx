import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const { amount, order_id, method } = await request.json();

		const project = process.env.PUBLIC_PAKASIR_SLUG;
		const apiKey = process.env.PAKASIR_API_KEY;

		console.log('Pakasir v2 ENV:', {
			slug: project,
			key: apiKey ? apiKey.slice(0, 6) + '...' : 'undefined'
		});

		if (!project || !apiKey) {
			throw new Error('Konfigurasi .env tidak lengkap');
		}

		const res = await fetch(`https://app.pakasir.com/api/transactioncreate/${method}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				project,
				order_id,
				amount,
				api_key: apiKey
			})
		});

		const text = await res.text();
		console.log('Pakasir v2 response:', res.status, text);

		if (!res.ok) {
			return json({ error: `API Error: ${res.status} - ${text}` }, { status: res.status });
		}

		const data = text ? JSON.parse(text) : null;
		if (!data) throw new Error('Response kosong dari Pakasir');

		return json(data);
	} catch (err: any) {
		console.error('Pakasir v2 Error:', err);
		return json({ error: err.message }, { status: 500 });
	}
};
