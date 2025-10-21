// src/routes/api/callback/+server.ts
import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { supabase } from '$lib/server/supabase.server';
import type { RequestHandler } from './$types';

const PRIVATE_KEY = process.env.VITE_TRIPAY_PRIVATE_KEY!;

export const POST: RequestHandler = async ({ request }) => {
	const raw = await request.text();
	const sig = request.headers.get('x-callback-signature')!;
	const event = request.headers.get('x-callback-event')!;

	const hmac = crypto.createHmac('sha256', PRIVATE_KEY).update(raw).digest('hex');
	if (hmac !== sig) return json({ success: false }, { status: 401 });
	if (event !== 'payment_status') return json({ success: true });

	const body = JSON.parse(raw);
	const { status, merchant_ref, amount_received, fee_merchant } = body;

	await supabase
		.from('payments')
		.update({
			status,
			tripay_ref: body.reference,
			fee: fee_merchant,
			net_received: amount_received,
			paid_at: status === 'PAID' ? new Date().toISOString() : null
		})
		.eq('merchant_ref', merchant_ref);

	return json({ success: true });
};
