import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const { amount, order_id, method } = await request.json();

	const res = await fetch(`https://app.pakasir.com/api/transactioncreate/${method}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			project: process.env.PUBLIC_PAKASIR_SLUG,
			order_id,
			amount,
			api_key: process.env.PAKASIR_API_KEY
		})
	});

	const data = await res.json();
	if (!res.ok) return json({ error: data.error || 'Gagal membuat transaksi' }, { status: 400 });

	return json(data);
};
