<script lang="ts">
	import { generateOrderId } from '$lib/utils/order';

	let amount = 20000;
	let orderId = generateOrderId();
	let paymentData: any = null;
	let status = '';
	let isLoading = false;

	async function createTransaction() {
		isLoading = true;
		status = '';
		try {
			const res = await fetch('/api/pakasir', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount,
					order_id: orderId,
					method: 'qris'
				})
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');
			paymentData = data.payment;
			status = 'Transaksi dibuat';
		} catch (err: any) {
			status = err.message;
		} finally {
			isLoading = false;
		}
	}

	async function simulatePayment() {
		const res = await fetch('/api/pakasir/simulate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				amount,
				order_id: orderId
			})
		});
		if (res.ok) status = 'Simulasi pembayaran dikirim (sandbox)';
	}
</script>

<h2 class="mb-2 text-xl font-semibold">Simulasi Pembelian</h2>

<div class="space-y-3">
	<input
		type="number"
		bind:value={amount}
		class="w-full rounded border p-2"
		placeholder="Jumlah (contoh 20000)"
	/>

	<button
		on:click={createTransaction}
		disabled={isLoading}
		class="rounded bg-blue-600 px-4 py-2 text-white"
	>
		{isLoading ? 'Memproses...' : 'Buat Transaksi'}
	</button>

	{#if status}
		<p class="text-sm text-gray-600">{status}</p>
	{/if}

	{#if paymentData}
		<div class="mt-4 space-y-2 rounded border p-4">
			<p><strong>Order ID:</strong> {paymentData.order_id}</p>
			<p><strong>Total:</strong> Rp {paymentData.total_payment}</p>
			<p><strong>Metode:</strong> {paymentData.payment_method}</p>
			<p><strong>Kadaluarsa:</strong> {new Date(paymentData.expired_at).toLocaleString()}</p>

			<img
				src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
					paymentData.payment_number
				)}&size=200x200`}
				alt="QR Code"
			/>

			<button on:click={simulatePayment} class="rounded bg-green-600 px-3 py-1 text-white">
				Simulasi Pembayaran
			</button>
		</div>
	{/if}
</div>
