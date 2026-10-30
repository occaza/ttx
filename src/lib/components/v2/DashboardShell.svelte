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
	import RandomNumberGeneratorView from '$lib/components/v2/RandomNumberGeneratorView.svelte';
	import FilesComparationView from '$lib/components/v2/FilesComparationView.svelte';
	import CsvParserView from '$lib/components/v2/CsvParserView.svelte';
	import EmojiPickerView from '$lib/components/v2/EmojiPickerView.svelte';
	import PageIdView from '$lib/components/v2/PageIdView.svelte';
	import PrivacyPolicyView from '$lib/components/v2/PrivacyPolicyView.svelte';
	import DisclaimerView from '$lib/components/v2/DisclaimerView.svelte';
	import DataDeletionView from '$lib/components/v2/DataDeletionView.svelte';

	let { initialTool = null }: { initialTool?: string | null } = $props();

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
		'/random-number-generator': 'random-number-generator',
		'/files-comparation': 'files-comparation',
		'/csv-parser': 'csv-parser',
		'/emoji-picker': 'emoji-picker',
		'/pageid': 'pageid',
		'/markdown-preview': 'markdown-editor',
		'/privacy-policy': 'privacy-policy',
		'/disclaimer': 'disclaimer',
		'/data-deletion': 'data-deletion'
	};

	let internalTool = $state<string | null>(initialTool);
	let activeTool = $derived(internalTool ?? ($page.params.tool || null));

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
		const isV2 = browser && window.location.pathname.startsWith('/v2');
		const homeUrl = isV2 ? '/v2' : '/';
		if (browser && window.location.pathname !== homeUrl) {
			window.history.pushState({}, '', homeUrl);
		}
		scrollToCategory('ALL TOOLS');
		isSidebarOpen = false;
	}

	$effect(() => {
		if (initialTool !== undefined) {
			internalTool = initialTool;
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
		const current = tools.find((t) => t.href.split('?')[0].replace('/', '') === activeTool);
		if (current) {
			return `${current.title} - TEXY Workspace`;
		}
		return 'TEXY Workspace - Kumpulan Tools Teks & Utilitas';
	});

	function openTool(href: string) {
		const cleanHref = href.split('?')[0];
		const queryString = href.includes('?') ? '?' + href.split('?')[1] : '';
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

<div class="ttx-dashboard flex flex-col h-screen w-screen overflow-hidden transition-colors duration-200 bg-[var(--ttx-bg-root)] text-[var(--ttx-text-main)]">
	<!-- TOP NAVIGATION BAR -->
	<header class="h-16 shrink-0 border-b flex items-center justify-between px-4 sm:px-6 z-40 transition-colors duration-200 bg-[var(--ttx-bg-header)] border-[var(--ttx-border-base)] shadow-xs">
		<!-- Left: Hamburger (mobile) + Brand Logo -->
		<div class="flex items-center gap-3 sm:gap-4">
			<button
				type="button"
				class="lg:hidden p-2 rounded-lg text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				onclick={() => (isSidebarOpen = !isSidebarOpen)}
				aria-label="Toggle menu"
			>
				{#if isSidebarOpen}
					<X size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>

			<!-- Brand Logo -->
			<button
				type="button"
				class="flex items-center gap-2 group text-left"
				onclick={goHome}
			>
				<div class="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
					<div class="h-full w-full rounded-[6px] flex items-center justify-center bg-[var(--ttx-bg-root)]">
						<svg class="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polygon points="12 2 22 19 2 19"></polygon>
						</svg>
					</div>
				</div>
				<span class="text-xl font-bold tracking-tight text-[var(--ttx-text-main)] group-hover:text-cyan-400 transition-colors">
					TEXY<span class="text-blue-500">.</span>
				</span>
			</button>
		</div>

		<!-- Middle: Search Bar with Ctrl+K shortcut -->
		<div class="flex-1 max-w-xl mx-2 sm:mx-6">
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

		<!-- Right: Theme Switcher & Actions -->
		<div class="flex items-center gap-2 sm:gap-3 shrink-0">
			<!-- Dark / Light Mode Switcher -->
			<button
				type="button"
				class="p-2 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-amber-400 hover:bg-[var(--ttx-bg-hover)] transition-colors"
				onclick={toggleTheme}
				title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
				aria-label="Toggle theme"
			>
				{#if isDark}
					<Sun size={17} />
				{:else}
					<Moon size={17} class="text-slate-700" />
				{/if}
			</button>

			<!-- Auth Buttons -->
			{#if user}
				<a
					href="/dashboard"
					class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				>
					<User size={14} />
					<span>Dashboard</span>
				</a>
				<button
					type="button"
					class="p-2 text-[var(--ttx-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
					onclick={async () => {
						await fetch('/logout', { method: 'POST' });
						window.location.href = '/login';
					}}
					title="Sign Out"
				>
					<LogOut size={16} />
				</button>
			{:else}
				<a
					href="/login"
					class="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
				>
					Sign In
				</a>
				<a
					href="/register"
					class="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shadow-sm shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
				>
					Sign Up
				</a>
			{/if}
		</div>
	</header>

	<!-- MAIN WORKSPACE CONTAINER -->
	<div class="flex-1 flex overflow-hidden relative">
		<!-- Mobile Sidebar Backdrop -->
		{#if isSidebarOpen}
			<button
				type="button"
				class="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-xs"
				onclick={() => (isSidebarOpen = false)}
				aria-label="Close backdrop"
			></button>
		{/if}

		<!-- LEFT SIDEBAR: Solid, non-shaking sidebar column -->
		<aside
			class="fixed lg:static inset-y-0 left-0 top-16 lg:top-0 z-30 w-64 h-[calc(100vh-4rem)] lg:h-full shrink-0 flex flex-col justify-between border-r overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 {isSidebarOpen
				? 'translate-x-0'
				: '-translate-x-full'} bg-[var(--ttx-bg-sidebar)] border-[var(--ttx-border-base)]"
		>
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
										<button
											type="button"
											class="w-full text-left block py-1.5 px-2 rounded-md text-xs transition-colors truncate text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] hover:bg-[var(--ttx-bg-hover)]"
											onclick={() => {
												isSidebarOpen = false;
												openTool(item.href);
											}}
										>
											{item.title}
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
					<a
						href="/notepad"
						class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
					>
						<span>Shared Notepad</span>
						<ExternalLink size={13} class="opacity-40" />
					</a>
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
		</aside>

		<!-- MAIN SCROLL CONTAINER: spans from sidebar to screen edge with scrollbar on the far right -->
		<div
			bind:this={mainScrollContainer}
			class="flex-1 flex items-start min-w-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar transition-colors duration-200 bg-[var(--ttx-bg-workspace)]"
			style="--scrollbar-thumb: var(--ttx-scrollbar); --scrollbar-thumb-hover: var(--ttx-scrollbar-hover);"
		>
			<!-- LEFT DIAGONAL STRIPED GUTTER (Sticky, stays locked full height while scrolling) -->
			<div
				class="hidden md:block w-7 lg:w-8 shrink-0 sticky top-0 h-[calc(100vh-4rem)] border-r transition-colors duration-200 diagonal-hatch border-[var(--ttx-border-base)] bg-[var(--ttx-bg-workspace)]"
				style="--hatch-line: var(--ttx-hatch);"
				aria-hidden="true"
			></div>

			<!-- MAIN CONTENT CARDS -->
			<div class="flex-1 min-w-0 px-4 py-8 sm:px-8 lg:px-10">
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
						class="mb-8 flex items-center justify-between rounded-xl border px-5 py-3 text-sm {isDark
							? 'border-blue-900/40 bg-blue-950/20 text-blue-300'
							: 'border-blue-200 bg-blue-50 text-blue-800'}"
					>
						<span>
							Menampilkan hasil pencarian untuk: <strong class={isDark ? 'text-white' : 'text-slate-900'}>"{searchQuery}"</strong> ({filteredTools.length} alat ditemukan)
						</span>
						<button
							type="button"
							class="text-xs underline {isDark ? 'text-blue-400 hover:text-white' : 'text-blue-600 hover:text-blue-900'}"
							onclick={() => (searchQuery = '')}
						>
							Reset Pencarian
						</button>
					</div>
				{/if}

				{#if filteredTools.length === 0}
					<div class="text-center py-24">
						<p class="text-base {isDark ? 'text-slate-400' : 'text-slate-600'}">
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
					<div class="space-y-12">
						<!-- POPULAR TOOLS SECTION -->
						{#if !searchQuery || filteredPopular.length > 0}
							<section id="category-popular-tools" class="scroll-mt-6">
								<div class="flex items-center gap-2 mb-4">
									<h2 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">
										POPULAR TOOLS
									</h2>
								</div>

								<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
									{#each filteredPopular as tool (tool.href)}
										{@const ToolIcon = tool.icon}
										{@const isEmbedded = !!(EMBEDDED_TOOLS[tool.href] || EMBEDDED_TOOLS[tool.href.split('?')[0]])}
										<button
											type="button"
											onclick={() => openTool(tool.href)}
											class="group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-bg-hover)] hover:shadow-lg shadow-xs transition-all duration-200 w-full text-left"
										>
											<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] group-hover:text-[var(--ttx-accent-text)] group-hover:bg-[var(--ttx-accent-light)] transition-colors">
												<ToolIcon size={18} />
											</div>
											<div class="min-w-0 flex-1">
												<h3 class="text-sm font-medium truncate transition-colors text-[var(--ttx-text-main)] group-hover:text-[var(--ttx-accent-text)]">
													{tool.title}
												</h3>
											</div>
											{#if isEmbedded}
												<div class="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
											{/if}
										</button>
									{/each}
								</div>
							</section>
						{/if}

						<!-- CATEGORIZED TOOLS -->
						{#each Object.entries(groupedTools()) as [category, categoryTools]}
							{@const categoryId = `category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
							<section id={categoryId} class="scroll-mt-6">
								<div class="flex items-center gap-2 mb-4">
									<h2 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">
										{category.toUpperCase()} TOOLS
									</h2>
								</div>

								<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
									{#each categoryTools as tool (tool.href)}
										{@const ToolIcon = tool.icon}
										{@const isEmbedded = !!(EMBEDDED_TOOLS[tool.href] || EMBEDDED_TOOLS[tool.href.split('?')[0]])}
										<button
											type="button"
											onclick={() => openTool(tool.href)}
											class="group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-bg-hover)] hover:shadow-lg shadow-xs transition-all duration-200 w-full text-left"
										>
											<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] group-hover:text-[var(--ttx-accent-text)] group-hover:bg-[var(--ttx-accent-light)] transition-colors">
												<ToolIcon size={18} />
											</div>
											<div class="min-w-0 flex-1">
												<h3 class="text-sm font-medium truncate transition-colors text-[var(--ttx-text-main)] group-hover:text-[var(--ttx-accent-text)]">
													{tool.title}
												</h3>
											</div>
											{#if isEmbedded}
												<div class="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
											{/if}
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
