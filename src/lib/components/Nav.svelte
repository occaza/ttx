<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, X, ChevronDown, Home } from '@lucide/svelte';

	let open = $state(false);
	let dropOpen: string | null = $state(null);
	let y = $state(0);

	const isScrolled = $derived(y > 20);

	import { groupedTools } from '$lib/data/tools';
	import { ThemeSwitcher } from '$lib';
	
	const groups = groupedTools();

	function closeMenus() {
		open = false;
		dropOpen = null;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (dropOpen && !target.closest('.dropdown')) {
			dropOpen = null;
		}
		if (open && !target.closest('.mobile-menu') && !target.closest('.hamburger-btn')) {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} bind:scrollY={y} />

<!-- Navbar Background Transition Wrapper -->
<div class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {isScrolled ? 'py-4 px-4' : 'py-0 px-0'}">
	<nav
		class="mx-auto relative transition-all duration-300 flex items-center {isScrolled 
			? 'h-14 max-w-4xl rounded-full bg-base-100/70 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl border border-base-content/10 px-6' 
			: 'h-16 w-full max-w-7xl px-4 md:px-8 bg-transparent border-b border-transparent'}"
	>
		<div class="flex w-full items-center justify-between">
			<!-- Brand -->
			<a href="/" class="text-xl font-bold tracking-tight text-base-content hover:text-primary transition-colors flex items-center" onclick={closeMenus}>
				TEXY<span class="text-primary">.</span>
			</a>

			<!-- Desktop Menu -->
			<div class="hidden md:flex items-center gap-8">
				<a href="/" class="text-sm font-medium text-base-content/70 hover:text-base-content transition-colors {$page.url.pathname === '/' ? 'text-base-content' : ''}">
					Beranda
				</a>
				
				<div>
					<button 
						class="flex items-center gap-1.5 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
						onclick={(e) => { e.stopPropagation(); dropOpen = dropOpen === 'tools' ? null : 'tools'; }}
					>
						Tools
						<ChevronDown size={14} class="transition-transform duration-300 {dropOpen === 'tools' ? 'rotate-180' : ''}" />
					</button>

					{#if dropOpen === 'tools'}
						<div class="absolute left-0 right-0 top-full mt-4 w-full rounded-2xl border border-base-content/10 bg-base-100/95 p-6 shadow-2xl backdrop-blur-xl fade-in-fast">
							<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
								{#each Object.entries(groups) as [category, categoryTools]}
									<div>
										<h4 class="mb-3 text-xs font-bold text-base-content/40 uppercase tracking-widest">{category}</h4>
										<div class="flex flex-col gap-1">
											{#each categoryTools as tool}
												<a 
													href={tool.href} 
													class="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-base-200 transition-colors"
													onclick={closeMenus}
												>
													<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200/50 text-base-content/60 group-hover:bg-base-100 group-hover:text-primary transition-colors">
														<tool.icon size={16} />
													</div>
													<div class="flex flex-col">
														<span class="text-sm font-medium text-base-content/80 group-hover:text-base-content">{tool.title}</span>
													</div>
												</a>
											{/each}
										</div>
									</div>
								{/each}
							</div>
							
							<div class="mt-4 pt-4 border-t border-base-content/5 flex justify-center">
								<a 
									href="/" 
									class="px-6 py-2 text-xs font-bold text-primary rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
									onclick={closeMenus}
								>
									Lihat Semua Tools di Beranda &rarr;
								</a>
							</div>
						</div>
					{/if}
				</div>

				<div class="h-5 w-px bg-base-content/10"></div>
				<ThemeSwitcher />
			</div>

			<!-- Mobile Hamburger & Theme -->
			<div class="flex md:hidden items-center gap-1">
				<ThemeSwitcher />
				
				<button 
					class="hamburger-btn flex items-center justify-center p-2 text-base-content/70 hover:text-base-content transition-colors rounded-full hover:bg-base-200"
					onclick={(e) => { e.stopPropagation(); open = !open; }}
				>
					{#if open}
						<X size={20} />
					{:else}
						<Menu size={20} />
					{/if}
				</button>
			</div>
		</div>
	</nav>
</div>

<!-- Mobile Menu Overlay -->
{#if open}
	<div class="mobile-menu md:hidden fixed inset-x-4 top-20 z-40 rounded-3xl border border-base-content/10 bg-base-100/95 p-3 shadow-[0_20px_50px_rgb(0,0,0,0.3)] backdrop-blur-2xl fade-in-fast">
		<div class="flex flex-col gap-1">
			<a href="/" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-base-200 text-sm font-medium text-base-content transition-colors {$page.url.pathname === '/' ? 'bg-base-200/50' : ''}" onclick={closeMenus}>
				<Home size={18} class="text-base-content/50" />
				Beranda
			</a>
			
			<div class="mx-4 my-2 h-px bg-base-content/5"></div>
			
			<div class="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
				{#each Object.entries(groups) as [category, categoryTools]}
					<div class="mt-4 mb-2">
						<div class="px-4 py-1 text-[11px] font-bold text-base-content/40 uppercase tracking-widest">
							{category}
						</div>
						
						{#each categoryTools as tool}
							<a href={tool.href} class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-base-200 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors" onclick={closeMenus}>
								<tool.icon size={16} class="text-base-content/50" />
								{tool.title}
							</a>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
