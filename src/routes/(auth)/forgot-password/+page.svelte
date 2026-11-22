<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Sun, Moon, Loader2, KeyRound } from '@lucide/svelte';

	let email = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');
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
	});

	function toggleTheme() {
		isDark = !isDark;
		const nextTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', nextTheme);
		localStorage.setItem('theme', nextTheme);
	}

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	async function handleResetPassword(e: SubmitEvent) {
		e.preventDefault();
		if (!email) {
			errorMsg = 'Alamat email wajib diisi';
			return;
		}

		loading = true;
		errorMsg = '';
		successMsg = '';

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

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
		});

		loading = false;

		if (error) {
			errorMsg = error.message;
			turnstileRef?.reset();
		} else {
			successMsg = 'Tautan pengaturan ulang password telah dikirim ke email Anda.';
			email = '';
		}
	}
</script>

<svelte:head>
	<title>Lupa Password - TEXY</title>
</svelte:head>

<div class="relative flex min-h-[100dvh] w-full flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors selection:bg-[var(--ttx-accent)] selection:text-[var(--ttx-accent-contrast)]">
	<!-- Background subtle glow -->
	<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--ttx-accent-light),transparent_60%)] opacity-40"></div>

	<!-- Top Navigation -->
	<header class="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
		<a
			href="/login"
			class="group inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-card)] hover:text-[var(--ttx-text-main)]"
		>
			<ArrowLeft size={15} class="transition-transform group-hover:-translate-x-0.5" />
			<span>Kembali ke Masuk</span>
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
				<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-accent)]/20 shadow-xs">
					<KeyRound size={22} />
				</div>
				<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
					Lupa Kata Sandi?
				</h1>
				<p class="mt-1 text-xs text-[var(--ttx-text-muted)]">
					Masukkan email terdaftar untuk menerima tautan pemulihan kata sandi.
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

				{#if successMsg}
					<div class="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 animate-fade-in">
						<div class="flex items-start gap-2.5">
							<CheckCircle2 size={18} class="shrink-0 mt-0.5 text-emerald-400" />
							<p class="leading-relaxed font-medium">{successMsg}</p>
						</div>
						<a
							href="/login"
							class="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ttx-accent-text)] hover:underline self-start"
						>
							<span>Kembali ke Halaman Masuk</span>
							<ArrowLeft size={13} class="rotate-180" />
						</a>
					</div>
				{:else}
					<form onsubmit={handleResetPassword} class="space-y-4">
						<div>
							<label for="reset-email" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Alamat Email Akun
							</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ttx-text-dim)]">
									<Mail size={16} />
								</div>
								<input
									id="reset-email"
									type="email"
									bind:value={email}
									placeholder="nama@email.com"
									class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-10 pr-3.5 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
									required
								/>
							</div>
						</div>

						<!-- Turnstile Bot Protection Widget -->
						<Turnstile
							bind:this={turnstileRef}
							action="forgot_password"
							theme={isDark ? 'dark' : 'light'}
							onSuccess={(token) => (turnstileToken = token)}
							onError={() => (turnstileToken = '')}
							onExpire={() => (turnstileToken = '')}
						/>

						<button
							type="submit"
							class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ttx-accent)] text-xs font-bold text-[var(--ttx-accent-contrast)] shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-[0.99] disabled:opacity-50"
							disabled={loading}
						>
							{#if loading}
								<Loader2 size={16} class="animate-spin" />
								<span>Mengirim Tautan...</span>
							{:else}
								<span>Kirim Tautan Pemulihan</span>
							{/if}
						</button>
					</form>
				{/if}

				<!-- Back to Login -->
				<div class="mt-6 pt-5 border-t border-[var(--ttx-border-base)] text-center text-xs text-[var(--ttx-text-muted)]">
					Ingat kata sandi Anda?
					<a href="/login" class="font-bold text-[var(--ttx-accent-text)] hover:underline ml-1">
						Masuk di sini
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
