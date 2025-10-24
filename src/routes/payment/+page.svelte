<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PaymentMethod } from '$lib/types/pakasir';

	let amount = 50000;
	let paymentMethod: PaymentMethod = 'qris';
	let loading = false;
	let error = '';

	const paymentMethods: { value: PaymentMethod; label: string }[] = [
		{ value: 'qris', label: 'QRIS' },
		{ value: 'bni_va', label: 'BNI Virtual Account' },
		{ value: 'bri_va', label: 'BRI Virtual Account' },
		{ value: 'cimb_niaga_va', label: 'CIMB Niaga Virtual Account' },
		{ value: 'permata_va', label: 'Permata Virtual Account' },
		{ value: 'maybank_va', label: 'Maybank Virtual Account' },
		{ value: 'sampoerna_va', label: 'Sampoerna Virtual Account' },
		{ value: 'bnc_va', label: 'BNC Virtual Account' },
		{ value: 'atm_bersama_va', label: 'ATM Bersama Virtual Account' },
		{ value: 'artha_graha_va', label: 'Artha Graha Virtual Account' },
		{ value: 'retail', label: 'Retail' }
	];

	async function handlePayment() {
		if (amount <= 0) {
			error = 'Jumlah pembayaran harus lebih dari 0';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/payment/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					amount,
					payment_method: paymentMethod
				})
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Gagal membuat pembayaran');
			}

			goto(`/payment/success?order_id=${data.transaction.order_id}`);
		} catch (err) {
			console.error('Payment error:', err);
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	function formatRupiah(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="mb-4 card-title text-2xl">Pembayaran</h2>

			<div class="form-control w-full">
				<label class="label" for="amount">
					<span class="label-text">Jumlah Pembayaran</span>
				</label>
				<input
					id="amount"
					type="number"
					min="1000"
					step="1000"
					bind:value={amount}
					class="input-bordered input w-full"
					disabled={loading}
				/>
				<label class="label" for="amount-display">
					<span id="amount-display" class="label-text-alt">{formatRupiah(amount)}</span>
				</label>
			</div>

			<div class="form-control w-full">
				<label class="label" for="payment-method">
					<span class="label-text">Metode Pembayaran</span>
				</label>
				<select
					id="payment-method"
					bind:value={paymentMethod}
					class="select-bordered select w-full"
					disabled={loading}
				>
					{#each paymentMethods as method}
						<option value={method.value}>{method.label}</option>
					{/each}
				</select>
			</div>

			{#if error}
				<div class="mt-4 alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<div class="mt-6 card-actions justify-end">
				<button class="btn w-full btn-primary" on:click={handlePayment} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner"></span>
						Memproses...
					{:else}
						Bayar Sekarang
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
