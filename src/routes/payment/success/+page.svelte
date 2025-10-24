<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Transaction } from '$lib/types/pakasir';
	import QRCode from 'qrcode';

	let transaction: Transaction | null = null;
	let loading = true;
	let error = '';
	let qrCodeUrl = '';
	let checkInterval: ReturnType<typeof setInterval>;

	const orderId = $page.url.searchParams.get('order_id');

	async function loadTransaction() {
		if (!orderId) {
			error = 'Order ID tidak ditemukan';
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/api/transaction/${orderId}`);
			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Gagal memuat transaksi');
			}

			transaction = data.transaction;

			if (transaction?.payment_number && transaction.payment_method === 'qris') {
				qrCodeUrl = await QRCode.toDataURL(transaction.payment_number);
			}

			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
			loading = false;
		}
	}

	async function checkPaymentStatus() {
		if (!orderId || !transaction) return;

		try {
			const response = await fetch(`/api/transaction/${orderId}`);

			if (response.ok) {
				const data = await response.json();
				transaction = data.transaction;

				if (transaction && transaction.status === 'completed') {
					clearInterval(checkInterval);
				}
			}
		} catch (err) {
			console.error('Error checking payment status:', err);
		}
	}

	onMount(() => {
		loadTransaction();
		checkInterval = setInterval(checkPaymentStatus, 5000);
	});

	onDestroy(() => {
		if (checkInterval) {
			clearInterval(checkInterval);
		}
	});

	function formatRupiah(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString('id-ID');
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	{#if loading}
		<div class="flex min-h-[400px] items-center justify-center">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if error}
		<div class="alert alert-error">
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
	{:else if transaction}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				{#if transaction.status === 'completed'}
					<div class="mb-4 alert alert-success">
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Pembayaran Berhasil</span>
					</div>
				{:else}
					<div class="mb-4 alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="h-6 w-6 shrink-0 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span>Menunggu Pembayaran</span>
					</div>
				{/if}

				<h2 class="mb-4 card-title text-2xl">Detail Pembayaran</h2>

				<div class="space-y-4">
					<div>
						<p class="text-sm opacity-70">Order ID</p>
						<div class="flex items-center gap-2">
							<p class="font-mono font-bold">{transaction.order_id}</p>
							<button
								class="btn btn-ghost btn-xs"
								on:click={() => copyToClipboard(transaction?.order_id ?? '')}
							>
								Copy
							</button>
						</div>
					</div>

					<div>
						<p class="text-sm opacity-70">Jumlah</p>
						<p class="text-2xl font-bold">{formatRupiah(transaction.amount)}</p>
					</div>

					<div>
						<p class="text-sm opacity-70">Biaya Admin</p>
						<p class="font-semibold">{formatRupiah(transaction.fee)}</p>
					</div>

					<div class="divider"></div>

					<div>
						<p class="text-sm opacity-70">Total Pembayaran</p>
						<p class="text-2xl font-bold text-primary">{formatRupiah(transaction.total_payment)}</p>
					</div>

					<div>
						<p class="text-sm opacity-70">Metode Pembayaran</p>
						<p class="font-semibold uppercase">{transaction.payment_method}</p>
					</div>

					{#if transaction.payment_method === 'qris' && qrCodeUrl}
						<div class="flex flex-col items-center gap-4 py-4">
							<p class="text-sm opacity-70">Scan QR Code untuk membayar</p>
							<img
								src={qrCodeUrl}
								alt="QR Code"
								class="h-64 w-64 rounded-lg border-4 border-base-300"
							/>
						</div>
					{:else if transaction.payment_number}
						<div>
							<p class="text-sm opacity-70">Nomor Virtual Account</p>
							<div class="flex items-center gap-2">
								<p class="font-mono text-xl font-bold">{transaction.payment_number}</p>
								<button
									class="btn btn-ghost btn-sm"
									on:click={() => copyToClipboard(transaction!.payment_number || '')}
								>
									Copy
								</button>
							</div>
						</div>
					{/if}

					{#if transaction.expired_at && transaction.status === 'pending'}
						<div class="alert alert-warning">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="h-6 w-6 shrink-0 stroke-current"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<div>
								<p class="font-semibold">Kadaluarsa pada</p>
								<p class="text-sm">{formatDate(transaction.expired_at)}</p>
							</div>
						</div>
					{/if}

					{#if transaction.completed_at}
						<div>
							<p class="text-sm opacity-70">Dibayar pada</p>
							<p class="font-semibold">{formatDate(transaction.completed_at)}</p>
						</div>
					{/if}

					<div>
						<p class="text-sm opacity-70">Status</p>
						<div
							class="badge badge-lg {transaction.status === 'completed'
								? 'badge-success'
								: 'badge-warning'}"
						>
							{transaction.status.toUpperCase()}
						</div>
					</div>
				</div>

				<div class="mt-6 card-actions justify-end">
					{#if transaction.status === 'completed'}
						<button class="btn w-full btn-primary" on:click={() => goto('/')}>
							Kembali ke Beranda
						</button>
					{:else}
						<button class="btn w-full btn-ghost" on:click={loadTransaction}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
								/>
							</svg>
							Refresh Status
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
