<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { Home, FileText, Plus, LogOut, ChevronLeft, ChevronRight, Settings } from '@lucide/svelte';

	let { data, children } = $props();

	let isSidebarOpen = $state(true);
	let showUpgradeModal = $state(false);
	let upgradeNotice = $state('');

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Notepad v2 - TEXY Workspace</title>
</svelte:head>

<div class="flex h-screen bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)]" style="height: 100vh">
	<!-- Sidebar -->
	<aside
		class="relative flex flex-col border-r border-[var(--ttx-border-base)] bg-[var(--ttx-bg-sidebar)] transition-all duration-300 shrink-0 {isSidebarOpen
			? 'w-64'
			: 'w-16'}"
	>
		<!-- Sidebar Header -->
		<div class="flex h-14 items-center {isSidebarOpen ? 'px-4' : 'justify-center'} border-b border-[var(--ttx-border-base)] shrink-0">
			<a href="/" class="flex items-center gap-2 font-bold text-[var(--ttx-text-main)] hover:text-[var(--ttx-accent)] transition-colors whitespace-nowrap" title={!isSidebarOpen ? "Home" : ""}>
				<Home size={18} />
				{#if isSidebarOpen}<span>TEXY</span>{/if}
			</a>
		</div>

		<!-- New Doc Button (hanya untuk user yang login) -->
		{#if data.user}
		<div class="p-3 shrink-0">
			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'failure' && result.data?.limitReached) {
						upgradeNotice = '';
						showUpgradeModal = true;
					} else {
						await update();
					}
				};
			}}>
				<button
					type="submit"
					class="flex items-center justify-center h-9 w-full gap-2 rounded-xl bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] text-[var(--ttx-accent-contrast)] text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap {isSidebarOpen ? '' : 'px-0'}"
					title={!isSidebarOpen ? "New Document" : ""}
				>
					<Plus size={16} />
					{#if isSidebarOpen}<span>New Document</span>{/if}
				</button>
			</form>
		</div>
		{/if}

		<!-- File List -->
		<div class="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
			{#if isSidebarOpen}
				<div class="text-xs font-bold text-[var(--ttx-text-dim)] uppercase tracking-wider mb-2 px-1 mt-2">
					Documents
				</div>
			{/if}
			<div class="flex flex-col gap-1 {isSidebarOpen ? '' : 'mt-2 items-center'}">
				{#each data.docs as doc (doc.id)}
					<a
						href="/notepad2/{doc.slug}"
						class="group flex items-center {isSidebarOpen ? 'justify-between px-3' : 'justify-center w-10 h-10'} rounded-xl py-2 text-xs font-medium transition-colors hover:bg-[var(--ttx-bg-hover)] {$page.params['slug'] === doc.slug
							? 'bg-[var(--ttx-bg-active)] text-[var(--ttx-text-main)] font-semibold border border-[var(--ttx-border-subtle)]'
							: 'text-[var(--ttx-text-muted)]'}"
						title={!isSidebarOpen ? doc.title : ""}
					>
						<div class="flex items-center gap-2 overflow-hidden">
							<FileText size={14} class="shrink-0 {$page.params['slug'] === doc.slug ? 'text-[var(--ttx-accent)]' : 'text-[var(--ttx-text-dim)] group-hover:text-[var(--ttx-text-main)]'}" />
							{#if isSidebarOpen}<span class="truncate">{doc.title}</span>{/if}
						</div>
					</a>
				{/each}
				{#if data.docs.length === 0}
					<div class="px-3 py-4 text-center text-xs text-[var(--ttx-text-dim)] italic">
						{#if isSidebarOpen}No documents yet.{:else}-{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- User Area -->
		<div class="border-t border-[var(--ttx-border-base)] p-3 shrink-0 flex justify-center bg-[var(--ttx-bg-sidebar)]">
			{#if data.user}
				{@const displayName = data.profile?.first_name || data.profile?.username || data.user?.user_metadata?.first_name || data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'User'}
				<div class="flex items-center {isSidebarOpen ? 'justify-between w-full' : 'justify-center'}">
					<a href="/account" class="group flex items-center gap-2 overflow-hidden rounded-xl hover:bg-[var(--ttx-bg-hover)] transition-colors p-1.5 -ml-1" title={!isSidebarOpen ? displayName : "Pengaturan Akun"}>
						<div class="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-border-subtle)] shrink-0 font-bold uppercase transition-colors">
							{displayName[0]}
						</div>
						{#if isSidebarOpen}
							<div class="flex flex-col overflow-hidden text-left">
								<span class="text-xs font-medium truncate text-[var(--ttx-text-main)]">{displayName}</span>
								<span class="text-[10px] {data.profile?.tier === 'pro' ? 'text-[var(--ttx-accent)] font-bold' : 'text-[var(--ttx-text-dim)]'}">{data.profile?.tier === 'pro' ? 'Pro User' : 'Free User'}</span>
							</div>
						{/if}
					</a>
					{#if isSidebarOpen}
						<button 
							class="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--ttx-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors" 
							title="Logout"
							onclick={async () => {
								await fetch('/logout', { method: 'POST' });
								window.location.href = '/login';
							}}
						>
							<LogOut size={14} />
						</button>
					{/if}
				</div>
			{:else}
				{#if isSidebarOpen}
					<a href="/login" class="flex items-center justify-center h-8 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs font-semibold text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors">
						Login untuk simpan dokumen
					</a>
				{:else}
					<a href="/login" class="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]" title="Login">
						<LogOut size={15} />
					</a>
				{/if}
			{/if}
		</div>
	</aside>

	<!-- Main Content Area -->
	<main class="relative flex-1 flex flex-col min-w-0 bg-[var(--ttx-bg-workspace)]">
		<!-- Sidebar Toggle Button (Floating) -->
		<button
			type="button"
			class="absolute left-0 top-3 -ml-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)] shadow-xs hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
			onclick={toggleSidebar}
			title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
		>
			{#if isSidebarOpen}
				<ChevronLeft size={15} />
			{:else}
				<ChevronRight size={15} />
			{/if}
		</button>

		<!-- Render nested pages -->
		{@render children?.()}
	</main>
</div>

{#if showUpgradeModal}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
	<div class="relative w-full max-w-md rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 text-center text-[var(--ttx-text-main)] shadow-2xl">
		<div class="mb-4 flex justify-center text-[var(--ttx-accent)]">
			<FileText size={44} />
		</div>
		<h3 class="mb-2 text-xl font-bold">Batas Dokumen Tercapai</h3>
		<p class="mb-4 text-xs leading-relaxed text-[var(--ttx-text-muted)]">
			Kamu telah menggunakan semua <strong class="text-[var(--ttx-text-main)]">4 kuota dokumen gratis</strong>. 
			Untuk membuat dokumen baru, silakan hapus dokumen lama atau upgrade akunmu ke versi <strong class="text-[var(--ttx-accent)]">Pro</strong>.
		</p>
		{#if upgradeNotice}
			<div class="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs font-semibold text-amber-500">
				{upgradeNotice}
			</div>
		{/if}
		<div class="flex items-center justify-center gap-3">
			<button
				type="button"
				class="h-9 px-4 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs font-semibold text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				onclick={() => { showUpgradeModal = false; upgradeNotice = ''; }}
			>
				Tutup
			</button>
			<button
				type="button"
				class="h-9 px-6 rounded-xl bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] text-xs font-semibold text-[var(--ttx-accent-contrast)] shadow-xs transition-colors"
				onclick={() => { upgradeNotice = 'Halaman pembayaran segera tersedia.'; }}
			>
				Upgrade ke Pro
			</button>
		</div>
	</div>
</div>
{/if}

<style>
	/* Custom scrollbar for sidebar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: var(--ttx-scrollbar);
		border-radius: 20px;
	}
	.custom-scrollbar:hover::-webkit-scrollbar-thumb {
		background-color: var(--ttx-scrollbar-hover);
	}
</style>
