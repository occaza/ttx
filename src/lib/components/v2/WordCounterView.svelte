<script lang="ts">
	import {
		ChartBar,
		Type,
		Hash,
		AlignLeft,
		Clock,
		Search,
		Upload,
		Copy,
		Check,
		Trash2,
		RotateCcw,
		BookOpen,
		ChevronDown
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	const SAMPLE_TEXT = `Teknologi komputasi modern berkembang sangat pesat dalam beberapa dekade terakhir. Dari kecerdasan buatan hingga sistem terdistribusi, inovasi teknologi terus memudahkan pekerjaan manusia.

Alat analisis teks seperti Word Counter membantu penulis, mahasiswa, dan profesional mengoptimalkan panjang artikel, esai, maupun dokumen resmi mereka secara akurat dan efisien.

Cobalah menempelkan teks Anda sendiri untuk melihat statistik kata, karakter, dan estimasi waktu baca secara seketika!`;

	let input = $state(SAMPLE_TEXT);
	let copied = $state(false);
	let isGuideOpen = $state(false);
	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let fileInputEl: HTMLInputElement | null = $state(null);

	// Derived statistics using runes
	const charsWithSpaces = $derived(input.length);
	const charsWithoutSpaces = $derived(input.replace(/\s+/g, '').length);

	const words = $derived(() => {
		const trimmed = input.trim();
		return trimmed ? trimmed.split(/\s+/).length : 0;
	});

	const sentences = $derived(() => {
		const trimmed = input.trim();
		const matches = trimmed.match(/[^.!?]+[.!?]+/g);
		if (!matches && trimmed.length > 0) return 1;
		return matches ? matches.length : 0;
	});

	const paragraphs = $derived(() => {
		const trimmed = input.trim();
		if (!trimmed) return 0;
		return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
	});

	const readingTime = $derived(() => {
		const wpm = 225;
		const totalWords = words();
		const minutes = totalWords / wpm;
		const seconds = Math.round((minutes % 1) * 60);
		const fullMinutes = Math.floor(minutes);

		if (totalWords === 0) return '0 dtk';
		if (fullMinutes === 0) return `${seconds} dtk`;
		return `${fullMinutes}m ${seconds}s`;
	});

	const topKeywords = $derived(() => {
		if (!input.trim()) return [];

		const wordsList = input.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
		const stopWords = new Set([
			'yang', 'dan', 'di', 'dari', 'ke', 'ini', 'itu', 'untuk', 'dengan', 'dalam', 'pada',
			'adalah', 'sebagai', 'tidak', 'akan', 'atau', 'juga', 'bisa', 'ada', 'oleh', 'kami',
			'kita', 'saya', 'dia', 'mereka', 'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that',
			'for', 'it', 'with', 'as', 'was', 'on', 'at'
		]);

		const counts: Record<string, number> = {};
		wordsList.forEach((word) => {
			if (!stopWords.has(word)) {
				counts[word] = (counts[word] || 0) + 1;
			}
		});

		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.slice(0, 6);
	});

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			input = (event.target?.result as string) || '';
		};
		reader.readAsText(file);
	}

	function selectAll() {
		textareaEl?.focus();
		textareaEl?.select();
	}

	function clearAll() {
		input = '';
		if (fileInputEl) fileInputEl.value = '';
	}

	function loadSample() {
		input = SAMPLE_TEXT;
	}

	async function copyToClipboard() {
		if (!input) return;
		try {
			await navigator.clipboard.writeText(input);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy', err);
		}
	}
</script>

<div class="space-y-4 animate-fade-in w-full">
	<!-- COMPACT SLIM HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b {isDark ? 'border-[#1a253c]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/20 shrink-0">
				<ChartBar class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
						Word Counter & Stats
					</h1>
					<span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
						Analisis Real-Time
					</span>
				</div>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Hitung jumlah kata, karakter, kalimat, paragraf, dan estimasi waktu baca otomatis.
				</p>
			</div>
		</div>

		<!-- Top Action: Sample Text Button -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all {isDark
					? 'border-[#223356] bg-[#11192b] text-slate-300 hover:text-white hover:bg-[#16233d]'
					: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
				onclick={loadSample}
				title="Muat teks contoh"
			>
				<RotateCcw size={13} />
				<span>Contoh Teks</span>
			</button>
		</div>
	</div>

	<!-- 4-METRIC COMPACT STATS ROW -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		<!-- Metric 1: Kata -->
		<div class="rounded-xl border p-3.5 transition-colors {isDark ? 'border-[#1a253c] bg-[#10182b]' : 'border-slate-200 bg-white shadow-xs'}">
			<div class="flex items-center gap-1.5 mb-1.5 text-indigo-400">
				<Type size={14} />
				<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Kata</span>
			</div>
			<div class="text-2xl font-black tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
				{words().toLocaleString()}
			</div>
		</div>

		<!-- Metric 2: Karakter -->
		<div class="rounded-xl border p-3.5 transition-colors {isDark ? 'border-[#1a253c] bg-[#10182b]' : 'border-slate-200 bg-white shadow-xs'}">
			<div class="flex items-center gap-1.5 mb-1.5 text-cyan-400">
				<Hash size={14} />
				<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Karakter</span>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-black tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
					{charsWithSpaces.toLocaleString()}
				</span>
				<span class="text-[10px] {isDark ? 'text-slate-400' : 'text-slate-500'} truncate">
					({charsWithoutSpaces.toLocaleString()} no-space)
				</span>
			</div>
		</div>

		<!-- Metric 3: Kalimat & Paragraf -->
		<div class="rounded-xl border p-3.5 transition-colors {isDark ? 'border-[#1a253c] bg-[#10182b]' : 'border-slate-200 bg-white shadow-xs'}">
			<div class="flex items-center gap-1.5 mb-1.5 text-emerald-400">
				<AlignLeft size={14} />
				<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Struktur</span>
			</div>
			<div class="flex items-baseline gap-3 text-sm">
				<div>
					<span class="text-lg font-black {isDark ? 'text-white' : 'text-slate-900'}">{sentences().toLocaleString()}</span>
					<span class="text-[10px] {isDark ? 'text-slate-400' : 'text-slate-500'}"> kalimat</span>
				</div>
				<div class="border-l pl-3 {isDark ? 'border-slate-800' : 'border-slate-200'}">
					<span class="text-lg font-black {isDark ? 'text-white' : 'text-slate-900'}">{paragraphs().toLocaleString()}</span>
					<span class="text-[10px] {isDark ? 'text-slate-400' : 'text-slate-500'}"> paragraf</span>
				</div>
			</div>
		</div>

		<!-- Metric 4: Waktu Baca -->
		<div class="rounded-xl border p-3.5 transition-colors {isDark ? 'border-[#1a253c] bg-[#10182b]' : 'border-slate-200 bg-white shadow-xs'}">
			<div class="flex items-center gap-1.5 mb-1.5 text-amber-400">
				<Clock size={14} />
				<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Waktu Baca</span>
			</div>
			<div class="flex items-baseline gap-1.5">
				<span class="text-2xl font-black tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
					{readingTime()}
				</span>
				<span class="text-[10px] {isDark ? 'text-slate-400' : 'text-slate-500'}">~225 wpm</span>
			</div>
		</div>
	</div>

	<!-- WORKSPACE CONTAINER (EDITOR + KEYWORDS DENSITY) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
		<!-- Left: Text Editor Area (Col 8) -->
		<div class="lg:col-span-8 rounded-2xl border transition-colors overflow-hidden flex flex-col {isDark ? 'border-[#1a253c] bg-[#10182b] shadow-xl' : 'border-slate-200 bg-white shadow-sm'}">
			<!-- Editor Toolbar -->
			<div class="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:px-4 border-b {isDark ? 'border-[#1a253c] bg-[#0c1424]' : 'border-slate-200 bg-slate-50'}">
				<!-- Upload & Selection -->
				<div class="flex items-center gap-2">
					<input
						bind:this={fileInputEl}
						type="file"
						accept=".txt,.md,.csv,.json"
						class="hidden"
						onchange={handleFileUpload}
					/>
					<button
						type="button"
						class="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all {isDark
							? 'border-[#223356] bg-[#131d33] text-slate-300 hover:text-white hover:bg-[#1a2845]'
							: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}"
						onclick={() => fileInputEl?.click()}
						title="Unggah file teks"
					>
						<Upload size={13} />
						<span>Upload File</span>
					</button>

					<div class="h-4 w-px {isDark ? 'bg-slate-800' : 'bg-slate-200'}"></div>

					<button
						type="button"
						class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors {isDark
							? 'text-slate-400 hover:text-white hover:bg-slate-800'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}"
						onclick={selectAll}
					>
						<span>Select All</span>
					</button>

					<button
						type="button"
						class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors {isDark
							? 'text-slate-400 hover:text-white hover:bg-slate-800'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}"
						onclick={copyToClipboard}
					>
						{#if copied}
							<Check size={13} class="text-emerald-400" />
							<span class="text-emerald-400">Tersalin!</span>
						{:else}
							<Copy size={13} />
							<span>Copy</span>
						{/if}
					</button>
				</div>

				<!-- Clear Button -->
				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 text-rose-400 hover:bg-rose-500/10 transition-colors"
					onclick={clearAll}
					title="Kosongkan teks"
				>
					<Trash2 size={13} />
					<span>Clear</span>
				</button>
			</div>

			<!-- Editor Textarea -->
			<div class="flex-1 p-3.5 sm:p-4 min-h-[300px]">
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					placeholder="Mulai ketik atau paste teks Anda di sini..."
					rows="12"
					class="w-full h-full min-h-[280px] p-2 font-mono text-xs sm:text-sm resize-y outline-none leading-relaxed transition-colors {isDark
						? 'bg-transparent text-slate-100 placeholder-slate-500'
						: 'bg-transparent text-slate-900 placeholder-slate-400'}"
				></textarea>
			</div>
		</div>

		<!-- Right: Keyword Density (Col 4) -->
		<div class="lg:col-span-4 rounded-2xl border transition-colors overflow-hidden flex flex-col {isDark ? 'border-[#1a253c] bg-[#10182b] shadow-xl' : 'border-slate-200 bg-white shadow-sm'}">
			<div class="flex items-center gap-2 p-3 sm:px-4 border-b {isDark ? 'border-[#1a253c] bg-[#0c1424]' : 'border-slate-200 bg-slate-50'}">
				<Search size={14} class="text-amber-400" />
				<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-700'}">
					Keyword Density
				</span>
			</div>

			<div class="p-4 flex-1 overflow-y-auto">
				{#if topKeywords().length > 0}
					{@const maxCount = topKeywords()[0][1]}
					<div class="space-y-3">
						{#each topKeywords() as [word, count]}
							{@const pct = Math.round((count / (words() || 1)) * 100)}
							<div class="space-y-1">
								<div class="flex items-center justify-between text-xs">
									<span class="font-medium truncate max-w-[120px] {isDark ? 'text-slate-200' : 'text-slate-800'}">{word}</span>
									<span class="text-[11px] font-mono {isDark ? 'text-slate-400' : 'text-slate-500'}">
										{count}x ({pct}%)
									</span>
								</div>
								<!-- Progress Bar -->
								<div class="w-full h-1.5 rounded-full overflow-hidden {isDark ? 'bg-slate-800' : 'bg-slate-200'}">
									<div
										class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
										style="width: {(count / maxCount) * 100}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 min-h-[160px]">
						<Search size={22} class="opacity-30 mb-2" />
						<p class="text-xs">Ketik atau tempel teks untuk melihat analisis kata kunci terpopuler.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- COLLAPSIBLE ACCORDION FOR GUIDE & FAQ -->
	<div class="rounded-xl border overflow-hidden transition-colors {isDark ? 'border-[#1a253c] bg-[#10182b]' : 'border-slate-200 bg-white'}">
		<button
			type="button"
			class="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors {isDark ? 'hover:bg-[#142038] text-slate-300' : 'hover:bg-slate-50 text-slate-700'}"
			onclick={() => (isGuideOpen = !isGuideOpen)}
		>
			<span class="flex items-center gap-2">
				<BookOpen size={14} class="text-violet-400" />
				<span>Informasi Perhitungan & Standar Kecepatan Baca</span>
			</span>
			<div class="flex items-center gap-1.5 text-slate-400 text-[11px]">
				<span>{isGuideOpen ? 'Sembunyikan' : 'Buka Detail'}</span>
				<ChevronDown size={14} class="transition-transform duration-200 {isGuideOpen ? 'rotate-180' : ''}" />
			</div>
		</button>

		{#if isGuideOpen}
			<div class="p-4 border-t text-xs leading-relaxed space-y-2.5 {isDark ? 'border-[#1a253c] text-slate-300 bg-[#0c1424]/40' : 'border-slate-200 text-slate-600 bg-slate-50'}">
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div class="p-3 rounded-lg border {isDark ? 'border-[#1e2d4d] bg-[#142038]' : 'border-slate-200 bg-white'}">
						<h4 class="font-bold mb-1 {isDark ? 'text-white' : 'text-slate-900'}">Standar Waktu Baca</h4>
						<p class="text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">Menggunakan rata-rata kecepatan membaca orang dewasa yaitu 225 hingga 250 kata per menit (WPM).</p>
					</div>
					<div class="p-3 rounded-lg border {isDark ? 'border-[#1e2d4d] bg-[#142038]' : 'border-slate-200 bg-white'}">
						<h4 class="font-bold mb-1 {isDark ? 'text-white' : 'text-slate-900'}">Penyaringan Stop Words</h4>
						<p class="text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">Kata umum seperti "dan", "yang", "di", "the", "in" otomatis disaring dari peringkat kata kunci agar lebih bermakna.</p>
					</div>
					<div class="p-3 rounded-lg border {isDark ? 'border-[#1e2d4d] bg-[#142038]' : 'border-slate-200 bg-white'}">
						<h4 class="font-bold mb-1 {isDark ? 'text-white' : 'text-slate-900'}">100% Aman & Privat</h4>
						<p class="text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">Semua kalkulasi dilakukan lokal di peramban Anda tanpa data terkirim ke server.</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
