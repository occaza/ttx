<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let phone = '';
	let loading = false;
	let errorMsg = '';
	let successMsg = '';
	let username = '';
	let first_name = '';
	let last_name = '';

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	async function handleRegister() {
		if (!email || !password || !confirmPassword || !username || !phone) {
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

		// 1. Buat akun
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

		// 2. Simpan ke tabel profiles (opsional, jika Anda punya tabel sendiri)
		const user = data?.user;
		if (user) {
			const { error: profileError } = await supabase.from('profiles').insert([
				{
					id: user.id, // gunakan id dari user Supabase
					name,
					phone,
					email
				}
			]);

			if (profileError) {
				console.error('Gagal simpan profil:', profileError.message);
			}
		}

		loading = false;
		successMsg = 'Akun berhasil dibuat! Cek email Anda untuk verifikasi.';
		setTimeout(() => {
			goto('/login');
		}, 3000);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
	<div class="card w-full max-w-2xl bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-center text-2xl">Daftar Akun</h2>

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

			<form on:submit|preventDefault={handleRegister} class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Kiri -->
				<div class="space-y-4">
					<div class="form-control">
						<label class="label" for="first_name">
							<span class="label-text">Nama Depan</span>
						</label>
						<input
							id="first_name"
							type="text"
							bind:value={first_name}
							placeholder="Nama depan"
							class="input-bordered input"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="last_name">
							<span class="label-text">Nama Belakang</span>
						</label>
						<input
							id="last_name"
							type="text"
							bind:value={last_name}
							placeholder="Nama belakang"
							class="input-bordered input"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="username">
							<span class="label-text">Username</span>
						</label>
						<input
							id="username"
							type="text"
							bind:value={username}
							placeholder="contoh: yusup123"
							class="input-bordered input"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="phone">
							<span class="label-text">Nomor HP</span>
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={phone}
							placeholder="08xxxxxxxxxx"
							class="input-bordered input"
							required
						/>
					</div>
				</div>

				<!-- Kanan -->
				<div class="space-y-4">
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

					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text">Password</span>
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

					<div class="form-control">
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

					<div class="form-control mt-2">
						<button type="submit" class="btn w-full btn-primary" disabled={loading}>
							{loading ? 'Loading...' : 'Daftar'}
						</button>
					</div>
				</div>
			</form>

			<div class="divider mt-6">ATAU</div>

			<div class="text-center">
				<p class="text-sm">
					Sudah punya akun?
					<a href="/login" class="link link-primary">Login di sini</a>
				</p>
			</div>
		</div>
	</div>
</div>
