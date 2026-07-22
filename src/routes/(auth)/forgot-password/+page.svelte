<script lang="ts">
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let email = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');

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

<div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-base-200/30 px-4 sm:px-6">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-base-content">
				Lupa Password?
			</h2>
			<p class="mt-2 text-sm text-base-content/60">
				Ingat password Anda? <a href="/login" class="font-medium text-primary hover:underline">Masuk di sini</a>
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
				<form onsubmit={handleResetPassword} class="space-y-4">
					<fieldset class="fieldset">
						<label class="fieldset-label font-medium" for="email">Email</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
							required
						/>
					</fieldset>

					<div class="pt-4">
						<button type="submit" class="btn btn-primary w-full shadow-sm" disabled={loading}>
							{loading ? 'Mengirim...' : 'Kirim Link Reset'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>
