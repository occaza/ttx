<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class=" min-h-screen bg-base-300">
	<div class="max-w-full md:mx-auto md:max-w-8/12">
		<Nav />

		<!-- Wrapper untuk content dengan padding top untuk navbar -->
		<div class="pt-20">
			{@render children?.()}
		</div>

		<Footer />
	</div>
</div>
