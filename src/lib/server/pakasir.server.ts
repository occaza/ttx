import { PAKASIR_API_KEY } from '$env/static/private';
import { PUBLIC_PAKASIR_SLUG } from '$env/static/public';
import type {
	CreateTransactionRequest,
	CreateTransactionResponse,
	TransactionDetailResponse,
	PaymentMethod
} from '$lib/types/pakasir';

const PAKASIR_API_URL = 'https://app.pakasir.com/api';

export async function createPayment(
	orderId: string,
	amount: number,
	method: PaymentMethod = 'qris'
): Promise<CreateTransactionResponse> {
	const payload: CreateTransactionRequest = {
		project: PUBLIC_PAKASIR_SLUG,
		order_id: orderId,
		amount: amount,
		api_key: PAKASIR_API_KEY
	};

	const response = await fetch(`${PAKASIR_API_URL}/transactioncreate/${method}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		throw new Error(`Pakasir API error: ${response.statusText}`);
	}

	return response.json();
}

export async function getTransactionDetail(
	orderId: string,
	amount: number
): Promise<TransactionDetailResponse> {
	const params = new URLSearchParams({
		project: PUBLIC_PAKASIR_SLUG,
		amount: amount.toString(),
		order_id: orderId,
		api_key: PAKASIR_API_KEY
	});

	const response = await fetch(`${PAKASIR_API_URL}/transactiondetail?${params}`);

	if (!response.ok) {
		throw new Error(`Pakasir API error: ${response.statusText}`);
	}

	return response.json();
}

export async function simulatePayment(orderId: string, amount: number): Promise<void> {
	const payload = {
		project: PUBLIC_PAKASIR_SLUG,
		order_id: orderId,
		amount: amount,
		api_key: PAKASIR_API_KEY
	};

	const response = await fetch(`${PAKASIR_API_URL}/paymentsimulation`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		throw new Error(`Pakasir API error: ${response.statusText}`);
	}
}

export function generateOrderId(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `INV${timestamp}${random}`;
}

export function getPaymentUrl(orderId: string, amount: number, qrisOnly = false): string {
	const baseUrl = `https://app.pakasir.com/pay/${PUBLIC_PAKASIR_SLUG}/${amount}`;
	const params = new URLSearchParams({ order_id: orderId });

	if (qrisOnly) {
		params.append('qris_only', '1');
	}

	return `${baseUrl}?${params}`;
}
