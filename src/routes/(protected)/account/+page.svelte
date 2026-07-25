<script lang="ts">
	import { enhance } from '$app/forms';
	import { User, Mail, Lock, ArrowLeft, Check, AlertCircle } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profile = $derived(data.profile);
	let user = $derived(data.user);
	let hasEmailProvider = $derived(data.hasEmailProvider);

	// Form states
	let profileLoading = $state(false);
	let emailLoading = $state(false);
	let passwordLoading = $state(false);

	// Toast
	let toast = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	$effect(() => {
		if (form) {
			toast = {
				type: form.success ? 'success' : 'error',
				message: form.message ?? (form.success ? 'Berhasil!' : 'Terjadi kesalahan.')
			};
			const t = setTimeout(() => (toast = null), 4000);
			return () => clearTimeout(t);
		}
	});
</script>

<svelte:head>
	<title>Pengaturan Akun - TEXY</title>
</svelte:head>

<!-- Toast -->
{#if toast}
	<div class="toast toast-top toast-end z-50">
		<div class="alert {toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg gap-2">
			{#if toast.type === 'success'}
				<Check size={16} />
			{:else}
				<AlertCircle size={16} />
			{/if}
			<span class="text-sm">{toast.message}</span>
		</div>
	</div>
{/if}

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100">
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 md:px-8">
		<!-- Header -->
		<div class="mb-8">
			<a href="/dashboard" class="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors mb-4">
				<ArrowLeft size={14} /> Dashboard
			</a>
			<h1 class="text-2xl font-bold text-base-content">Pengaturan Akun</h1>
			<p class="text-sm text-base-content/50 mt-1">{user?.email}</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Col Kiri: Informasi Profil (Lebih besar) -->
			<div class="lg:col-span-2 flex flex-col gap-5">
				<div class="rounded-2xl border border-base-content/10 bg-base-100/60 overflow-hidden">
					<div class="flex items-center gap-2.5 px-5 py-4 border-b border-base-content/10 bg-base-200/30">
						<User size={15} class="text-base-content/50" />
						<h2 class="text-sm font-bold text-base-content/70">Informasi Profil</h2>
					</div>
					<div class="p-5 md:p-6">
						<form
							method="POST"
							action="?/updateProfile"
							use:enhance={() => {
								profileLoading = true;
								return async ({ update }) => {
									await update();
									profileLoading = false;
								};
							}}
							class="flex flex-col gap-5"
						>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<fieldset class="fieldset">
									<legend class="fieldset-legend text-xs text-base-content/50">Nama Depan *</legend>
									<input
										type="text"
										id="first_name"
										name="first_name"
										class="input input-bordered w-full"
										value={profile?.first_name ?? ''}
										placeholder="Nama depan"
										required
									/>
								</fieldset>
								<fieldset class="fieldset">
									<legend class="fieldset-legend text-xs text-base-content/50">Nama Belakang</legend>
									<input
										type="text"
										id="last_name"
										name="last_name"
										class="input input-bordered w-full"
										value={profile?.last_name ?? ''}
										placeholder="Nama belakang"
									/>
								</fieldset>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<fieldset class="fieldset">
									<legend class="fieldset-legend text-xs text-base-content/50">Username</legend>
									<input
										type="text"
										id="username"
										name="username"
										class="input input-bordered w-full"
										value={profile?.username ?? ''}
										placeholder="username_kamu"
										minlength="3"
										autocomplete="username"
									/>
									<p class="fieldset-label text-xs text-base-content/40">Minimal 3 karakter, harus unik.</p>
								</fieldset>

								<fieldset class="fieldset">
									<legend class="fieldset-legend text-xs text-base-content/50">Nomor Telepon</legend>
									<input
										type="tel"
										id="phone"
										name="phone"
										class="input input-bordered w-full"
										value={profile?.phone ?? ''}
										placeholder="+62 812 3456 7890"
										autocomplete="tel"
									/>
								</fieldset>
							</div>

							<div class="flex justify-end pt-2 border-t border-base-content/10 mt-2">
								<button type="submit" class="btn btn-primary btn-sm rounded-xl gap-1.5 mt-4" disabled={profileLoading}>
									{#if profileLoading}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<Check size={14} />
									{/if}
									Simpan Perubahan
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			<!-- Col Kanan: Email & Password -->
			<div class="lg:col-span-1 flex flex-col gap-5">
				<!-- Ubah Email -->
				<div class="rounded-2xl border border-base-content/10 bg-base-100/60 overflow-hidden">
					<div class="flex items-center gap-2.5 px-5 py-4 border-b border-base-content/10 bg-base-200/30">
						<Mail size={15} class="text-base-content/50" />
						<h2 class="text-sm font-bold text-base-content/70">Ubah Email</h2>
					</div>
					<div class="p-5">
						<p class="text-xs text-base-content/40 mb-4">
							Email saat ini: <span class="font-mono font-semibold text-base-content/60 break-all">{user?.email}</span>
						</p>
						<form
							method="POST"
							action="?/changeEmail"
							use:enhance={() => {
								emailLoading = true;
								return async ({ update }) => {
									await update();
									emailLoading = false;
								};
							}}
							class="flex flex-col gap-4"
						>
							<fieldset class="fieldset">
								<legend class="fieldset-legend text-xs text-base-content/50">Email Baru</legend>
								<input
									type="email"
									id="email"
									name="email"
									class="input input-bordered w-full"
									placeholder="email@baru.com"
									autocomplete="email"
									required
								/>
								<p class="fieldset-label text-[10px] text-base-content/40 leading-tight">Email konfirmasi akan dikirim ke alamat baru.</p>
							</fieldset>
							<button type="submit" class="btn btn-sm btn-outline rounded-xl gap-1.5 w-full mt-2" disabled={emailLoading}>
								{#if emailLoading}
									<span class="loading loading-spinner loading-xs"></span>
								{/if}
								Kirim Konfirmasi
							</button>
						</form>
					</div>
				</div>

				<!-- Ubah Password -->
				<div class="rounded-2xl border border-base-content/10 bg-base-100/60 overflow-hidden">
					<div class="flex items-center gap-2.5 px-5 py-4 border-b border-base-content/10 bg-base-200/30">
						<Lock size={15} class="text-base-content/50" />
						<h2 class="text-sm font-bold text-base-content/70">Ubah Password</h2>
					</div>
					<div class="p-5">
						<form
							method="POST"
							action="?/changePassword"
							use:enhance={() => {
								passwordLoading = true;
								return async ({ update }) => {
									await update({ reset: true });
									passwordLoading = false;
								};
							}}
							class="flex flex-col gap-4"
						>
							{#if hasEmailProvider}
								<fieldset class="fieldset">
									<legend class="fieldset-legend text-xs text-base-content/50">Password Lama *</legend>
									<input
										type="password"
										id="old_password"
										name="old_password"
										class="input input-bordered w-full"
										placeholder="Masukkan password lama"
										autocomplete="current-password"
										required
									/>
								</fieldset>
							{/if}

							<fieldset class="fieldset">
								<legend class="fieldset-legend text-xs text-base-content/50">Password Baru</legend>
								<input
									type="password"
									id="password"
									name="password"
									class="input input-bordered w-full"
									placeholder="Minimal 8 karakter"
									minlength="8"
									autocomplete="new-password"
									required
								/>
							</fieldset>
							<fieldset class="fieldset">
								<legend class="fieldset-legend text-xs text-base-content/50">Konfirmasi Password</legend>
								<input
									type="password"
									id="confirm_password"
									name="confirm_password"
									class="input input-bordered w-full"
									placeholder="Ulangi password baru"
									minlength="8"
									autocomplete="new-password"
									required
								/>
							</fieldset>
							<button type="submit" class="btn btn-sm btn-outline rounded-xl gap-1.5 w-full mt-2" disabled={passwordLoading}>
								{#if passwordLoading}
									<span class="loading loading-spinner loading-xs"></span>
								{/if}
								Ubah Password
							</button>
						</form>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
