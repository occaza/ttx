<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let errorMsg = $state('');
	let googleLoading = $state(false);
	let turnstileToken = $state('');
	let turnstileRef: Turnstile | undefined = $state();

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

		const urlParams = new URLSearchParams(window.location.search);
		const err = urlParams.get('error') || urlParams.get('error_description');
		if (err) {
			errorMsg = err;
		}
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

		let next = new URLSearchParams(window.location.search).get('next') || '/dashboard';
		if (next.startsWith('/login') || next.startsWith('/register')) next = '/dashboard';

		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
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

		// Verifikasi Turnstile Bot Protection
		try {
			const verifyRes = await fetch('/api/turnstile-verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: turnstileToken })
			});
			const verifyData = await verifyRes.json();
			if (!verifyData.success) {
				errorMsg = verifyData.error || 'Verifikasi keamanan bot gagal. Silakan coba lagi.';
				loading = false;
				turnstileRef?.reset();
				return;
			}
		} catch (err: any) {
			errorMsg = 'Gagal menghubungi server verifikasi bot.';
			loading = false;
			turnstileRef?.reset();
			return;
		}

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			errorMsg = error.message;
			loading = false;
			turnstileRef?.reset();
		} else {
			let next = new URLSearchParams(window.location.search).get('next') || '/dashboard';
			if (next.startsWith('/login') || next.startsWith('/register')) next = '/dashboard';
			window.location.href = next;
		}
	}
</script>

<svelte:head>
	<title>Masuk - TEXY</title>
</svelte:head>

<div
	class="flex min-h-[100dvh] w-full flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors"
>
	<!-- Top Bar -->
	<header class="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 text-xs">
		<a
			href="/"
			class="text-[var(--ttx-text-muted)] transition-colors hover:text-[var(--ttx-text-main)]"
		>
			← Beranda
		</a>

		<button
			type="button"
			class="rounded border border-[var(--ttx-border-base)] px-2 py-1 text-[var(--ttx-text-muted)] transition-colors hover:text-[var(--ttx-text-main)]"
			onclick={toggleTheme}
		>
			{isDark ? 'Mode Terang' : 'Mode Gelap'}
		</button>
	</header>

	<!-- Main Container -->
	<main class="flex flex-1 items-center justify-center px-4 py-8">
		<div class="w-full max-w-sm">
			<div
				class="rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-7"
			>
				<h1 class="text-lg font-semibold text-[var(--ttx-text-main)]">Masuk</h1>
				<p class="mt-1 text-xs text-[var(--ttx-text-muted)]">
					Belum punya akun?
					<a href="/register" class="text-[var(--ttx-accent-text)] hover:underline">Daftar sekarang</a>
				</p>

				{#if errorMsg}
					<div
						class="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
					>
						{errorMsg}
					</div>
				{/if}

				<form onsubmit={handleLogin} class="mt-5 space-y-4">
					<div>
						<label for="email" class="mb-1.5 block text-xs font-medium text-[var(--ttx-text-main)]">
							Email
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							class="h-10 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-colors focus:border-[var(--ttx-border-focus)] focus:outline-none"
							required
						/>
					</div>

					<div>
						<div class="mb-1.5 flex items-center justify-between">
							<label for="password" class="block text-xs font-medium text-[var(--ttx-text-main)]">
								Password
							</label>
							<a
								href="/forgot-password"
								class="text-xs text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] hover:underline"
							>
								Lupa password?
							</a>
						</div>
						<div class="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="••••••••"
								class="h-10 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pr-16 pl-3 text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-colors focus:border-[var(--ttx-border-focus)] focus:outline-none"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center px-2.5 text-xs text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
								onclick={() => (showPassword = !showPassword)}
							>
								{showPassword ? 'Sembunyikan' : 'Lihat'}
							</button>
						</div>
					</div>

					<Turnstile
						bind:this={turnstileRef}
						action="login"
						theme={isDark ? 'dark' : 'light'}
						onSuccess={(token) => (turnstileToken = token)}
						onError={() => (turnstileToken = '')}
						onExpire={() => (turnstileToken = '')}
					/>

					<button
						type="submit"
						class="h-10 w-full cursor-pointer rounded-lg bg-[var(--ttx-accent)] text-xs font-medium text-white transition-colors hover:bg-[var(--ttx-accent-hover)] active:scale-[0.99] disabled:opacity-50"
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
					class="h-10 w-full cursor-pointer rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs font-medium text-[var(--ttx-text-main)] transition-colors hover:bg-[var(--ttx-bg-hover)] disabled:opacity-50"
					onclick={() => handleOAuthLogin('google')}
					disabled={googleLoading || loading}
				>
					{googleLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
				</button>
			</div>
		</div>
	</main>

	<footer class="w-full py-4 text-center text-xs text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
