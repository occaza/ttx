<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import {
		ArrowLeft,
		Eye,
		EyeOff,
		AlertCircle,
		CheckCircle2,
		Sun,
		Moon,
		Loader2
	} from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let phone = $state('');
	let username = $state('');
	let first_name = $state('');
	let last_name = $state('');

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

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		if (!email || !password || !confirmPassword || !username || !phone) {
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

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username,
					first_name,
					last_name,
					phone
				},
				emailRedirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (error) {
			loading = false;
			errorMsg = error.message;
			turnstileRef?.reset();
			return;
		}

		const user = data?.user;
		if (user) {
			const { error: profileError } = await supabase.from('profiles').upsert(
				[
					{
						id: user.id,
						name: `${first_name} ${last_name}`.trim(),
						first_name,
						last_name,
						username,
						phone,
						email
					}
				],
				{ onConflict: 'id' }
			);

			if (profileError) {
				console.error('Gagal simpan profil:', profileError.message);
			}
		}

		loading = false;
		successMsg = 'Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.';
		setTimeout(() => {
			goto('/login');
		}, 3000);
	}
</script>

<svelte:head>
	<title>Daftar - TEXY</title>
</svelte:head>

<div class="min-h-[100dvh] w-full flex flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors">
	<!-- Top Bar -->
	<header class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs">
		<a
			href="/login"
			class="group inline-flex items-center gap-1.5 text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
		>
			<ArrowLeft size={14} class="transition-transform group-hover:-translate-x-0.5" />
			<span>Sudah punya akun? Masuk</span>
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
		<div class="w-full max-w-[440px]">
			<!-- Header -->
			<div class="text-center mb-5">
				<h1 class="text-xl font-bold tracking-tight text-[var(--ttx-text-main)]">
					Buat Akun Baru
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
					Daftar untuk menikmati sinkronisasi catatan dan fitur cloud.
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

				{#if successMsg}
					<div class="flex items-start gap-2 p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-xs text-emerald-400 animate-fade-in leading-relaxed">
						<CheckCircle2 size={15} class="shrink-0 mt-0.5" />
						<span class="flex-1">{successMsg}</span>
					</div>
				{/if}

				<form onsubmit={handleRegister} class="space-y-3.5">
					<!-- Names -->
					<div class="grid grid-cols-2 gap-2.5">
						<div>
							<label for="first_name" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Nama Depan
							</label>
							<input
								id="first_name"
								type="text"
								bind:value={first_name}
								placeholder="Nama depan"
								class="w-full h-9.5 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
								required
							/>
						</div>
						<div>
							<label for="last_name" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Nama Belakang
							</label>
							<input
								id="last_name"
								type="text"
								bind:value={last_name}
								placeholder="Opsional"
								class="w-full h-9.5 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
							/>
						</div>
					</div>

					<!-- Username & Phone -->
					<div class="grid grid-cols-2 gap-2.5">
						<div>
							<label for="username" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Username
							</label>
							<input
								id="username"
								type="text"
								bind:value={username}
								placeholder="username"
								class="w-full h-9.5 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
								required
							/>
						</div>
						<div>
							<label for="phone" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								No. Telepon
							</label>
							<input
								id="phone"
								type="tel"
								bind:value={phone}
								placeholder="08123456789"
								class="w-full h-9.5 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
								required
							/>
						</div>
					</div>

					<!-- Email -->
					<div>
						<label for="email" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
							Email
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							class="w-full h-9.5 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
							required
						/>
					</div>

					<!-- Password & Confirm -->
					<div class="grid grid-cols-2 gap-2.5">
						<div>
							<label for="password" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Password
							</label>
							<div class="relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="Min. 6 char"
									class="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
									onclick={() => (showPassword = !showPassword)}
									aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
								>
									{#if showPassword}
										<EyeOff size={14} />
									{:else}
										<Eye size={14} />
									{/if}
								</button>
							</div>
						</div>
						<div>
							<label for="confirmPassword" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1">
								Ulangi
							</label>
							<div class="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									placeholder="Konfirmasi"
									class="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)] transition-colors"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
								>
									{#if showConfirmPassword}
										<EyeOff size={14} />
									{:else}
										<Eye size={14} />
									{/if}
								</button>
							</div>
						</div>
					</div>

					<!-- Turnstile Widget -->
					<div class="pt-1">
						<Turnstile
							bind:this={turnstileRef}
							action="register"
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
							<span>Mendaftarkan...</span>
						{:else}
							<span>Daftar Akun</span>
						{/if}
					</button>
				</form>
			</div>

			<!-- Footer link -->
			<p class="text-center text-xs text-[var(--ttx-text-muted)] mt-5">
				Sudah memiliki akun?
				<a href="/login" class="font-semibold text-[var(--ttx-accent-text)] hover:underline ml-1">
					Masuk di sini
				</a>
			</p>
		</div>
	</main>

	<!-- Footer -->
	<footer class="py-4 text-center text-[11px] text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
