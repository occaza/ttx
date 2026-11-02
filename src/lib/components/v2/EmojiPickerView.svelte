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

<div class="flex flex-col gap-4 w-full flex-1 h-full min-h-0">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3 shrink-0">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
			>
				<Smile size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
					Emoji Browser & Picker
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Jelajahi ribuan emoji berdasarkan kategori, pilih warna kulit, dan salin ke clipboard
				</p>
			</div>
		</div>

		{#if selectedEmojis.length > 0}
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={copySelectedEmojis}
					class="flex items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[var(--ttx-accent-hover)]"
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
					class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] transition-colors hover:text-rose-500 hover:border-rose-500/40"
				>
					<Trash2 size={13} />
					Hapus
				</button>
			</div>
		{/if}
	</div>

	<!-- Unified Card: toolbar + emoji grid + tray -->
	<div class="flex flex-1 flex-col min-h-0 overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Toolbar: Search + Skin + Categories -->
		<div class="flex flex-col gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-3 shrink-0">
			<!-- Search Input & Skin Selector -->
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
				<div class="relative flex-1">
					<Search
						size={15}
						class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ttx-text-dim)]"
					/>
					<input
						type="text"
						bind:value={searchQuery}
						oninput={onSearchInput}
						placeholder="Cari emoji (mis: heart, fire, flag, coffee, rocket)..."
						class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] pl-9 pr-8 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)]"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={clearSearch}
							class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
						>
							<X size={14} />
						</button>
					{/if}
				</div>

				<!-- Skin Tone Buttons -->
				<div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
					<span class="text-[10px] font-bold uppercase tracking-wider mr-1 text-[var(--ttx-text-dim)]">
						Warna Kulit:
					</span>
					{#each SKIN_TONES as tone, i}
						<button
							type="button"
							onclick={() => (skinTone = i)}
							title={SKIN_LABELS[i]}
							class="flex h-7 w-7 items-center justify-center rounded-md border text-sm transition-all {skinTone === i
								? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent)]/20 shadow-xs'
								: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:border-[var(--ttx-border-focus)]'}"
						>
							{i === 0 ? '✋' : tone}
						</button>
					{/each}
				</div>
			</div>

			<!-- Category Tabs -->
			{#if !searchQuery.trim() && !isLoading}
				<div class="flex flex-wrap items-center gap-1.5">
					{#each categories as cat}
						<button
							type="button"
							onclick={() => selectCategory(cat)}
							title={CATEGORY_LABELS[cat] ?? cat}
							class="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all {selectedCategory === cat
								? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent)] text-white shadow-xs'
								: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]'}"
						>
							<span class="text-sm">{getCategoryIcon(cat)}</span>
							<span>{CATEGORY_LABELS[cat] ?? cat}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Emoji Grid Area -->
		<div class="flex-1 min-h-0 overflow-y-auto p-4 bg-[var(--ttx-bg-card)] custom-scrollbar">
			{#if isLoading}
				<div class="flex h-64 flex-col items-center justify-center gap-3">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ttx-accent)] border-t-transparent"></div>
					<p class="text-xs text-[var(--ttx-text-muted)]">Memuat database emoji...</p>
				</div>
			{:else if loadError}
				<div class="flex h-64 flex-col items-center justify-center">
					<p class="text-xs text-rose-400">Gagal memuat database emoji.</p>
				</div>
			{:else if filteredEmojis.length === 0}
				<div class="flex h-64 flex-col items-center justify-center">
					<Smile size={32} class="opacity-30 mb-2" />
					<p class="text-xs text-[var(--ttx-text-dim)]">
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
								class="flex aspect-square items-center justify-center rounded-lg border border-transparent text-xl transition-all duration-100 active:scale-90 bg-[var(--ttx-bg-card-subtle)]/40 hover:bg-[var(--ttx-accent-light)] hover:border-[var(--ttx-border-subtle)]"
							>
								{native}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Selected Emojis Tray -->
		<div class="flex items-center gap-3 border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-3 shrink-0">
			<div class="relative flex-1">
				<input
					type="text"
					readonly
					value={selectedEmojis.join('')}
					placeholder="Klik emoji di atas untuk memasukkannya ke sini..."
					class="h-10 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-3 text-base tracking-wider text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none"
				/>
				{#if selectedEmojis.length > 0}
					<span
						class="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-[var(--ttx-accent)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--ttx-accent-text)]"
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
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] transition-colors hover:text-[var(--ttx-text-main)] disabled:opacity-30 disabled:pointer-events-none"
			>
				⌫
			</button>

			<button
				type="button"
				onclick={clearSelected}
				disabled={selectedEmojis.length === 0}
				title="Hapus semua pilihan"
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-30 disabled:pointer-events-none"
			>
				<Trash2 size={15} />
			</button>

			<button
				type="button"
				onclick={copySelectedEmojis}
				disabled={selectedEmojis.length === 0}
				class="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[var(--ttx-accent-hover)] disabled:opacity-30 disabled:pointer-events-none"
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
</div>
