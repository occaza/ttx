<script lang="ts">
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { FilePlus2, Save, RefreshCw, Copy, Link, Clock, ArrowLeft, NotebookPen, Lock, X, Zap } from '@lucide/svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let text = $state(data.text);
	let saved = $state(false);
	let refreshing = $state(false);
	let showSaveWarning = $state(false);
	let saveFormEl: HTMLFormElement | undefined = $state();
	let linkInput: HTMLInputElement | undefined = $state();
	let ta: TextArea | undefined = $state();
	let lineNumbersEl: HTMLDivElement | undefined = $state();
	let passwordInput = $state('');
	let showChangePasswordModal = $state(false);
	let changePasswordError = $state('');
	let changingPassword = $state(false);
	let unlockPassword = $state('');
	let unlocking = $state(false);
	let unlockError = $state('');
	let cutLinesCount = $state(10);
	let cutting = $state(false);

	$effect(() => {
		text = data.text;
	});

	let lineCount = $derived(text ? text.split('\n').length : 1);
	const LINE_LIMIT = 1000;
	let showUpgradeModal = $state(false);
	let upgradeModalDismissed = $state(false);

	$effect(() => {
		if (lineCount > LINE_LIMIT && !upgradeModalDismissed) {
			showUpgradeModal = true;
		}
	});

	function syncScroll(e: Event) {
		if (lineNumbersEl) {
			lineNumbersEl.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
		}
	}

	function selectAll() {
		ta?.select();
	}

	function formatDate(dateString: string | null) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleString('en-EN', {
			dateStyle: 'long',
			timeStyle: 'short',
			timeZone: 'Asia/Jakarta'
		});
	}

	const afterSave: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
			saved = true;
			setTimeout(() => (saved = false), 1000);
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
		linkInput?.select();
		navigator.clipboard.writeText(`${$page.url.origin}/notepad/${data.slug}`);
	}

	const handleUnlock: SubmitFunction = () => {
		unlocking = true;
		unlockError = '';
		return async ({ result, update }) => {
			unlocking = false;
			if (result.type === 'success' && result.data?.success) {
				await update();
			} else if (result.type === 'success' && result.data?.error) {
				unlockError = result.data.error;
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
				if (result.data.changePasswordError) {
					changePasswordError = result.data.changePasswordError as string;
				} else if (result.data.changePasswordSuccess) {
					showChangePasswordModal = false;
					// Reload to reflect new locked state
					window.location.reload();
				}
			}
			await update({ reset: false });
		};
	};

	function cutTopLines() {
		const n = Math.max(1, cutLinesCount);
		const lines = text ? text.split('\n') : [];
		if (lines.length === 0) return;
		const cut = lines.slice(0, n).join('\n');
		navigator.clipboard.writeText(cut).catch(() => {});
		text = lines.slice(n).join('\n');
	}
</script>

<svelte:head>
	<title>Notepad - {data.slug} - TEXY Workspace</title>
	<meta name="description" content="Catatan online yang bisa dibuka dan diedit bersama. Bagikan link dan kolaborasi real-time dengan siapa saja." />
	<meta name="keywords" content="notepad online, shared notepad, collaborative notes, catatan bersama, text editor online" />
	<meta name="robots" content="noindex, nofollow" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Online Notepad - {data.slug}" />
	<meta property="og:description" content="Catatan online yang bisa dibuka dan diedit bersama" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Online Notepad - {data.slug}" />
	<meta name="twitter:description" content="Catatan online yang bisa dibuka dan diedit bersama" />
	<meta name="twitter:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Grid Background Pattern -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
		
		<!-- Header -->
		<div class="mb-8">
			<a href="/" class="mb-5 inline-flex items-center text-sm font-medium text-base-content/40 hover:text-base-content transition-colors">
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center justify-between flex-wrap gap-4">
				<div class="flex items-center gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md">
						<NotebookPen size={26} strokeWidth={1.5} />
					</div>
					<div>
						<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Notepad</h1>
						<div class="mt-1 flex items-center gap-2">
							<span class="text-sm text-base-content/50">Shared via:</span>
							<code class="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold">{data.slug}</code>
						</div>
					</div>
				</div>
				<div class="flex gap-2">
					<button type="button" class="btn btn-sm bg-base-200/50 border border-base-content/10 rounded-lg hover:bg-base-200 transition-colors shadow-sm gap-1.5" onclick={refresh} disabled={refreshing}>
						<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
					</button>
					<a href="/notepad" class="btn btn-sm bg-base-200/50 border border-base-content/10 rounded-lg hover:bg-base-200 transition-colors shadow-sm gap-2">
						<FilePlus2 size={16} /> New Notes
					</a>
				</div>
			</div>
		</div>

		{#if data.isLocked}
			<div class="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md p-8">
				<div class="bg-primary/10 p-4 rounded-full mb-4 text-primary">
					<Lock size={48} />
				</div>
				<h2 class="text-2xl font-bold mb-2">Catatan Terkunci</h2>
				<p class="text-base-content/60 text-center mb-6 max-w-sm">
					Catatan ini dilindungi dengan password. Silakan masukkan password untuk melihat dan mengedit isinya.
				</p>

				{#if unlockError}
					<div class="alert alert-error text-sm mb-4 max-w-sm">
						<span>{unlockError}</span>
					</div>
				{/if}

				<form method="POST" action="?/unlock" use:enhance={handleUnlock} class="flex w-full max-w-sm flex-col gap-3">
					<input 
						type="password" 
						name="password" 
						bind:value={unlockPassword}
						placeholder="Masukkan password..." 
						class="input input-bordered w-full"
						required 
					/>
					<button type="submit" class="btn btn-primary" disabled={unlocking || !unlockPassword}>
						{#if unlocking}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							Buka Catatan
						{/if}
					</button>
				</form>
			</div>
		{:else}
			<form method="POST" action="?/save" use:enhance={afterSave} bind:this={saveFormEl} class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
				
				<!-- Editor Toolbar -->
				<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 px-4 py-2.5 rounded-t-2xl">
					<div class="text-xs font-semibold text-base-content/40 flex items-center gap-1.5 uppercase tracking-wider">
						<NotebookPen size={14} /> Editor
					</div>
					
					<!-- Cut Lines Action -->
					<div class="flex items-center gap-2">
						<span class="text-xs text-base-content/50 font-medium">Cut top</span>
						<input
							type="number"
							min="1"
							max={lineCount}
							bind:value={cutLinesCount}
							class="input input-xs w-16 bg-base-100 border border-base-content/10 font-mono text-center focus:outline-none focus:border-primary/50"
						/>
						<button
							type="button"
							class="btn btn-xs bg-base-100 border border-base-content/10 hover:bg-base-200 hover:border-base-content/20 gap-1.5 font-mono shadow-sm transition-all"
							onclick={cutTopLines}
							disabled={lineCount === 0 || cutting}
							title="Cut and copy lines to clipboard"
						>
							<Zap size={12} class="text-warning" />
							Cut
						</button>
					</div>
				</div>

				<!-- Main Editor -->
				<div class="bg-base-100/50 flex overflow-hidden h-[600px]">
					<!-- Line Numbers Gutter -->
					<div
						bind:this={lineNumbersEl}
						class="w-12 shrink-0 bg-base-200/20 border-r border-base-content/5 text-right pr-3 pt-5 overflow-hidden text-base-content/25 font-mono text-sm select-none"
					>
						{#each Array(lineCount) as _, i}
							<div class="leading-6">{i + 1}</div>
						{/each}
					</div>
					<TextArea
						bind:this={ta}
						bind:value={text}
						name="text"
						placeholder="Tulis catatan kamu di sini..."
						rows={25}
						onscroll={syncScroll}
						className="w-full flex-1 h-full resize-none border-none bg-transparent p-5 text-sm leading-6 outline-none focus:ring-0 font-mono overflow-y-auto"
					/>
				</div>

				<!-- Bottom Footer (Info & Share) -->
				<div class="flex flex-col sm:flex-row items-center justify-between border-t border-base-content/10 bg-base-200/20 px-4 py-3 gap-4 rounded-b-2xl">
					<div class="flex items-center gap-3 text-xs font-medium text-base-content/40">
						<Clock size={14} />
						<span>Last edited: {formatDate(data.updatedAt)}</span>
						<span class="text-base-content/20">|</span>
						<span class="font-mono text-base-content/50">{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
					</div>
					
					<div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
						<div class="relative w-full sm:w-48">
							{#if !data.hasPassword}
								<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock size={14} class="text-base-content/30" />
								</div>
								<input
									type="password"
									name="password"
									bind:value={passwordInput}
									placeholder="Set Password (Opsional)"
									class="w-full bg-base-100 border border-base-content/10 text-base-content/80 text-xs rounded-lg focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors py-2 pl-9 pr-3 shadow-inner"
								/>
							{:else}
								<button type="button" class="flex items-center gap-2 text-base-content/50 hover:text-base-content/80 text-xs px-2 py-2 bg-base-200/50 hover:bg-base-200 rounded-lg border border-base-content/5 transition-colors cursor-pointer w-full" onclick={() => showChangePasswordModal = true}>
									<Lock size={14} />
									<span>Protected (Click to Change)</span>
								</button>
							{/if}
						</div>

						<div class="relative w-full sm:w-72">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Link size={14} class="text-base-content/30" />
							</div>
							<input
								type="text"
								readonly
								bind:this={linkInput}
								value="https://{$page.url.host}/notepad/{data.slug}"
								class="w-full bg-base-100 border border-base-content/10 text-base-content/60 text-xs rounded-lg focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors py-2 pl-9 pr-3 shadow-inner"
							/>
						</div>
						<button type="button" class="btn btn-sm bg-base-100 border border-base-content/10 rounded-lg hover:bg-base-200 transition-colors shadow-sm gap-1.5" onclick={copyLink}>
							<Copy size={14} /> Copy
						</button>
						<div class="flex items-center gap-2">
							<button type="submit" class="btn btn-sm btn-primary rounded-lg font-bold shadow-sm gap-1.5" onclick={handleSaveClick}>
								<Save size={14} /> Save
							</button>
							{#if saved}
								<span class="text-xs font-bold text-success animate-in fade-in slide-in-from-left-2">Saved!</span>
							{/if}
						</div>
					</div>
				</div>
			</form>
		{/if}

		{#if showChangePasswordModal}
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
				<form method="POST" action="?/changePassword" use:enhance={handleChangePassword} class="bg-base-100 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-left">
					<button type="button" class="absolute top-4 right-4 text-base-content/50 hover:text-base-content" onclick={() => showChangePasswordModal = false}>
						<X size={18} />
					</button>
					<h3 class="font-bold text-lg mb-2">Ubah / Hapus Password</h3>
					<p class="text-xs text-base-content/60 mb-4">Fitur ini hanya untuk Admin. Masukkan Admin Recovery Password untuk mengizinkan perubahan.</p>
					
					{#if changePasswordError}
						<div class="alert alert-error text-xs py-2 mb-4">{changePasswordError}</div>
					{/if}

					<div class="space-y-4">
						<div class="form-control">
							<label class="label text-xs font-semibold py-1" for="adminPassword">Admin Recovery Password</label>
							<input id="adminPassword" type="password" name="adminPassword" class="input input-sm input-bordered w-full font-mono" required />
						</div>
						<div class="form-control">
							<label class="label text-xs font-semibold py-1" for="newPassword">Password Baru</label>
							<input id="newPassword" type="password" name="newPassword" class="input input-sm input-bordered w-full" placeholder="Kosongkan untuk menghapus gembok" />
						</div>
						<button type="submit" class="btn btn-primary btn-sm w-full mt-2" disabled={changingPassword}>
							{#if changingPassword}<span class="loading loading-spinner loading-xs"></span>{/if}
							Terapkan Perubahan
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Save Warning Modal (>1000 lines) -->
		{#if showSaveWarning}
			<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
				<div class="bg-base-100 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-base-content/10">
					<h3 class="text-lg font-bold mb-2">Perhatian: Data Akan Terpotong</h3>
					<p class="text-sm text-base-content/60 mb-2">
						Dokumen kamu saat ini memiliki <strong class="text-base-content">{lineCount.toLocaleString()} baris</strong>.
					</p>
					<p class="text-sm text-base-content/60 mb-6">
						Shared Notepad hanya menyimpan <strong class="text-base-content">1.000 baris pertama</strong>. Baris ke-{(LINE_LIMIT + 1).toLocaleString()} sampai ke-{lineCount.toLocaleString()} akan <strong class="text-error">dibuang permanen</strong>.
					</p>
					<div class="flex gap-3">
						<button
							type="button"
							class="btn btn-ghost flex-1"
							onclick={() => showSaveWarning = false}
						>
							Batal
						</button>
						<button
							type="button"
							class="btn btn-error flex-1"
							onclick={confirmSave}
						>
							Ya, Simpan 1.000 Baris
						</button>
					</div>
					<div class="mt-4 pt-4 border-t border-base-content/10">
						{#if $page.data.user}
							<a href="/notepad2" class="flex items-center justify-center gap-2 text-xs text-primary font-medium hover:underline">
								<Zap size={13} /> Buka Notepad Pro untuk simpan tanpa batas
							</a>
						{:else}
							<a href="/register" class="flex items-center justify-center gap-2 text-xs text-primary font-medium hover:underline">
								<Zap size={13} /> Upgrade ke Pro untuk simpan tanpa batas
							</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Upgrade Modal -->
		{#if showUpgradeModal}
			<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
				<div class="bg-base-100 rounded-2xl max-w-md w-full p-8 shadow-2xl relative text-left border border-base-content/10">
					<button
						type="button"
						class="absolute top-4 right-4 text-base-content/40 hover:text-base-content transition-colors"
						onclick={() => { showUpgradeModal = false; upgradeModalDismissed = true; }}
					>
						<X size={18} />
					</button>

					<div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Zap size={24} />
					</div>

					<h3 class="text-xl font-bold mb-2">Batas 1.000 Baris Tercapai</h3>
					<p class="text-sm text-base-content/60 mb-6">
						Shared Notepad gratis dibatasi <strong class="text-base-content">1.000 baris</strong>. Upgrade ke <strong class="text-primary">Notepad Pro</strong> untuk mendapatkan:
					</p>

					<ul class="space-y-2 mb-8">
						{#each ['Dokumen tanpa batas baris', 'Simpan banyak dokumen sekaligus', 'Akses dari mana saja lewat akun', 'Editor lebih canggih (CodeMirror)'] as benefit}
							<li class="flex items-center gap-2 text-sm">
								<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">✓</span>
								{benefit}
							</li>
						{/each}
					</ul>

					{#if $page.data.user}
						<div class="flex flex-col gap-3">
							<a href="/notepad2" class="btn btn-primary w-full gap-2">
								<Zap size={16} />
								Buka Notepad Pro
							</a>
						</div>
					{:else}
						<div class="flex flex-col sm:flex-row gap-3">
							<a href="/register" class="btn btn-primary flex-1 gap-2">
								<Zap size={16} />
								Daftar Gratis
							</a>
							<a href="/login" class="btn btn-ghost flex-1">
								Sudah punya akun
							</a>
						</div>
					{/if}

					<p class="text-center text-xs text-base-content/40 mt-4">
						Anda masih bisa terus menulis di bawah 1.000 baris tanpa batasan.
					</p>
				</div>
			</div>
		{/if}

	</div>
</div>
