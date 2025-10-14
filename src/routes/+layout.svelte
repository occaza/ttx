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

<div class="animated-gradient">
	<div class="max-w-full md:mx-auto md:max-w-8/12">
		<Nav />
		<main class="min-h-dvh place-content-between bg-base-300/50 pt-24 pb-20">
			{@render children?.()}
		</main>
		<Footer />
	</div>
</div>
