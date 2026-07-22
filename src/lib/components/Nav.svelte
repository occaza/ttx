<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, X, ChevronDown, Home, LogIn, User, LogOut } from '@lucide/svelte';

	let open = $state(false);
	let dropOpen: string | null = $state(null);
	let y = $state(0);

	const isScrolled = $derived(y > 20);
	const user = $derived($page.data.user);

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
<div
	class="fixed top-0 right-0 left-0 z-50 transition-all duration-300 {isScrolled
		? 'px-4 py-4'
		: 'px-0 py-0'}"
>
	<nav
		class="relative mx-auto flex items-center transition-all duration-300 {isScrolled
			? 'h-14 max-w-4xl rounded-full border border-base-content/10 bg-base-100/30 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl'
			: 'h-16 w-full max-w-7xl border-b border-transparent bg-transparent px-4 md:px-8'}"
	>
		<div class="flex w-full items-center justify-between">
			<!-- Brand -->
			<a
				href="/"
				class="flex items-center text-xl font-bold tracking-tight text-base-content transition-colors hover:text-primary"
				onclick={closeMenus}
			>
				TEXY<span class="text-primary">.</span>
			</a>

			<!-- Desktop Menu -->
			<div class="hidden items-center gap-8 md:flex">
				<a
					href="/"
					class="text-sm font-medium text-base-content/70 transition-colors hover:text-base-content {$page
						.url.pathname === '/'
						? 'text-base-content'
						: ''}"
				>
					Beranda
				</a>

				<div>
					<button
						class="flex items-center gap-1.5 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
						onclick={(e) => {
							e.stopPropagation();
							dropOpen = dropOpen === 'tools' ? null : 'tools';
						}}
					>
						Tools
						<ChevronDown
							size={14}
							class="transition-transform duration-300 {dropOpen === 'tools' ? 'rotate-180' : ''}"
						/>
					</button>

					{#if dropOpen === 'tools'}
						<div
							class="fade-in-fast absolute top-full right-0 left-0 mt-4 w-full rounded-2xl border border-base-content/10 bg-base-100/95 p-6 shadow-2xl backdrop-blur-2xl"
						>
							<div class="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
								{#each Object.entries(groups) as [category, categoryTools]}
									<div>
										<h4
											class="mb-3 text-xs font-bold tracking-widest text-base-content/40 uppercase"
										>
											{category}
										</h4>
										<div class="flex flex-col gap-1">
											{#each categoryTools as tool}
												<a
													href={tool.href}
													class="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-base-200"
													onclick={closeMenus}
												>
													<div
														class="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200/50 text-base-content/60 transition-colors group-hover:bg-base-100 group-hover:text-primary"
													>
														<tool.icon size={16} />
													</div>
													<div class="flex flex-col">
														<span
															class="text-sm font-medium text-base-content/80 group-hover:text-base-content"
															>{tool.title}</span
														>
													</div>
												</a>
											{/each}
										</div>
									</div>
								{/each}
							</div>

							<div class="mt-4 flex justify-center border-t border-base-content/5 pt-4">
								<a
									href="/"
									class="rounded-xl bg-primary/10 px-6 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
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

				{#if user}
					<a
						href="/dashboard"
						class="flex items-center gap-2 rounded-full bg-base-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-base-300"
					>
						<User size={16} />
						Dashboard
					</a>
					<button
						class="flex items-center gap-2 rounded-full bg-error/10 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/20"
						onclick={async () => {
							await fetch('/logout', { method: 'POST' });
							window.location.href = '/login';
						}}
					>
						<LogOut size={16} />
						Logout
					</button>
				{:else}
					<a
						href="/login"
						class="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-content shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
					>
						<LogIn size={16} />
						Masuk
					</a>
				{/if}
			</div>

			<!-- Mobile Hamburger & Theme -->
			<div class="flex items-center gap-1 md:hidden">
				<ThemeSwitcher />

				<button
					class="hamburger-btn flex items-center justify-center rounded-full p-2 text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
					onclick={(e) => {
						e.stopPropagation();
						open = !open;
					}}
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
	<div
		class="mobile-menu fade-in-fast fixed inset-x-4 top-20 z-40 flex max-h-[80vh] flex-col rounded-3xl border border-base-content/10 bg-base-100/95 p-3 shadow-[0_20px_50px_rgb(0,0,0,0.3)] backdrop-blur-2xl md:hidden"
	>
		<div class="flex shrink-0 flex-col gap-1">
			<a
				href="/"
				class="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-base-content transition-colors hover:bg-base-200 {$page
					.url.pathname === '/'
					? 'bg-base-200/50'
					: ''}"
				onclick={closeMenus}
			>
				<Home size={18} class="text-base-content/50" />
				Beranda
			</a>

			<div class="mx-4 my-2 h-px bg-base-content/5"></div>
		</div>

		<div class="custom-scrollbar flex-grow overflow-y-auto pr-2">
			{#each Object.entries(groups) as [category, categoryTools]}
				<div class="mt-2 mb-2">
					<div
						class="px-4 py-1 text-[11px] font-bold tracking-widest text-base-content/40 uppercase"
					>
						{category}
					</div>

					{#each categoryTools as tool}
						<a
							href={tool.href}
							class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
							onclick={closeMenus}
						>
							<tool.icon size={16} class="text-base-content/50" />
							{tool.title}
						</a>
					{/each}
				</div>
			{/each}
		</div>

		<div class="mt-2 flex shrink-0 flex-col gap-1 border-t border-base-content/5 pt-2">
			{#if user}
				<a
					href="/dashboard"
					class="flex items-center justify-center gap-3 rounded-2xl bg-base-200 px-4 py-3.5 text-sm font-medium text-base-content transition-colors hover:bg-base-300"
					onclick={closeMenus}
				>
					<User size={18} />
					Dashboard
				</a>
				<button
					class="flex items-center justify-center gap-3 rounded-2xl bg-error/10 px-4 py-3.5 text-sm font-medium text-error transition-colors hover:bg-error/20"
					onclick={async () => {
						closeMenus();
						await fetch('/logout', { method: 'POST' });
						window.location.href = '/login';
					}}
				>
					<LogOut size={18} />
					Logout
				</button>
			{:else}
				<a
					href="/login"
					class="flex items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-sm font-medium text-primary-content shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
					onclick={closeMenus}
				>
					<LogIn size={18} />
					Masuk / Daftar
				</a>
			{/if}
		</div>
	</div>
{/if}
