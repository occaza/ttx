<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let { data } = $props();

	let logoutLoading = $state(false);
	let supabase: any = null;

	onMount(() => {
		supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	});

	async function handleLogout() {
		if (!supabase) {
			console.error('Supabase client not initialized');
			return;
		}

		console.log('Logout started');
		logoutLoading = true;

		try {
			const { error } = await supabase.auth.signOut();
			console.log('SignOut result:', { error });

			if (!error) {
				console.log('Invalidating data...');
				await invalidateAll();
				console.log('Redirecting to login...');
				goto('/login');
			} else {
				console.error('Logout error:', error);
				alert('Logout gagal: ' + error.message);
				logoutLoading = false;
			}
		} catch (e) {
			console.error('Exception during logout:', e);
			alert('Terjadi error saat logout');
			logoutLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-base-200">
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<a href="/dashboard" class="btn text-xl btn-ghost">Dashboard</a>
		</div>
		<div class="flex-none">
			<button onclick={handleLogout} class="btn btn-ghost" disabled={logoutLoading}>
				{logoutLoading ? 'Logging out...' : 'Logout'}
			</button>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8">
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
