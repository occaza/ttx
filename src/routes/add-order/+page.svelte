<!-- src/routes/add-order/+page.svelte -->
<script lang="ts">
	let amount = 50_000;
	let method = 'BRIVA';
	let email = 'customer@example.com';
	let name = 'Customer';
	let loading = false;
	let va = '';

	async function pay() {
		loading = true;
		const res = await fetch('/api/pay', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount, method, orderId: crypto.randomUUID(), email, name })
		});
		const json = await res.json();
		loading = false;
		if (json.ok) va = json.code;
	}
</script>

<form on:submit|preventDefault={pay} class="flex max-w-sm flex-col gap-2">
	<input bind:value={name} placeholder="Nama" class="input-bordered input" />
	<input bind:value={email} placeholder="Email" class="input-bordered input" type="email" />
	<select bind:value={method} class="select-bordered select">
		<option value="BRIVA">BRIVA</option>
		<option value="BCAVA">BCAVA</option>
		<option value="QRIS">QRIS</option>
	</select>
	<input type="number" bind:value={amount} class="input-bordered input" />
	<button class="btn btn-primary" disabled={loading}>Buat Pembayaran</button>
</form>

{#if va}
	<div class="mt-4 alert alert-info">
		Bayar ke VA: <strong>{va}</strong>
	</div>
{/if}
