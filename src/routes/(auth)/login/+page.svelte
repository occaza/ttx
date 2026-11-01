<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let errorMsg = $state('');
	let googleLoading = $state(false);

	function getInitialTheme(): boolean {
		if (!browser) return true;
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) return savedTheme === 'dark';
		const currentTheme = document.documentElement.getAttribute('data-theme');
		if (currentTheme) return currentTheme === 'dark';
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	let isDark = $state(true);

	onMount(() => {
		isDark = getInitialTheme();
	});

	function toggleTheme() {
		isDark = !isDark;
		const nextTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', nextTheme);
		localStorage.setItem('theme', nextTheme);
	}

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	async function handleOAuthLogin(provider: 'google') {
		if (provider === 'google') googleLoading = true;
		errorMsg = '';

		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (error) {
			errorMsg = error.message;
			if (provider === 'google') googleLoading = false;
		}
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		if (!email || !password) {
			errorMsg = 'Email dan password harus diisi';
			return;
		}

		loading = true;
		errorMsg = '';

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			errorMsg = error.message;
			loading = false;
		} else {
			goto('/dashboard');
		}
	}
</script>

<svelte:head>
	<title>Masuk - TEXY</title>
</svelte:head>

<div class="min-h-[100dvh] w-full flex flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors">
	<!-- Top Bar -->
	<header class="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between text-xs">
		<a
			href="/"
			class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
		>
			← Beranda
		</a>

		<button
			type="button"
			class="px-2 py-1 rounded border border-[var(--ttx-border-base)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
			onclick={toggleTheme}
		>
			{isDark ? 'Mode Terang' : 'Mode Gelap'}
		</button>
	</header>

	<!-- Main Container -->
	<main class="flex-1 flex items-center justify-center px-4 py-8">
		<div class="w-full max-w-sm">
			<div class="rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-7">
				<h1 class="text-lg font-semibold text-[var(--ttx-text-main)]">Masuk</h1>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
					Belum punya akun?
					<a href="/register" class="text-blue-500 hover:underline">Daftar sekarang</a>
				</p>

				{#if errorMsg}
					<div class="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
						{errorMsg}
					</div>
				{/if}

				<form onsubmit={handleLogin} class="mt-5 space-y-4">
					<div>
						<label for="email" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
							Email
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							class="w-full h-10 px-3 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
							required
						/>
					</div>

					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label for="password" class="block text-xs font-medium text-[var(--ttx-text-main)]">
								Password
							</label>
							<a href="/forgot-password" class="text-xs text-[var(--ttx-text-muted)] hover:text-blue-500 hover:underline">
								Lupa password?
							</a>
						</div>
						<div class="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="••••••••"
								class="w-full h-10 pl-3 pr-16 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 px-2.5 flex items-center text-xs text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
								onclick={() => (showPassword = !showPassword)}
							>
								{showPassword ? 'Sembunyikan' : 'Lihat'}
							</button>
						</div>
					</div>

					<button
						type="submit"
						class="w-full h-10 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-colors cursor-pointer"
						disabled={loading || googleLoading}
					>
						{loading ? 'Memproses...' : 'Masuk'}
					</button>
				</form>

				<div class="relative my-5">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-[var(--ttx-border-base)]"></div>
					</div>
					<div class="relative flex justify-center text-xs">
						<span class="bg-[var(--ttx-bg-card)] px-2 text-[var(--ttx-text-dim)]">atau</span>
					</div>
				</div>

				<button
					type="button"
					class="w-full h-10 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] text-xs font-medium text-[var(--ttx-text-main)] transition-colors disabled:opacity-50 cursor-pointer"
					onclick={() => handleOAuthLogin('google')}
					disabled={googleLoading || loading}
				>
					{googleLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
				</button>
			</div>
		</div>
	</main>

	<footer class="w-full text-center py-4 text-xs text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
