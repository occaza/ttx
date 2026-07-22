<script lang="ts">
	import { page } from '$app/stores';
	import { Home, FileText, Plus, LogOut, ChevronLeft, ChevronRight, Settings } from '@lucide/svelte';
	import { ThemeSwitcher } from '$lib';

	let { data, children } = $props();

	let isSidebarOpen = $state(true);

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

<div class="flex bg-base-100" style="height: 100vh">
	<!-- Sidebar -->
	<div
		class="relative flex flex-col border-r border-base-content/10 bg-base-200/50 transition-all duration-300 shrink-0 {isSidebarOpen
			? 'w-64'
			: 'w-16'}"
	>
		<!-- Sidebar Header -->
		<div class="flex h-14 items-center {isSidebarOpen ? 'justify-between px-4' : 'justify-center'} border-b border-base-content/10 shrink-0">
			<a href="/" class="flex items-center gap-2 font-bold text-base-content hover:text-primary transition-colors whitespace-nowrap" title={!isSidebarOpen ? "Home" : ""}>
				<Home size={18} />
				{#if isSidebarOpen}<span>TEXY</span>{/if}
			</a>
			{#if isSidebarOpen}
				<div class="flex items-center gap-1">
					<ThemeSwitcher />
				</div>
			{/if}
		</div>

		<!-- New Doc Button (hanya untuk user yang login) -->
		{#if data.user}
		<div class="p-3 shrink-0">
			<form method="POST" action="?/create">
				<button
					type="submit"
					class="btn btn-sm btn-primary w-full gap-2 rounded-lg font-medium shadow-sm whitespace-nowrap {isSidebarOpen ? '' : 'px-0'}"
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
				<div class="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-2 px-1 mt-2">
					Documents
				</div>
			{/if}
			<div class="flex flex-col gap-1 {isSidebarOpen ? '' : 'mt-2 items-center'}">
				{#each data.docs as doc (doc.id)}
					<a
						href="/notepad2/{doc.slug}"
						class="group flex items-center {isSidebarOpen ? 'justify-between px-3' : 'justify-center w-10 h-10'} rounded-lg py-2 text-sm transition-colors hover:bg-base-300 {$page.params['slug'] === doc.slug
							? 'bg-base-300 font-medium text-base-content'
							: 'text-base-content/70'}"
						title={!isSidebarOpen ? doc.title : ""}
					>
						<div class="flex items-center gap-2 overflow-hidden">
							<FileText size={14} class="shrink-0 {$page.params['slug'] === doc.slug ? 'text-primary' : 'text-base-content/40 group-hover:text-base-content/70'}" />
							{#if isSidebarOpen}<span class="truncate">{doc.title}</span>{/if}
						</div>
					</a>
				{/each}
				{#if data.docs.length === 0}
					<div class="px-3 py-4 text-center text-xs text-base-content/50 italic">
						{#if isSidebarOpen}No documents yet.{:else}-{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- User Area -->
		<div class="border-t border-base-content/10 p-3 shrink-0 flex justify-center">
			{#if data.user}
				<div class="flex items-center {isSidebarOpen ? 'justify-between w-full' : 'justify-center'}">
					<div class="flex items-center gap-2 overflow-hidden" title={!isSidebarOpen ? data.user?.email : ""}>
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0 font-bold">
							{data.user?.email?.[0].toUpperCase() || 'U'}
						</div>
						{#if isSidebarOpen}
							<div class="flex flex-col overflow-hidden">
								<span class="text-xs font-medium truncate">{data.user?.email}</span>
								<span class="text-[10px] text-base-content/50">Free User</span>
							</div>
						{/if}
					</div>
					{#if isSidebarOpen}
						<button 
							class="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error hover:bg-error/10 transition-colors" 
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
					<a href="/login" class="btn btn-sm btn-ghost w-full text-xs">Login untuk menyimpan dokumen</a>
				{:else}
					<a href="/login" class="btn btn-sm btn-ghost btn-square" title="Login">
						<LogOut size={16} />
					</a>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="relative flex-1 flex flex-col min-w-0 bg-base-100">
		<!-- Sidebar Toggle Button (Floating) -->
		<button
			class="absolute left-0 top-3 -ml-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-base-content/10 bg-base-100 text-base-content/70 shadow-sm hover:text-base-content hover:bg-base-200 transition-colors"
			style={!isSidebarOpen ? 'margin-left: 1rem;' : ''}
			onclick={toggleSidebar}
			title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
		>
			{#if isSidebarOpen}
				<ChevronLeft size={16} />
			{:else}
				<ChevronRight size={16} />
			{/if}
		</button>

		<!-- Render nested pages -->
		{@render children?.()}
	</div>
</div>

<style>
	/* Custom scrollbar for sidebar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: oklch(var(--bc) / 0.1);
		border-radius: 20px;
	}
	.custom-scrollbar:hover::-webkit-scrollbar-thumb {
		background-color: oklch(var(--bc) / 0.2);
	}
</style>
