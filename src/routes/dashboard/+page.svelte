<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let { data } = $props();

	let logoutLoading = $state(false);
	let supabase = $state<SupabaseClient | null>(null);
	let profile = $state<any>(null); // ✅ bikin reaktif

	onMount(async () => {
		supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (user) {
			// Coba ambil data dari tabel profiles
			const { data: profileData } = await supabase
				.from('profiles')
				.select('first_name, last_name, username')
				.eq('id', user.id)
				.single();

			profile = profileData;
		}
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

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-3xl">
					{#if profile}
						Halo, {profile.first_name || profile.username || 'User'}!
					{:else if data.user}
						Halo, {data.user.user_metadata?.first_name ||
							data.user.user_metadata?.username ||
							'User'}!
					{:else}
						<span>Memuat data...</span>
					{/if}
				</h2>

				{#if data.user}
					<p class="text-sm text-gray-600">User ID: {data.user.id}</p>
				{/if}
				<div>
					<button onclick={handleLogout} class="btn btn-sm btn-error" disabled={logoutLoading}>
						{#if logoutLoading}
							<span class="loading loading-xs loading-spinner"></span>
							Logging out...
						{:else}
							Logout
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
