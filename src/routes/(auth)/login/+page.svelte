<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import { ArrowLeft, Eye, EyeOff, AlertCircle, Sun, Moon, Loader2 } from '@lucide/svelte';

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

<div class="min-h-[100dvh] w-full flex flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors">
	<!-- Top Bar -->
	<header class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs">
		<a
			href="/"
			class="group inline-flex items-center gap-1.5 text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
		>
			<ArrowLeft size={14} class="transition-transform group-hover:-translate-x-0.5" />
			<span>Beranda</span>
		</a>

		<button
			type="button"
			class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all"
			onclick={toggleTheme}
			aria-label="Ganti tema"
		>
			{#if isDark}
				<Sun size={14} class="text-amber-400" />
			{:else}
				<Moon size={14} class="text-slate-600" />
			{/if}
		</button>
	</header>

	<!-- Main Auth Container -->
	<main class="flex-1 flex items-center justify-center px-4 py-8">
		<div class="w-full max-w-[380px]">
			<!-- Header inside flow -->
			<div class="text-center mb-5">
				<h1 class="text-xl font-bold tracking-tight text-[var(--ttx-text-main)]">
					Masuk ke Akun
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
					Akses seluruh dokumen dan preferensi Anda.
				</p>
			</div>

			<!-- Card Container -->
			<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-7 shadow-xs space-y-4">
				{#if errorMsg}
					<div class="flex items-start gap-2 p-3 rounded-xl border border-rose-500/25 bg-rose-500/10 text-xs text-rose-400 animate-fade-in leading-relaxed">
						<AlertCircle size={15} class="shrink-0 mt-0.5" />
						<span class="flex-1">{errorMsg}</span>
					</div>
				{/if}

				<!-- Google OAuth -->
				<button
					type="button"
					class="w-full h-10 flex items-center justify-center gap-2.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] text-xs font-medium text-[var(--ttx-text-main)] transition-colors cursor-pointer disabled:opacity-50"
					onclick={() => handleOAuthLogin('google')}
					disabled={googleLoading || loading}
				>
					{#if googleLoading}
						<Loader2 size={15} class="animate-spin text-[var(--ttx-accent)]" />
						<span>Menghubungkan...</span>
					{:else}
						<svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
							/>
						</svg>
						<span>Lanjutkan dengan Google</span>
					{/if}
				</button>

				<!-- Divider -->
				<div class="relative flex items-center justify-center my-3">
					<div class="w-full border-t border-[var(--ttx-border-subtle)]"></div>
					<span class="absolute bg-[var(--ttx-bg-card)] px-2.5 text-[11px] text-[var(--ttx-text-dim)]">
						atau
					</span>
				</div>

				<!-- Form -->
				<form onsubmit={handleLogin} class="space-y-3.5">
					<div>
						<label for="email" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
							Email
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							class="w-full h-10 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
							required
						/>
					</div>

					<div>
						<div class="flex items-center justify-between mb-1">
							<label for="password" class="text-xs font-medium text-[var(--ttx-text-main)]">
								Password
							</label>
							<a
								href="/forgot-password"
								class="text-[11px] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors"
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
								class="w-full h-10 pl-3 pr-10 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
							>
								{#if showPassword}
									<EyeOff size={15} />
								{:else}
									<Eye size={15} />
								{/if}
							</button>
						</div>
					</div>

					<!-- Turnstile Widget -->
					<div class="pt-1">
						<Turnstile
							bind:this={turnstileRef}
							action="login"
							theme={isDark ? 'dark' : 'light'}
							onSuccess={(token) => (turnstileToken = token)}
							onError={() => (turnstileToken = '')}
							onExpire={() => (turnstileToken = '')}
						/>
					</div>

					<button
						type="submit"
						class="w-full h-10 rounded-xl bg-[var(--ttx-accent)] text-xs font-semibold text-[var(--ttx-accent-contrast)] hover:bg-[var(--ttx-accent-hover)] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
						disabled={loading || googleLoading}
					>
						{#if loading}
							<Loader2 size={15} class="animate-spin" />
							<span>Memproses...</span>
						{:else}
							<span>Masuk</span>
						{/if}
					</button>
				</form>
			</div>

			<!-- Footer link -->
			<p class="text-center text-xs text-[var(--ttx-text-muted)] mt-5">
				Belum punya akun?
				<a href="/register" class="font-semibold text-[var(--ttx-accent-text)] hover:underline ml-1">
					Daftar sekarang
				</a>
			</p>
		</div>
	</main>

	<!-- Footer -->
	<footer class="py-4 text-center text-[11px] text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
