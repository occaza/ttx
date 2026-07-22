<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import type { User } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';

	let { children, data } = $props();
	let authenticatedUser: User | null = $state(data.user ?? null);
	let isLoading: boolean = $state(false); // Tidak perlu loading lama karena data user dari SSR
	let isNotepad2 = $derived($page.url.pathname.startsWith('/notepad2') || $page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/register'));
	let supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	$effect(() => {
		// Sinkronisasi data user dari SSR ketika terjadi navigasi
		authenticatedUser = data.user ?? null;
	});

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				invalidate('supabase:auth');
			}
		});

		return () => {
			subscription?.unsubscribe();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Primary Meta Tags -->
	<title>TEXY — Kumpulan Tools Online Gratis & Tanpa Login</title>
	<meta name="title" content="TEXY — Kumpulan Tools Online Gratis & Tanpa Login" />
	<meta
		name="description"
		content="Hapus baris duplikat, pisahkan file, hitung line, dan puluhan tools teks lainnya. 100% gratis, tanpa registrasi, semua proses di browser kamu."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://texy.vercel.app" />
	<meta property="og:title" content="TEXY — Kumpulan Tools Online Gratis & Tanpa Login" />
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
	<meta property="twitter:url" content="https://texy.vercel.app" />
	<meta property="twitter:title" content="TEXY — Kumpulan Tools Online Gratis & Tanpa Login" />
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
</svelte:head>

<div class="flex min-h-screen flex-col bg-base-100">
	{#if !$page.error && !isNotepad2}
		<Nav />
	{/if}
	<main class="flex-1 {$page.error ? '' : (isNotepad2 ? '' : 'pt-16')}">
		{@render children?.()}
	</main>
	{#if !$page.error && !isNotepad2}
		<Footer />
	{/if}
</div>
