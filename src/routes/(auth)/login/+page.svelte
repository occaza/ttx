<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, Sun, Moon, Loader2 } from '@lucide/svelte';

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

<div class="relative flex min-h-[100dvh] w-full flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors selection:bg-[var(--ttx-accent)] selection:text-[var(--ttx-accent-contrast)]">
	<!-- Background subtle glow -->
	<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--ttx-accent-light),transparent_60%)] opacity-40"></div>

	<!-- Top Navigation -->
	<header class="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
		<a
			href="/"
			class="group inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-card)] hover:text-[var(--ttx-text-main)]"
		>
			<ArrowLeft size={15} class="transition-transform group-hover:-translate-x-0.5" />
			<span>Kembali ke Beranda</span>
		</a>

		<button
			type="button"
			class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)] transition-all hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] active:scale-95 shadow-xs"
			onclick={toggleTheme}
			aria-label="Ganti tema"
			title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
		>
			{#if isDark}
				<Sun size={15} class="text-amber-400" />
			{:else}
				<Moon size={15} class="text-slate-600" />
			{/if}
		</button>
	</header>

	<!-- Main Card Section -->
	<main class="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
		<div class="w-full max-w-[420px]">
			<!-- Brand header -->
			<div class="mb-6 text-center">
				<a href="/" class="inline-flex items-center gap-1.5 font-black text-xl tracking-tight text-[var(--ttx-text-main)]">
					<span>TEXY</span>
					<span class="h-2 w-2 rounded-full bg-[var(--ttx-accent)]"></span>
				</a>
				<h1 class="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
					Selamat Datang Kembali
				</h1>
				<p class="mt-1 text-xs text-[var(--ttx-text-muted)]">
					Masuk untuk mengelola catatan dan alat tersimpan Anda.
				</p>
			</div>

			<!-- Card -->
			<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-8 shadow-xl backdrop-blur-xs transition-all">
				{#if errorMsg}
					<div class="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 animate-fade-in">
						<AlertCircle size={16} class="shrink-0 mt-0.5 text-rose-400" />
						<div class="min-w-0 flex-1 leading-relaxed">{errorMsg}</div>
					</div>
				{/if}

				<!-- Google OAuth Button -->
				<button
					type="button"
					class="relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-4 text-xs font-semibold text-[var(--ttx-text-main)] transition-all hover:bg-[var(--ttx-bg-hover)] hover:border-[var(--ttx-border-base)] active:scale-[0.99] shadow-xs disabled:opacity-50"
					onclick={() => handleOAuthLogin('google')}
					disabled={googleLoading || loading}
				>
					{#if googleLoading}
						<Loader2 size={16} class="animate-spin text-[var(--ttx-accent)]" />
						<span>Menghubungkan ke Google...</span>
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
				<div class="relative my-5 flex items-center justify-center">
					<div class="w-full border-t border-[var(--ttx-border-base)]"></div>
					<span class="relative bg-[var(--ttx-bg-card)] px-3 text-[11px] font-medium uppercase tracking-wider text-[var(--ttx-text-dim)]">
						atau email
					</span>
				</div>

				<!-- Email & Password Form -->
				<form onsubmit={handleLogin} class="space-y-4">
					<div>
						<label for="email" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
							Email
						</label>
						<div class="relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ttx-text-dim)]">
								<Mail size={16} />
							</div>
							<input
								id="email"
								type="email"
								bind:value={email}
								placeholder="nama@email.com"
								class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-10 pr-3.5 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
								required
							/>
						</div>
					</div>

					<div>
						<div class="mb-1.5 flex items-center justify-between">
							<label for="password" class="block text-xs font-semibold text-[var(--ttx-text-main)]">
								Password
							</label>
							<a
								href="/forgot-password"
								class="text-[11px] font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors"
							>
								Lupa password?
							</a>
						</div>
						<div class="relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ttx-text-dim)]">
								<Lock size={16} />
							</div>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="••••••••"
								class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-10 pr-11 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors focus:outline-none"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
								title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
							>
								{#if showPassword}
									<EyeOff size={16} />
								{:else}
									<Eye size={16} />
								{/if}
							</button>
						</div>
					</div>

					<!-- Turnstile Bot Protection Widget -->
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
						class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ttx-accent)] text-xs font-bold text-[var(--ttx-accent-contrast)] shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-[0.99] disabled:opacity-50"
						disabled={loading || googleLoading}
					>
						{#if loading}
							<Loader2 size={16} class="animate-spin" />
							<span>Memproses...</span>
						{:else}
							<span>Masuk ke Akun</span>
						{/if}
					</button>
				</form>

				<!-- Switch to Register -->
				<div class="mt-6 pt-5 border-t border-[var(--ttx-border-base)] text-center text-xs text-[var(--ttx-text-muted)]">
					Belum punya akun?
					<a href="/register" class="font-bold text-[var(--ttx-accent-text)] hover:underline ml-1">
						Daftar sekarang
					</a>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="relative z-10 py-5 text-center text-[11px] text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY Workspace. Hak cipta dilindungi.
	</footer>
</div>
