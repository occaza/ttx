<script lang="ts">
	import { onMount } from 'svelte';

	interface Payment {
		order_id: string;
		total_payment: number;
		payment_number: string;
	}

	let amount = 20000;
	let orderId = 'INV' + Date.now();
	let payment: Payment | null = null;
	let error = '';
	async function pay() {
		error = '';
		const res = await fetch('/api/pakasirv2/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount, order_id: orderId, method: 'qris' })
		});
		const data = await res.json();
		if (!res.ok) {
			error = data.error || 'Gagal';
			return;
		}
		payment = data.payment;
	}
	async function simulate() {
		await fetch('/api/pakasirv2/simulate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount, order_id: orderId })
		});
		alert('Simulasi dikirim');
	}
</script>

<button on:click={pay}>Buat Transaksi</button>
{#if payment}
	<p>Order: {payment.order_id}</p>
	<p>Total: Rp {payment.total_payment}</p>
	<img
		src={'https://api.qrserver.com/v1/create-qr-code/?data=' +
			encodeURIComponent(payment.payment_number) +
			'&size=200x200'}
		alt="QR"
	/> <button on:click={simulate}>Simulasi</button>
{/if}
{#if error} <p style="color:red">{error}</p> {/if}
