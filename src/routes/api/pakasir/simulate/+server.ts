import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const { amount, order_id } = await request.json();

	const res = await fetch('https://app.pakasir.com/api/paymentsimulation', {
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
	return json(data);
};
