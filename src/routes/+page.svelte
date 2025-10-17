<script>
	import ToolCard from '$lib/components/ToolCard.svelte';
	import Hero from '$lib/components/Hero.svelte';
</script>

<Hero />
<main class="relative min-h-screen pt-32 pb-32 md:pt-28 md:pb-40">
	<!-- Tools Grid -->
	<div class="relative mx-auto max-w-7xl px-4">
		<!-- Section header -->
		<div class="mb-8 text-center">
			<h2 class="mb-2 text-3xl font-bold text-base-content">Choose Your Tool</h2>
			<div
				class="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
			></div>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<ToolCard
				title="Remove Duplicate Lines"
				desc="Hapus baris duplikat dari teks Anda dengan cepat dan mudah"
				href="/text-tools/remove-duplicate-lines"
			/>
			<ToolCard
				title="Add Prefix/Suffix"
				desc="Tambahkan prefix atau suffix di setiap baris text secara otomatis"
				href="/text-tools/add-prefixsuffix-into-line"
			/>
			<ToolCard
				title="Split File"
				desc="Pecah file teks besar menjadi beberapa file kecil"
				href="/text-tools/split-files"
			/>
			<ToolCard
				title="Random Number Generator"
				desc="Generate angka acak dengan custom range dan jumlah"
				href="/text-tools/random-number-generator"
			/>
			<ToolCard
				title="Line Counter"
				desc="Hitung jumlah baris dan karakter dalam teks Anda"
				href="/text-tools/lines-counter"
			/>
			<ToolCard
				title="File Comparison"
				desc="Bandingkan dua file dan temukan perbedaannya"
				href="/text-tools/files-comparation"
			/>
			<ToolCard
				title="Online Notepad"
				desc="Catatan online yang bisa dibuka di browser manapun"
				href="/notepad"
			/>
			<ToolCard
				title="Caption Formatter"
				desc="Beautify your Instagram captions dengan format yang menarik"
				href="/text-tools/captions-formatter"
			/>
			<ToolCard
				title="Emoji Browser"
				desc="Browse, search, dan copy emoji dengan skin tone support"
				href="/emoji-picker"
			/>
			<ToolCard
				title="Split by Delimiter"
				desc="Pisahkan teks berdasarkan delimiter yang Anda tentukan"
				href="/text-tools/split-random-delimiter"
			/>
		</div>
	</div>

	<!-- Features Section -->
	<div class="relative mx-auto mt-24 max-w-6xl px-4">
		<div class="m-10 pb-10 text-center text-3xl font-bold">Features</div>
		<div class="grid gap-8 md:grid-cols-3">
			<div
				class="group rounded-2xl border border-white/20 bg-gradient-to-br from-white/25 via-white/15 to-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-500"
			>
				<div class="mb-4 inline-block rounded-xl bg-primary/20 p-3">
					<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-bold">Lightning Fast</h3>
				<p class="text-base-content/70">Process your text instantly with optimized algorithms</p>
			</div>

			<div
				class="group rounded-2xl border border-white/20 bg-gradient-to-br from-white/25 via-white/15 to-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-500"
			>
				<div class="mb-4 inline-block rounded-xl bg-accent/20 p-3">
					<svg class="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-bold">100% Private</h3>
				<p class="text-base-content/70">
					All processing happens in your browser. We don't store anything
				</p>
			</div>

			<div
				class="group rounded-2xl border border-white/20 bg-gradient-to-br from-white/25 via-white/15 to-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-500"
			>
				<div class="mb-4 inline-block rounded-xl bg-secondary/20 p-3">
					<svg class="h-8 w-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-bold">Easy to Use</h3>
				<p class="text-base-content/70">Simple interface designed for everyone</p>
			</div>
		</div>
	</div>
</main>
