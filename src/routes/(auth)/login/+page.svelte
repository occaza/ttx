<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import {
		ArrowLeft,
		Mail,
		Lock,
		Eye,
		EyeOff,
		Sun,
		Moon,
		AlertCircle,
		CheckCircle2,
		Loader2
	} from '@lucide/svelte';

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
	<title>Masuk - TEXY Workspace</title>
</svelte:head>

<div class="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-x-hidden bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors duration-200">
	<!-- Background subtle ambient lights -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden opacity-40 select-none">
		<div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-blue-600/20 blur-[120px]"></div>
		<div class="absolute -bottom-32 left-1/3 w-[450px] h-[350px] rounded-full bg-cyan-500/15 blur-[120px]"></div>
	</div>

	<!-- Top Navigation Header -->
	<header class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
		<a
			href="/"
			class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)]/80 backdrop-blur-md text-xs font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] active:scale-95 transition-all shadow-xs"
		>
			<ArrowLeft size={15} />
			<span>Kembali ke Beranda</span>
		</a>

		<button
			type="button"
			class="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)]/80 backdrop-blur-md text-amber-400 hover:bg-[var(--ttx-bg-hover)] active:scale-95 transition-all shadow-xs"
			onclick={toggleTheme}
			title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
			aria-label="Toggle theme"
		>
			{#if isDark}
				<Sun size={16} />
			{:else}
				<Moon size={16} class="text-slate-700" />
			{/if}
		</button>
	</header>

	<!-- Main Form Content -->
	<main class="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
		<div class="w-full max-w-[420px]">
			<!-- Card Container -->
			<div class="rounded-2xl sm:rounded-3xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-8 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
				<!-- Brand Logo & Header -->
				<div class="text-center mb-6">
					<div class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/30 mb-3.5">
						<div class="h-full w-full rounded-[14px] flex items-center justify-center bg-[var(--ttx-bg-root)]">
							<svg class="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polygon points="12 2 22 19 2 19"></polygon>
							</svg>
						</div>
					</div>
					<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
						Masuk ke Akun
					</h1>
					<p class="text-xs sm:text-sm text-[var(--ttx-text-muted)] mt-1.5">
						Belum punya akun?
						<a href="/register" class="font-semibold text-blue-500 hover:text-blue-400 hover:underline">
							Daftar gratis
						</a>
					</p>
				</div>

				<!-- Error Alert -->
				{#if errorMsg}
					<div class="mb-5 flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs animate-fadeIn">
						<AlertCircle size={16} class="shrink-0 mt-0.5" />
						<span class="flex-1">{errorMsg}</span>
					</div>
				{/if}

				<!-- Login Form -->
				<form onsubmit={handleLogin} class="space-y-4">
					<!-- Email Input -->
					<div class="space-y-1.5">
						<label for="email" class="block text-xs font-semibold text-[var(--ttx-text-main)]">
							Email
						</label>
						<div class="relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--ttx-text-dim)]">
								<Mail size={16} />
							</div>
							<input
								id="email"
								type="email"
								bind:value={email}
								placeholder="nama@email.com"
								class="w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all outline-none bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								required
							/>
						</div>
					</div>

					<!-- Password Input -->
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label for="password" class="block text-xs font-semibold text-[var(--ttx-text-main)]">
								Password
							</label>
							<a href="/forgot-password" class="text-xs font-medium text-blue-500 hover:text-blue-400 hover:underline">
								Lupa password?
							</a>
						</div>
						<div class="relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--ttx-text-dim)]">
								<Lock size={16} />
							</div>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="••••••••"
								class="w-full h-11 pl-10 pr-10 rounded-xl text-sm transition-all outline-none bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
							>
								{#if showPassword}
									<EyeOff size={16} />
								{:else}
									<Eye size={16} />
								{/if}
							</button>
						</div>
					</div>

					<!-- Submit Button -->
					<div class="pt-2">
						<button
							type="submit"
							class="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
							disabled={loading || googleLoading}
						>
							{#if loading}
								<Loader2 size={17} class="animate-spin" />
								<span>Memproses...</span>
							{:else}
								<span>Masuk ke Akun</span>
							{/if}
						</button>
					</div>
				</form>

				<!-- Divider -->
				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-[var(--ttx-border-base)]"></div>
					</div>
					<div class="relative flex justify-center text-xs">
						<span class="bg-[var(--ttx-bg-card)] px-3 text-[var(--ttx-text-dim)] uppercase tracking-wider font-medium">
							atau
						</span>
					</div>
				</div>

				<!-- Google OAuth Button -->
				<button
					type="button"
					class="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] active:scale-[0.99] text-sm font-medium text-[var(--ttx-text-main)] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
					onclick={() => handleOAuthLogin('google')}
					disabled={googleLoading || loading}
				>
					{#if googleLoading}
						<Loader2 size={17} class="animate-spin text-blue-500" />
						<span>Menghubungkan ke Google...</span>
					{:else}
						<svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
							/>
							<path
								fill="#34A853"
								d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
							/>
							<path
								fill="#FBBC05"
								d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
							/>
							<path
								fill="#EA4335"
								d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
							/>
						</svg>
						<span>Lanjutkan dengan Google</span>
					{/if}
				</button>
			</div>

			<!-- Footer notes -->
			<p class="text-center text-[11px] text-[var(--ttx-text-dim)] mt-6">
				Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi TEXY.
			</p>
		</div>
	</main>

	<!-- Bottom decorative space -->
	<div class="h-6"></div>
</div>
