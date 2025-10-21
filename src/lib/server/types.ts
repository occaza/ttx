// src/lib/server/types.ts

export interface Payment {
	id: string;
	created_at: string;
	user_id: string;
	merchant_ref: string;
	tripay_ref: string | null;
	method: string | null;
	amount: number;
	fee: number | null;
	net_received: number | null;
	status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED';
	paid_at: string | null;
}
