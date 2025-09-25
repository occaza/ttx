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

<div class="min-h-screen bg-gray-50/15">
	<div class="mx-auto max-w-full px-2 md:max-w-8/12">
		<Nav />
		<main class="h-[1820px] pt-24">
			{@render children?.()}
		</main>
		<Footer />
	</div>
</div>
