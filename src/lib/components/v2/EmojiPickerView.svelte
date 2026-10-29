<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Smile,
		Search,
		X,
		Copy,
		Check,
		Trash2,
		Delete
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let emojiData = $state<any>(null);
	let isLoading = $state(true);
	let loadError = $state(false);

	let categories = $state<string[]>([]);
	let selectedCategory = $state('people');
	let searchQuery = $state('');
	let filteredEmojis = $state<any[]>([]);
	let selectedEmojis = $state<string[]>([]);
	let skinTone = $state(0);
	let copied = $state(false);
	let searchDebounce: ReturnType<typeof setTimeout>;

	const SKIN_TONES = ['🫱', '🫱🏻', '🫱🏼', '🫱🏽', '🫱🏾', '🫱🏿'];
	const SKIN_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];

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

	function getCategoryIcon(cat: string): string {
		if (!emojiData) return '';
		const ids: string[] = emojiData.categories[cat]?.emojis ?? [];
		const firstId = ids[0] ?? CATEGORY_FIRST_EMOJI[cat];
		if (!firstId) return '';
		const e = emojiData.emojis[firstId];
		return e?.skins?.[0]?.native ?? '';
	}

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
				if (results.length >= 250) break;
			}
		}
		filteredEmojis = results;
	}

	function onSearchInput() {
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(runSearch, 200);
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
		if (native) {
			selectedEmojis = [...selectedEmojis, native];
		}
	}

	function removeLastEmoji() {
		if (selectedEmojis.length > 0) {
			selectedEmojis = selectedEmojis.slice(0, -1);
		}
	}

	function clearSelected() {
		selectedEmojis = [];
	}

	async function copySelectedEmojis() {
		if (!selectedEmojis.length) return;
		await navigator.clipboard.writeText(selectedEmojis.join(''));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex flex-col gap-5 w-full">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
					: 'border-blue-200 bg-blue-50 text-blue-600'}"
			>
				<Smile size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
					Emoji Browser & Picker
				</h1>
				<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
					Jelajahi ribuan emoji berdasarkan kategori, pilih warna kulit, dan salin ke clipboard
				</p>
			</div>
		</div>

		{#if selectedEmojis.length > 0}
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={copySelectedEmojis}
					class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-500"
				>
					{#if copied}
						<Check size={13} />
						Tersalin!
					{:else}
						<Copy size={13} />
						Salin ({selectedEmojis.length})
					{/if}
				</button>
				<button
					type="button"
					onclick={clearSelected}
					class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
						: 'border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200'}"
				>
					<Trash2 size={13} />
					Hapus
				</button>
			</div>
		{/if}
	</div>

	<!-- Main Filter & Search Container -->
	<div
		class="space-y-3 rounded-xl border p-4 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<!-- Search Input & Skin Selector -->
		<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
			<div class="relative flex-1">
				<Search
					size={15}
					class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					oninput={onSearchInput}
					placeholder="Cari emoji (mis: heart, fire, flag, coffee, rocket)..."
					class="h-9 w-full rounded-lg pl-9 pr-8 text-xs outline-none transition-all {isDark
						? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={clearSearch}
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
					>
						<X size={14} />
					</button>
				{/if}
			</div>

			<!-- Skin Tone Buttons -->
			<div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
				<span class="text-[10px] font-bold uppercase tracking-wider mr-1 {isDark ? 'text-slate-500' : 'text-slate-400'}">
					Warna Kulit:
				</span>
				{#each SKIN_TONES as tone, i}
					<button
						type="button"
						onclick={() => (skinTone = i)}
						title={SKIN_LABELS[i]}
						class="flex h-7 w-7 items-center justify-center rounded-md border text-sm transition-all {skinTone === i
							? 'border-blue-500 bg-blue-500/20 shadow-xs'
							: isDark
								? 'border-[#1e2e50] bg-[#111a2f] hover:bg-[#16223b]'
								: 'border-slate-200 bg-slate-50 hover:bg-slate-100'}"
					>
						{i === 0 ? '✋' : tone}
					</button>
				{/each}
			</div>
		</div>

		<!-- Category Tabs -->
		{#if !searchQuery.trim() && !isLoading}
			<div class="flex flex-wrap items-center gap-1.5 pt-1">
				{#each categories as cat}
					<button
						type="button"
						onclick={() => selectCategory(cat)}
						title={CATEGORY_LABELS[cat] ?? cat}
						class="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all {selectedCategory === cat
							? 'border-blue-500 bg-blue-600 text-white shadow-xs'
							: isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:border-slate-600'
								: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}"
					>
						<span class="text-sm">{getCategoryIcon(cat)}</span>
						<span>{CATEGORY_LABELS[cat] ?? cat}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Emoji Grid Area -->
	<div
		class="min-h-[380px] max-h-[520px] overflow-y-auto rounded-xl border p-4 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		{#if isLoading}
			<div class="flex h-64 flex-col items-center justify-center gap-3">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}">Memuat database emoji...</p>
			</div>
		{:else if loadError}
			<div class="flex h-64 flex-col items-center justify-center">
				<p class="text-xs text-rose-400">Gagal memuat database emoji.</p>
			</div>
		{:else if filteredEmojis.length === 0}
			<div class="flex h-64 flex-col items-center justify-center">
				<Smile size={32} class="opacity-30 mb-2" />
				<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-400'}">
					Tidak ada emoji ditemukan untuk "{searchQuery}"
				</p>
			</div>
		{:else}
			<div
				class="grid gap-1.5"
				style="grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));"
			>
				{#each filteredEmojis as emoji (emoji.id)}
					{@const native = getEmojiNative(emoji)}
					{#if native}
						<button
							type="button"
							onclick={() => addEmoji(emoji)}
							title={emoji.name}
							class="flex aspect-square items-center justify-center rounded-lg border text-xl transition-all duration-100 active:scale-90 {isDark
								? 'border-transparent bg-[#111a2f]/40 hover:bg-[#16223b] hover:border-[#1e2e50]'
								: 'border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}"
						>
							{native}
						</button>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<!-- Selected Emojis Tray -->
	<div
		class="flex items-center gap-3 rounded-xl border p-3.5 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<div class="relative flex-1">
			<input
				type="text"
				readonly
				value={selectedEmojis.join('')}
				placeholder="Klik emoji di atas untuk memasukkannya ke sini..."
				class="h-10 w-full rounded-lg border px-3 text-base tracking-wider outline-none {isDark
					? 'border-[#1e2e50] bg-[#080d1a] text-slate-100 placeholder-slate-500'
					: 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'}"
			/>
			{#if selectedEmojis.length > 0}
				<span
					class="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400"
				>
					{selectedEmojis.length}
				</span>
			{/if}
		</div>

		<button
			type="button"
			onclick={removeLastEmoji}
			disabled={selectedEmojis.length === 0}
			title="Hapus satu emoji terakhir"
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 disabled:pointer-events-none {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
				: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
		>
			⌫
		</button>

		<button
			type="button"
			onclick={clearSelected}
			disabled={selectedEmojis.length === 0}
			title="Hapus semua pilihan"
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 disabled:pointer-events-none {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
				: 'border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200'}"
		>
			<Trash2 size={15} />
		</button>

		<button
			type="button"
			onclick={copySelectedEmojis}
			disabled={selectedEmojis.length === 0}
			class="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none"
		>
			{#if copied}
				<Check size={14} />
				Tersalin
			{:else}
				<Copy size={14} />
				Salin ({selectedEmojis.length})
			{/if}
		</button>
	</div>
</div>

