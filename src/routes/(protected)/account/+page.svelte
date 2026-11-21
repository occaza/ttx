<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		User,
		Mail,
		Lock,
		ArrowLeft,
		Check,
		AlertCircle,
		Crown,
		Copy,
		Smartphone,
		KeyRound,
		Eye,
		EyeOff
	} from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profile = $derived(data.profile);
	let user = $derived(data.user);
	let hasEmailProvider = $derived(data.hasEmailProvider);

	// Form loading states
	let profileLoading = $state(false);
	let emailLoading = $state(false);
	let passwordLoading = $state(false);

	// Password visibility toggles
	let showOldPass = $state(false);
	let showNewPass = $state(false);
	let showConfirmPass = $state(false);

	// Toast notification
	let toast = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// User ID copy state
	let copiedUserId = $state(false);
	function copyId() {
		if (!user?.id) return;
		navigator.clipboard.writeText(user.id);
		copiedUserId = true;
		setTimeout(() => {
			copiedUserId = false;
		}, 2000);
	}

	// Short greeting name (nama depan/panggilan saja, tidak nama lengkap)
	let greetingName = $derived(
		profile?.first_name ||
			profile?.username ||
			user?.user_metadata?.full_name?.split(' ')[0] ||
			user?.email?.split('@')[0] ||
			'Pengguna'
	);

	let initials = $derived(
		(profile?.first_name
			? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`
			: greetingName.slice(0, 2)
		).toUpperCase()
	);

	const isPro = $derived(
		(profile?.tier || user?.app_metadata?.tier || 'free').toLowerCase() === 'pro' ||
		(profile?.role || '').toLowerCase() === 'admin'
	);

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
	<title>Pengaturan Akun - TEXY Workspace</title>
</svelte:head>

<!-- Floating Toast Notification -->
{#if toast}
	<div class="fixed top-5 right-5 z-50 animate-fade-in">
		<div
			class="flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md
			{toast.type === 'success'
				? 'bg-[var(--ttx-bg-card)] border-emerald-500/40 text-emerald-400'
				: 'bg-[var(--ttx-bg-card)] border-rose-500/40 text-rose-400'}"
		>
			{#if toast.type === 'success'}
				<Check size={16} />
			{:else}
				<AlertCircle size={16} />
			{/if}
			<span>{toast.message}</span>
		</div>
	</div>
{/if}

<div class="relative min-h-[calc(100vh-4rem)] bg-[var(--ttx-bg-workspace)] text-[var(--ttx-text-main)] font-sans transition-colors duration-200">
	<!-- Subtle background pattern -->
	<div
		class="absolute inset-0 pointer-events-none opacity-30"
		style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, var(--ttx-hatch) 10px, var(--ttx-hatch) 11.5px);"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
		<!-- 1. HEADER PROFILE CARD -->
		<section
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs transition-colors"
			aria-label="Ringkasan Akun"
		>
			<div class="flex items-center gap-4 min-w-0">
				<!-- Avatar initials -->
				<div
					class="w-14 h-14 rounded-2xl bg-[var(--ttx-accent)]/15 border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent)] font-bold text-lg flex items-center justify-center shadow-xs shrink-0"
				>
					{initials}
				</div>

				<!-- Identity info -->
				<div class="min-w-0">
					<div class="flex items-center gap-2.5 flex-wrap">
						<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)] truncate">
							{greetingName}
						</h1>
						{#if isPro}
							<span
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400"
							>
								<Crown size={12} />
								<span>Pro Member</span>
							</span>
						{:else}
							<span
								class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]"
							>
								Free Tier
							</span>
						{/if}
					</div>
					<p class="text-xs text-[var(--ttx-text-dim)] truncate mt-1">
						{user?.email}
					</p>
				</div>
			</div>

			<!-- Back to Dashboard button -->
			<a
				href="/dashboard"
				class="inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all self-start sm:self-center shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)]"
			>
				<ArrowLeft size={14} />
				<span>Dashboard</span>
			</a>
		</section>

		<!-- 2. BALANCED 50/50 CONTENT GRID -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
			<!-- LEFT COLUMN: PROFIL & INFORMASI SISTEM (50%) -->
			<div class="space-y-6">
				<!-- Card 1: Data Diri Form -->
				<section class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden transition-colors">
					<div class="flex items-center gap-2.5 px-6 py-4 border-b border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)]">
						<User size={15} class="text-[var(--ttx-accent)]" />
						<div>
							<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
								Informasi Profil
							</h2>
							<p class="text-[11px] text-[var(--ttx-text-dim)]">Informasi publik yang ditampilkan pada workspace</p>
						</div>
					</div>

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
						class="p-6 space-y-5"
					>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<!-- Nama Depan -->
							<div class="space-y-1.5">
								<label for="first_name" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Nama Depan <span class="text-rose-400">*</span>
								</label>
								<input
									type="text"
									id="first_name"
									name="first_name"
									class="w-full h-10 px-3.5 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
									value={profile?.first_name ?? ''}
									placeholder="Nama depan Anda"
									required
								/>
							</div>

							<!-- Nama Belakang -->
							<div class="space-y-1.5">
								<label for="last_name" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Nama Belakang
								</label>
								<input
									type="text"
									id="last_name"
									name="last_name"
									class="w-full h-10 px-3.5 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
									value={profile?.last_name ?? ''}
									placeholder="Nama belakang"
								/>
							</div>

							<!-- Username -->
							<div class="space-y-1.5">
								<label for="username" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Username
								</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--ttx-text-dim)] pointer-events-none font-mono">
										@
									</span>
									<input
										type="text"
										id="username"
										name="username"
										class="w-full h-10 pl-8 pr-3.5 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all font-mono"
										value={profile?.username ?? ''}
										placeholder="username_anda"
										minlength="3"
										autocomplete="username"
									/>
								</div>
								<p class="text-[11px] text-[var(--ttx-text-dim)]">Minimal 3 karakter, harus unik.</p>
							</div>

							<!-- Telepon -->
							<div class="space-y-1.5">
								<label for="phone" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Nomor Telepon
								</label>
								<div class="relative">
									<Smartphone size={14} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] pointer-events-none" />
									<input
										type="tel"
										id="phone"
										name="phone"
										class="w-full h-10 pl-9 pr-3.5 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
										value={profile?.phone ?? ''}
										placeholder="+62 812 3456 7890"
										autocomplete="tel"
									/>
								</div>
								<p class="text-[11px] text-[var(--ttx-text-dim)]">Nomor kontak aktif.</p>
							</div>
						</div>

						<div class="flex items-center justify-end pt-4 border-t border-[var(--ttx-border-subtle)]">
							<button
								type="submit"
								class="inline-flex items-center gap-2 h-9 px-5 text-xs font-semibold rounded-xl text-white bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] active:scale-95 transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
								disabled={profileLoading}
							>
								{#if profileLoading}
									<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
								{:else}
									<Check size={14} />
								{/if}
								<span>Simpan Perubahan</span>
							</button>
						</div>
					</form>
				</section>

				<!-- Card 2: Detail Akun & Metadata -->
				<section class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-xs space-y-4 transition-colors">
					<div class="flex items-center justify-between">
						<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
							Detail Akun & Langganan
						</h2>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<!-- Item 1: Paket -->
						<div class="p-3.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] space-y-1">
							<span class="text-[11px] font-medium text-[var(--ttx-text-dim)]">Paket Saat Ini</span>
							<div class="flex items-center justify-between pt-0.5">
								<span class="text-xs font-bold text-[var(--ttx-text-main)]">
									{isPro ? 'Pro Member' : 'Free Tier'}
								</span>
								{#if !isPro}
									<a href="/pricing" class="text-[10px] font-semibold text-[var(--ttx-accent)] hover:underline">
										Upgrade
									</a>
								{/if}
							</div>
						</div>

						<!-- Item 2: Provider Autentikasi -->
						<div class="p-3.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] space-y-1">
							<span class="text-[11px] font-medium text-[var(--ttx-text-dim)]">Metode Masuk</span>
							<div class="pt-0.5">
								<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] border border-[var(--ttx-border-subtle)]">
									{user?.app_metadata?.providers?.includes('google') ? 'Google OAuth' : 'Email & Sandi'}
								</span>
							</div>
						</div>

						<!-- Item 3: ID Pengguna -->
						<div class="p-3.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] space-y-1">
							<span class="text-[11px] font-medium text-[var(--ttx-text-dim)]">User ID</span>
							<div class="flex items-center justify-between pt-0.5">
								<span class="text-[11px] font-mono text-[var(--ttx-text-muted)] truncate max-w-[90px]">
									{user?.id}
								</span>
								<button
									type="button"
									class="p-1 rounded-md text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors cursor-pointer"
									onclick={copyId}
									title="Salin ID"
									aria-label="Salin User ID"
								>
									{#if copiedUserId}
										<Check size={12} class="text-emerald-400" />
									{:else}
										<Copy size={12} />
									{/if}
								</button>
							</div>
						</div>
					</div>
				</section>
			</div>

			<!-- RIGHT COLUMN: EMAIL & KEAMANAN SANDI (50%) -->
			<div class="space-y-6">
				<!-- Card 3: Ubah Email -->
				<section class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden transition-colors">
					<div class="flex items-center gap-2.5 px-6 py-4 border-b border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)]">
						<Mail size={15} class="text-[var(--ttx-accent)]" />
						<div>
							<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
								Alamat Email
							</h2>
							<p class="text-[11px] text-[var(--ttx-text-dim)]">Email utama untuk login dan notifikasi</p>
						</div>
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
						class="p-6 space-y-4"
					>
						<!-- Current Email Display -->
						<div class="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)]">
							<div class="space-y-0.5 min-w-0">
								<span class="text-[10px] font-medium text-[var(--ttx-text-dim)]">Email Saat Ini</span>
								<p class="text-xs font-mono font-semibold text-[var(--ttx-text-main)] truncate">{user?.email}</p>
							</div>
							<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
								<Check size={11} />
								Terverifikasi
							</span>
						</div>

						<!-- New Email Input -->
						<div class="space-y-1.5">
							<label for="email" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
								Alamat Email Baru
							</label>
							<div class="relative">
								<Mail size={14} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] pointer-events-none" />
								<input
									type="email"
									id="email"
									name="email"
									class="w-full h-10 pl-9 pr-3.5 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all font-mono"
									placeholder="email-baru@domain.com"
									autocomplete="email"
									required
								/>
							</div>
							<p class="text-[11px] text-[var(--ttx-text-dim)]">
								Tautan konfirmasi akan dikirim ke alamat email baru.
							</p>
						</div>

						<div class="pt-3 border-t border-[var(--ttx-border-subtle)]">
							<button
								type="submit"
								class="inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all disabled:opacity-60 cursor-pointer shadow-xs"
								disabled={emailLoading}
							>
								{#if emailLoading}
									<span class="w-3.5 h-3.5 border-2 border-[var(--ttx-text-dim)] border-t-[var(--ttx-text-main)] rounded-full animate-spin"></span>
								{:else}
									<Mail size={13} />
								{/if}
								<span>Kirim Konfirmasi Email</span>
							</button>
						</div>
					</form>
				</section>

				<!-- Card 4: Ubah Kata Sandi -->
				<section class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden transition-colors">
					<div class="flex items-center gap-2.5 px-6 py-4 border-b border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)]">
						<KeyRound size={15} class="text-[var(--ttx-accent)]" />
						<div>
							<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
								Kata Sandi & Keamanan
							</h2>
							<p class="text-[11px] text-[var(--ttx-text-dim)]">Kelola kata sandi akun untuk akses email</p>
						</div>
					</div>

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
						class="p-6 space-y-4"
					>
						{#if hasEmailProvider}
							<!-- Password Lama -->
							<div class="space-y-1.5">
								<label for="old_password" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Kata Sandi Lama <span class="text-rose-400">*</span>
								</label>
								<div class="relative">
									<input
										type={showOldPass ? 'text' : 'password'}
										id="old_password"
										name="old_password"
										class="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all font-mono"
										placeholder="Kata sandi lama"
										autocomplete="current-password"
										required
									/>
									<button
										type="button"
										class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
										onclick={() => (showOldPass = !showOldPass)}
										tabindex="-1"
										aria-label={showOldPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
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

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<!-- Password Baru -->
							<div class="space-y-1.5">
								<label for="password" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Kata Sandi Baru
								</label>
								<div class="relative">
									<input
										type={showNewPass ? 'text' : 'password'}
										id="password"
										name="password"
										class="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all font-mono"
										placeholder="Min. 8 karakter"
										minlength="8"
										autocomplete="new-password"
										required
									/>
									<button
										type="button"
										class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
										onclick={() => (showNewPass = !showNewPass)}
										tabindex="-1"
										aria-label={showNewPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
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
							<div class="space-y-1.5">
								<label for="confirm_password" class="block text-xs font-semibold text-[var(--ttx-text-muted)]">
									Konfirmasi Sandi
								</label>
								<div class="relative">
									<input
										type={showConfirmPass ? 'text' : 'password'}
										id="confirm_password"
										name="confirm_password"
										class="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all font-mono"
										placeholder="Ulangi sandi baru"
										minlength="8"
										autocomplete="new-password"
										required
									/>
									<button
										type="button"
										class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] transition-colors cursor-pointer"
										onclick={() => (showConfirmPass = !showConfirmPass)}
										tabindex="-1"
										aria-label={showConfirmPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
									>
										{#if showConfirmPass}
											<EyeOff size={14} />
										{:else}
											<Eye size={14} />
										{/if}
									</button>
								</div>
							</div>
						</div>

						<div class="pt-3 border-t border-[var(--ttx-border-subtle)]">
							<button
								type="submit"
								class="inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all disabled:opacity-60 cursor-pointer shadow-xs"
								disabled={passwordLoading}
							>
								{#if passwordLoading}
									<span class="w-3.5 h-3.5 border-2 border-[var(--ttx-text-dim)] border-t-[var(--ttx-text-main)] rounded-full animate-spin"></span>
								{:else}
									<Lock size={13} />
								{/if}
								<span>Perbarui Kata Sandi</span>
							</button>
						</div>
					</form>
				</section>
			</div>
		</div>
	</div>
</div>
