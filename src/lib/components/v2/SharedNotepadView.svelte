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

	function handleSaveClick(e: MouseEvent) {
		if (lineCount > LINE_LIMIT) {
			e.preventDefault();
			showSaveWarning = true;
		}
	}

	function confirmSave() {
		showSaveWarning = false;
		saveFormEl?.requestSubmit();
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

<div class="flex flex-col gap-3 sm:gap-4 w-full flex-1 min-h-0 h-full overflow-hidden">
	<!-- HEADER BAR -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b shrink-0 {isDark ? 'border-[#1a253c]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 shrink-0">
				<NotebookPen class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
						Shared Notepad
					</h1>
					{#if data?.slug}
						<span class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg {isDark ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
							{data.slug}
						</span>
					{/if}
				</div>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Catatan kolaborasi realtime dengan tautan unik, terenkripsi aman, dan bebas batas waktu.
				</p>
			</div>
		</div>

		<!-- Top Header Actions -->
		<div class="flex items-center gap-2">
			{#if data?.slug}
				<button
					type="button"
					onclick={refresh}
					disabled={refreshing}
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all {isDark
						? 'border-[#223356] bg-[#11192b] text-slate-300 hover:text-white hover:bg-[#16233d]'
						: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
					title="Muat ulang catatan dari server"
				>
					<RefreshCw size={13} class={refreshing ? 'animate-spin' : ''} />
					<span class="hidden sm:inline">Refresh</span>
				</button>

				<button
					type="button"
					onclick={copyLink}
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all {isDark
						? 'border-[#223356] bg-[#11192b] text-slate-300 hover:text-white hover:bg-[#16233d]'
						: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
					title="Salin tautan catatan untuk dibagikan"
				>
					{#if copiedLink}
						<Check size={13} class="text-emerald-400" />
						<span class="text-emerald-400">Tautan Tersalin!</span>
					{:else}
						<Copy size={13} />
						<span>Salin Link</span>
					{/if}
				</button>
			{/if}

			<a
				href="/notepad"
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-xs transition-all"
				title="Buat dokumen catatan bersama baru"
			>
				<FilePlus2 size={13} />
				<span>Catatan Baru</span>
			</a>
		</div>
	</div>

	{#if !data?.slug}
		<!-- EMPTY / NO SLUG STATE: Guide user to open or create a note -->
		<div class="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-xl border {isDark ? 'border-[#1a253c] bg-[#0d1525]' : 'border-slate-200 bg-white'}">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
				<NotebookPen size={32} />
			</div>
			<h2 class="text-lg font-bold mb-2 {isDark ? 'text-white' : 'text-slate-900'}">
				Mulai Catatan Bersama
			</h2>
			<p class="text-xs max-w-md mb-6 leading-relaxed {isDark ? 'text-slate-400' : 'text-slate-500'}">
				Buat dokumen baru dengan tautan unik 12-karakter, atau masukkan ID dokumen yang ingin Anda buka.
			</p>

			<div class="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
				<input
					type="text"
					bind:value={targetSlug}
					placeholder="Masukkan ID / slug (mis: a1b2c3d4e5f6)"
					class="h-10 px-3.5 rounded-lg border text-xs font-mono w-full outline-none transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
				/>
				<a
					href={targetSlug.trim() ? `/notepad/${targetSlug.trim()}` : '/notepad'}
					class="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto shadow-sm transition-all"
				>
					<span>{targetSlug.trim() ? 'Buka Catatan' : 'Buat Baru'}</span>
					<ArrowRight size={14} />
				</a>
			</div>
		</div>
	{:else if data.isLocked}
		<!-- LOCKED STATE -->
		<div class="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-xl border {isDark ? 'border-[#1a253c] bg-[#0d1525]' : 'border-slate-200 bg-white'}">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
				<Lock size={32} />
			</div>
			<h2 class="text-lg font-bold mb-2 {isDark ? 'text-white' : 'text-slate-900'}">
				Catatan Ini Terkunci
			</h2>
			<p class="text-xs max-w-sm mb-6 leading-relaxed {isDark ? 'text-slate-400' : 'text-slate-500'}">
				Dokumen ini dilindungi dengan kata sandi. Silakan masukkan password untuk membaca dan menyunting isinya.
			</p>

			{#if unlockError}
				<div class="mb-4 flex items-center gap-2 p-3 rounded-lg text-xs font-medium border border-rose-500/30 bg-rose-500/10 text-rose-400 max-w-sm w-full text-left">
					<AlertCircle size={15} class="shrink-0" />
					<span>{unlockError}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/unlock"
				use:enhance={handleUnlock}
				class="flex flex-col gap-3 w-full max-w-sm"
			>
				<input
					type="password"
					name="password"
					bind:value={unlockPassword}
					placeholder="Masukkan password..."
					class="h-10 px-3.5 rounded-lg border text-xs outline-none transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					required
				/>
				<button
					type="submit"
					class="h-10 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
					disabled={unlocking || !unlockPassword}
				>
					{#if unlocking}
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
						<span>Membuka...</span>
					{:else}
						<ShieldCheck size={15} />
						<span>Buka Catatan</span>
					{/if}
				</button>
			</form>
		</div>
	{:else}
		<!-- UNLOCKED NOTEBOOK WORKSPACE -->
		<form
			method="POST"
			action="?/save"
			use:enhance={afterSave}
			bind:this={saveFormEl}
			class="flex-1 flex flex-col min-h-0 h-full max-h-full rounded-xl border overflow-hidden {isDark ? 'border-[#1a253c]' : 'border-slate-200'}"
		>
			<!-- WORKSPACE TOOLBAR -->
			<div class="flex flex-wrap items-center justify-between gap-3 px-4 h-11 border-b shrink-0 {isDark ? 'bg-[#0d1525] border-[#1a253c]' : 'bg-slate-50 border-slate-200'}">
				<!-- Left: Cut Tool & Info -->
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1.5">
						<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-600'}">
							Cut Top:
						</span>
						<input
							type="number"
							min="1"
							max={lineCount}
							bind:value={cutLinesCount}
							class="h-7 w-14 rounded-md border text-center font-mono text-xs outline-none transition-colors {isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-200 focus:border-blue-500'
								: 'border-slate-200 bg-white text-slate-800 focus:border-blue-500'}"
						/>
						<span class="text-xs font-mono {isDark ? 'text-slate-500' : 'text-slate-400'}">baris</span>
						<button
							type="button"
							onclick={cutTopLines}
							disabled={lineCount === 0 || cutting}
							class="h-7 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-30 {isDark
								? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
								: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'}"
							title="Potong baris teratas dan salin ke clipboard (otomatis dicatat ke history saat disimpan)"
						>
							<Zap size={11} class="text-amber-400" />
							<span>Cut</span>
						</button>
					</div>

					<div class="h-4 w-px {isDark ? 'bg-slate-800' : 'bg-slate-200'}"></div>

					<div class="flex items-center gap-1 text-[11px] font-mono {isDark ? 'text-slate-400' : 'text-slate-500'}">
						<span>{lineCount.toLocaleString()} baris</span>
						<span class="opacity-40">|</span>
						<span>{text.length.toLocaleString()} karakter</span>
					</div>
				</div>

				<!-- Right: Password & Save Status -->
				<div class="flex items-center gap-2">
					<!-- Password Protection Control -->
					{#if !data.hasPassword}
						<div class="relative hidden sm:block">
							<div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none {isDark ? 'text-slate-500' : 'text-slate-400'}">
								<Lock size={12} />
							</div>
							<input
								type="password"
								name="password"
								bind:value={passwordInput}
								placeholder="Set Password (opsional)"
								class="h-7 w-44 pl-7 pr-2.5 text-xs rounded-md border outline-none transition-colors {isDark
									? 'border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-500 focus:border-blue-500'
									: 'border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500'}"
							/>
						</div>
					{:else}
						<button
							type="button"
							onclick={() => (showChangePasswordModal = true)}
							class="h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors {isDark
								? 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
								: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}"
							title="Klik untuk ubah atau hapus password (hanya admin)"
						>
							<Lock size={12} />
							<span>Terkunci Password</span>
						</button>
					{/if}

					<!-- Save feedback -->
					{#if saved}
						<span class="flex items-center gap-1 text-xs font-bold text-emerald-400 px-1 animate-fade-in">
							<Check size={13} /> Tersimpan!
						</span>
					{/if}

					<!-- Submit Save Button -->
					<button
						type="submit"
						onclick={handleSaveClick}
						disabled={isSaving}
						class="h-7 px-3 rounded-md bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-40"
					>
						<Save size={13} />
						<span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
					</button>
				</div>
			</div>

			<!-- MAIN EDITOR WITH SYNCED LINE-NUMBER GUTTER -->
			<div class="flex-1 min-h-0 h-full flex overflow-hidden {isDark ? 'bg-[#08101e]' : 'bg-white'}">
				<!-- Gutter line numbers -->
				<div class="w-12 shrink-0 h-full max-h-full border-r select-none overflow-hidden font-mono text-xs {isDark ? 'border-[#1a253c] bg-[#0c1424] text-slate-600' : 'border-slate-200 bg-slate-50 text-slate-400'}">
					<div style="transform: translateY({-textareaScrollTop}px); padding-top: 16px;">
						{#each Array(lineCount) as _, i}
							<div class="text-right pr-3" style="height: 22px; line-height: 22px;">
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
					class="w-full flex-1 h-full min-h-0 resize-none p-4 font-mono text-xs sm:text-sm outline-none overflow-y-auto {isDark
						? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
						: 'bg-white text-slate-800 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- WORKSPACE BOTTOM STATUS -->
			<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t text-[11px] font-mono shrink-0 {isDark ? 'border-[#1a253c] bg-[#0d1525] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}">
				<div class="flex items-center gap-1.5">
					<Clock size={12} class="opacity-60" />
					<span>Terakhir diubah: {formatDate(data.updatedAt)}</span>
				</div>
				<div class="flex items-center gap-3">
					<span>Batas: {lineCount > LINE_LIMIT ? `${LINE_LIMIT} baris (terlampaui)` : `${lineCount}/${LINE_LIMIT} baris`}</span>
				</div>
			</div>
		</form>
	{/if}

	<!-- MODAL: GANTI / HAPUS PASSWORD -->
	{#if showChangePasswordModal}
		<div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
			<form
				method="POST"
				action="?/changePassword"
				use:enhance={handleChangePassword}
				class="rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border {isDark ? 'bg-[#0d1525] border-[#1a253c] text-white' : 'bg-white border-slate-200 text-slate-900'}"
			>
				<button
					type="button"
					class="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
					onclick={() => (showChangePasswordModal = false)}
				>
					<X size={18} />
				</button>

				<div class="flex items-center gap-2.5 mb-3">
					<div class="p-2 rounded-lg bg-blue-500/10 text-blue-400">
						<KeyRound size={18} />
					</div>
					<h3 class="font-bold text-base">Ubah / Hapus Password</h3>
				</div>

				<p class="text-xs leading-relaxed mb-4 {isDark ? 'text-slate-400' : 'text-slate-600'}">
					Tindakan ini memerlukan Password Recovery Admin untuk mengizinkan perubahan proteksi.
				</p>

				{#if changePasswordError}
					<div class="mb-3.5 p-2.5 rounded-lg text-xs border border-rose-500/30 bg-rose-500/10 text-rose-400">
						{changePasswordError}
					</div>
				{/if}

				<div class="space-y-3">
					<div>
						<label class="block text-[10px] font-bold uppercase tracking-wider mb-1 {isDark ? 'text-slate-400' : 'text-slate-600'}" for="adminPassword">
							Admin Recovery Password
						</label>
						<input
							id="adminPassword"
							type="password"
							name="adminPassword"
							required
							class="h-9 w-full rounded-lg border px-3 text-xs outline-none transition-colors {isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-200 focus:border-blue-500'
								: 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
						/>
					</div>

					<div>
						<label class="block text-[10px] font-bold uppercase tracking-wider mb-1 {isDark ? 'text-slate-400' : 'text-slate-600'}" for="newPassword">
							Password Baru (Kosongkan jika ingin membuka proteksi)
						</label>
						<input
							id="newPassword"
							type="password"
							name="newPassword"
							placeholder="Kosongkan untuk menghapus password"
							class="h-9 w-full rounded-lg border px-3 text-xs outline-none transition-colors {isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-500 focus:border-blue-500'
								: 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
						/>
					</div>

					<button
						type="submit"
						disabled={changingPassword}
						class="h-9 w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
					>
						{#if changingPassword}
							<div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
						{/if}
						<span>Terapkan Perubahan</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- MODAL: SAVE WARNING (>1000 LINES) -->
	{#if showSaveWarning}
		<div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
			<div class="rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border {isDark ? 'bg-[#0d1525] border-[#1a253c] text-white' : 'bg-white border-slate-200 text-slate-900'}">
				<h3 class="text-base font-bold mb-2 text-amber-400 flex items-center gap-2">
					<AlertCircle size={18} /> Perhatian: Batas Baris
				</h3>
				<p class="text-xs mb-2 {isDark ? 'text-slate-300' : 'text-slate-700'}">
					Dokumen Anda saat ini memiliki <strong class="font-mono">{lineCount.toLocaleString()} baris</strong>.
				</p>
				<p class="text-xs mb-5 leading-relaxed {isDark ? 'text-slate-400' : 'text-slate-600'}">
					Shared Notepad publik hanya menyimpan <strong class="font-mono">1.000 baris pertama</strong>. Baris ke-{(LINE_LIMIT + 1).toLocaleString()} ke atas akan terpotong secara permanen.
				</p>
				<div class="flex gap-2.5">
					<button
						type="button"
						class="flex-1 h-9 rounded-lg border text-xs font-semibold transition-colors {isDark ? 'border-[#1e2e50] hover:bg-[#152035] text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}"
						onclick={() => (showSaveWarning = false)}
					>
						Batal
					</button>
					<button
						type="button"
						class="flex-1 h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
						onclick={confirmSave}
					>
						Simpan 1.000 Baris
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

