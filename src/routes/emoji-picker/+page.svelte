<script lang="ts">
	import { onMount } from 'svelte';

	// Menggunakan promise untuk menghindari loading yang blocking
	let emojiDataPromise: Promise<any> | null = null;
	let emojiData: any = null;
	let isLoading = true; // State baru untuk loading

	let categories: string[] = [];
	let selectedCategory = 'people';
	let searchQuery = '';
	let filteredEmojis: any[] = [];
	let selectedEmojis: string[] = [];
	let skinTone = 0;
	let copiedNotif = false;

	const skinToneEmojis = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];

	onMount(() => {
		// Mengimpor data sekali dan menanganinya secara asinkron
		emojiDataPromise = import('@emoji-mart/data')
			.then((data) => {
				emojiData = data.default;
				// Filter kategori yang valid
				categories = Object.keys(emojiData.categories).filter((cat) => cat !== 'recent');
				isLoading = false;
				// Panggil filterEmojis setelah data dimuat
				filterEmojis();
				return data.default;
			})
			.catch((err) => {
				console.error('Failed to load emoji data:', err);
				isLoading = false;
			});
	});

	// Fungsi untuk memfilter emoji
	function filterEmojis() {
		if (isLoading || !emojiData) return;

		let emojis: any[] = [];

		const searchLower = searchQuery.trim().toLowerCase();

		if (searchLower) {
			// Mengoptimalkan pencarian: iterasi melalui kunci emoji lebih cepat
			// daripada array besar, dan hanya dilakukan jika ada query
			Object.keys(emojiData.emojis).forEach((emojiId) => {
				const emoji = emojiData.emojis[emojiId];
				// Menggunakan optional chaining untuk keamanan
				if (
					emoji.name?.toLowerCase().includes(searchLower) ||
					emoji.keywords?.some((k: string) => k.toLowerCase().includes(searchLower))
				) {
					emojis.push({ id: emojiId, ...emoji });
				}
			});
		} else {
			// Mengambil emoji berdasarkan kategori
			const categoryEmojis = emojiData.categories[selectedCategory]?.emojis || [];
			emojis = categoryEmojis.map((id: string) => ({
				id,
				...emojiData.emojis[id]
			}));
		}

		// Batasi hasil pencarian agar tidak terlalu membebani UI (misalnya 500)
		filteredEmojis = emojis.slice(0, 500);
	}

	// Fungsi untuk mendapatkan emoji native dengan skin tone yang benar
	function getEmojiNative(emoji: any): string {
		// Pastikan emoji memiliki skin dan skin tone valid
		if (!emoji || !emoji.skins || emoji.skins.length === 0) return '';

		// Pilih skin berdasarkan skinTone, fallback ke skin pertama (default)
		const skinIndex = Math.min(skinTone, emoji.skins.length - 1);
		const skin = emoji.skins[skinIndex];

		return skin?.native || emoji.skins[0]?.native || '';
	}

	// Menambahkan emoji ke list terpilih
	function addEmoji(emoji: any) {
		const native = getEmojiNative(emoji);
		if (native) {
			selectedEmojis = [...selectedEmojis, native];
		}
	}

	// Menyalin emoji yang terpilih
	function copySelectedEmojis() {
		if (selectedEmojis.length === 0) return;
		const text = selectedEmojis.join('');
		navigator.clipboard.writeText(text);
		copiedNotif = true;
		setTimeout(() => (copiedNotif = false), 1500);
	}

	// Mengosongkan list terpilih
	function clearSelected() {
		selectedEmojis = [];
	}

	// Label kategori yang lebih rapi
	function getCategoryLabel(cat: string) {
		const labels: Record<string, string> = {
			people: '😊 Smileys & People',
			nature: '🐻 Animals & Nature',
			foods: '🍕 Food & Drink',
			activity: '⚽ Activity',
			places: '✈️ Travel & Places',
			objects: '💡 Objects',
			symbols: '❤️ Symbols',
			flags: '🏁 Flags'
		};
		return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
	}

	// Reactive statement: memanggil filterEmojis ketika kategori atau query berubah
	$: (selectedCategory, searchQuery, filterEmojis());
</script>

<svelte:head>
	<title>Emoji Browser - Text Tools</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-3 bg-base-200 p-6 shadow-lg lg:rounded-2xl">
	<div class="border-b bg-base-100 p-4 shadow-md">
		<h1 class="mb-4 text-3xl font-extrabold text-primary">✨ Emoji Explorer</h1>

		<div class="mx-auto mb-4 flex w-full place-content-center items-center gap-3">
			<div class="w-full flex-1">
				<input
					type="text"
					placeholder="Cari emoji (mis: heart, dog)..."
					bind:value={searchQuery}
					class="input-bordered input input-md"
				/>
			</div>
			<div class="join border-base-300 shadow-inner">
				{#each skinToneEmojis as tone, i}
					<button
						class="btn join-item border-2 transition-all duration-150 btn-sm lg:btn-md"
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
			<div class="flex flex-wrap justify-center gap-2 border-t border-base-200 pt-2">
				{#each categories as category}
					<button
						class="btn text-sm font-medium transition-colors btn-md"
						class:btn-primary={selectedCategory === category}
						class:btn-outline={selectedCategory !== category}
						on:click={() => (selectedCategory = category)}
					>
						{getCategoryLabel(category)}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="bg-base-50 flex-1 overflow-y-auto p-4">
		{#if isLoading}
			<div class="flex h-full flex-col items-center justify-center py-20">
				<span class="loading mb-4 loading-lg loading-spinner text-primary"></span>
				<p class="text-xl font-medium text-gray-600">
					Memuat data emoji... (Ini mungkin memakan waktu sebentar)
				</p>
			</div>
		{:else}
			<div
				class="grid grid-cols-8 gap-1 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24"
			>
				{#each filteredEmojis as emoji (emoji.id)}
					<button
						class="tooltip btn aspect-square rounded-lg p-1 text-4xl btn-ghost transition-transform duration-100 hover:bg-base-200 active:scale-95"
						on:click={() => addEmoji(emoji)}
						data-tip={emoji.name}
					>
						{getEmojiNative(emoji)}
					</button>
				{:else}
					<p class="col-span-full text-center text-gray-500 py-12 text-lg">
						😢 Tidak ada emoji yang ditemukan. Coba kata kunci atau kategori lain.
					</p>
				{/each}
			</div>
		{/if}
	</div>

	<div class="sticky bottom-0 border-t bg-base-200 p-4 shadow-lg">
		<div class="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
			<div class="flex-1">
				<div class="flex items-center gap-2">
					<input
						type="text"
						readonly
						value={selectedEmojis.join('')}
						placeholder="Klik emoji untuk ditambahkan..."
						class="input-bordered input flex-1 cursor-text bg-white font-mono focus:outline-none lg:input-md lg:text-lg"
					/>
				</div>
			</div>

			<div class="flex shrink-0 gap-2">
				<button
					class="btn btn-md btn-primary md:w-auto"
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
					class="btn btn-ghost btn-md md:w-auto"
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
					<span>✓ Berhasil disalin ke clipboard!</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	/* Mengatur ukuran font emoji secara konsisten */
	.text-4xl {
		font-size: 2rem; /* Ukuran yang bagus untuk tombol grid */
	}

	/* Memastikan grid emoji terlihat bagus di layar yang sangat kecil */
	@media (max-width: 640px) {
		.grid-cols-8 {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
		.text-4xl {
			font-size: 1.5rem;
		}
	}
</style>
