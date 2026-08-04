<script lang="ts">
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { Search } from '@lucide/svelte';
	import { tools } from '$lib/data/tools';
	import { page } from '$app/stores';

	let query = $state('');

	const filtered = $derived(
		query.trim() === ''
			? tools
			: tools.filter(t =>
					t.title.toLowerCase().includes(query.toLowerCase()) ||
					t.desc.toLowerCase().includes(query.toLowerCase()) ||
					t.category.toLowerCase().includes(query.toLowerCase())
			  )
	);

	const groupedTools = $derived(() => {
		const groups: Record<string, typeof tools> = {};
		filtered.forEach(t => {
			if (!groups[t.category]) groups[t.category] = [];
			groups[t.category].push(t);
		});
		return groups;
	});
</script>

<svelte:head>
	<title>TEXY Workspace - Kumpulan Tools Teks & Utilitas</title>
	<meta name="description" content="TEXY Workspace menyediakan berbagai tools gratis untuk manipulasi teks, parsing data, shared notepad, hingga case converter untuk produktivitas Anda." />
	<meta name="keywords" content="texy workspace, text tools, notepad online, text converter, developer tools, text editor" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="TEXY Workspace - Kumpulan Tools Teks & Utilitas" />
	<meta property="og:description" content="TEXY Workspace menyediakan berbagai tools gratis untuk manipulasi teks, parsing data, shared notepad, hingga case converter untuk produktivitas Anda." />
	<meta property="og:url" content={$page.url.href} />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="TEXY Workspace - Kumpulan Tools Teks & Utilitas" />
	<meta name="twitter:description" content="TEXY Workspace menyediakan berbagai tools gratis untuk manipulasi teks, parsing data, shared notepad, hingga case converter untuk produktivitas Anda." />

	<!-- Structured Data -->
	{@html `
	<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "TEXY Workspace",
		"url": "${$page.url.origin}",
		"description": "Kumpulan tools gratis untuk manipulasi teks, parsing data, dan utilitas developer.",
		"applicationCategory": "DeveloperApplication",
		"operatingSystem": "All"
	}
	</script>
	`}
</svelte:head>

<div class="min-h-screen bg-base-100">
	<!-- Page Header -->
	<div class="max-w-7xl mx-auto px-4 pt-12 pb-2 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
			<div>
				<h1 class="text-xl font-bold text-base-content tracking-tight">TEXY Workspace</h1>
				<p class="text-sm text-base-content/60 mt-0.5">Kumpulan utilitas teks ringan di browser.</p>
			</div>
			
			<div class="relative w-full sm:w-80 shrink-0">
				<label class="input input-sm input-bordered flex items-center gap-2 bg-base-200/50 w-full focus-within:bg-base-100 rounded-lg">
					<Search class="h-4 w-4 opacity-50" />
					<input type="search" bind:value={query} class="grow text-sm" placeholder="Filter tools..." />
					{#if query}
						<button class="btn btn-ghost btn-xs btn-circle" aria-label="Clear search" onclick={() => query = ''}>✕</button>
					{/if}
				</label>
			</div>
		</div>


	<!-- Main Directory -->
	<div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
		{#if filtered.length > 0}
			<div class="space-y-10">
				{#each Object.entries(groupedTools()) as [category, categoryTools]}
					<div>
						<h2 class="text-sm font-semibold text-base-content/80 uppercase tracking-wider mb-4 border-b border-base-content/5 pb-2">
							{category}
						</h2>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
							{#each categoryTools as tool (tool.href)}
								<ToolCard {...tool} />
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-20 text-center">
				<p class="text-base-content/50">Tidak ada alat yang cocok dengan "{query}".</p>
				<button class="btn btn-link btn-sm mt-2" onclick={() => query = ''}>Reset filter</button>
			</div>
		{/if}
	</div>
</div>
