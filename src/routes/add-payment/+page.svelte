<script>
	import PakasirPayment from '$lib/components/PakasirPayment.svelte';
</script>

<PakasirPayment orderId="INV{Date.now()}" amount={50000} />
