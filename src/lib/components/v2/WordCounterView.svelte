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

<div class="space-y-4 animate-fade-in w-full flex flex-col flex-1">
	<!-- COMPACT SLIM HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b shrink-0 border-[var(--ttx-border-base)]">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] shadow-xs shrink-0">
				<ChartBar class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight text-[var(--ttx-text-main)]">
						Word Counter & Stats
					</h1>
					<span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-border-subtle)]">
						Analisis Real-Time
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Hitung jumlah kata, karakter, kalimat, paragraf, dan estimasi waktu baca otomatis.
				</p>
			</div>
		</div>

		<!-- Top Action: Sample Text Button -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all"
				onclick={loadSample}
				title="Muat teks contoh"
			>
				<RotateCcw size={13} />
				<span>Contoh Teks</span>
			</button>
		</div>
	</div>

	<!-- UNIFIED CARD -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- 4-METRIC COMPACT STATS STRIP -->
		<div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--ttx-border-base)] border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]">
			<!-- Metric 1: Kata -->
			<div class="p-3.5 flex flex-col items-center justify-center text-center">
				<div class="flex items-center gap-1.5 mb-1 text-[var(--ttx-accent-text)]">
					<Type size={14} />
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Kata</span>
				</div>
				<div class="text-2xl font-black tracking-tight text-[var(--ttx-text-main)]">
					{words().toLocaleString()}
				</div>
			</div>

			<!-- Metric 2: Karakter -->
			<div class="p-3.5 flex flex-col items-center justify-center text-center">
				<div class="flex items-center gap-1.5 mb-1 text-cyan-500">
					<Hash size={14} />
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Karakter</span>
				</div>
				<div class="flex items-baseline gap-1.5">
					<span class="text-2xl font-black tracking-tight text-[var(--ttx-text-main)]">
						{charsWithSpaces.toLocaleString()}
					</span>
					<span class="text-[10px] text-[var(--ttx-text-dim)] truncate">
						({charsWithoutSpaces.toLocaleString()} no-space)
					</span>
				</div>
			</div>

			<!-- Metric 3: Kalimat & Paragraf -->
			<div class="p-3.5 flex flex-col items-center justify-center text-center">
				<div class="flex items-center gap-1.5 mb-1 text-emerald-500">
					<AlignLeft size={14} />
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Struktur</span>
				</div>
				<div class="flex items-baseline gap-3 text-sm">
					<div>
						<span class="text-lg font-black text-[var(--ttx-text-main)]">{sentences().toLocaleString()}</span>
						<span class="text-[10px] text-[var(--ttx-text-dim)]"> kal</span>
					</div>
					<div class="border-l border-[var(--ttx-border-base)] pl-3">
						<span class="text-lg font-black text-[var(--ttx-text-main)]">{paragraphs().toLocaleString()}</span>
						<span class="text-[10px] text-[var(--ttx-text-dim)]"> par</span>
					</div>
				</div>
			</div>

			<!-- Metric 4: Waktu Baca -->
			<div class="p-3.5 flex flex-col items-center justify-center text-center">
				<div class="flex items-center gap-1.5 mb-1 text-amber-500">
					<Clock size={14} />
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Waktu Baca</span>
				</div>
				<div class="flex items-baseline gap-1.5">
					<span class="text-2xl font-black tracking-tight text-[var(--ttx-text-main)]">
						{readingTime()}
					</span>
					<span class="text-[10px] text-[var(--ttx-text-dim)]">~225 wpm</span>
				</div>
			</div>
		</div>

		<!-- WORKSPACE (EDITOR + KEYWORDS DENSITY) -->
		<div class="flex flex-col lg:flex-row flex-1 min-h-0">
			<!-- Left: Text Editor Area -->
			<div class="flex flex-col flex-1 min-h-[320px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-[var(--ttx-border-base)]">
				<!-- Editor Toolbar -->
				<div class="flex flex-wrap items-center justify-between gap-2 px-4 h-10 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] shrink-0">
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
							class="h-7 px-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-all"
							onclick={() => fileInputEl?.click()}
							title="Unggah file teks"
						>
							<Upload size={12} />
							<span>Upload File</span>
						</button>

						<div class="h-4 w-px bg-[var(--ttx-border-base)]"></div>

						<button
							type="button"
							class="h-7 px-2 rounded-lg text-xs font-medium flex items-center gap-1 text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
							onclick={selectAll}
						>
							<span>Select All</span>
						</button>

						<button
							type="button"
							class="h-7 px-2 rounded-lg text-xs font-medium flex items-center gap-1.5 text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
							onclick={copyToClipboard}
						>
							{#if copied}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Copy</span>
							{/if}
						</button>
					</div>

					<!-- Clear Button -->
					<button
						type="button"
						class="h-7 px-2 rounded-lg text-xs font-medium flex items-center gap-1 text-[var(--ttx-text-dim)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
						onclick={clearAll}
						title="Kosongkan teks"
					>
						<Trash2 size={12} />
						<span>Clear</span>
					</button>
				</div>

				<!-- Editor Textarea -->
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					placeholder="Mulai ketik atau paste teks Anda di sini..."
					class="w-full flex-1 min-h-[240px] lg:min-h-0 resize-none p-4 font-mono text-xs sm:text-sm outline-none leading-relaxed bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				></textarea>
			</div>

			<!-- Right: Keyword Density -->
			<div class="w-full lg:w-80 shrink-0 flex flex-col bg-[var(--ttx-bg-card-subtle)]">
				<div class="flex items-center gap-2 px-4 h-10 border-b border-[var(--ttx-border-base)] shrink-0">
					<Search size={13} class="text-amber-500" />
					<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
						Keyword Density
					</span>
				</div>

				<div class="p-4 flex-1 min-h-[160px] overflow-y-auto">
					{#if topKeywords().length > 0}
						{@const maxCount = topKeywords()[0][1]}
						<div class="space-y-3">
							{#each topKeywords() as [word, count]}
								{@const pct = Math.round((count / (words() || 1)) * 100)}
								<div class="space-y-1">
									<div class="flex items-center justify-between text-xs">
										<span class="font-medium truncate max-w-[140px] text-[var(--ttx-text-main)]">{word}</span>
										<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">
											{count}x ({pct}%)
										</span>
									</div>
									<!-- Progress Bar -->
									<div class="w-full h-1.5 rounded-full overflow-hidden bg-[var(--ttx-border-base)]">
										<div
											class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
											style="width: {(count / maxCount) * 100}%"
										></div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--ttx-text-dim)] min-h-[140px]">
							<Search size={22} class="opacity-30 mb-2" />
							<p class="text-xs">Ketik atau tempel teks untuk melihat analisis kata kunci terpopuler.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- COLLAPSIBLE ACCORDION FOR GUIDE & FAQ AT BOTTOM OF CARD -->
		<div class="border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] shrink-0">
			<button
				type="button"
				class="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				onclick={() => (isGuideOpen = !isGuideOpen)}
			>
				<span class="flex items-center gap-2">
					<BookOpen size={14} class="text-[var(--ttx-accent-text)]" />
					<span>Informasi Perhitungan & Standar Kecepatan Baca</span>
				</span>
				<div class="flex items-center gap-1.5 text-[var(--ttx-text-dim)] text-[11px]">
					<span>{isGuideOpen ? 'Sembunyikan' : 'Buka Detail'}</span>
					<ChevronDown size={14} class="transition-transform duration-200 {isGuideOpen ? 'rotate-180' : ''}" />
				</div>
			</button>

			{#if isGuideOpen}
				<div class="p-4 border-t border-[var(--ttx-border-base)] text-xs leading-relaxed space-y-2.5 bg-[var(--ttx-bg-card)]">
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div class="p-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
							<h4 class="font-bold mb-1 text-[var(--ttx-text-main)]">Standar Waktu Baca</h4>
							<p class="text-[11px] text-[var(--ttx-text-muted)]">Menggunakan rata-rata kecepatan membaca orang dewasa yaitu 225 hingga 250 kata per menit (WPM).</p>
						</div>
						<div class="p-3 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
							<h4 class="font-bold mb-1 text-[var(--ttx-text-main)]">Penyaringan Stop Words</h4>
							<p class="text-[11px] text-[var(--ttx-text-muted)]">Kata umum seperti "dan", "yang", "di", "the", "in" otomatis disaring dari peringkat kata kunci agar lebih bermakna.</p>
						</div>
						<div class="p-3 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
							<h4 class="font-bold mb-1 text-[var(--ttx-text-main)]">100% Aman & Privat</h4>
							<p class="text-[11px] text-[var(--ttx-text-muted)]">Semua kalkulasi dilakukan lokal di peramban Anda tanpa data terkirim ke server.</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
