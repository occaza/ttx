<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ArrowLeft, Search, X, Copy, Trash2, Smile, Check } from '@lucide/svelte';

	// ── State ──────────────────────────────────────────────────────────────────
	let emojiData = $state<any>(null);
	let isLoading = $state(true);
	let loadError = $state(false);

	let categories = $state<string[]>([]);
	let selectedCategory = $state('people');
	let searchQuery = $state('');
	let filteredEmojis = $state<any[]>([]);
	let selectedEmojis = $state<string[]>([]);
	let skinTone = $state(0);
	let copiedNotif = $state(false);
	let searchDebounce: ReturnType<typeof setTimeout>;

	const SKIN_TONES = ['🫱', '🫱🏻', '🫱🏼', '🫱🏽', '🫱🏾', '🫱🏿'];
	const SKIN_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];

	// Map fallback: ID emoji per kategori dari @emoji-mart/data
	const CATEGORY_FIRST_EMOJI: Record<string, string> = {
		people: 'grinning',
		nature: 'dog',
		foods: 'apple',
		activity: 'soccer',
		places: 'airplane',
		objects: 'bulb',
		symbols: 'heart',
		flags: 'flag-white'
	};

	function getCategoryIcon(cat: string): string {
		if (!emojiData) return '';
		// Ambil emoji pertama dari kategori berdasarkan data
		const ids: string[] = emojiData.categories[cat]?.emojis ?? [];
		const firstId = ids[0] ?? CATEGORY_FIRST_EMOJI[cat];
		if (!firstId) return '';
		const e = emojiData.emojis[firstId];
		return e?.skins?.[0]?.native ?? '';
	}

	const CATEGORY_LABELS: Record<string, string> = {
		people: 'Smileys & People',
		nature: 'Animals & Nature',
		foods: 'Food & Drink',
		activity: 'Activity',
		places: 'Travel & Places',
		objects: 'Objects',
		symbols: 'Symbols',
		flags: 'Flags'
	};

	// ── Load data ──────────────────────────────────────────────────────────────
	onMount(async () => {
		try {
			const mod = await import('@emoji-mart/data');
			emojiData = (mod as any).default;
			categories = Object.keys(emojiData.categories).filter((c) => c !== 'recent');
			isLoading = false;
			loadCategory(selectedCategory);
		} catch (err) {
			console.error('Failed to load emoji data:', err);
			isLoading = false;
			loadError = true;
		}
	});

	// ── Functions ──────────────────────────────────────────────────────────────
	function loadCategory(cat: string) {
		if (!emojiData) return;
		const ids: string[] = emojiData.categories[cat]?.emojis ?? [];
		filteredEmojis = ids
			.map((id: string) => {
				const e = emojiData.emojis[id];
				return e ? { id, ...e } : null;
			})
			.filter(Boolean);
	}

	function runSearch() {
		if (!emojiData) return;
		const q = searchQuery.trim().toLowerCase();
		if (!q) {
			loadCategory(selectedCategory);
			return;
		}
		const results: any[] = [];
		for (const id of Object.keys(emojiData.emojis)) {
			const e = emojiData.emojis[id];
			if (
				e.name?.toLowerCase().includes(q) ||
				e.keywords?.some((k: string) => k.toLowerCase().includes(q))
			) {
				results.push({ id, ...e });
				if (results.length >= 200) break;
			}
		}
		filteredEmojis = results;
	}

	function onSearchInput() {
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(runSearch, 250);
	}

	function clearSearch() {
		searchQuery = '';
		loadCategory(selectedCategory);
	}

	function selectCategory(cat: string) {
		selectedCategory = cat;
		searchQuery = '';
		loadCategory(cat);
	}

	function getEmojiNative(emoji: any): string {
		if (!emoji?.skins?.length) return '';
		const idx = Math.min(skinTone, emoji.skins.length - 1);
		return emoji.skins[idx]?.native ?? emoji.skins[0]?.native ?? '';
	}

	function addEmoji(emoji: any) {
		const native = getEmojiNative(emoji);
		if (native) selectedEmojis = [...selectedEmojis, native];
	}

	function removeLastEmoji() {
		if (selectedEmojis.length > 0) selectedEmojis = selectedEmojis.slice(0, -1);
	}

	function copySelectedEmojis() {
		if (!selectedEmojis.length) return;
		navigator.clipboard.writeText(selectedEmojis.join(''));
		copiedNotif = true;
		setTimeout(() => (copiedNotif = false), 1800);
	}

	function clearSelected() {
		selectedEmojis = [];
	}

	// Re-render when skin tone changes without full reload
	function changeSkin(i: number) {
		skinTone = i;
	}
</script>

<svelte:head>
	<title>Emoji Browser - TEXY Workspace</title>
	<meta name="description" content="Jelajahi dan copy emoji dengan mudah. Filter berdasarkan kategori, cari nama emoji, pilih skin tone, lalu salin semuanya sekaligus." />
	<meta name="keywords" content="emoji picker, copy emoji, emoji browser, instagram emoji, emoji list" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/emoji-picker" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" />
</svelte:head>



<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Grid Background -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 flex flex-col" style="height: calc(100vh - 4rem);">

		<!-- Header -->
		<div class="mb-6 flex-shrink-0">
			<a href="/" class="mb-4 inline-flex items-center text-sm font-medium text-base-content/40 hover:text-base-content transition-colors">
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center justify-between flex-wrap gap-4">
				<div class="flex items-center gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-2xl shadow-sm">
						😀
					</div>
					<div>
						<h1 class="text-3xl font-extrabold tracking-tight">Emoji Browser</h1>
						<p class="mt-1 text-sm text-base-content/50">Pilih dan salin emoji ke clipboard dengan mudah.</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Panel -->
		<div class="flex-1 flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md overflow-hidden min-h-0">

			<!-- Top Bar: Search + Skin Tones -->
			<div class="flex-shrink-0 border-b border-base-content/10 bg-base-200/30 px-4 py-3 space-y-3">
				<!-- Search -->
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search size={16} class="text-base-content/40" />
					</div>
					<input
						type="text"
						placeholder="Cari emoji (mis: heart, flag, fire)..."
						bind:value={searchQuery}
						oninput={onSearchInput}
						class="w-full h-10 pl-9 pr-10 rounded-xl bg-base-100 border border-base-content/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
					/>
					{#if searchQuery}
						<button
							onclick={clearSearch}
							class="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content transition-colors"
						>
							<X size={16} />
						</button>
					{/if}
				</div>

				<!-- Skin Tone Selector -->
				<div class="flex items-center gap-2 flex-wrap">
					<span class="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mr-1">Skin</span>
					{#each SKIN_TONES as tone, i}
						<button
							onclick={() => changeSkin(i)}
							title={SKIN_LABELS[i]}
							class="h-8 w-8 rounded-lg text-base flex items-center justify-center border transition-all
								{skinTone === i
									? 'border-primary bg-primary/10 shadow-sm'
									: 'border-base-content/10 bg-base-200/40 hover:bg-base-200'}"
							style="font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;"
						>
							{i === 0 ? '✋' : tone}
						</button>
					{/each}
				</div>

				<!-- Category Tabs (only when not searching) -->
				{#if !searchQuery.trim() && !isLoading}
					<div class="flex gap-1.5 flex-wrap">
						{#each categories as cat}
							<button
								onclick={() => selectCategory(cat)}
								title={CATEGORY_LABELS[cat] ?? cat}
								class="h-9 px-3 rounded-lg text-base flex items-center gap-1.5 border text-sm font-medium transition-all
									{selectedCategory === cat
										? 'border-primary bg-primary text-primary-content shadow-sm'
										: 'border-base-content/10 bg-base-200/40 hover:bg-base-200 text-base-content/70'}"
								style="font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;"
							>
								<span class="text-base">{getCategoryIcon(cat)}</span>
								<span class="hidden sm:inline text-xs">{CATEGORY_LABELS[cat] ?? cat}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Emoji Grid -->
			<div class="flex-1 overflow-y-auto p-4 min-h-0">
				{#if isLoading}
					<div class="flex h-full flex-col items-center justify-center py-20 text-base-content/40">
						<span class="loading loading-spinner loading-lg mb-4 text-primary"></span>
						<p class="text-sm font-medium">Memuat data emoji...</p>
					</div>
				{:else if loadError}
					<div class="flex h-full flex-col items-center justify-center py-20 text-base-content/40">
						<p class="text-sm">Gagal memuat data emoji. Coba refresh halaman.</p>
					</div>
				{:else if filteredEmojis.length === 0}
					<div class="flex h-full flex-col items-center justify-center py-20 text-base-content/30">
						<Smile size={48} strokeWidth={1} class="mb-4 opacity-40" />
						<p class="text-sm font-medium">Tidak ada emoji ditemukan untuk "{searchQuery}"</p>
					</div>
				{:else}
					<div class="grid gap-0.5"
						style="grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));"
					>
						{#each filteredEmojis as emoji (emoji.id)}
							{@const native = getEmojiNative(emoji)}
							{#if native}
								<button
									onclick={() => addEmoji(emoji)}
									title={emoji.name}
									class="flex items-center justify-center rounded-lg hover:bg-base-200 active:scale-90 transition-all duration-100 aspect-square"
									style="font-size: 1.6rem; font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; line-height: 1;"
								>
									{native}
								</button>
							{/if}
						{/each}
					</div>
				{/if}
			</div>

			<!-- Bottom Bar: Selection & Actions -->
			<div class="flex-shrink-0 border-t border-base-content/10 bg-base-200/20 px-4 py-3">
				<div class="flex items-center gap-3">
					<div class="flex-1 relative">
						<input
							type="text"
							readonly
							value={selectedEmojis.join('')}
							placeholder="Klik emoji untuk ditambahkan..."
							class="w-full h-11 px-4 rounded-xl bg-base-100 border border-base-content/10 text-lg font-mono focus:outline-none cursor-default tracking-wider"
							style="font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;"
						/>
						{#if selectedEmojis.length > 0}
							<span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-content/30 uppercase tracking-widest">
								{selectedEmojis.length}
							</span>
						{/if}
					</div>

					<button
						onclick={removeLastEmoji}
						disabled={selectedEmojis.length === 0}
						class="btn btn-sm h-11 w-11 rounded-xl border border-base-content/10 bg-base-100 hover:bg-base-200 disabled:opacity-30 transition-colors p-0 min-w-0"
						title="Hapus satu"
					>
						⌫
					</button>

					<button
						onclick={clearSelected}
						disabled={selectedEmojis.length === 0}
						class="btn btn-sm h-11 w-11 rounded-xl border border-base-content/10 bg-base-100 hover:bg-error/10 hover:border-error/30 hover:text-error disabled:opacity-30 transition-colors p-0 min-w-0"
						title="Hapus semua"
					>
						<Trash2 size={16} />
					</button>

					<button
						onclick={copySelectedEmojis}
						disabled={selectedEmojis.length === 0}
						class="btn btn-sm h-11 px-5 rounded-xl font-bold shadow-sm gap-2 transition-all
							{copiedNotif
								? 'bg-success text-success-content border-success hover:bg-success'
								: 'btn-primary disabled:opacity-30'}"
					>
						{#if copiedNotif}
							<Check size={16} /> Copied!
						{:else}
							<Copy size={16} /> Copy ({selectedEmojis.length})
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
