<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	import { ArrowLeft } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let phone = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');
	let username = $state('');
	let first_name = $state('');
	let last_name = $state('');

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
					name: `${first_name} ${last_name}`,
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

<div class="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-base-200/30 px-4 sm:px-6 py-12">
	<!-- Back to Home Button -->
	<div class="absolute inset-x-0 top-6 mx-auto w-full max-w-7xl px-4 md:px-8 z-10">
		<a 
			href="/" 
			class="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content w-fit -ml-3"
		>
			<ArrowLeft size={16} />
			<span class="hidden sm:inline">Kembali ke Beranda</span>
		</a>
	</div>
	<div class="w-full max-w-lg space-y-6">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-base-content">
				Buat akun baru
			</h2>
			<p class="mt-2 text-sm text-base-content/60">
				Sudah punya akun? <a href="/login" class="font-medium text-primary hover:underline">Masuk di sini</a>
			</p>
		</div>

		<div class="bg-base-100 p-8 shadow-sm ring-1 ring-base-content/5 rounded-2xl">
			{#if errorMsg}
				<div class="alert alert-error text-sm mb-6 py-2">
					<span>{errorMsg}</span>
				</div>
			{/if}

			{#if successMsg}
				<div class="alert alert-success text-sm mb-6 py-2">
					<span>{successMsg}</span>
				</div>
			{/if}

			<form onsubmit={handleRegister} class="space-y-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<fieldset class="fieldset">
						<label class="fieldset-label font-medium" for="first_name">Nama Depan</label>
						<input
							id="first_name"
							type="text"
							bind:value={first_name}
							placeholder="Nama depan"
							class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
							required
						/>
					</fieldset>

					<fieldset class="fieldset">
						<label class="fieldset-label font-medium" for="last_name">Nama Belakang</label>
						<input
							id="last_name"
							type="text"
							bind:value={last_name}
							placeholder="Nama belakang"
							class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
							required
						/>
					</fieldset>
				</div>

				<fieldset class="fieldset">
					<label class="fieldset-label font-medium" for="username">Username</label>
					<input
						id="username"
						type="text"
						bind:value={username}
						placeholder="contoh: yusup123"
						class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
						required
					/>
				</fieldset>
				
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

				<fieldset class="fieldset">
					<label class="fieldset-label font-medium" for="phone">Nomor HP</label>
					<input
						id="phone"
						type="tel"
						bind:value={phone}
						placeholder="08xxxxxxxxxx"
						class="input w-full bg-base-200/50 focus:bg-base-100 focus:ring-1 focus:ring-primary/50 transition-all"
						required
					/>
				</fieldset>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<fieldset class="fieldset">
						<label class="fieldset-label font-medium" for="password">Password</label>
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
				</div>

				<div class="pt-4">
					<button type="submit" class="btn btn-primary w-full shadow-sm" disabled={loading}>
						{loading ? 'Memproses...' : 'Daftar Sekarang'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
