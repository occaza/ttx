// src/lib/server/tripay.ts

import crypto from 'node:crypto';

const BASE =
	process.env.TRIPAY_MODE === 'production'
		? 'https://tripay.co.id/api'
		: 'https://tripay.co.id/api-sandbox';

type ClosedArgs = { merchantCode: string; merchantRef: string; amount: number };
type OpenArgs = { merchantCode: string; merchantRef: string; channel: string };

export function signClosed(a: ClosedArgs) {
	const key = process.env.TRIPAY_PRIVATE_KEY!;
	console.log('[DEBUG] TRIPAY_PRIVATE_KEY =', key); // <-- ini

	const str = a.merchantCode + a.merchantRef + a.amount;
	return crypto.createHmac('sha256', key).update(str).digest('hex');
}

export async function tripayPost(path: string, body: Record<string, unknown>) {
	const res = await fetch(BASE + path, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	return res.json() as Promise<{ success: boolean; message?: string; data?: any }>;
}
