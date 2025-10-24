<script lang="ts">
	let orderId = '';
	let amount = 50000;
	let loading = false;
	let result = '';

	// Generate order ID on component mount
	function generateOrderId(): string {
		const timestamp = Date.now().toString(36).toUpperCase();
		const random = Math.random().toString(36).substring(2, 8).toUpperCase();
		return `TEST_${timestamp}_${random}`;
	}

	// Initialize with generated order ID
	orderId = generateOrderId();

	async function simulatePayment() {
		if (!orderId.trim()) {
			result = 'Order ID tidak boleh kosong';
			return;
		}

		loading = true;
		result = '';
		
		try {
			const response = await fetch('/api/payment/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id: orderId, amount })
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || `HTTP error! status: ${response.status}`);
			}
			
			result = JSON.stringify(data, null, 2);
		} catch (err) {
			result = err instanceof Error ? err.message : 'An unexpected error occurred';
		}
		loading = false;
	}

	function generateNewOrderId() {
		orderId = generateOrderId();
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-3xl font-bold">Test Payment Simulation</h1>
	
	<div class="space-y-4">
		<div class="form-control">
			<label class="label" for="order-id">
				<span class="label-text">Order ID</span>
			</label>
			<div class="flex gap-2">
				<input
					id="order-id"
					type="text"
					bind:value={orderId}
					placeholder="Order ID"
					class="input-bordered input flex-1"
				/>
				<button class="btn btn-outline" on:click={generateNewOrderId}>
					Generate
				</button>
			</div>
		</div>

		<div class="form-control">
			<label class="label" for="amount">
				<span class="label-text">Amount (Rupiah)</span>
			</label>
			<input 
				id="amount"
				type="number" 
				bind:value={amount} 
				class="input-bordered input" 
				min="1000"
			/>
		</div>

		<button 
			class="btn btn-primary w-full" 
			on:click={simulatePayment} 
			disabled={loading}
		>
			{loading ? 'Processing...' : 'Simulate Payment'}
		</button>

		{#if result}
			<div class="mt-6">
				<h3 class="mb-2 text-lg font-semibold">Result:</h3>
				<pre class="rounded bg-base-200 p-4 text-sm">{result}</pre>
			</div>
		{/if}
	</div>
</div>
