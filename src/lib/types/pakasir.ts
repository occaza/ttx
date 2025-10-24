export type PaymentMethod =
	| 'cimb_niaga_va'
	| 'bni_va'
	| 'qris'
	| 'retail'
	| 'sampoerna_va'
	| 'bnc_va'
	| 'maybank_va'
	| 'permata_va'
	| 'atm_bersama_va'
	| 'artha_graha_va'
	| 'bri_va';

export type PaymentStatus = 'pending' | 'completed' | 'expired' | 'failed';

export interface CreateTransactionRequest {
	project: string;
	order_id: string;
	amount: number;
	api_key: string;
}

export interface CreateTransactionResponse {
	payment: {
		project: string;
		order_id: string;
		amount: number;
		fee: number;
		total_payment: number;
		payment_method: string;
		payment_number: string;
		expired_at: string;
	};
}

export interface WebhookPayload {
	amount: number;
	order_id: string;
	project: string;
	status: string;
	payment_method: string;
	completed_at: string;
}

export interface TransactionDetailResponse {
	transaction: {
		amount: number;
		order_id: string;
		project: string;
		status: string;
		payment_method: string;
		completed_at: string;
	};
}

export interface Transaction {
	id: string;
	order_id: string;
	user_id?: string;
	amount: number;
	fee: number;
	total_payment: number;
	payment_method: string;
	payment_number?: string;
	status: PaymentStatus;
	expired_at?: string;
	completed_at?: string;
	created_at: string;
	updated_at: string;
}
