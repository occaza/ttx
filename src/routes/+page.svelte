<script>
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	const features = [
		{ icon: '⚡', text: 'Proses Instan', desc: 'Hasil langsung tanpa loading' },
		{ icon: '🔒', text: 'Data Aman', desc: 'Semua proses di browser Anda' },
		{ icon: '📱', text: 'Mobile Friendly', desc: 'Bisa dipakai di HP' },
		{ icon: '💯', text: 'Tanpa Batas', desc: 'Pakai sepuasnya gratis' }
	];
</script>

<div class="hero-section mb-12 px-4">
	<div class="space-y-6 text-center {mounted ? 'fade-in' : 'opacity-0'}">
		<div class="inline-block">
			<div class="animate-bounce-slow mb-4 text-6xl">🛠️</div>
		</div>
		<h1
			class="animate-text-shimmer bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-7xl"
		>
			TEXY
		</h1>
		<p class="mx-auto max-w-2xl text-xl leading-relaxed text-base-content/80 md:text-2xl">
			Kumpulan tools untuk memudahkan pekerjaan Anda. Semua gratis dan bisa digunakan tanpa login.
		</p>

		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<span class="badge gap-2 badge-lg badge-primary">
				<span class="text-lg">✓</span> 10+ Tools
			</span>
			<span class="badge gap-2 badge-lg badge-secondary">
				<span class="text-lg">🎉</span> Gratis Selamanya
			</span>
			<span class="badge gap-2 badge-lg badge-accent">
				<span class="text-lg">🚀</span> No Sign Up
			</span>
		</div>
	</div>
</div>

<div class="features-grid mb-16 px-4 {mounted ? 'fade-in-delayed' : 'opacity-0'}">
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-3xl font-bold text-base-content md:text-4xl">Kenapa harus TEXY?</h2>
		<p class="text-base-content/70">Tools sederhana yang bekerja cepat</p>
	</div>
	<div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each features as feature}
			<div
				class="card border border-base-300 bg-base-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
			>
				<div class="card-body items-center p-6 text-center">
					<div class="mb-3 text-5xl">{feature.icon}</div>
					<h3 class="mb-2 text-lg font-bold text-base-content">{feature.text}</h3>
					<p class="text-sm text-base-content/70">{feature.desc}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<div class="tools-section mb-16 px-4">
	<div class="mb-8 text-center {mounted ? 'fade-in-more-delayed' : 'opacity-0'}">
		<h2 class="mb-2 text-3xl font-bold text-base-content md:text-4xl">Pilih Tools</h2>
		<p class="text-base-content/70">Klik untuk mulai menggunakan</p>
	</div>

	<div class="m-2 mx-auto grid w-fit grid-cols-1 gap-4 md:m-4 md:grid-cols-2 lg:grid-cols-4">
		<ToolCard
			title="Remove Duplicate Lines"
			desc="Hapus baris duplikat dari teks Anda"
			href="/text-tools/remove-duplicate-lines"
		/>
		<ToolCard
			title="Add Prefix/Suffix into Line"
			desc="Tambahkan prefix atau suffix di baris text"
			href="/text-tools/add-prefixsuffix-into-line"
		/>
		<ToolCard
			title="Split File"
			desc="Pecah teks menjadi beberapa file"
			href="/text-tools/split-files"
		/>
		<ToolCard
			title="Random Number Generator"
			desc="Buat angka acak"
			href="/text-tools/random-number-generator"
		/>
		<ToolCard title="Line Counter" desc="Hitung jumlah line" href="/text-tools/lines-counter" />
		<ToolCard
			title="File Comparation"
			desc="Bandingkan file dan cek duplikat"
			href="/text-tools/files-comparation"
		/>
		<ToolCard
			title="Shared Notepad"
			desc="Catatan online bisa dibuka di browser lain"
			href="/notepad"
		/>
		<ToolCard
			title="Caption Formater"
			desc="Beautify your instagram captions"
			href="/text-tools/captions-formatter"
		/>
		<ToolCard
			title="Emoji Browser"
			desc="Browse, search, and copy emojis with skin tone support"
			href="/emoji-picker"
		/>
		<ToolCard
			title="Split Text Random Delimiter"
			desc="Pisahkan teks berdasarkan delimiter acak"
			href="/text-tools/split-random-delimiter"
		/>
		<ToolCard
			title="CSV Parser"
			desc="Extract nama dan nomor telepon dari file VCard (.vcf)"
			href="/text-tools/csv-parser"
		/>
		<ToolCard
			title="Page Identifier"
			desc="Demo page untuk mengenali query parameter"
			href="/pageid?id=Demo"
		/>
		<ToolCard
			title="Sort Lines"
			desc="Urutkan baris teks secara alfabetis"
			href="/text-tools/sort-lines"
		/>
	</div>
</div>
