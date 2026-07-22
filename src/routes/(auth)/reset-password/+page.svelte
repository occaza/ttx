<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	async function handleUpdatePassword() {
		if (!password || !confirmPassword) {
			errorMsg = 'Semua field harus diisi';
			return;
		}

		if (password !== confirmPassword) {
			errorMsg = 'Password tidak cocok';
			return;
		}

		if (password.length < 6) {
			errorMsg = 'Password minimal 6 karakter';
			return;
		}

		loading = true;
		errorMsg = '';
		successMsg = '';

		const { error } = await supabase.auth.updateUser({
			password
		});

		loading = false;

		if (error) {
			errorMsg = error.message;
		} else {
			successMsg = 'Password berhasil diubah! Redirecting...';
			setTimeout(() => {
				goto('/dashboard');
			}, 2000);
		}
	}
</script>

<div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-base-200/30 px-4 sm:px-6">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-base-content">
				Atur Ulang Password
			</h2>
			<p class="mt-2 text-sm text-base-content/60">
				Masukkan password baru untuk akun Anda.
			</p>
		</div>

		<div class="bg-base-100 p-8 shadow-sm ring-1 ring-base-content/5 rounded-2xl">
			{#if errorMsg}
				<div class="alert alert-error text-sm mb-4 py-2">
					<span>{errorMsg}</span>
				</div>
			{/if}

			{#if successMsg}
				<div class="alert alert-success text-sm mb-4 py-2">
					<span>{successMsg}</span>
				</div>
			{:else}
				<form onsubmit={handleUpdatePassword} class="space-y-4">
					<fieldset class="fieldset">
						<label class="fieldset-label font-medium" for="password">Password Baru</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="••••••••"
							class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
							required
						/>
					</fieldset>

					<fieldset class="fieldset">
						<label class="fieldset-label font-medium" for="confirm-password">Konfirmasi Password</label>
						<input
							id="confirm-password"
							type="password"
							bind:value={confirmPassword}
							placeholder="••••••••"
							class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
							required
						/>
					</fieldset>

					<div class="pt-4">
						<button type="submit" class="btn btn-primary w-full shadow-sm" disabled={loading}>
							{loading ? 'Menyimpan...' : 'Simpan Password'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>
