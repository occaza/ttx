<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let { data } = $props();

	let logoutLoading = $state(false);
	let supabase = $state<SupabaseClient | null>(null);
	let profile = $derived(data.profile);

	onMount(async () => {
		supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	});

	async function handleLogout() {
		logoutLoading = true;

		try {
			const response = await fetch('/logout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await response.json();

			if (!response.ok && !result.success) throw new Error(result.error || 'API logout failed');

			if (supabase) await supabase.auth.signOut();

			Object.keys(localStorage).forEach((key) => {
				if (key.includes('supabase') || key.includes('sb-')) {
					localStorage.removeItem(key);
				}
			});

			await invalidateAll();
			window.location.href = '/login';
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			alert('Error logout: ' + errorMessage);
			logoutLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-base-200 p-4 md:p-8">
	<div class="max-w-7xl mx-auto space-y-6">
		<!-- Header / Welcome -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300">
			<div>
				<h1 class="text-2xl md:text-3xl font-bold">
					Halo,
					{#if profile}
						{profile.first_name || profile.username || 'User'}
					{:else if data.user}
						{data.user.user_metadata?.first_name || data.user.user_metadata?.username || 'User'}
					{:else}
						User
					{/if}! 👋
				</h1>
				<p class="text-base-content/70 mt-1">Selamat datang di dashboard Anda.</p>
			</div>
			<div class="flex gap-2">
				<button onclick={handleLogout} class="btn btn-error btn-outline" disabled={logoutLoading}>
					{#if logoutLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Logout
				</button>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="stat bg-base-100 rounded-2xl shadow-sm border border-base-300">
				<div class="stat-title">Total Penggunaan Alat</div>
				<div class="stat-value text-primary">0</div>
				<div class="stat-desc">Belum ada aktivitas</div>
			</div>
			<div class="stat bg-base-100 rounded-2xl shadow-sm border border-base-300">
				<div class="stat-title">Alat Favorit</div>
				<div class="stat-value text-secondary">0</div>
				<div class="stat-desc">Belum ada alat yang ditandai</div>
			</div>
			<div class="stat bg-base-100 rounded-2xl shadow-sm border border-base-300">
				<div class="stat-title">Status Akun</div>
				<div class="stat-value text-success text-2xl">Reguler</div>
				<div class="stat-desc">User standar</div>
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Aktivitas Terakhir -->
			<div class="lg:col-span-2 card bg-base-100 shadow-sm border border-base-300">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Aktivitas Terakhir</h2>
					<div class="flex flex-col items-center justify-center py-12 text-base-content/50">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p>Belum ada aktivitas yang terekam.</p>
					</div>
				</div>
			</div>

			<!-- Akses Cepat -->
			<div class="card bg-base-100 shadow-sm border border-base-300">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Akses Cepat</h2>
					<ul class="menu bg-base-200 rounded-box w-full space-y-2">
						<li>
							<a href="/" class="flex justify-between items-center py-3">
								<span class="font-medium">Jelajahi Alat</span>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
								</svg>
							</a>
						</li>
						<li>
							<a href="/account" class="flex justify-between items-center py-3">
								<span class="font-medium">Pengaturan Akun</span>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
								</svg>
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
