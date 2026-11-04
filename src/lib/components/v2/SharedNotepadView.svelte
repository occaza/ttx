<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		NotebookPen,
		RefreshCw,
		FilePlus2,
		Copy,
		Check,
		Lock,
		Zap,
		Clock,
		Save,
		X,
		KeyRound,
		ShieldCheck,
		AlertCircle,
		ArrowRight
	} from '@lucide/svelte';

	interface Props {
		isDark?: boolean;
		data?: {
			slug: string;
			text: string;
			isLocked: boolean;
			hasPassword: boolean;
			updatedAt: string | null;
		} | null;
	}

	let { isDark = true, data = null }: Props = $props();

	let text = $state(data?.text || '');
	let saved = $state(false);
	let isSaving = $state(false);
	let refreshing = $state(false);
	let copiedLink = $state(false);
	let copiedAll = $state(false);
	let showSaveWarning = $state(false);
	let saveFormEl: HTMLFormElement | undefined = $state();
	let ta: HTMLTextAreaElement | undefined = $state();
	let textareaScrollTop = $state(0);

	// Password protection states
	let passwordInput = $state('');
	let showChangePasswordModal = $state(false);
	let changePasswordError = $state('');
	let changingPassword = $state(false);
	let unlockPassword = $state('');
	let unlocking = $state(false);
	let unlockError = $state('');

	// Cut lines feature
	let cutLinesCount = $state(10);
	let cutting = $state(false);

	// Custom slug lookup for empty state
	let targetSlug = $state('');

	$effect(() => {
		if (data?.text !== undefined) {
			text = data.text;
		}
	});

	let lineCount = $derived(text ? text.split('\n').length : 1);
	const LINE_LIMIT = 1000;
	let showUpgradeModal = $state(false);
	let upgradeModalDismissed = $state(false);

	$effect(() => {
		if (cutLinesCount > lineCount) {
			cutLinesCount = Math.max(1, lineCount);
		}
	});

	$effect(() => {
		if (lineCount > LINE_LIMIT && !upgradeModalDismissed) {
			showUpgradeModal = true;
		}
	});

	function syncScroll(e: Event) {
		textareaScrollTop = (e.target as HTMLTextAreaElement).scrollTop;
	}

	function formatDate(dateString: string | null | undefined) {
		if (!dateString) return 'Belum pernah';
		const date = new Date(dateString);
		return date.toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Asia/Jakarta'
		});
	}

	const afterSave: SubmitFunction = () => {
		isSaving = true;
		return async ({ update }) => {
			await update({ reset: false });
			isSaving = false;
			saved = true;
			setTimeout(() => (saved = false), 2000);
			ta?.focus();
		};
	};

	function handleSaveClick(e?: MouseEvent) {
		if (lineCount > LINE_LIMIT) {
			e?.preventDefault();
			showSaveWarning = true;
			return;
		}
		saveFormEl?.requestSubmit();
	}

	function confirmSave() {
		showSaveWarning = false;
		saveFormEl?.requestSubmit();
	}

	async function copyAllText() {
		if (!text) return;
		await navigator.clipboard.writeText(text);
		copiedAll = true;
		setTimeout(() => (copiedAll = false), 1800);
	}

	async function refresh() {
		refreshing = true;
		await invalidateAll();
		refreshing = false;
	}

	function copyLink() {
		if (!data?.slug) return;
		const fullUrl = `${$page.url.origin}/notepad/${data.slug}`;
		navigator.clipboard.writeText(fullUrl);
		copiedLink = true;
		setTimeout(() => (copiedLink = false), 2000);
	}

	function cutTopLines() {
		const n = Math.max(1, cutLinesCount);
		const lines = text ? text.split('\n') : [];
		if (lines.length === 0) return;
		cutting = true;
		const cut = lines.slice(0, n).join('\n');
		navigator.clipboard.writeText(cut).catch(() => {});
		text = lines.slice(n).join('\n');
		setTimeout(() => (cutting = false), 500);
	}

	const handleUnlock: SubmitFunction = () => {
		unlocking = true;
		unlockError = '';
		return async ({ result, update }) => {
			unlocking = false;
			if (result.type === 'success' && (result.data as any)?.success) {
				await update();
			} else if (result.type === 'success' && (result.data as any)?.error) {
				unlockError = (result.data as any).error;
			} else {
				unlockError = 'Gagal membuka catatan';
			}
		};
	};

	const handleChangePassword: SubmitFunction = () => {
		changingPassword = true;
		changePasswordError = '';
		return async ({ result, update }) => {
			changingPassword = false;
			if (result.type === 'success' && result.data) {
				if ((result.data as any).changePasswordError) {
					changePasswordError = (result.data as any).changePasswordError as string;
				} else if ((result.data as any).changePasswordSuccess) {
					showChangePasswordModal = false;
					window.location.reload();
				}
			}
			await update({ reset: false });
		};
	};
</script>

<div class="flex h-full min-h-[520px] w-full flex-1 flex-col gap-3 sm:min-h-0 sm:gap-4">
	<!-- HEADER BAR -->
	<div
		class="flex shrink-0 flex-col justify-between gap-3 border-b border-[var(--ttx-border-base)] pb-3 sm:flex-row sm:items-center"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] shadow-xs"
			>
				<NotebookPen class="h-5 w-5" />
			</div>
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-base font-bold tracking-tight text-[var(--ttx-text-main)] sm:text-lg">
						Shared Notepad
					</h1>
					{#if data?.slug}
						<span
							class="inline-flex items-center gap-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--ttx-accent-text)]"
						>
							{data.slug}
						</span>
					{/if}
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Catatan kolaborasi realtime dengan tautan unik, terenkripsi aman, dan bebas batas waktu.
				</p>
			</div>
		</div>

		<!-- Top Header Actions -->
		<div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
			{#if data?.slug}
				<button
					type="button"
					onclick={refresh}
					disabled={refreshing}
					class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ttx-text-muted)] shadow-xs transition-all hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] sm:px-3"
					title="Muat ulang catatan dari server"
				>
					<RefreshCw size={13} class={refreshing ? 'animate-spin' : ''} />
					<span class="hidden sm:inline">Refresh</span>
				</button>

				<button
					type="button"
					onclick={copyLink}
					class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ttx-text-muted)] shadow-xs transition-all hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] sm:px-3"
					title="Salin tautan catatan untuk dibagikan"
				>
					{#if copiedLink}
						<Check size={13} class="text-emerald-500" />
						<span class="text-emerald-500">Tersalin!</span>
					{:else}
						<Copy size={13} />
						<span>Salin Link</span>
					{/if}
				</button>
			{/if}

			<a
				href="/notepad"
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ttx-text-muted)] shadow-xs transition-all hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] sm:px-3"
				title="Buat dokumen catatan bersama baru"
			>
				<FilePlus2 size={13} />
				<span class="hidden sm:inline">Catatan Baru</span>
			</a>

			{#if data?.slug && !data?.isLocked}
				<button
					type="button"
					onclick={handleSaveClick}
					disabled={isSaving}
					class="flex items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-95 disabled:opacity-40"
					title="Simpan perubahan catatan"
				>
					{#if isSaving}
						<div
							class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						<span>Menyimpan...</span>
					{:else if saved}
						<Check size={13} class="text-white" />
						<span>Tersimpan!</span>
					{:else}
						<Save size={13} />
						<span>Simpan</span>
					{/if}
				</button>
			{/if}
		</div>
	</div>

	{#if !data?.slug}
		<!-- EMPTY / NO SLUG STATE: Guide user to open or create a note -->
		<div
			class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-8 text-center shadow-xs"
		>
			<div
				class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ttx-accent-subtle)] text-[var(--ttx-accent-text)]"
			>
				<NotebookPen size={32} />
			</div>
			<h2 class="mb-2 text-lg font-bold text-[var(--ttx-text-main)]">Mulai Catatan Bersama</h2>
			<p class="mb-6 max-w-md text-xs leading-relaxed text-[var(--ttx-text-muted)]">
				Buat dokumen baru dengan tautan unik 12-karakter, atau masukkan ID dokumen yang ingin Anda
				buka.
			</p>

			<div class="flex w-full max-w-sm flex-col items-center gap-3 sm:flex-row">
				<input
					type="text"
					bind:value={targetSlug}
					placeholder="Masukkan ID / slug (mis: a1b2c3d4e5f6)"
					class="h-10 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-colors outline-none focus:border-[var(--ttx-accent)]"
				/>
				<a
					href={targetSlug.trim() ? `/notepad/${targetSlug.trim()}` : '/notepad'}
					class="flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-4 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-95 sm:w-auto"
				>
					<span>{targetSlug.trim() ? 'Buka Catatan' : 'Buat Baru'}</span>
					<ArrowRight size={14} />
				</a>
			</div>
		</div>
	{:else if data.isLocked}
		<!-- LOCKED STATE -->
		<div
			class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-8 text-center shadow-xs"
		>
			<div
				class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500"
			>
				<Lock size={32} />
			</div>
			<h2 class="mb-2 text-lg font-bold text-[var(--ttx-text-main)]">Catatan Ini Terkunci</h2>
			<p class="mb-6 max-w-sm text-xs leading-relaxed text-[var(--ttx-text-muted)]">
				Dokumen ini dilindungi dengan kata sandi. Silakan masukkan password untuk membaca dan
				menyunting isinya.
			</p>

			{#if unlockError}
				<div
					class="mb-4 flex w-full max-w-sm items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs font-medium text-rose-500"
				>
					<AlertCircle size={15} class="shrink-0" />
					<span>{unlockError}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/unlock"
				use:enhance={handleUnlock}
				class="flex w-full max-w-sm flex-col gap-3"
			>
				<input
					type="password"
					name="password"
					bind:value={unlockPassword}
					placeholder="Masukkan password..."
					class="h-10 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-colors outline-none focus:border-[var(--ttx-accent)]"
					required
				/>
				<button
					type="submit"
					class="flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--ttx-accent)] text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-95 disabled:opacity-40"
					disabled={unlocking || !unlockPassword}
				>
					{#if unlocking}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						<span>Membuka...</span>
					{:else}
						<ShieldCheck size={15} />
						<span>Buka Catatan</span>
					{/if}
				</button>
			</form>
		</div>
	{:else}
		<!-- UNLOCKED NOTEBOOK WORKSPACE: UNIFIED CARD -->
		<form
			method="POST"
			action="?/save"
			use:enhance={afterSave}
			bind:this={saveFormEl}
			class="flex h-full max-h-full min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs sm:min-h-0"
		>
			<!-- WORKSPACE TOOLBAR -->
			<div
				class="flex shrink-0 flex-col justify-between gap-2.5 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-3.5 py-2.5 sm:h-11 sm:flex-row sm:items-center sm:px-4 sm:py-0"
			>
				<!-- Left: Cut Tool & Info -->
				<div class="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-3">
					<div class="flex items-center gap-1.5">
						<span
							class="text-[10px] font-bold tracking-wider text-[var(--ttx-text-muted)] uppercase"
						>
							Cut:
						</span>
						<input
							type="number"
							min="1"
							max={Math.max(1, lineCount)}
							bind:value={cutLinesCount}
							class="h-7 w-12 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-center font-mono text-xs text-[var(--ttx-text-main)] transition-colors outline-none focus:border-[var(--ttx-accent)] sm:w-14"
						/>
						<span class="font-mono text-xs text-[var(--ttx-text-dim)]">baris</span>
						<button
							type="button"
							onclick={cutTopLines}
							disabled={lineCount === 0 || cutting}
							class="flex h-7 items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-500 transition-all hover:bg-amber-500/20 disabled:opacity-30"
							title="Potong baris teratas dan salin ke clipboard"
						>
							<Zap size={11} class="text-amber-500" />
							<span>Cut</span>
						</button>
					</div>

					<div class="hidden h-4 w-px bg-[var(--ttx-border-subtle)] sm:block"></div>

					<div class="flex items-center gap-1.5 font-mono text-[11px] text-[var(--ttx-text-muted)]">
						<span>{lineCount.toLocaleString()} baris</span>
						<span class="opacity-40">•</span>
						<span>{text.length.toLocaleString()} char</span>
					</div>
				</div>

				<!-- Right: Password, Copy All & Save Button -->
				<div class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
					<!-- Password Protection Control (active on mobile and desktop) -->
					{#if !data.hasPassword}
						<div class="relative flex-1 sm:flex-initial">
							<div
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[var(--ttx-text-dim)]"
							>
								<Lock size={12} />
							</div>
							<input
								type="password"
								name="password"
								bind:value={passwordInput}
								placeholder="Set Password (opsional)"
								class="h-7 w-full rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pr-2.5 pl-7 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-colors outline-none focus:border-[var(--ttx-accent)] sm:w-44"
							/>
						</div>
					{:else}
						<button
							type="button"
							onclick={() => (showChangePasswordModal = true)}
							class="flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[var(--ttx-accent)]/30 bg-[var(--ttx-accent-subtle)] px-2.5 text-xs font-medium text-[var(--ttx-accent-text)] transition-colors hover:opacity-90"
							title="Klik untuk ubah atau hapus password (hanya admin)"
						>
							<Lock size={12} />
							<span>Terkunci</span>
						</button>
					{/if}

					<!-- Quick Copy All Button -->
					<button
						type="button"
						onclick={copyAllText}
						disabled={!text}
						class="flex h-7 shrink-0 items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-2.5 text-xs font-semibold text-[var(--ttx-text-muted)] transition-all hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] disabled:opacity-30"
						title="Salin seluruh isi catatan ke clipboard"
					>
						{#if copiedAll}
							<Check size={12} class="text-emerald-500" />
							<span class="font-bold text-emerald-500">Disalin</span>
						{:else}
							<Copy size={12} />
							<span class="xs:inline hidden">Salin</span>
						{/if}
					</button>

					<!-- Submit Save Button -->
					<button
						type="submit"
						onclick={handleSaveClick}
						disabled={isSaving}
						class="flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-[var(--ttx-accent)] px-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-95 disabled:opacity-40"
					>
						{#if isSaving}
							<div
								class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							<span>Menyimpan...</span>
						{:else if saved}
							<Check size={13} class="text-white" />
							<span>Tersimpan!</span>
						{:else}
							<Save size={13} />
							<span>Simpan</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- MAIN EDITOR WITH SYNCED LINE-NUMBER GUTTER -->
			<div
				class="flex h-full min-h-[380px] flex-1 overflow-hidden bg-[var(--ttx-bg-card)] sm:min-h-0"
			>
				<!-- Gutter line numbers -->
				<div
					class="h-full max-h-full w-9 shrink-0 overflow-hidden border-r border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] font-mono text-xs text-[var(--ttx-text-dim)] select-none sm:w-12"
				>
					<div class="pt-3.5 sm:pt-4" style="transform: translateY({-textareaScrollTop}px);">
						{#each Array(lineCount) as _, i}
							<div class="pr-2 text-right sm:pr-3" style="height: 22px; line-height: 22px;">
								{i + 1}
							</div>
						{/each}
					</div>
				</div>

				<!-- Textarea Editor -->
				<textarea
					bind:this={ta}
					bind:value={text}
					name="text"
					placeholder="Tulis atau paste catatan bersama di sini..."
					onscroll={syncScroll}
					style="line-height: 22px;"
					class="h-full min-h-[380px] w-full flex-1 resize-none overflow-y-auto bg-transparent p-3.5 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none sm:min-h-0 sm:p-4 sm:text-sm"
				></textarea>
			</div>

			<!-- WORKSPACE BOTTOM STATUS -->
			<div
				class="flex shrink-0 flex-col justify-between gap-1.5 border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-3.5 py-2 font-mono text-[11px] text-[var(--ttx-text-muted)] sm:flex-row sm:items-center sm:gap-3 sm:px-4"
			>
				<div class="flex items-center gap-1.5 truncate">
					<Clock size={12} class="shrink-0 opacity-60" />
					<span class="truncate">Terakhir diubah: {formatDate(data.updatedAt)}</span>
				</div>
				<div class="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
					<span class={lineCount > LINE_LIMIT ? 'font-bold text-rose-500' : ''}>
						Batas: {lineCount > LINE_LIMIT
							? `${LINE_LIMIT} baris (terlampaui)`
							: `${lineCount}/${LINE_LIMIT} baris`}
					</span>
				</div>
			</div>
		</form>
	{/if}

	<!-- MODAL: GANTI / HAPUS PASSWORD -->
	{#if showChangePasswordModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
		>
			<form
				method="POST"
				action="?/changePassword"
				use:enhance={handleChangePassword}
				class="relative w-full max-w-sm rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 text-[var(--ttx-text-main)] shadow-2xl"
			>
				<button
					type="button"
					class="absolute top-4 right-4 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
					onclick={() => (showChangePasswordModal = false)}
				>
					<X size={18} />
				</button>

				<div class="mb-3 flex items-center gap-2.5">
					<div class="rounded-lg bg-[var(--ttx-accent-subtle)] p-2 text-[var(--ttx-accent-text)]">
						<KeyRound size={18} />
					</div>
					<h3 class="text-base font-bold">Ubah / Hapus Password</h3>
				</div>

				<p class="mb-4 text-xs leading-relaxed text-[var(--ttx-text-muted)]">
					Tindakan ini memerlukan Password Recovery Admin untuk mengizinkan perubahan proteksi.
				</p>

				{#if changePasswordError}
					<div
						class="mb-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-500"
					>
						{changePasswordError}
					</div>
				{/if}

				<div class="space-y-3">
					<div>
						<label
							class="mb-1 block text-[10px] font-bold tracking-wider text-[var(--ttx-text-muted)] uppercase"
							for="adminPassword"
						>
							Admin Recovery Password
						</label>
						<input
							id="adminPassword"
							type="password"
							name="adminPassword"
							required
							class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 text-xs text-[var(--ttx-text-main)] transition-colors outline-none focus:border-[var(--ttx-accent)]"
						/>
					</div>

					<div>
						<label
							class="mb-1 block text-[10px] font-bold tracking-wider text-[var(--ttx-text-muted)] uppercase"
							for="newPassword"
						>
							Password Baru (Kosongkan jika ingin membuka proteksi)
						</label>
						<input
							id="newPassword"
							type="password"
							name="newPassword"
							placeholder="Kosongkan untuk menghapus password"
							class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] transition-colors outline-none focus:border-[var(--ttx-accent)]"
						/>
					</div>

					<button
						type="submit"
						disabled={changingPassword}
						class="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-95 disabled:opacity-40"
					>
						{#if changingPassword}
							<div
								class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{/if}
						<span>Terapkan Perubahan</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- MODAL: SAVE WARNING (>1000 LINES) -->
	{#if showSaveWarning}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
		>
			<div
				class="relative w-full max-w-sm rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 text-[var(--ttx-text-main)] shadow-2xl"
			>
				<h3 class="mb-2 flex items-center gap-2 text-base font-bold text-amber-500">
					<AlertCircle size={18} /> Perhatian: Batas Baris
				</h3>
				<p class="mb-2 text-xs text-[var(--ttx-text-main)]">
					Dokumen Anda saat ini memiliki <strong class="font-mono"
						>{lineCount.toLocaleString()} baris</strong
					>.
				</p>
				<p class="mb-5 text-xs leading-relaxed text-[var(--ttx-text-muted)]">
					Shared Notepad publik hanya menyimpan <strong class="font-mono"
						>1.000 baris pertama</strong
					>. Baris ke-{(LINE_LIMIT + 1).toLocaleString()} ke atas akan terpotong secara permanen.
				</p>
				<div class="flex gap-2.5">
					<button
						type="button"
						class="h-9 flex-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-xs font-semibold text-[var(--ttx-text-main)] transition-colors hover:bg-[var(--ttx-bg-hover)]"
						onclick={() => (showSaveWarning = false)}
					>
						Batal
					</button>
					<button
						type="button"
						class="h-9 flex-1 rounded-lg bg-rose-600 text-xs font-bold text-white transition-colors hover:bg-rose-500"
						onclick={confirmSave}
					>
						Simpan 1.000 Baris
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
