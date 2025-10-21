<script lang="ts">
	import PakasirPayment from '$lib/components/PakasirPayment.svelte';
	import { onMount } from 'svelte';

	let orderId = '';
	let amount = 50000;

	onMount(() => {
		orderId = 'INV' + Date.now();
	});
</script>

{#if orderId}
	<PakasirPayment {orderId} {amount} />
{:else}
	<div>Loading...</div>
{/if}
