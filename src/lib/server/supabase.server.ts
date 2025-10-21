import { createClient } from '@supabase/supabase-js';
import {
	SUPABASE_URL,
	SUPABASE_SERVICE_KEY,
	NOTEPAD_ENCRYPTION_KEY,
	PAKASIR_API_KEY
} from '$env/static/private';
import { PUBLIC_PAKASIR_SLUG } from '$env/static/public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const ENCRYPTION_KEY_SERVER = NOTEPAD_ENCRYPTION_KEY;

// Pakasir Functions
type PakasirMethod =
	| 'qris'
	| 'cimb_niaga_va'
	| 'bni_va'
	| 'retail'
	| 'sampoerna_va'
	| 'bnc_va'
	| 'maybank_va'
	| 'permata_va'
	| 'atm_bersama_va'
	| 'artha_graha_va'
	| 'bri_va';

interface PakasirPayment {
	project: string;
	order_id: string;
	amount: number;
	fee: number;
	total_payment: number;
	payment_method: string;
	payment_number: string;
	expired_at: string;
}

interface PakasirResponse {
	payment: PakasirPayment;
}

export async function createPakasirTransaction(
	orderId: string,
	amount: number,
	method: PakasirMethod = 'qris'
): Promise<PakasirResponse> {
	const response = await fetch(`https://app.pakasir.com/api/transactioncreate/${method}`, {
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

	if (!response.ok) {
		throw new Error(`Pakasir API error: ${response.statusText}`);
	}

	return response.json();
}

export async function getTransactionStatus(orderId: string, amount: number) {
	const params = new URLSearchParams({
		project: PUBLIC_PAKASIR_SLUG,
		order_id: orderId,
		amount: amount.toString(),
		api_key: PAKASIR_API_KEY
	});

	const response = await fetch(`https://app.pakasir.com/api/transactiondetail?${params}`, {
		method: 'GET'
	});

	if (!response.ok) {
		throw new Error(`Pakasir API error: ${response.statusText}`);
	}

	return response.json();
}

export async function simulatePayment(orderId: string, amount: number) {
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

	if (!response.ok) {
		throw new Error(`Pakasir API error: ${response.statusText}`);
	}

	return response.json();
}
