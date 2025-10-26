<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let password = '';
	let confirmPassword = '';
	let loading = false;
	let errorMsg = '';
	let successMsg = '';

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

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-center text-2xl">Reset Password</h2>
			<p class="text-center text-sm text-gray-600">Masukkan password baru Anda.</p>

			{#if errorMsg}
				<div class="alert alert-error">
					<span>{errorMsg}</span>
				</div>
			{/if}

			{#if successMsg}
				<div class="alert alert-success">
					<span>{successMsg}</span>
				</div>
			{/if}

			<form on:submit|preventDefault={handleUpdatePassword}>
				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password Baru</span>
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control mt-4">
					<label class="label" for="confirm-password">
						<span class="label-text">Konfirmasi Password</span>
					</label>
					<input
						id="confirm-password"
						type="password"
						bind:value={confirmPassword}
						placeholder="••••••••"
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{loading ? 'Menyimpan...' : 'Simpan Password'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
