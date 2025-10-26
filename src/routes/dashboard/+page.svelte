<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let { data } = $props();

	let logoutLoading = $state(false);
	let supabase = $state<any>(null);
	let debugMsg = $state('');

	onMount(() => {
		supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
		console.log('Supabase client initialized:', !!supabase);
	});

	// Helper function dengan timeout
	function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
		return Promise.race([
			promise,
			new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
		]);
	}

	async function handleLogout() {
		if (!supabase) {
			debugMsg = 'Error: Supabase client not initialized';
			console.error('Supabase not initialized');
			return;
		}

		logoutLoading = true;
		debugMsg = 'Starting logout...';
		console.log('Starting logout process...');

		try {
			// Step 1: SignOut dengan timeout 5 detik
			debugMsg = 'Calling signOut...';
			console.log('Calling supabase.auth.signOut() with 5s timeout');

			try {
				const { error } = await withTimeout<{ error: any }>(
					supabase.auth.signOut(),
					5000 // 5 detik timeout
				);

				if (error) {
					console.error('Logout error:', error);
					debugMsg = `SignOut error: ${error.message}`;
					// Lanjutkan logout meski ada error
				} else {
					console.log('SignOut successful');
					debugMsg = 'SignOut successful';
				}
			} catch (timeoutError) {
				console.warn('SignOut timeout, continuing anyway:', timeoutError);
				debugMsg = 'SignOut timeout, forcing logout...';
			}

			// Step 2: Invalidate all
			console.log('Invalidating all data...');
			debugMsg = 'Clearing cache...';

			try {
				await withTimeout(invalidateAll(), 3000);
				console.log('InvalidateAll done');
			} catch (e) {
				console.warn('InvalidateAll timeout, continuing:', e);
			}

			// Step 3: Clear local storage (opsional tapi berguna)
			console.log('Clearing localStorage...');
			debugMsg = 'Clearing local data...';

			try {
				// Clear semua Supabase keys di localStorage
				Object.keys(localStorage).forEach((key) => {
					if (key.includes('supabase') || key.includes('sb-')) {
						localStorage.removeItem(key);
						console.log('Removed localStorage key:', key);
					}
				});
			} catch (e) {
				console.warn('localStorage clear error:', e);
			}

			// Step 4: Small delay
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Step 5: Force redirect dengan full page reload
			console.log('Redirecting to /login with full reload');
			debugMsg = 'Redirecting...';

			// Gunakan window.location untuk force full reload
			window.location.href = '/login';
		} catch (e) {
			console.error('Exception during logout:', e);
			debugMsg = `Exception: ${e}`;

			// Bahkan jika ada error, tetap coba redirect
			console.log('Error occurred, forcing redirect anyway...');
			setTimeout(() => {
				window.location.href = '/login';
			}, 1000);
		}
	}

	// Alternatif logout: langsung force reload tanpa tunggu Supabase
	async function forceLogout() {
		console.log('Force logout - immediate redirect');

		// Clear localStorage
		Object.keys(localStorage).forEach((key) => {
			if (key.includes('supabase') || key.includes('sb-')) {
				localStorage.removeItem(key);
			}
		});

		// Immediate redirect
		window.location.href = '/login';
	}
</script>

<div class="min-h-screen bg-base-200">
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<a href="/dashboard" class="btn text-xl btn-ghost">Dashboard</a>
		</div>
		<div class="flex-none gap-2">
			{#if debugMsg}
				<span class="badge text-sm badge-info">{debugMsg}</span>
			{/if}
			<button onclick={handleLogout} class="btn btn-sm btn-error" disabled={logoutLoading}>
				{#if logoutLoading}
					<span class="loading loading-xs loading-spinner"></span>
					Logging out...
				{:else}
					Logout
				{/if}
			</button>
			<button
				onclick={forceLogout}
				class="btn btn-sm btn-warning"
				title="Force logout jika normal logout stuck"
			>
				⚡ Force
			</button>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8">
		<!-- Debug Info Card -->
		<div class="card mb-4 border-2 border-warning bg-base-100 shadow-xl">
			<div class="card-body">
				<h3 class="card-title text-warning">🔧 Debug Info</h3>
				<div class="space-y-2 font-mono text-sm">
					<p>Supabase Client: {supabase ? '✅ Ready' : '❌ Not Ready'}</p>
					<p>User Data: {data.user ? '✅ Loaded' : '❌ No User'}</p>
					<p>Session: {data.session ? '✅ Active' : '❌ No Session'}</p>
					{#if data.session?.expires_at}
						<p class="text-xs">
							Expires: {new Date(data.session.expires_at * 1000).toLocaleString()}
						</p>
					{/if}
					<p class="text-xs text-gray-500">Supabase URL: {PUBLIC_SUPABASE_URL}</p>
				</div>
				<div class="mt-4 flex gap-2">
					<button
						onclick={() => console.log('Session:', data.session, 'User:', data.user)}
						class="btn btn-outline btn-xs"
					>
						Log Session
					</button>
					<button
						onclick={() =>
							console.log(
								'LocalStorage keys:',
								Object.keys(localStorage).filter((k) => k.includes('supabase') || k.includes('sb-'))
							)}
						class="btn btn-outline btn-xs"
					>
						Log Storage
					</button>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-3xl">Selamat Datang!</h2>
				{#if data.user}
					<p class="text-lg">Email: {data.user.email}</p>
					<p class="text-sm text-gray-600">User ID: {data.user.id}</p>
				{:else}
					<div class="flex items-center gap-2">
						<span class="loading loading-sm loading-spinner"></span>
						<span>Loading user data...</span>
					</div>
				{/if}

				<div class="divider"></div>

				<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
					<div class="stat rounded-lg bg-primary text-primary-content">
						<div class="stat-title text-primary-content">Total Tools</div>
						<div class="stat-value">9</div>
						<div class="stat-desc text-primary-content">Text tools tersedia</div>
					</div>

					<div class="stat rounded-lg bg-secondary text-secondary-content">
						<div class="stat-title text-secondary-content">Notepad</div>
						<div class="stat-value">∞</div>
						<div class="stat-desc text-secondary-content">Unlimited notes</div>
					</div>

					<div class="stat rounded-lg bg-accent text-accent-content">
						<div class="stat-title text-accent-content">Status</div>
						<div class="stat-value text-2xl">Active</div>
						<div class="stat-desc text-accent-content">Account verified</div>
					</div>
				</div>

				<div class="mt-6">
					<h3 class="mb-4 text-xl font-bold">Quick Access</h3>
					<div class="flex flex-wrap gap-2">
						<a href="/text-tools/csv-parser" class="btn btn-outline btn-sm">CSV Parser</a>
						<a href="/text-tools/lines-counter" class="btn btn-outline btn-sm">Line Counter</a>
						<a href="/text-tools/remove-duplicate-lines" class="btn btn-outline btn-sm"
							>Remove Duplicates</a
						>
						<a href="/notepad" class="btn btn-outline btn-sm">Notepad</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
