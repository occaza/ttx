<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Sun, Moon, Loader2 } from '@lucide/svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

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
	let sessionChecked = $state(false);
	let hasSession = $state(true);

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	onMount(async () => {
		isDark = getInitialTheme();
		const { data } = await supabase.auth.getSession();
		hasSession = Boolean(data?.session);
		sessionChecked = true;
	});

	function toggleTheme() {
		isDark = !isDark;
		const nextTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', nextTheme);
		localStorage.setItem('theme', nextTheme);
	}

	async function handleUpdatePassword(e: SubmitEvent) {
		e.preventDefault();
		if (!password || !confirmPassword) {
			errorMsg = 'Semua field wajib diisi';
			return;
		}

		if (password !== confirmPassword) {
			errorMsg = 'Konfirmasi password tidak cocok';
			return;
		}

		if (password.length < 6) {
			errorMsg = 'Password minimal harus 6 karakter';
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

		const { error } = await supabase.auth.updateUser({
			password
		});

		loading = false;

		if (error) {
			errorMsg = error.message;
			turnstileRef?.reset();
		} else {
			successMsg = 'Password berhasil diubah. Mengalihkan ke dashboard...';
			setTimeout(() => {
				window.location.href = '/dashboard';
			}, 1500);
		}
	}
</script>

<svelte:head>
	<title>Atur Ulang Password - TEXY</title>
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

	<!-- Main Container -->
	<main class="flex-1 flex items-center justify-center px-4 py-8">
		<div class="w-full max-w-[380px]">
			<!-- Header -->
			<div class="text-center mb-6">
				<a href="/" class="inline-flex items-center gap-1.5 font-black text-lg tracking-tight text-[var(--ttx-text-main)]">
					<span>TEXY</span>
					<span class="h-1.5 w-1.5 rounded-full bg-[var(--ttx-accent)]"></span>
				</a>
				<h1 class="text-xl font-bold tracking-tight text-[var(--ttx-text-main)] mt-2">
					Atur Password Baru
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
					Masukkan kata sandi baru untuk akun Anda.
				</p>
			</div>

			<!-- Card -->
			<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-7 shadow-xs space-y-4">
				{#if errorMsg}
					<div class="flex items-start gap-2 p-3 rounded-xl border border-rose-500/25 bg-rose-500/10 text-xs text-rose-400 animate-fade-in leading-relaxed">
						<AlertCircle size={15} class="shrink-0 mt-0.5" />
						<span class="flex-1">{errorMsg}</span>
					</div>
				{/if}

				{#if successMsg}
					<div class="flex items-start gap-2 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-xs text-emerald-400 animate-fade-in leading-relaxed">
						<CheckCircle2 size={16} class="shrink-0 mt-0.5" />
						<span class="flex-1">{successMsg}</span>
					</div>
				{:else if sessionChecked && !hasSession}
					<div class="flex flex-col gap-2 p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/10 text-xs text-amber-300">
						<p>Sesi reset password tidak ditemukan atau sudah kadaluarsa.</p>
						<a href="/forgot-password" class="font-semibold text-[var(--ttx-accent-text)] underline mt-1">
							Minta tautan baru →
						</a>
					</div>
				{:else}
					<form onsubmit={handleUpdatePassword} class="space-y-3.5">
						<div>
							<label for="new-password" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Password Baru
							</label>
							<div class="relative">
								<input
									id="new-password"
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="Minimal 6 karakter"
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

						<div>
							<label for="confirm-new-password" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Konfirmasi Password
							</label>
							<div class="relative">
								<input
									id="confirm-new-password"
									type={showConfirmPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									placeholder="Ulangi password baru"
									class="w-full h-10 pl-3 pr-10 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
								>
									{#if showConfirmPassword}
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
								action="reset_password"
								theme={isDark ? 'dark' : 'light'}
								onSuccess={(token) => (turnstileToken = token)}
								onError={() => (turnstileToken = '')}
								onExpire={() => (turnstileToken = '')}
							/>
						</div>

						<button
							type="submit"
							class="w-full h-10 rounded-xl bg-[var(--ttx-accent)] text-xs font-semibold text-[var(--ttx-accent-contrast)] hover:bg-[var(--ttx-accent-hover)] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
							disabled={loading}
						>
							{#if loading}
								<Loader2 size={15} class="animate-spin" />
								<span>Menyimpan...</span>
							{:else}
								<span>Simpan Password</span>
							{/if}
						</button>
					</form>
				{/if}
			</div>

			<!-- Footer link -->
			<p class="text-center text-xs text-[var(--ttx-text-muted)] mt-5">
				<a href="/login" class="font-semibold text-[var(--ttx-accent-text)] hover:underline">
					Kembali ke halaman masuk
				</a>
			</p>
		</div>
	</main>

	<!-- Footer -->
	<footer class="py-4 text-center text-[11px] text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
