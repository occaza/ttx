<script lang="ts">
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { FilePlus2, Save, RefreshCw, Copy, Link, Clock, ArrowLeft, NotebookPen, Lock, X } from '@lucide/svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let text = $state(data.text);
	let saved = $state(false);
	let refreshing = $state(false);
	let linkInput: HTMLInputElement | undefined = $state();
	let ta: TextArea | undefined = $state();
	let passwordInput = $state('');
	let showChangePasswordModal = $state(false);
	let changePasswordError = $state('');
	let changingPassword = $state(false);
	let unlockPassword = $state('');
	let unlocking = $state(false);
	let unlockError = $state('');

	$effect(() => {
		text = data.text;
	});

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
			<form method="POST" action="?/save" use:enhance={afterSave} class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
				
				<!-- Main Editor -->
				<div class="bg-base-100/50 flex-col relative rounded-t-2xl">
					<TextArea
						bind:this={ta}
						bind:value={text}
						name="text"
						placeholder="Tulis catatan kamu di sini..."
						rows={25}
						className="w-full resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[500px] rounded-t-2xl"
					/>
				</div>

				<!-- Bottom Footer (Info & Share) -->
				<div class="flex flex-col sm:flex-row items-center justify-between border-t border-base-content/10 bg-base-200/20 px-4 py-3 gap-4 rounded-b-2xl">
					<div class="flex items-center gap-2 text-xs font-medium text-base-content/40">
						<Clock size={14} />
						<span>Last edited: {formatDate(data.updatedAt)}</span>
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
							<button type="submit" class="btn btn-sm btn-primary rounded-lg font-bold shadow-sm gap-1.5">
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

	</div>
</div>
