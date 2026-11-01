<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

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
			successMsg = 'Tautan reset password telah dikirim ke email Anda.';
			email = '';
		}
	}
</script>

<svelte:head>
	<title>Lupa Password - TEXY</title>
</svelte:head>

<div class="min-h-[100dvh] w-full flex flex-col justify-between bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)] transition-colors">
	<!-- Top Bar -->
	<header class="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between text-xs">
		<a
			href="/login"
			class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
		>
			← Masuk
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
		<div class="w-full max-w-sm">
			<div class="rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 sm:p-7">
				<h1 class="text-lg font-semibold text-[var(--ttx-text-main)]">Lupa Password</h1>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
					Masukkan email terdaftar untuk menerima tautan reset kata sandi.
				</p>

				{#if errorMsg}
					<div class="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
						{errorMsg}
					</div>
				{/if}

				{#if successMsg}
					<div class="mt-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs space-y-3">
						<p>{successMsg}</p>
						<a
							href="/login"
							class="inline-block text-xs text-blue-500 hover:underline"
						>
							Kembali ke halaman masuk →
						</a>
					</div>
				{:else}
					<form onsubmit={handleResetPassword} class="mt-5 space-y-4">
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

						<button
							type="submit"
							class="w-full h-10 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-colors cursor-pointer"
							disabled={loading}
						>
							{loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
						</button>
					</form>
				{/if}

				<div class="mt-5 pt-4 border-t border-[var(--ttx-border-base)] text-xs text-center text-[var(--ttx-text-muted)]">
					Ingat password Anda?
					<a href="/login" class="text-blue-500 hover:underline">Masuk di sini</a>
				</div>
			</div>
		</div>
	</main>

	<footer class="w-full text-center py-4 text-xs text-[var(--ttx-text-dim)]">
		&copy; {new Date().getFullYear()} TEXY
	</footer>
</div>
