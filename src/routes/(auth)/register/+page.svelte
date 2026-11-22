<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import {
		ArrowLeft,
		Mail,
		Lock,
		User,
		Phone,
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
		successMsg = 'Akun berhasil dibuat! Silakan cek kotak masuk email Anda untuk verifikasi.';
		setTimeout(() => {
			goto('/login');
		}, 3500);
	}
</script>

<svelte:head>
	<title>Daftar Akun Baru - TEXY</title>
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
			<span>Sudah punya akun? Masuk</span>
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
		<div class="w-full max-w-[480px]">
			<!-- Brand header -->
			<div class="mb-6 text-center">
				<a href="/" class="inline-flex items-center gap-1.5 font-black text-xl tracking-tight text-[var(--ttx-text-main)]">
					<span>TEXY</span>
					<span class="h-2 w-2 rounded-full bg-[var(--ttx-accent)]"></span>
				</a>
				<h1 class="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
					Buat Akun Baru
				</h1>
				<p class="mt-1 text-xs text-[var(--ttx-text-muted)]">
					Daftar untuk menikmati sinkronisasi cloud dokumen dan fitur premium.
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
					<div class="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 animate-fade-in">
						<CheckCircle2 size={16} class="shrink-0 mt-0.5 text-emerald-400" />
						<div class="min-w-0 flex-1 leading-relaxed">{successMsg}</div>
					</div>
				{/if}

				<form onsubmit={handleRegister} class="space-y-4">
					<!-- Name row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="first_name" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Nama Depan
							</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--ttx-text-dim)]">
									<User size={15} />
								</div>
								<input
									id="first_name"
									type="text"
									bind:value={first_name}
									placeholder="John"
									class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-9 pr-3 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
									required
								/>
							</div>
						</div>

						<div>
							<label for="last_name" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Nama Belakang
							</label>
							<input
								id="last_name"
								type="text"
								bind:value={last_name}
								placeholder="Doe"
								class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
							/>
						</div>
					</div>

					<!-- Username & Phone row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="username" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Username
							</label>
							<input
								id="username"
								type="text"
								bind:value={username}
								placeholder="johndoe"
								class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
								required
							/>
						</div>

						<div>
							<label for="phone" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Nomor Telepon
							</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--ttx-text-dim)]">
									<Phone size={15} />
								</div>
								<input
									id="phone"
									type="tel"
									bind:value={phone}
									placeholder="08123456789"
									class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-9 pr-3 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
									required
								/>
							</div>
						</div>
					</div>

					<!-- Email -->
					<div>
						<label for="reg-email" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
							Email
						</label>
						<div class="relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ttx-text-dim)]">
								<Mail size={16} />
							</div>
							<input
								id="reg-email"
								type="email"
								bind:value={email}
								placeholder="nama@email.com"
								class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-10 pr-3.5 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
								required
							/>
						</div>
					</div>

					<!-- Password & Confirm row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="reg-password" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Password
							</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--ttx-text-dim)]">
									<Lock size={15} />
								</div>
								<input
									id="reg-password"
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="Min. 6 karakter"
									class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-9 pr-10 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors focus:outline-none"
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
							<label for="confirm-password" class="mb-1.5 block text-xs font-semibold text-[var(--ttx-text-main)]">
								Konfirmasi
							</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--ttx-text-dim)]">
									<Lock size={15} />
								</div>
								<input
									id="confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									placeholder="Ulangi password"
									class="h-10 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-9 pr-10 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-all focus:border-[var(--ttx-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors focus:outline-none"
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
					</div>

					<!-- Turnstile Bot Protection Widget -->
					<Turnstile
						bind:this={turnstileRef}
						action="register"
						theme={isDark ? 'dark' : 'light'}
						onSuccess={(token) => (turnstileToken = token)}
						onError={() => (turnstileToken = '')}
						onExpire={() => (turnstileToken = '')}
					/>

					<button
						type="submit"
						class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ttx-accent)] text-xs font-bold text-[var(--ttx-accent-contrast)] shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-[0.99] disabled:opacity-50 mt-2"
						disabled={loading}
					>
						{#if loading}
							<Loader2 size={16} class="animate-spin" />
							<span>Mendaftarkan Akun...</span>
						{:else}
							<span>Daftar Akun Baru</span>
						{/if}
					</button>
				</form>

				<!-- Switch to Login -->
				<div class="mt-6 pt-5 border-t border-[var(--ttx-border-base)] text-center text-xs text-[var(--ttx-text-muted)]">
					Sudah memiliki akun?
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
