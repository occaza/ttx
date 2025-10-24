<script lang="ts">
	let orderId = '';
	let amount = 50000;
	let loading = false;
	let result = '';

	async function simulatePayment() {
		loading = true;
		try {
			const response = await fetch('/api/payment/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id: orderId, amount })
			});
			const data = await response.json();
			result = JSON.stringify(data, null, 2);
		} catch (err) {
			result = err instanceof Error ? err.message : 'Error';
		}
		loading = false;
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl">Test Payment Simulation</h1>
	<input
		type="text"
		bind:value={orderId}
		placeholder="Order ID"
		class="input-bordered input mb-2"
	/>
	<input type="number" bind:value={amount} class="input-bordered input mb-2" />
	<button class="btn btn-primary" on:click={simulatePayment} disabled={loading}>
		{loading ? 'Processing...' : 'Simulate Payment'}
	</button>
	{#if result}
		<pre class="mt-4 rounded bg-base-200 p-4">{result}</pre>
	{/if}
</div>
