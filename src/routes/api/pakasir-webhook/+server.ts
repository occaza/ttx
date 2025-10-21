import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase.server';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json();

	const { amount, order_id, project, status, payment_method, completed_at } = payload;

	if (status === 'completed') {
		const { error } = await supabase
			.from('transactions')
			.update({
				status: 'completed',
				payment_method: payment_method,
				completed_at: completed_at
			})
			.eq('order_id', order_id);

		if (error) {
			console.error('Error updating transaction:', error);
			return json({ success: false }, { status: 500 });
		}
	}

	return json({ success: true });
};
