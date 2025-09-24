<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	// import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mx-auto max-w-full px-2 md:max-w-8/12">
	<Nav />
	<!-- <Header /> -->
	<main class="container mx-auto p-4">
		{@render children?.()}
	</main>
	<Footer />
</div>
