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
		<main class=" mb-5 min-h-dvh place-content-center pt-24 md:bg-white/70">
			{@render children?.()}
		</main>
		<Footer />
	</div>
</div>
