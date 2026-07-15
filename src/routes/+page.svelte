<script lang="ts">
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { onMount } from 'svelte';
	import { Search } from '@lucide/svelte';
	import { tools } from '$lib/data/tools';

	let mounted = $state(false);
	let query = $state('');

	onMount(() => {
		mounted = true;
	});

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

<!-- Grid Background Pattern -->
<div class="relative overflow-hidden">
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20 {mounted ? 'fade-in' : 'opacity-0'}">
		<!-- Header Section -->
		<div class="mb-14">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p class="text-sm font-medium uppercase tracking-widest text-primary mb-3">Tools</p>
					<h1 class="text-4xl font-bold tracking-tight text-base-content md:text-5xl">
						TEXY Workspace
					</h1>
					<p class="mt-3 max-w-md text-base text-base-content/50">
						Utilitas teks ringan yang berjalan langsung di browser. Tanpa server, tanpa login.
					</p>
				</div>

				<div class="relative w-full sm:w-72">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
						<Search size={18} class="text-base-content/30" />
					</div>
					<input
						bind:value={query}
						type="text"
						placeholder="Filter tools..."
						class="w-full rounded-xl border border-base-content/10 bg-base-200/60 py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-base-content/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-base-200"
					/>
					{#if query}
						<button
							onclick={() => query = ''}
							class="absolute inset-y-0 right-0 flex items-center pr-4 text-base-content/30 hover:text-base-content transition-colors text-lg leading-none"
						>
							&times;
						</button>
					{/if}
				</div>
			</div>

			{#if query}
				<p class="mt-4 text-sm text-base-content/40">
					{filtered.length} hasil untuk "<span class="text-base-content/70">{query}</span>"
				</p>
			{:else}
				<p class="mt-4 text-sm text-base-content/40">{tools.length} tools tersedia</p>
			{/if}
		</div>

		<!-- Tools Grid by Category -->
		{#if filtered.length > 0}
			<div class="space-y-12">
				{#each Object.entries(groupedTools()) as [category, categoryTools]}
					<div>
						<h2 class="text-xl font-bold tracking-tight text-base-content mb-5 flex items-center gap-2">
							<span class="w-1.5 h-6 bg-primary rounded-full"></span>
							{category}
						</h2>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{#each categoryTools as tool (tool.href)}
								<ToolCard {...tool} />
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-24 text-center">
				<p class="text-4xl mb-4 opacity-20">
					<Search size={48} />
				</p>
				<p class="font-medium text-base-content/50">Tidak ada tools yang cocok.</p>
				<button onclick={() => query = ''} class="mt-4 text-sm text-primary underline-offset-4 hover:underline">
					Reset filter
				</button>
			</div>
		{/if}
	</div>
</div>
