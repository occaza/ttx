<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import {
		ArrowLeft,
		Mail,
		KeyRound,
		Sun,
		Moon,
		AlertCircle,
		CheckCircle2,
		Loader2
	} from '@lucide/svelte';

	let email = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');

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

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`
		});

		loading = false;

		if (error) {
			errorMsg = error.message;
		} else {
			successMsg = 'Tautan reset password telah dikirim ke email Anda. Silakan periksa kotak masuk (inbox) atau spam.';
			email = '';
		}
	}
</script>

<svelte:head>
	<title>Lupa Password - TEXY Workspace</title>
</svelte:head>

<div class="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-x-hidden bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors duration-200">
	<!-- Background subtle ambient lights -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden opacity-40 select-none">
		<div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-blue-600/20 blur-[120px]"></div>
		<div class="absolute -bottom-32 left-1/4 w-[450px] h-[350px] rounded-full bg-cyan-500/15 blur-[120px]"></div>
	</div>

	<!-- Top Navigation Header -->
	<header class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
		<a
			href="/login"
			class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)]/80 backdrop-blur-md text-xs font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] active:scale-95 transition-all shadow-xs"
		>
			<ArrowLeft size={15} />
			<span>Kembali ke Login</span>
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
				<!-- Header Icon & Title -->
				<div class="text-center mb-6">
					<div class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/30 mb-3.5">
						<div class="h-full w-full rounded-[14px] flex items-center justify-center bg-[var(--ttx-bg-root)]">
							<KeyRound size={22} class="text-cyan-400" />
						</div>
					</div>
					<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
						Lupa Password?
					</h1>
					<p class="text-xs sm:text-sm text-[var(--ttx-text-muted)] mt-1.5 leading-relaxed">
						Masukkan email terdaftar Anda dan kami akan mengirimkan tautan untuk menyetel ulang kata sandi.
					</p>
				</div>

				<!-- Alerts -->
				{#if errorMsg}
					<div class="mb-5 flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs animate-fadeIn">
						<AlertCircle size={16} class="shrink-0 mt-0.5" />
						<span class="flex-1">{errorMsg}</span>
					</div>
				{/if}

				{#if successMsg}
					<div class="mb-5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs animate-fadeIn space-y-3">
						<div class="flex items-start gap-2.5">
							<CheckCircle2 size={18} class="shrink-0 mt-0.5" />
							<span class="flex-1 leading-relaxed">{successMsg}</span>
						</div>
						<div class="pt-2">
							<a
								href="/login"
								class="inline-flex items-center justify-center w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
							>
								Kembali ke Halaman Masuk
							</a>
						</div>
					</div>
				{:else}
					<!-- Form -->
					<form onsubmit={handleResetPassword} class="space-y-4">
						<div class="space-y-1.5">
							<label for="email" class="block text-xs font-semibold text-[var(--ttx-text-main)]">
								Alamat Email
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

						<!-- Submit Button -->
						<div class="pt-2">
							<button
								type="submit"
								class="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
								disabled={loading}
							>
								{#if loading}
									<Loader2 size={17} class="animate-spin" />
									<span>Mengirim email...</span>
								{:else}
									<span>Kirim Tautan Reset</span>
								{/if}
							</button>
						</div>
					</form>
				{/if}

				<!-- Back to Login link -->
				<div class="mt-6 pt-5 border-t border-[var(--ttx-border-base)] text-center">
					<p class="text-xs text-[var(--ttx-text-muted)]">
						Sudah ingat password?
						<a href="/login" class="font-semibold text-blue-500 hover:text-blue-400 hover:underline">
							Masuk di sini
						</a>
					</p>
				</div>
			</div>
		</div>
	</main>

	<!-- Bottom decorative space -->
	<div class="h-6"></div>
</div>
