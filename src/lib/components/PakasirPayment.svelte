<script lang="ts">
	import { onMount } from 'svelte';

	export let orderId: string;
	export let amount: number;

	let qrString: string = '';
	let loading = false;
	let error: string = '';
	let showQr = false;
	let isSandbox = true;

	async function initializePayment() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/create-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderId, amount })
			});

			const data = await response.json();

			if (data.payment) {
				qrString = data.payment.payment_number;
				showQr = true;
			} else {
				error = 'Gagal membuat transaksi';
			}
		} catch (err) {
			error = 'Terjadi kesalahan: ' + err;
		} finally {
			loading = false;
		}
	}

	async function simulatePayment() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/simulate-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderId, amount })
			});

			const data = await response.json();

			if (data.payment) {
				error = 'Simulasi pembayaran berhasil';
			} else {
				error = 'Gagal simulasi pembayaran';
			}
		} catch (err) {
			error = 'Terjadi kesalahan: ' + err;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		initializePayment();
	});
</script>

<div class="card bg-base-100 shadow-lg">
	<div class="card-body">
		<h2 class="card-title">Pembayaran</h2>

		{#if error}
			<div class="alert alert-error">
				<span>{error}</span>
			</div>
		{/if}

		{#if loading}
			<div class="flex justify-center">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{/if}

		{#if showQr && qrString}
			<div class="text-center">
				<p class="mb-4">Rp {amount.toLocaleString('id-ID')}</p>
				<img
					src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`}
					alt="QR Code"
					class="mx-auto w-full max-w-sm"
				/>

				{#if isSandbox}
					<div class="mt-6">
						<p class="mb-3 text-sm">Mode Sandbox</p>
						<button class="btn btn-sm btn-primary" on:click={simulatePayment} disabled={loading}>
							Simulasi Pembayaran
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
