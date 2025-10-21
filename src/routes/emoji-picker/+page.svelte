<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let emojiData: any = null;
	let isLoading = true;

	let categories: string[] = [];
	let selectedCategory = 'people';
	let searchQuery = '';
	let filteredEmojis: any[] = [];
	let selectedEmojis: string[] = [];
	let skinTone = 0;
	let copiedNotif = false;
	const skinToneEmojis = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];

	onMount(async () => {
		try {
			const data = await import('@emoji-mart/data');
			emojiData = data.default;

			if (emojiData && emojiData.categories) {
				categories = Object.keys(emojiData.categories).filter((cat) => cat !== 'recent');
			}

			// Load emoji kategori default setelah data dimuat
			loadCategoryEmojis(selectedCategory);
			isLoading = false;
		} catch (err) {
			console.error('Failed to load emoji data:', err);
			isLoading = false;
		}
	});

	function loadCategoryEmojis(category: string) {
		if (!emojiData || !emojiData.categories || !emojiData.emojis) {
			return;
		}

		const categoryData = emojiData.categories[category];

		if (!categoryData || !categoryData.emojis) {
			filteredEmojis = [];
			return;
		}

		const emojiIds = categoryData.emojis;

		filteredEmojis = emojiIds
			.map((id: string) => {
				const emoji = emojiData.emojis[id];
				if (!emoji) return null;
				return { id, ...emoji };
			})
			.filter((e: any) => e !== null)
			.slice(0, 500);
	}

	function filterEmojis() {
		if (isLoading || !emojiData) return;

		if (searchQuery.trim()) {
			// Search mode
			const searchLower = searchQuery.trim().toLowerCase();
			const results: any[] = [];

			Object.keys(emojiData.emojis).forEach((emojiId) => {
				const emoji = emojiData.emojis[emojiId];
				if (
					emoji.name?.toLowerCase().includes(searchLower) ||
					emoji.keywords?.some((k: string) => k.toLowerCase().includes(searchLower))
				) {
					results.push({ id: emojiId, ...emoji });
				}
			});
			filteredEmojis = results.slice(0, 500);
		} else {
			// Category mode
			loadCategoryEmojis(selectedCategory);
		}
	}

	function clearSearch() {
		searchQuery = '';
	}

	function getEmojiNative(emoji: any): string {
		if (!emoji || !emoji.skins || emoji.skins.length === 0) {
			return '';
		}
		const skinIndex = Math.min(skinTone, emoji.skins.length - 1);
		const skin = emoji.skins[skinIndex];
		return skin?.native || emoji.skins[0]?.native || '';
	}

	function addEmoji(emoji: any) {
		const native = getEmojiNative(emoji);
		if (native) {
			selectedEmojis = [...selectedEmojis, native];
		}
	}

	function copySelectedEmojis() {
		if (selectedEmojis.length === 0) return;
		const text = selectedEmojis.join('');
		navigator.clipboard.writeText(text);
		copiedNotif = true;
		setTimeout(() => (copiedNotif = false), 1500);
	}

	function clearSelected() {
		selectedEmojis = [];
	}

	function getCategoryEmoji(cat: string): string {
		if (!emojiData) return '?';
		const categoryEmojis = emojiData.categories[cat]?.emojis || [];
		if (categoryEmojis.length === 0) return '?';
		const firstEmojiId = categoryEmojis[0];
		const emoji = emojiData.emojis[firstEmojiId];
		return emoji?.skins?.[0]?.native || '?';
	}

	function getCategoryLabel(cat: string) {
		const labels: Record<string, string> = {
			people: 'Smileys & People',
			nature: 'Animals & Nature',
			foods: 'Food & Drink',
			activity: 'Activity',
			places: 'Travel & Places',
			objects: 'Objects',
			symbols: 'Symbols',
			flags: 'Flags'
		};
		return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
	}

	$: if (!isLoading && emojiData) {
		selectedCategory;
		searchQuery;
		skinTone;
		filterEmojis();
	}
</script>

<svelte:head>
	<title>Emoji Browser - Text Tools</title>
</svelte:head>

<div
	class="mx-auto flex max-w-5xl flex-col bg-base-100 shadow-lg lg:rounded-lg"
	style="height: calc(100vh - 2rem);"
>
	<div class="sticky top-0 z-10 rounded-t-lg border-b bg-base-200 p-4 shadow-md">
		<div class="pb-5">
			<h2 class="text-lg font-bold text-primary">Emoji Explorer</h2>
			<p class="text-sm text-gray-600">Jelajahi dan salin emoji dengan mudah.</p>
		</div>

		<div class="mx-auto mb-4 flex w-full place-content-center items-center gap-3">
			<div class="relative w-full flex-1">
				<input
					type="text"
					placeholder="Cari emoji (mis: heart, dog)..."
					bind:value={searchQuery}
					class="input-bordered input input-md w-full rounded-sm pr-10"
				/>
				{#if searchQuery}
					<button
						on:click={clearSearch}
						class="btn absolute top-1/2 right-2 btn-circle -translate-y-1/2 btn-ghost btn-xs"
						title="Hapus pencarian"
					>
						✕
					</button>
				{/if}
			</div>
			<div class="join border-base-300 shadow-inner">
				{#each skinToneEmojis as tone, i}
					<button
						class="btn join-item rounded-sm border-2 transition-all duration-150 btn-sm lg:btn-md"
						class:btn-active={skinTone === i}
						class:text-primary={skinTone === i}
						class:btn-ghost={skinTone !== i}
						on:click={() => (skinTone = i)}
						title={i === 0 ? 'Default Skin Tone' : `Skin Tone ${i}`}
					>
						{#if i === 0}
							<span class="text-base">Default</span>
						{:else}
							👋{tone}
						{/if}
					</button>
				{/each}
			</div>
		</div>

		{#if !searchQuery.trim() && !isLoading}
			<div class="flex flex-wrap justify-center gap-2 border-t border-base-300 pt-3">
				{#each categories as category}
					<button
						class="btn aspect-square rounded-sm text-2xl transition-colors btn-md"
						class:btn-primary={selectedCategory === category}
						class:btn-outline={selectedCategory !== category}
						on:click={() => (selectedCategory = category)}
						title={getCategoryLabel(category)}
					>
						{getCategoryEmoji(category)}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex-1 overflow-y-auto p-4">
		{#if isLoading}
			<div class="flex h-full flex-col items-center justify-center py-20">
				<span class="loading mb-4 loading-lg loading-spinner text-primary"></span>
				<p class="text-xl font-medium text-gray-600">Memuat data emoji...</p>
			</div>
		{:else if filteredEmojis.length > 0}
			<div
				class="grid grid-cols-8 gap-1 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24"
			>
				{#each filteredEmojis as emoji (emoji.id)}
					<button
						class="tooltip btn aspect-square rounded-sm p-1 text-4xl btn-ghost transition-transform duration-100 hover:bg-base-200 active:scale-95"
						on:click={() => addEmoji(emoji)}
						data-tip={emoji.name}
					>
						{getEmojiNative(emoji)}
					</button>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center">
				<p class="text-lg text-gray-500">😢 Tidak ada emoji yang ditemukan.</p>
			</div>
		{/if}
	</div>

	<div class="sticky bottom-0 rounded-b-lg border-t bg-base-100 p-4 shadow-lg">
		<div class="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
			<p class="mb-1 text-sm font-medium text-gray-700">Emoji Terpilih:</p>
			<div class="flex-1">
				<div class="flex items-center gap-2">
					<input
						type="text"
						readonly
						value={selectedEmojis.join('')}
						placeholder="Klik emoji untuk ditambahkan..."
						class="input-bordered input flex-1 cursor-text rounded-sm bg-white font-mono focus:outline-none lg:input-md lg:text-lg"
					/>
				</div>
			</div>

			<div class="flex shrink-0 gap-2">
				<button
					class="btn rounded-sm btn-md btn-primary md:w-auto"
					on:click={copySelectedEmojis}
					disabled={selectedEmojis.length === 0}
				>
					{#if copiedNotif}
						<span class="flex items-center gap-1">✅ Disalin!</span>
					{:else}
						<span class="flex items-center gap-1">📋 Salin ({selectedEmojis.length})</span>
					{/if}
				</button>
				<button
					class="btn rounded-sm btn-ghost btn-md md:w-auto"
					on:click={clearSelected}
					disabled={selectedEmojis.length === 0}
				>
					Hapus Semua
				</button>
			</div>
		</div>
	</div>

	{#if copiedNotif}
		<div class="toast-top toast-end toast z-50">
			<div class="alert alert-success shadow-lg">
				<div>
					<span>✔ Berhasil disalin ke clipboard!</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.text-4xl {
		font-size: 2rem;
	}

	@media (max-width: 640px) {
		.grid-cols-8 {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
		.text-4xl {
			font-size: 1.5rem;
		}
	}
</style>
