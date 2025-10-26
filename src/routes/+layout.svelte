<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Primary Meta Tags -->
	<title>TEXY – Kumpulan Tools Online Gratis & Tanpa Login</title>
	<meta name="title" content="TEXY – Kumpulan Tools Online Gratis & Tanpa Login" />
	<meta
		name="description"
		content="Hapus baris duplikat, pisahkan file, hitung line, dan puluhan tools teks lainnya. 100% gratis, tanpa registrasi, semua proses di browser kamu."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="texy.yusupmabd.my.id" />
	<meta property="og:title" content="TEXY – Kumpulan Tools Online Gratis & Tanpa Login" />
	<meta
		property="og:description"
		content="Hapus baris duplikat, pisahkan file, hitung line, dan puluhan tools teks lainnya. 100% gratis, tanpa registrasi, semua proses di browser kamu."
	/>
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="texy.yusupmabd.my.id" />
	<meta property="twitter:title" content="TEXY – Kumpulan Tools Online Gratis & Tanpa Login" />
	<meta
		property="twitter:description"
		content="Hapus baris duplikat, pisahkan file, hitung line, dan puluhan tools teks lainnya. 100% gratis, tanpa registrasi, semua proses di browser kamu."
	/>
	<meta
		property="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Theme & Misc -->
	<meta name="theme-color" content="#0ea5e9" />
	<!-- contoh: Tailwind sky-500 -->
</svelte:head>

<div class=" min-h-screen bg-base-300">
	<div class="max-w-full md:mx-auto md:max-w-8/12">
		<Nav />

		<!-- Wrapper untuk content dengan padding top untuk navbar -->
		<div class="pt-30">
			{@render children?.()}
		</div>

		<Footer />
	</div>
</div>
