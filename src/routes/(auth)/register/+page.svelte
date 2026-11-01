<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

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
			return;
		}

		const user = data?.user;
		if (user) {
			const { error: profileError } = await supabase.from('profiles').insert([
				{
					id: user.id,
					name: `${first_name} ${last_name}`.trim(),
					phone,
					email
				}
			]);

			if (profileError) {
				console.error('Gagal simpan profil:', profileError.message);
			}
		}

		loading = false;
		successMsg = 'Akun berhasil dibuat. Cek email Anda untuk konfirmasi.';
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
		<div class="w-full max-w-md">
			<div class="rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-7">
				<h1 class="text-lg font-semibold text-[var(--ttx-text-main)]">Buat Akun</h1>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
					Sudah punya akun?
					<a href="/login" class="text-blue-500 hover:underline">Masuk di sini</a>
				</p>

				{#if errorMsg}
					<div class="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
						{errorMsg}
					</div>
				{/if}

				{#if successMsg}
					<div class="mt-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs">
						{successMsg}
					</div>
				{/if}

				<form onsubmit={handleRegister} class="mt-5 space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="first_name" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
								Nama Depan
							</label>
							<input
								id="first_name"
								type="text"
								bind:value={first_name}
								placeholder="Nama depan"
								class="w-full h-10 px-3 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
								required
							/>
						</div>

						<div>
							<label for="last_name" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
								Nama Belakang
							</label>
							<input
								id="last_name"
								type="text"
								bind:value={last_name}
								placeholder="Nama belakang"
								class="w-full h-10 px-3 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
								required
							/>
						</div>
					</div>

					<div>
						<label for="username" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
							Username
						</label>
						<input
							id="username"
							type="text"
							bind:value={username}
							placeholder="username"
							class="w-full h-10 px-3 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
							required
						/>
					</div>

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
						<label for="phone" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
							Nomor HP
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={phone}
							placeholder="08xxxxxxxxxx"
							class="w-full h-10 px-3 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
							required
						/>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="password" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
								Password
							</label>
							<div class="relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="••••••••"
									class="w-full h-10 pl-3 pr-14 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 px-2 flex items-center text-[11px] text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
									onclick={() => (showPassword = !showPassword)}
								>
									{showPassword ? 'Tutup' : 'Lihat'}
								</button>
							</div>
						</div>

						<div>
							<label for="confirm-password" class="block text-xs font-medium text-[var(--ttx-text-main)] mb-1.5">
								Konfirmasi
							</label>
							<div class="relative">
								<input
									id="confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									placeholder="••••••••"
									class="w-full h-10 pl-3 pr-14 rounded-lg text-sm bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-blue-500 transition-colors"
									required
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 px-2 flex items-center text-[11px] text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
								>
									{showConfirmPassword ? 'Tutup' : 'Lihat'}
								</button>
							</div>
						</div>
					</div>

					<button
						type="submit"
						class="w-full h-10 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-colors cursor-pointer mt-2"
						disabled={loading}
					>
						{loading ? 'Memproses...' : 'Daftar Sekarang'}
					</button>
				</form>
			</div>
		</div>
	</main>

	<footer class="w-full text-center py-4 text-xs text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
