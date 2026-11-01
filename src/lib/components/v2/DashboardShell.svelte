<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tools } from '$lib/data/tools';
	import {
		Search,
		Sun,
		Moon,
		ChevronRight,
		Menu,
		X,
		LogIn,
		LogOut,
		User,
		ExternalLink
	} from '@lucide/svelte';
	import QRGeneratorView from '$lib/components/v2/QRGeneratorView.svelte';
	import RemoveDuplicateLinesView from '$lib/components/v2/RemoveDuplicateLinesView.svelte';
	import WordCounterView from '$lib/components/v2/WordCounterView.svelte';
	import CaseConverterView from '$lib/components/v2/CaseConverterView.svelte';
	import SortLinesView from '$lib/components/v2/SortLinesView.svelte';
	import AddPrefixSuffixView from '$lib/components/v2/AddPrefixSuffixView.svelte';
	import LinesCounterView from '$lib/components/v2/LinesCounterView.svelte';
	import RegexToolView from '$lib/components/v2/RegexToolView.svelte';
	import MarkdownEditorView from '$lib/components/v2/MarkdownEditorView.svelte';
	import ObfuscatorView from '$lib/components/v2/ObfuscatorView.svelte';
	import SliceLinesView from '$lib/components/v2/SliceLinesView.svelte';
	import CaptionsFormatterView from '$lib/components/v2/CaptionsFormatterView.svelte';
	import SplitFilesView from '$lib/components/v2/SplitFilesView.svelte';
	import SplitRandomDelimiterView from '$lib/components/v2/SplitRandomDelimiterView.svelte';
	import PercentageCalculatorView from '$lib/components/v2/PercentageCalculatorView.svelte';
	import MultiCounterView from '$lib/components/v2/MultiCounterView.svelte';
	import RandomNumberGeneratorView from '$lib/components/v2/RandomNumberGeneratorView.svelte';
	import FilesComparationView from '$lib/components/v2/FilesComparationView.svelte';
	import CsvParserView from '$lib/components/v2/CsvParserView.svelte';
	import EmojiPickerView from '$lib/components/v2/EmojiPickerView.svelte';
	import PageIdView from '$lib/components/v2/PageIdView.svelte';
	import PrivacyPolicyView from '$lib/components/v2/PrivacyPolicyView.svelte';
	import DisclaimerView from '$lib/components/v2/DisclaimerView.svelte';
	import DataDeletionView from '$lib/components/v2/DataDeletionView.svelte';
	import SharedNotepadView from '$lib/components/v2/SharedNotepadView.svelte';

	let {
		initialTool = null,
		notepadData = null
	}: {
		initialTool?: string | null;
		notepadData?: any;
	} = $props();

	// Map of tool hrefs that have an embedded in-page panel
	const EMBEDDED_TOOLS: Record<string, string> = {
		'/qr-generator': 'qr-generator',
		'/remove-duplicate-lines': 'remove-duplicate-lines',
		'/word-counter': 'word-counter',
		'/case-converter': 'case-converter',
		'/sort-lines': 'sort-lines',
		'/add-prefix-suffix': 'add-prefix-suffix',
		'/lines-counter': 'lines-counter',
		'/regex-tool': 'regex-tool',
		'/markdown-editor': 'markdown-editor',
		'/obfuscate': 'obfuscate',
		'/slice-lines': 'slice-lines',
		'/captions-formatter': 'captions-formatter',
		'/split-files': 'split-files',
		'/split-random-delimiter': 'split-random-delimiter',
		'/percentage-calculator': 'percentage-calculator',
		'/multi-counter': 'multi-counter',
		'/random-number-generator': 'random-number-generator',
		'/files-comparation': 'files-comparation',
		'/csv-parser': 'csv-parser',
		'/emoji-picker': 'emoji-picker',
		'/pageid': 'pageid',
		'/markdown-preview': 'markdown-editor',
		'/privacy-policy': 'privacy-policy',
		'/disclaimer': 'disclaimer',
		'/data-deletion': 'data-deletion',
		'/shared-notepad': 'shared-notepad',
		'/notepad': 'shared-notepad'
	};

	let internalTool = $state<string | null>(initialTool);
	let activeTool = $derived(internalTool);

	// Popular tools definition
	const POPULAR_TOOL_HREFS = [
		'/remove-duplicate-lines',
		'/regex-tool',
		'/markdown-editor',
		'/case-converter',
		'/word-counter',
		'/qr-generator',
		'/emoji-picker',
		'/obfuscate'
	];

	const popularTools = tools.filter((t) => POPULAR_TOOL_HREFS.includes(t.href));

	const categories = [
		'ALL TOOLS',
		'POPULAR TOOLS',
		'TEXT OPERATIONS',
		'DATA & PARSING',
		'GENERAL UTILITIES',
		'SECURITY & MISC'
	];

	// Mapping category to tools for sidebar dropdown
	const categoryItems: Record<string, typeof tools> = {
		'POPULAR TOOLS': popularTools,
		'TEXT OPERATIONS': tools.filter((t) => t.category === 'Text Operations'),
		'DATA & PARSING': tools.filter((t) => t.category === 'Data & Parsing'),
		'GENERAL UTILITIES': tools.filter((t) => t.category === 'General Utilities'),
		'SECURITY & MISC': tools.filter((t) => t.category === 'Security & Misc')
	};

	let selectedCategory = $state('ALL TOOLS');
	let searchQuery = $state('');
	let searchInputEl: HTMLInputElement | null = $state(null);
	let mainScrollContainer: HTMLElement | null = $state(null);
	let isSidebarOpen = $state(false);
	let showMobileSearch = $state(false);
	function getInitialTheme(): boolean {
		if (!browser) return true;
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			return savedTheme === 'dark';
		}
		const currentTheme = document.documentElement.getAttribute('data-theme');
		if (currentTheme) {
			return currentTheme === 'dark';
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	let isDark = $state(getInitialTheme());
	let user = $derived($page.data.user);

	// Active open dropdown category (only one category open at a time)
	let openCategory: string | null = $state(null);

	function toggleDropdown(cat: string) {
		selectedCategory = cat;
		openCategory = openCategory === cat ? null : cat;
		if (activeTool) {
			internalTool = null;
			const isV2 = browser && window.location.pathname.startsWith('/v2');
			const homeUrl = isV2 ? '/v2' : '/';
			if (browser && window.location.pathname !== homeUrl) {
				window.history.pushState({}, '', homeUrl);
			}
		}
		scrollToCategory(cat);
	}

	// Keyboard shortcut for Ctrl+K / Cmd+K
	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			searchInputEl?.focus();
		} else if (e.key === 'Escape' && document.activeElement === searchInputEl) {
			searchQuery = '';
			searchInputEl?.blur();
		}
	}

	function goHome() {
		openCategory = null;
		internalTool = null;
		selectedCategory = 'ALL TOOLS';
		isSidebarOpen = false;
		searchQuery = '';
		
		const isV2 = browser && window.location.pathname.startsWith('/v2');
		const homeUrl = isV2 ? '/v2' : '/';
		goto(homeUrl);
		mainScrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	$effect(() => {
		if (initialTool !== undefined) {
			internalTool = initialTool;
		}
	});

	$effect(() => {
		if (activeTool) {
			const current = tools.find(
				(t) =>
					EMBEDDED_TOOLS[t.href] === activeTool ||
					EMBEDDED_TOOLS[t.href.split('?')[0]] === activeTool ||
					t.href.replace('/', '') === activeTool
			);
			if (current) {
				const catKey = current.category.toUpperCase();
				if (categories.includes(catKey) && openCategory === null) {
					openCategory = catKey;
					selectedCategory = catKey;
				}
			}
		}
	});

	onMount(() => {
		isDark = getInitialTheme();

		function handlePopState() {
			const path = window.location.pathname;
			const matchV2 = path.match(/^\/v2\/([^\/]+)/);
			const cleanPath = matchV2 ? '/' + matchV2[1] : path;
			if (EMBEDDED_TOOLS[cleanPath]) {
				internalTool = EMBEDDED_TOOLS[cleanPath];
			} else if (path === '/' || path === '/v2' || path === '/v2/') {
				internalTool = null;
			}
		}

		window.addEventListener('popstate', handlePopState);
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function toggleTheme() {
		isDark = !isDark;
		const nextTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', nextTheme);
		localStorage.setItem('theme', nextTheme);
	}

	// Filtered tools based on search
	const filteredTools = $derived(
		searchQuery.trim() === ''
			? tools
			: tools.filter(
					(t) =>
						t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
						t.category.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);

	// Filtered popular tools based on search
	const filteredPopular = $derived(
		searchQuery.trim() === ''
			? popularTools
			: popularTools.filter(
					(t) =>
						t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						t.desc.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);

	// Grouping for regular view
	const groupedTools = $derived(() => {
		const groups: Record<string, typeof tools> = {};
		filteredTools.forEach((t) => {
			if (!groups[t.category]) groups[t.category] = [];
			groups[t.category].push(t);
		});
		return groups;
	});

	function scrollToCategory(cat: string) {
		selectedCategory = cat;

		if (cat === 'ALL TOOLS') {
			mainScrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		const elementId = `category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
		const el = document.getElementById(elementId);
		if (el && mainScrollContainer) {
			const targetTop = el.offsetTop - 24;
			mainScrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
		}
	}

	const pageTitle = $derived.by(() => {
		if (activeTool === 'privacy-policy') return 'Kebijakan Privasi - TEXY Workspace';
		if (activeTool === 'disclaimer') return 'Disclaimer - TEXY Workspace';
		if (activeTool === 'data-deletion') return 'Penghapusan Data - TEXY Workspace';
		if (activeTool === 'shared-notepad' || activeTool === 'notepad') return 'Shared Notepad - TEXY Workspace';
		const current = tools.find((t) => t.href.split('?')[0].replace('/', '') === activeTool);
		if (current) {
			return `${current.title} - TEXY Workspace`;
		}
		return 'TEXY Workspace - Kumpulan Tools Teks & Utilitas';
	});

	const isDocumentPage = $derived(
		activeTool === 'privacy-policy' ||
		activeTool === 'disclaimer' ||
		activeTool === 'data-deletion'
	);

	function openTool(href: string) {
		const cleanHref = href.split('?')[0];
		const queryString = href.includes('?') ? '?' + href.split('?')[1] : '';

		if (cleanHref === '/notepad' || cleanHref === '/shared-notepad') {
			if (notepadData && internalTool !== 'shared-notepad') {
				internalTool = 'shared-notepad';
				if (browser && window.location.pathname !== `/notepad/${notepadData.slug}`) {
					window.history.pushState({ tool: 'shared-notepad' }, '', `/notepad/${notepadData.slug}`);
				}
				mainScrollContainer?.scrollTo({ top: 0, behavior: 'instant' });
				return;
			}
			goto('/notepad');
			return;
		}

		const embeddedKey = EMBEDDED_TOOLS[href] || EMBEDDED_TOOLS[cleanHref];
		if (embeddedKey) {
			internalTool = embeddedKey;
			const isV2 = browser && window.location.pathname.startsWith('/v2');
			const targetUrl = isV2 ? `/v2/${embeddedKey}${queryString}` : `${cleanHref}${queryString}`;
			if (browser && (window.location.pathname + window.location.search) !== targetUrl) {
				window.history.pushState({ tool: embeddedKey }, '', targetUrl);
			}
			mainScrollContainer?.scrollTo({ top: 0, behavior: 'instant' });
		} else {
			goto(href);
		}
	}
</script>

<svelte:head>
	{#if activeTool !== 'pageid'}
		<title>{pageTitle}</title>
	{/if}
	<meta
		name="description"
		content="TEXY Workspace menyediakan berbagai tools gratis untuk manipulasi teks, parsing data, shared notepad, hingga case converter untuk produktivitas Anda."
	/>
</svelte:head>

<!-- Global Style override to lock outer scroll so sidebar stays completely still -->
<style>
	:global(body:has(.ttx-dashboard)) {
		overflow: hidden !important;
	}
	:global(body:has(.ttx-dashboard) main.flex-1) {
		padding-top: 0 !important;
		height: 100vh !important;
		overflow: hidden !important;
	}
	.diagonal-hatch {
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 6px,
			var(--hatch-line) 6px,
			var(--hatch-line) 7.5px
		);
	}
	.custom-scrollbar::-webkit-scrollbar {
		width: 7px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb);
		border-radius: 9999px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: var(--scrollbar-thumb-hover);
	}
</style>

<div class="ttx-dashboard flex flex-col h-[100dvh] w-full max-w-full overflow-hidden transition-colors duration-200 bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)]">
	<!-- TOP NAVIGATION BAR -->
	<header class="shrink-0 border-b z-40 transition-colors duration-200 bg-[var(--ttx-bg-header)] border-[var(--ttx-border-base)] shadow-xs pt-[env(safe-area-inset-top,0px)]">
		<div class="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 gap-2">
			<!-- Left: Hamburger (mobile) + Brand Logo -->
			<div class="flex items-center gap-2 sm:gap-4 shrink-0">
				<button
					type="button"
					class="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] active:scale-95 transition-all"
					onclick={() => (isSidebarOpen = !isSidebarOpen)}
					aria-label="Toggle menu"
				>
					{#if isSidebarOpen}
						<X size={18} />
					{:else}
						<Menu size={18} />
					{/if}
				</button>

				<!-- Brand Logo -->
				<button
					type="button"
					class="flex items-center group text-left cursor-pointer select-none"
					onclick={goHome}
				>
					<span class="text-xl sm:text-2xl font-black tracking-tight text-[var(--ttx-text-main)] group-hover:text-blue-500 transition-colors">
						TEXY<span class="text-blue-500">.</span>
					</span>
				</button>
			</div>

			<!-- Middle: Search Bar (Desktop) -->
			<div class="hidden md:flex flex-1 max-w-xl mx-4 sm:mx-6">
				<div class="relative w-full">
					<div class="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
						<Search size={16} class="text-[var(--ttx-text-dim)]" />
					</div>
					<input
						bind:this={searchInputEl}
						bind:value={searchQuery}
						type="text"
						placeholder="Search Tools"
						class="w-full h-10 pl-10 pr-16 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-500/40 bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-blue-500 shadow-inner"
					/>
					<div class="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
						{#if searchQuery}
							<button
								type="button"
								class="p-1 rounded-md transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
								onclick={() => (searchQuery = '')}
								aria-label="Clear search"
							>
								<X size={14} />
							</button>
						{:else}
							<kbd class="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-dim)]">
								Ctrl K
							</kbd>
						{/if}
					</div>
				</div>
			</div>

			<!-- Right: Actions & Controls -->
			<div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
				<!-- Mobile Search Toggle Button -->
				<button
					type="button"
					class="md:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] active:scale-95 transition-all {showMobileSearch ? 'border-blue-500 text-blue-400' : ''}"
					onclick={() => (showMobileSearch = !showMobileSearch)}
					aria-label="Search"
				>
					<Search size={16} />
				</button>

				<!-- Dark / Light Mode Switcher -->
				<button
					type="button"
					class="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-amber-400 hover:bg-[var(--ttx-bg-hover)] active:scale-95 transition-all"
					onclick={toggleTheme}
					title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
					aria-label="Toggle theme"
				>
					{#if isDark}
						<Sun size={16} />
					{:else}
						<Moon size={16} class="text-slate-700" />
					{/if}
				</button>

				<!-- Auth Buttons -->
				{#if user}
					<a
						href="/dashboard"
						class="flex items-center gap-1.5 px-2.5 sm:px-3.5 h-9 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
					>
						<User size={14} />
						<span class="hidden sm:inline">Dashboard</span>
					</a>
					<button
						type="button"
						class="h-9 w-9 flex items-center justify-center text-[var(--ttx-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
						onclick={async () => {
							await fetch('/logout', { method: 'POST' });
							window.location.href = '/login';
						}}
						title="Sign Out"
					>
						<LogOut size={15} />
					</button>
				{:else}
					<!-- Mobile Auth Icon Button -->
					<a
						href="/login"
						class="flex sm:hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-blue-400 hover:border-blue-500/40 active:scale-95 transition-all"
						title="Sign In / Register"
						aria-label="Sign In"
					>
						<User size={16} />
					</a>

					<!-- Desktop Auth Buttons -->
					<a
						href="/login"
						class="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
					>
						Sign In
					</a>
					<a
						href="/register"
						class="hidden sm:inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shadow-sm shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
					>
						Sign Up
					</a>
				{/if}
			</div>
		</div>

		<!-- Mobile Search Drawer (collapsible under navbar) -->
		{#if showMobileSearch}
			<div class="md:hidden px-3.5 pb-3 pt-1 border-t border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-header)]">
				<div class="relative w-full">
					<div class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
						<Search size={15} class="text-[var(--ttx-text-dim)]" />
					</div>
					<input
						bind:value={searchQuery}
						type="text"
						placeholder="Cari alat (misal: qr, counter, regex)..."
						class="w-full h-10 pl-9 pr-9 rounded-xl text-xs outline-none bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-blue-500 shadow-inner"
					/>
					{#if searchQuery}
						<button
							type="button"
							class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
							onclick={() => (searchQuery = '')}
						>
							<X size={15} />
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</header>

	<!-- MAIN WORKSPACE CONTAINER -->
	<div class="flex-1 flex overflow-hidden relative">
		<!-- Mobile Sidebar Backdrop -->
		{#if isSidebarOpen}
			<button
				type="button"
				class="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
				onclick={() => (isSidebarOpen = false)}
				aria-label="Close backdrop"
			></button>
		{/if}

		<!-- LEFT SIDEBAR: Solid drawer on mobile, static column on desktop -->
		<aside
			class="fixed lg:static inset-y-0 left-0 z-50 lg:z-30 w-72 max-w-[85vw] lg:w-64 h-[100dvh] lg:h-full shrink-0 flex flex-col justify-between border-r overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none {isSidebarOpen
				? 'translate-x-0'
				: '-translate-x-full'} bg-[var(--ttx-bg-sidebar)] border-[var(--ttx-border-base)]"
		>
			<!-- Mobile Drawer Header -->
			<div class="lg:hidden flex items-center justify-between px-4 py-3.5 border-b border-[var(--ttx-border-base)] pt-[max(0.875rem,env(safe-area-inset-top))]">
				<span class="text-base font-black tracking-tight text-[var(--ttx-text-main)]">
					TEXY<span class="text-blue-500">.</span>
				</span>
				<button
					type="button"
					class="p-1.5 rounded-lg text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
					onclick={() => (isSidebarOpen = false)}
					aria-label="Tutup menu"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Navigation categories list with single-open collapsible dropdown -->
			<div class="flex-1 overflow-y-auto py-5 px-3 space-y-1">
				<p class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
					Navigation
				</p>

				{#each categories as category}
					{#if category === 'ALL TOOLS'}
						<button
							type="button"
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all {selectedCategory === 'ALL TOOLS' && !activeTool
								? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-accent)]/30'
								: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
							onclick={goHome}
						>
							<span class="tracking-wide uppercase truncate">ALL TOOLS</span>
						</button>
					{:else}
						{@const isOpen = openCategory === category}
						{@const items = categoryItems[category] || []}
						<div class="space-y-1">
							<button
								type="button"
								class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group {selectedCategory === category
									? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-accent)]/30'
									: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
								onclick={() => toggleDropdown(category)}
							>
								<span class="tracking-wide uppercase truncate">{category}</span>
								<ChevronRight
									size={14}
									class="transition-transform duration-200 opacity-50 group-hover:opacity-100 {isOpen ? 'rotate-90' : ''}"
								/>
							</button>

							<!-- Collapsible Dropdown Submenu -->
							{#if isOpen}
								<div class="ml-3 pl-3 border-l py-1 space-y-0.5 border-[var(--ttx-border-base)]">
									{#each items as item}
										{@const cleanItemHref = item.href.split('?')[0].replace('/', '')}
										{@const isItemActive = Boolean(activeTool && cleanItemHref === activeTool)}
										<button
											type="button"
											class="w-full flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors text-left {isItemActive
												? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold'
												: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] hover:bg-[var(--ttx-bg-hover)]'}"
											onclick={() => {
												isSidebarOpen = false;
												openTool(item.href);
											}}
										>
											<span class="truncate">{item.title}</span>
											{#if isItemActive}
												<span class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				{/each}

				<div class="pt-4 border-t mt-4 border-[var(--ttx-border-base)]">
					<p class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Quick Links
					</p>
					<button
						type="button"
						onclick={() => { isSidebarOpen = false; openTool('/notepad'); }}
						class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left {activeTool === 'shared-notepad' || activeTool === 'notepad'
							? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
					>
						<span>Shared Notepad</span>
						{#if activeTool === 'shared-notepad' || activeTool === 'notepad'}
							<span class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
						{:else}
							<ExternalLink size={13} class="opacity-40" />
						{/if}
					</button>
					<a
						href="/notepad2"
						class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
					>
						<span>Notepad Pro (Cloud)</span>
						<ExternalLink size={13} class="opacity-40" />
					</a>
				</div>

				<div class="pt-3 border-t mt-3 border-[var(--ttx-border-base)]">
					<p class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Legal & Kebijakan
					</p>
					<button
						type="button"
						onclick={() => { isSidebarOpen = false; openTool('/privacy-policy'); }}
						class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left {activeTool === 'privacy-policy'
							? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
					>
						<span>Kebijakan Privasi</span>
					</button>
					<button
						type="button"
						onclick={() => { isSidebarOpen = false; openTool('/disclaimer'); }}
						class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left {activeTool === 'disclaimer'
							? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
					>
						<span>Disclaimer</span>
					</button>
					<button
						type="button"
						onclick={() => { isSidebarOpen = false; openTool('/data-deletion'); }}
						class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left {activeTool === 'data-deletion'
							? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
					>
						<span>Penghapusan Data</span>
					</button>
				</div>
			</div>

			<!-- Mobile Drawer Bottom Auth (when logged out) -->
			{#if !user}
				<div class="lg:hidden p-3 border-t border-[var(--ttx-border-base)] flex items-center gap-2">
					<a
						href="/login"
						class="flex-1 py-2 text-center text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
					>
						Sign In
					</a>
					<a
						href="/register"
						class="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-colors"
					>
						Sign Up
					</a>
				</div>
			{/if}
		</aside>

		<!-- MAIN SCROLL CONTAINER: spans from sidebar to screen edge with scrollbar on the far right -->
		<div
			bind:this={mainScrollContainer}
			class="flex-1 flex items-start min-w-0 h-full {activeTool && !isDocumentPage
				? 'overflow-hidden'
				: 'overflow-y-auto'} overflow-x-hidden custom-scrollbar transition-colors duration-200 bg-[var(--ttx-bg-workspace)]"
			style="--scrollbar-thumb: var(--ttx-scrollbar); --scrollbar-thumb-hover: var(--ttx-scrollbar-hover);"
		>
			<!-- LEFT DIAGONAL STRIPED GUTTER (Sticky, stays locked full height while scrolling) -->
			<div
				class="hidden md:block w-7 lg:w-8 shrink-0 sticky top-0 h-[calc(100vh-4rem)] border-r transition-colors duration-200 diagonal-hatch border-[var(--ttx-border-base)] bg-[var(--ttx-bg-workspace)]"
				style="--hatch-line: var(--ttx-hatch);"
				aria-hidden="true"
			></div>

			<!-- MAIN CONTENT CARDS -->
			<div
				class="flex-1 min-w-0 {activeTool && !isDocumentPage
					? 'h-full max-h-full overflow-hidden'
					: 'min-h-full'} flex flex-col px-3.5 py-4 sm:px-8 sm:py-6 lg:px-10"
			>
			{#if activeTool}
				<!-- IN-PAGE TOOL PANEL -->
				{#if activeTool === 'qr-generator'}
					<QRGeneratorView {isDark} />
				{:else if activeTool === 'remove-duplicate-lines'}
					<RemoveDuplicateLinesView {isDark} />
				{:else if activeTool === 'word-counter'}
					<WordCounterView {isDark} />
				{:else if activeTool === 'case-converter'}
					<CaseConverterView {isDark} />
				{:else if activeTool === 'sort-lines'}
					<SortLinesView {isDark} />
				{:else if activeTool === 'add-prefix-suffix'}
					<AddPrefixSuffixView {isDark} />
				{:else if activeTool === 'lines-counter'}
					<LinesCounterView {isDark} />
				{:else if activeTool === 'regex-tool'}
					<RegexToolView {isDark} />
				{:else if activeTool === 'markdown-editor'}
					<MarkdownEditorView {isDark} />
				{:else if activeTool === 'obfuscate'}
					<ObfuscatorView {isDark} />
				{:else if activeTool === 'slice-lines'}
					<SliceLinesView {isDark} />
				{:else if activeTool === 'captions-formatter'}
					<CaptionsFormatterView {isDark} />
				{:else if activeTool === 'split-files'}
					<SplitFilesView {isDark} />
				{:else if activeTool === 'split-random-delimiter'}
					<SplitRandomDelimiterView {isDark} />
				{:else if activeTool === 'percentage-calculator'}
					<PercentageCalculatorView {isDark} />
				{:else if activeTool === 'multi-counter'}
					<MultiCounterView {isDark} />
				{:else if activeTool === 'random-number-generator'}
					<RandomNumberGeneratorView {isDark} />
				{:else if activeTool === 'files-comparation'}
					<FilesComparationView {isDark} />
				{:else if activeTool === 'csv-parser'}
					<CsvParserView {isDark} />
				{:else if activeTool === 'emoji-picker'}
					<EmojiPickerView {isDark} />
				{:else if activeTool === 'pageid'}
					<PageIdView {isDark} />
				{:else if activeTool === 'shared-notepad' || activeTool === 'notepad'}
					<SharedNotepadView {isDark} data={notepadData} />
				{:else if activeTool === 'privacy-policy'}
					<PrivacyPolicyView {isDark} onBack={goHome} />
				{:else if activeTool === 'disclaimer'}
					<DisclaimerView {isDark} onBack={goHome} />
				{:else if activeTool === 'data-deletion'}
					<DataDeletionView {isDark} onBack={goHome} />
				{/if}
			{:else}
				{#if searchQuery}
					<!-- Search results status banner -->
					<div
						class="mb-6 sm:mb-8 flex items-center justify-between rounded-xl border px-4 sm:px-5 py-3 text-xs sm:text-sm {isDark
							? 'border-blue-900/40 bg-blue-950/20 text-blue-300'
							: 'border-blue-200 bg-blue-50 text-blue-800'}"
					>
						<span class="truncate mr-2">
							Hasil: <strong class={isDark ? 'text-white' : 'text-slate-900'}>"{searchQuery}"</strong> ({filteredTools.length} alat)
						</span>
						<button
							type="button"
							class="text-xs underline shrink-0 {isDark ? 'text-blue-400 hover:text-white' : 'text-blue-600 hover:text-blue-900'}"
							onclick={() => (searchQuery = '')}
						>
							Reset
						</button>
					</div>
				{/if}

				{#if filteredTools.length === 0}
					<div class="text-center py-20">
						<p class="text-sm sm:text-base {isDark ? 'text-slate-400' : 'text-slate-600'}">
							Tidak ada alat yang cocok dengan kata kunci "{searchQuery}"
						</p>
						<button
							type="button"
							class="mt-4 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors {isDark
								? 'text-blue-400 hover:text-blue-300 border-blue-500/30 hover:bg-blue-500/10'
								: 'text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50'}"
							onclick={() => (searchQuery = '')}
						>
							Reset Pencarian
						</button>
					</div>
				{:else}
					<div class="space-y-8 sm:space-y-12">
						<!-- POPULAR TOOLS SECTION -->
						{#if !searchQuery || filteredPopular.length > 0}
							<section id="category-popular-tools" class="scroll-mt-6">
								<div class="flex items-center gap-2 mb-3 sm:mb-4">
									<div class="w-1.5 h-3.5 rounded-full bg-blue-500"></div>
									<h2 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-700'}">
										POPULAR TOOLS
									</h2>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
									{#each filteredPopular as tool (tool.href)}
										{@const ToolIcon = tool.icon}
										{@const isEmbedded = !!(EMBEDDED_TOOLS[tool.href] || EMBEDDED_TOOLS[tool.href.split('?')[0]])}
										<button
											type="button"
											onclick={() => openTool(tool.href)}
											class="group relative flex items-center gap-3 sm:gap-3.5 p-3 sm:px-4 sm:py-3.5 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-bg-hover)] active:scale-[0.99] hover:shadow-lg shadow-xs transition-all duration-200 w-full text-left"
										>
											<div class="flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl sm:rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] group-hover:text-[var(--ttx-accent-text)] group-hover:bg-[var(--ttx-accent-light)] transition-colors">
												<ToolIcon size={20} class="sm:hidden" />
												<ToolIcon size={18} class="hidden sm:block" />
											</div>
											<div class="min-w-0 flex-1">
												<div class="flex items-center gap-2">
													<h3 class="text-sm font-semibold sm:font-medium truncate transition-colors text-[var(--ttx-text-main)] group-hover:text-[var(--ttx-accent-text)]">
														{tool.title}
													</h3>
													{#if isEmbedded}
														<span class="sm:hidden shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
															Instant
														</span>
													{/if}
												</div>
												<p class="text-xs text-[var(--ttx-text-muted)] line-clamp-1 mt-0.5 sm:hidden">
													{tool.desc}
												</p>
											</div>
											<div class="shrink-0 flex items-center">
												{#if isEmbedded}
													<div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
												{/if}
												<ChevronRight size={16} class="sm:hidden text-[var(--ttx-text-dim)] group-hover:text-[var(--ttx-text-main)] transition-colors" />
											</div>
										</button>
									{/each}
								</div>
							</section>
						{/if}

						<!-- CATEGORIZED TOOLS -->
						{#each Object.entries(groupedTools()) as [category, categoryTools]}
							{@const categoryId = `category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
							<section id={categoryId} class="scroll-mt-6">
								<div class="flex items-center gap-2 mb-3 sm:mb-4">
									<div class="w-1.5 h-3.5 rounded-full bg-slate-500/60"></div>
									<h2 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-700'}">
										{category.toUpperCase()} TOOLS
									</h2>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
									{#each categoryTools as tool (tool.href)}
										{@const ToolIcon = tool.icon}
										{@const isEmbedded = !!(EMBEDDED_TOOLS[tool.href] || EMBEDDED_TOOLS[tool.href.split('?')[0]])}
										<button
											type="button"
											onclick={() => openTool(tool.href)}
											class="group relative flex items-center gap-3 sm:gap-3.5 p-3 sm:px-4 sm:py-3.5 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-bg-hover)] active:scale-[0.99] hover:shadow-lg shadow-xs transition-all duration-200 w-full text-left"
										>
											<div class="flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl sm:rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] group-hover:text-[var(--ttx-accent-text)] group-hover:bg-[var(--ttx-accent-light)] transition-colors">
												<ToolIcon size={20} class="sm:hidden" />
												<ToolIcon size={18} class="hidden sm:block" />
											</div>
											<div class="min-w-0 flex-1">
												<div class="flex items-center gap-2">
													<h3 class="text-sm font-semibold sm:font-medium truncate transition-colors text-[var(--ttx-text-main)] group-hover:text-[var(--ttx-accent-text)]">
														{tool.title}
													</h3>
													{#if isEmbedded}
														<span class="sm:hidden shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
															Instant
														</span>
													{/if}
												</div>
												<p class="text-xs text-[var(--ttx-text-muted)] line-clamp-1 mt-0.5 sm:hidden">
													{tool.desc}
												</p>
											</div>
											<div class="shrink-0 flex items-center">
												{#if isEmbedded}
													<div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
												{/if}
												<ChevronRight size={16} class="sm:hidden text-[var(--ttx-text-dim)] group-hover:text-[var(--ttx-text-main)] transition-colors" />
											</div>
										</button>
									{/each}
								</div>
							</section>
						{/each}

						<!-- WORKSPACE FOOTER -->
						<footer class="pt-8 pb-4 mt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-[var(--ttx-border-base)] text-[var(--ttx-text-muted)]">
							<p>&copy; {new Date().getFullYear()} TEXY Workspace. Diproses secara lokal di browser Anda.</p>
							<div class="flex items-center gap-3">
								<button type="button" onclick={() => openTool('/privacy-policy')} class="hover:underline transition-colors hover:text-[var(--ttx-text-main)]">Kebijakan Privasi</button>
								<span>•</span>
								<button type="button" onclick={() => openTool('/disclaimer')} class="hover:underline transition-colors hover:text-[var(--ttx-text-main)]">Disclaimer</button>
								<span>•</span>
								<button type="button" onclick={() => openTool('/data-deletion')} class="hover:underline transition-colors hover:text-[var(--ttx-text-main)]">Penghapusan Data</button>
							</div>
						</footer>
					</div>
				{/if}
			{/if}
			</div>

			<!-- RIGHT DIAGONAL STRIPED GUTTER (Sticky, stays locked full height while scrolling) -->
			<div
				class="hidden xl:block w-7 lg:w-8 shrink-0 sticky top-0 h-[calc(100vh-4rem)] border-l transition-colors duration-200 diagonal-hatch border-[var(--ttx-border-base)] bg-[var(--ttx-bg-workspace)]"
				style="--hatch-line: var(--ttx-hatch);"
				aria-hidden="true"
			></div>
		</div>
	</div>
</div>
