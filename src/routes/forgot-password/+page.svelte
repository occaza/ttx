<script lang="ts">
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let email = '';
	let loading = false;
	let errorMsg = '';
	let successMsg = '';

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	async function handleResetPassword() {
		if (!email) {
			errorMsg = 'Email harus diisi';
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
			successMsg = 'Link reset password sudah dikirim ke email Anda. Cek inbox atau spam.';
			email = '';
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-center text-2xl">Lupa Password</h2>
			<p class="text-center text-sm text-gray-600">
				Masukkan email Anda dan kami akan mengirim link untuk reset password.
			</p>

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

			<form on:submit|preventDefault={handleResetPassword}>
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="email@example.com"
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{loading ? 'Mengirim...' : 'Kirim Link Reset'}
					</button>
				</div>
			</form>

			<div class="divider">ATAU</div>

			<div class="text-center">
				<a href="/login" class="link link-primary">Kembali ke Login</a>
			</div>
		</div>
	</div>
</div>
