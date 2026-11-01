<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		User,
		Mail,
		Lock,
		ArrowLeft,
		Check,
		AlertCircle,
		Settings,
		Shield,
		Eye,
		EyeOff
	} from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profile = $derived(data.profile);
	let user = $derived(data.user);
	let hasEmailProvider = $derived(data.hasEmailProvider);

	// Form states
	let profileLoading = $state(false);
	let emailLoading = $state(false);
	let passwordLoading = $state(false);

	// Password visibility
	let showOldPass = $state(false);
	let showNewPass = $state(false);
	let showConfirmPass = $state(false);

	// Toast
	let toast = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// Display name
	let displayName = $derived(
		profile?.first_name ||
			profile?.username ||
			user?.user_metadata?.full_name?.split(' ')[0] ||
			user?.email?.split('@')[0] ||
			'User'
	);

	let initials = $derived(displayName.slice(0, 2).toUpperCase());

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
	<div class="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-200">
		<div
			class="flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
			{toast.type === 'success'
				? 'bg-[var(--ttx-bg-card)] border-emerald-500/40 text-emerald-400'
				: 'bg-[var(--ttx-bg-card)] border-rose-500/40 text-rose-400'}"
		>
			{#if toast.type === 'success'}
				<Check size={15} />
			{:else}
				<AlertCircle size={15} />
			{/if}
			<span>{toast.message}</span>
		</div>
	</div>
{/if}

<div
	class="relative min-h-[calc(100vh-4rem)] bg-[var(--ttx-bg-workspace)] text-[var(--ttx-text-main)] font-sans transition-colors duration-200"
>
	<!-- Background pattern -->
	<div
		class="absolute inset-0 pointer-events-none opacity-40"
		style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, var(--ttx-hatch) 10px, var(--ttx-hatch) 11.5px);"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- HEADER -->
		<div
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs mb-8 transition-colors"
		>
			<div class="flex items-center gap-4">
				<div
					class="w-14 h-14 rounded-2xl bg-[var(--ttx-accent-light)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent-text)] font-bold text-lg flex items-center justify-center shadow-xs shrink-0"
				>
					{initials}
				</div>
				<div>
					<div class="flex items-center gap-2 flex-wrap">
						<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
							{displayName}
						</h1>
						<span
							class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]"
						>
							<Settings size={11} />
							Pengaturan Akun
						</span>
					</div>
					<p class="text-xs text-[var(--ttx-text-muted)] mt-1">{user?.email}</p>
				</div>
			</div>

			<a
				href="/dashboard"
				class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all self-start sm:self-auto"
			>
				<ArrowLeft size={13} />
				Dashboard
			</a>
		</div>

		<!-- CONTENT GRID -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<!-- MAIN: Profil -->
			<div class="lg:col-span-2">
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden transition-colors"
				>
					<!-- Card header -->
					<div
						class="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]"
					>
						<User size={15} class="text-[var(--ttx-accent-text)]" />
						<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
							Informasi Profil
						</h2>
					</div>

					<div class="p-5 sm:p-6">
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
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<!-- Nama Depan -->
								<div class="flex flex-col gap-1.5">
									<label
										for="first_name"
										class="text-xs font-semibold text-[var(--ttx-text-muted)]"
									>
										Nama Depan <span class="text-rose-400">*</span>
									</label>
									<input
										type="text"
										id="first_name"
										name="first_name"
										class="h-9 px-3 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										value={profile?.first_name ?? ''}
										placeholder="Nama depan"
										required
									/>
								</div>

								<!-- Nama Belakang -->
								<div class="flex flex-col gap-1.5">
									<label
										for="last_name"
										class="text-xs font-semibold text-[var(--ttx-text-muted)]"
									>
										Nama Belakang
									</label>
									<input
										type="text"
										id="last_name"
										name="last_name"
										class="h-9 px-3 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										value={profile?.last_name ?? ''}
										placeholder="Nama belakang"
									/>
								</div>

								<!-- Username -->
								<div class="flex flex-col gap-1.5">
									<label
										for="username"
										class="text-xs font-semibold text-[var(--ttx-text-muted)]"
									>
										Username
									</label>
									<input
										type="text"
										id="username"
										name="username"
										class="h-9 px-3 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										value={profile?.username ?? ''}
										placeholder="username_kamu"
										minlength="3"
										autocomplete="username"
									/>
									<p class="text-[11px] text-[var(--ttx-text-dim)]">
										Minimal 3 karakter, harus unik.
									</p>
								</div>

								<!-- Telepon -->
								<div class="flex flex-col gap-1.5">
									<label
										for="phone"
										class="text-xs font-semibold text-[var(--ttx-text-muted)]"
									>
										Nomor Telepon
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										class="h-9 px-3 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										value={profile?.phone ?? ''}
										placeholder="+62 812 3456 7890"
										autocomplete="tel"
									/>
								</div>
							</div>

							<div class="flex justify-end pt-4 border-t border-[var(--ttx-border-base)]">
								<button
									type="submit"
									class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-sm shadow-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={profileLoading}
								>
									{#if profileLoading}
										<span
											class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
										></span>
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

			<!-- SIDEBAR: Email & Password -->
			<div class="flex flex-col gap-5">
				<!-- Ubah Email -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden transition-colors"
				>
					<div
						class="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]"
					>
						<Mail size={15} class="text-[var(--ttx-accent-text)]" />
						<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
							Ubah Email
						</h2>
					</div>

					<div class="p-5">
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] mb-4"
						>
							<Mail size={13} class="text-[var(--ttx-text-dim)] shrink-0" />
							<span class="text-xs font-mono text-[var(--ttx-text-muted)] truncate"
								>{user?.email}</span
							>
						</div>

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
							class="flex flex-col gap-3"
						>
							<div class="flex flex-col gap-1.5">
								<label for="email" class="text-xs font-semibold text-[var(--ttx-text-muted)]">
									Email Baru
								</label>
								<input
									type="email"
									id="email"
									name="email"
									class="h-9 px-3 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
									placeholder="email@baru.com"
									autocomplete="email"
									required
								/>
								<p class="text-[11px] text-[var(--ttx-text-dim)] leading-tight">
									Link konfirmasi dikirim ke alamat baru.
								</p>
							</div>
							<button
								type="submit"
								class="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all disabled:opacity-60"
								disabled={emailLoading}
							>
								{#if emailLoading}
									<span
										class="w-3.5 h-3.5 border-2 border-[var(--ttx-text-dim)] border-t-[var(--ttx-text-main)] rounded-full animate-spin"
									></span>
								{:else}
									<Mail size={13} />
								{/if}
								Kirim Konfirmasi
							</button>
						</form>
					</div>
				</div>

				<!-- Ubah Password -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden transition-colors"
				>
					<div
						class="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]"
					>
						<Lock size={15} class="text-[var(--ttx-accent-text)]" />
						<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
							Ubah Password
						</h2>
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
							class="flex flex-col gap-3"
						>
							{#if hasEmailProvider}
								<!-- Password Lama -->
								<div class="flex flex-col gap-1.5">
									<label
										for="old_password"
										class="text-xs font-semibold text-[var(--ttx-text-muted)]"
									>
										Password Lama <span class="text-rose-400">*</span>
									</label>
									<div class="relative">
										<input
											type={showOldPass ? 'text' : 'password'}
											id="old_password"
											name="old_password"
											class="w-full h-9 pl-3 pr-9 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
											placeholder="Password lama"
											autocomplete="current-password"
											required
										/>
										<button
											type="button"
											class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors"
											onclick={() => (showOldPass = !showOldPass)}
											tabindex="-1"
										>
											{#if showOldPass}
												<EyeOff size={14} />
											{:else}
												<Eye size={14} />
											{/if}
										</button>
									</div>
								</div>
							{/if}

							<!-- Password Baru -->
							<div class="flex flex-col gap-1.5">
								<label for="password" class="text-xs font-semibold text-[var(--ttx-text-muted)]">
									Password Baru
								</label>
								<div class="relative">
									<input
										type={showNewPass ? 'text' : 'password'}
										id="password"
										name="password"
										class="w-full h-9 pl-3 pr-9 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										placeholder="Min. 8 karakter"
										minlength="8"
										autocomplete="new-password"
										required
									/>
									<button
										type="button"
										class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors"
										onclick={() => (showNewPass = !showNewPass)}
										tabindex="-1"
									>
										{#if showNewPass}
											<EyeOff size={14} />
										{:else}
											<Eye size={14} />
										{/if}
									</button>
								</div>
							</div>

							<!-- Konfirmasi Password -->
							<div class="flex flex-col gap-1.5">
								<label
									for="confirm_password"
									class="text-xs font-semibold text-[var(--ttx-text-muted)]"
								>
									Konfirmasi Password
								</label>
								<div class="relative">
									<input
										type={showConfirmPass ? 'text' : 'password'}
										id="confirm_password"
										name="confirm_password"
										class="w-full h-9 pl-3 pr-9 text-sm rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										placeholder="Ulangi password baru"
										minlength="8"
										autocomplete="new-password"
										required
									/>
									<button
										type="button"
										class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors"
										onclick={() => (showConfirmPass = !showConfirmPass)}
										tabindex="-1"
									>
										{#if showConfirmPass}
											<EyeOff size={14} />
										{:else}
											<Eye size={14} />
										{/if}
									</button>
								</div>
							</div>

							<button
								type="submit"
								class="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all disabled:opacity-60 mt-1"
								disabled={passwordLoading}
							>
								{#if passwordLoading}
									<span
										class="w-3.5 h-3.5 border-2 border-[var(--ttx-text-dim)] border-t-[var(--ttx-text-main)] rounded-full animate-spin"
									></span>
								{:else}
									<Shield size={13} />
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
