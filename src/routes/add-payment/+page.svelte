<script lang="ts">
	import PakasirPayment from '$lib/components/PakasirPayment.svelte';
	let orderId = 'INV' + Date.now();
	let amount = 50000;
</script>

<PakasirPayment {orderId} {amount} />
