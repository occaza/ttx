<script lang="ts">
	import { page } from '$app/stores';
	import {
		Menu,
		X,
		ChevronDown,
		Home,
		LogIn,
		User,
		LogOut,
		Settings,
		LayoutDashboard,
		NotebookPen,
		ChevronRight,
		Wrench
	} from '@lucide/svelte';
	import { groupedTools } from '$lib/data/tools';
	import { ThemeSwitcher } from '$lib';
	import { handleLogout } from '$lib/utils/auth';

	let mobileOpen = $state(false);
	let toolsMenuOpen = $state(false);
	let userMenuOpen = $state(false);
	let mobileToolsAccordion = $state(false);

	const groups = groupedTools();

	const user = $derived($page.data.user);
	const profile = $derived($page.data.profile);

	const displayName = $derived(
		profile?.first_name
			? `${profile.first_name} ${profile.last_name || ''}`.trim()
			: profile?.username ||
			  user?.user_metadata?.full_name ||
			  user?.email?.split('@')[0] ||
			  'Pengguna'
	);

	const initials = $derived(
		(profile?.first_name
			? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`
			: displayName.slice(0, 2)
		).toUpperCase()
	);

	const tier = $derived((profile?.tier || profile?.plan || 'free').toUpperCase());

	function closeAllMenus() {
		toolsMenuOpen = false;
		userMenuOpen = false;
		mobileOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeAllMenus();
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!target) return;

		if (toolsMenuOpen && !target.closest('.tools-menu-container')) {
			toolsMenuOpen = false;
		}

		if (userMenuOpen && !target.closest('.user-menu-container')) {
			userMenuOpen = false;
		}

		if (mobileOpen && !target.closest('.mobile-menu-drawer') && !target.closest('.mobile-menu-toggle')) {
			mobileOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<header
	class="sticky top-0 z-40 w-full border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-root)]/90 backdrop-blur-md transition-colors duration-200"
>
	<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Brand & Left Navigation -->
		<div class="flex items-center gap-6 lg:gap-8">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center gap-1.5 text-lg font-bold tracking-tight text-[var(--ttx-text-main)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)] rounded-lg px-1 py-0.5"
				onclick={closeAllMenus}
				aria-label="TEXY Beranda"
			>
				<span class="text-base font-extrabold tracking-tight">TEXY</span>
				<span class="inline-block h-2 w-2 rounded-full bg-[var(--ttx-accent)]" aria-hidden="true"></span>
			</a>

			<!-- Desktop Nav Links -->
			<nav aria-label="Navigasi Utama" class="hidden md:flex items-center gap-1">
				<a
					href="/"
					class="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all {$page.url.pathname === '/'
						? 'bg-[var(--ttx-bg-active)] text-[var(--ttx-accent-text)]'
						: 'text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]'}"
					onclick={closeAllMenus}
				>
					Beranda
				</a>

				<!-- Tools Dropdown Trigger -->
				<div class="relative tools-menu-container">
					<button
						type="button"
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer {toolsMenuOpen
							? 'bg-[var(--ttx-bg-active)] text-[var(--ttx-accent-text)]'
							: 'text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]'}"
						onclick={(e) => {
							e.stopPropagation();
							userMenuOpen = false;
							toolsMenuOpen = !toolsMenuOpen;
						}}
						aria-expanded={toolsMenuOpen}
						aria-haspopup="true"
						aria-controls="tools-dropdown"
					>
						<span>Tools</span>
						<ChevronDown
							size={13}
							class="transition-transform duration-200 {toolsMenuOpen ? 'rotate-180' : ''}"
							aria-hidden="true"
						/>
					</button>

					<!-- Tools Mega Menu Dropdown -->
					{#if toolsMenuOpen}
						<div
							id="tools-dropdown"
							class="absolute left-0 top-full mt-2.5 z-50 w-[720px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-2xl animate-fade-in custom-scrollbar max-h-[80vh] overflow-y-auto"
							role="region"
							aria-label="Koleksi Tools"
						>
							<div class="mb-3.5 flex items-center justify-between border-b border-[var(--ttx-border-subtle)] pb-2.5">
								<div class="flex items-center gap-2">
									<Wrench size={15} class="text-[var(--ttx-accent)]" />
									<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
										Semua Tools Online
									</span>
								</div>
								<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">Gratis & Tanpa Server</span>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
								{#each Object.entries(groups) as [category, categoryTools]}
									<div class="space-y-1.5">
										<h4 class="text-[11px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)] px-2">
											{category}
										</h4>
										<div class="space-y-0.5">
											{#each categoryTools as tool}
												<a
													href={tool.href}
													class="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]"
													onclick={closeAllMenus}
												>
													<div
														class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] group-hover:bg-[var(--ttx-accent)]/15 group-hover:text-[var(--ttx-accent)] transition-colors"
													>
														<tool.icon size={13} />
													</div>
													<span class="truncate">{tool.title}</span>
												</a>
											{/each}
										</div>
									</div>
								{/each}
							</div>

							<div class="mt-4 flex items-center justify-between border-t border-[var(--ttx-border-subtle)] pt-3 text-xs">
								<a
									href="/notepad2"
									class="inline-flex items-center gap-1.5 text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent)] font-medium transition-colors"
									onclick={closeAllMenus}
								>
									<NotebookPen size={13} />
									<span>Notepad Workspace</span>
								</a>
								<a
									href="/"
									class="inline-flex items-center gap-1 text-[var(--ttx-accent)] font-semibold hover:underline"
									onclick={closeAllMenus}
								>
									<span>Lihat semua di Beranda</span>
									<ChevronRight size={13} />
								</a>
							</div>
						</div>
					{/if}
				</div>
			</nav>
		</div>

		<!-- Right Side Controls & User Menu -->
		<div class="flex items-center gap-2.5 sm:gap-3">
			<!-- Theme Switcher -->
			<ThemeSwitcher />

			<div class="hidden sm:block h-5 w-px bg-[var(--ttx-border-subtle)]" aria-hidden="true"></div>

			<!-- User Authenticated Profile Menu OR Guest Login -->
			{#if user}
				<div class="relative user-menu-container">
					<button
						type="button"
						class="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)]"
						onclick={(e) => {
							e.stopPropagation();
							toolsMenuOpen = false;
							userMenuOpen = !userMenuOpen;
						}}
						aria-expanded={userMenuOpen}
						aria-haspopup="true"
						aria-controls="user-dropdown-menu"
						aria-label="Menu akun pengguna"
					>
						<User size={16} />
					</button>

					<!-- User Dropdown Popover -->
					{#if userMenuOpen}
						<div
							id="user-dropdown-menu"
							class="absolute right-0 top-full mt-2.5 z-50 w-64 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-2 shadow-2xl animate-fade-in"
							role="menu"
							aria-label="Opsi Akun"
						>
							<!-- User Summary Info -->
							<div class="px-3 py-2.5 border-b border-[var(--ttx-border-subtle)]">
								<div class="flex items-center justify-between">
									<p class="text-xs font-semibold text-[var(--ttx-text-main)] truncate max-w-[160px]">
										{displayName}
									</p>
									<span
										class="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[var(--ttx-accent)]/15 text-[var(--ttx-accent)] uppercase tracking-wider"
									>
										{tier}
									</span>
								</div>
								<p class="text-[11px] text-[var(--ttx-text-dim)] truncate mt-0.5">
									{user.email}
								</p>
							</div>

							<!-- Menu Links -->
							<div class="py-1 space-y-0.5">
								{#if !$page.url.pathname.startsWith('/dashboard')}
									<a
										href="/dashboard"
										class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
										onclick={closeAllMenus}
										role="menuitem"
									>
										<LayoutDashboard size={14} class="text-[var(--ttx-text-dim)]" />
										<span>Dashboard</span>
									</a>
								{/if}

								<a
									href="/notepad2"
									class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
									onclick={closeAllMenus}
									role="menuitem"
								>
									<NotebookPen size={14} class="text-[var(--ttx-text-dim)]" />
									<span>Notepad Workspace</span>
								</a>

								<a
									href="/account"
									class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
									onclick={closeAllMenus}
									role="menuitem"
								>
									<Settings size={14} class="text-[var(--ttx-text-dim)]" />
									<span>Pengaturan Akun</span>
								</a>
							</div>

							<div class="border-t border-[var(--ttx-border-subtle)] pt-1 mt-1">
								<button
									type="button"
									class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
									onclick={() => {
										closeAllMenus();
										handleLogout();
									}}
									role="menuitem"
								>
									<LogOut size={14} />
									<span>Keluar (Logout)</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<a
					href="/login"
					class="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)]"
					onclick={closeAllMenus}
				>
					<LogIn size={14} />
					<span>Masuk</span>
				</a>
			{/if}

			<!-- Mobile Hamburger Button -->
			<button
				type="button"
				class="mobile-menu-toggle flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)]"
				onclick={(e) => {
					e.stopPropagation();
					mobileOpen = !mobileOpen;
				}}
				aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
				aria-expanded={mobileOpen}
				aria-controls="mobile-drawer"
			>
				{#if mobileOpen}
					<X size={18} />
				{:else}
					<Menu size={18} />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile Menu Drawer Overlay -->
	{#if mobileOpen}
		<div
			id="mobile-drawer"
			class="mobile-menu-drawer md:hidden border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] px-4 py-5 shadow-2xl animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar"
			role="dialog"
			aria-modal="true"
			aria-label="Menu Navigasi Mobile"
		>
			<!-- If logged in, show user header card in mobile -->
			{#if user}
				<div class="mb-4 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3">
					<div class="flex items-center gap-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ttx-accent)]/20 text-[var(--ttx-accent)] text-xs font-bold"
						>
							{initials}
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs font-semibold text-[var(--ttx-text-main)] truncate">{displayName}</p>
							<p class="text-[11px] text-[var(--ttx-text-dim)] truncate">{user.email}</p>
						</div>
						<span
							class="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[var(--ttx-accent)]/15 text-[var(--ttx-accent)]"
						>
							{tier}
						</span>
					</div>

					<div class="mt-3 grid gap-2 border-t border-[var(--ttx-border-subtle)] pt-2.5 {!$page.url.pathname.startsWith('/dashboard') ? 'grid-cols-2' : 'grid-cols-1'}">
						{#if !$page.url.pathname.startsWith('/dashboard')}
							<a
								href="/dashboard"
								class="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--ttx-bg-card)] py-2 text-xs font-medium text-[var(--ttx-text-main)] border border-[var(--ttx-border-subtle)]"
								onclick={closeAllMenus}
							>
								<LayoutDashboard size={13} />
								<span>Dashboard</span>
							</a>
						{/if}
						<a
							href="/account"
							class="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--ttx-bg-card)] py-2 text-xs font-medium text-[var(--ttx-text-main)] border border-[var(--ttx-border-subtle)]"
							onclick={closeAllMenus}
						>
							<Settings size={13} />
							<span>Pengaturan Akun</span>
						</a>
					</div>
				</div>
			{/if}

			<!-- Navigation Links -->
			<div class="space-y-1">
				<a
					href="/"
					class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors {$page.url.pathname === '/'
						? 'bg-[var(--ttx-bg-active)] text-[var(--ttx-accent-text)] font-semibold'
						: 'text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
					onclick={closeAllMenus}
				>
					<Home size={16} class="text-[var(--ttx-text-dim)]" />
					<span>Beranda</span>
				</a>

				<a
					href="/notepad2"
					class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
					onclick={closeAllMenus}
				>
					<NotebookPen size={16} class="text-[var(--ttx-text-dim)]" />
					<span>Notepad Workspace</span>
				</a>

				<!-- Tools Accordion in Mobile -->
				<div>
					<button
						type="button"
						class="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
						onclick={() => (mobileToolsAccordion = !mobileToolsAccordion)}
					>
						<div class="flex items-center gap-3">
							<Wrench size={16} class="text-[var(--ttx-text-dim)]" />
							<span>Katalog Tools ({Object.values(groups).flat().length})</span>
						</div>
						<ChevronDown
							size={14}
							class="text-[var(--ttx-text-dim)] transition-transform duration-200 {mobileToolsAccordion
								? 'rotate-180'
								: ''}"
						/>
					</button>

					{#if mobileToolsAccordion}
						<div class="ml-4 mt-1 border-l-2 border-[var(--ttx-border-subtle)] pl-3 space-y-3 py-2">
							{#each Object.entries(groups) as [category, categoryTools]}
								<div>
									<h5 class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)] mb-1">
										{category}
									</h5>
									<div class="space-y-0.5">
										{#each categoryTools as tool}
											<a
												href={tool.href}
												class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
												onclick={closeAllMenus}
											>
												<tool.icon size={12} class="text-[var(--ttx-text-dim)]" />
												<span class="truncate">{tool.title}</span>
											</a>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Mobile Footer Auth Actions -->
			<div class="mt-5 border-t border-[var(--ttx-border-subtle)] pt-4">
				{#if user}
					<button
						type="button"
						class="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
						onclick={() => {
							closeAllMenus();
							handleLogout();
						}}
					>
						<LogOut size={15} />
						<span>Keluar dari Akun</span>
					</button>
				{:else}
					<a
						href="/login"
						class="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--ttx-accent)] py-2.5 text-xs font-semibold text-white hover:bg-[var(--ttx-accent-hover)] transition-colors shadow-xs"
						onclick={closeAllMenus}
					>
						<LogIn size={15} />
						<span>Masuk / Daftar Akun</span>
					</a>
				{/if}
			</div>
		</div>
	{/if}
</header>
