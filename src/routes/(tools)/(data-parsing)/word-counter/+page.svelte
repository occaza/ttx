<script lang="ts">
	import { ActionButton, TextArea, FileUploadInput } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, BarChart2, Type, Hash, AlignLeft, Clock, AlignJustify, Search } from '@lucide/svelte';

	let input = $state('');
	let fileUpload: FileUploadInput;
	let inputEl: TextArea | undefined;

	// Derived statistics using runes
	let charsWithSpaces = $derived(input.length);
	let charsWithoutSpaces = $derived(input.replace(/\s+/g, '').length);
	
	let words = $derived(() => {
		const trimmed = input.trim();
		return trimmed ? trimmed.split(/\s+/).length : 0;
	});
	
	let sentences = $derived(() => {
		const trimmed = input.trim();
		// Match sentences ending with ., !, or ?
		const matches = trimmed.match(/[^.!?]+[.!?]+/g);
		// Fallback for text without proper punctuation but has words
		if (!matches && trimmed.length > 0) return 1;
		return matches ? matches.length : 0;
	});
	
	let paragraphs = $derived(() => {
		const trimmed = input.trim();
		if (!trimmed) return 0;
		return trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
	});

	let readingTime = $derived(() => {
		// Average adult reading speed is ~225-250 words per minute
		const wpm = 225;
		const minutes = words() / wpm;
		const seconds = Math.round((minutes % 1) * 60);
		const fullMinutes = Math.floor(minutes);
		
		if (words() === 0) return '0 detik';
		if (fullMinutes === 0) return `${seconds} detik`;
		return `${fullMinutes} mnt ${seconds} dtk`;
	});

	let topKeywords = $derived(() => {
		if (!input.trim()) return [];
		
		// Convert to lowercase and extract only alphabetical words
		const wordsList = input.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
		
		// Common stop words to ignore
		const stopWords = new Set(['yang', 'dan', 'di', 'dari', 'ke', 'ini', 'itu', 'untuk', 'dengan', 'dalam', 'pada', 'adalah', 'sebagai', 'tidak', 'akan', 'atau', 'juga', 'bisa', 'ada', 'oleh', 'kami', 'kita', 'saya', 'dia', 'mereka', 'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'for', 'it', 'with', 'as', 'was', 'on', 'at']);
		
		const counts: Record<string, number> = {};
		
		wordsList.forEach(word => {
			if (!stopWords.has(word)) {
				counts[word] = (counts[word] || 0) + 1;
			}
		});
		
		// Sort by count descending, then alphabetically
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.slice(0, 8); // Top 8 keywords
	});

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function selectAll() {
		inputEl?.select();
	}

	function clear() {
		input = '';
		if (fileUpload) fileUpload.reset();
	}
</script>

<svelte:head>
	<title>Word Counter & Text Stats - TEXY Workspace</title>
	<meta name="description" content="Hitung jumlah kata, karakter, kalimat, paragraf, serta estimasi waktu baca dan kepadatan kata kunci." />
	<meta name="keywords" content="word counter, hitung kata, karakter counter, text analyzer, text statistics" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/word-counter" />
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Grid Background Pattern -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">

		<!-- Header -->
		<div class="mb-8">
			<a href="/" class="mb-5 inline-flex items-center text-sm font-medium text-base-content/40 hover:text-base-content transition-colors">
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md">
					<BarChart2 size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Word Counter & Stats</h1>
					<p class="mt-1 text-sm text-base-content/50">Hitung jumlah kata, karakter, dan analisis struktur teks secara real-time.</p>
				</div>
			</div>
		</div>

		<!-- Main Layout -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">

			<!-- Left Side: Editor -->
			<div class="w-full flex-1 flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md overflow-hidden">
				
				<!-- Editor Toolbar -->
				<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-base-content/10 bg-base-200/30 p-3 sm:px-4 sm:h-14 gap-3">
					<div class="flex items-center gap-3">
						<div class="w-48">
							<FileUploadInput
								bind:this={fileUpload}
								onload={handleLoad}
								onerror={handleError}
								accept=".txt,.md,.csv,.json"
								size="xs"
							/>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<ActionButton
							showSelectAll={true}
							showClear={true}
							showCopy={true}
							onselectall={selectAll}
							onclear={clear}
							oncopy={() => navigator.clipboard.writeText(input)}
						/>
					</div>
				</div>

				<!-- Text Area -->
				<div class="flex-1 relative min-h-[400px]">
					<TextArea
						bind:this={inputEl}
						bind:value={input}
						placeholder="Mulai ketik atau paste teks Anda di sini..."
						rows={18}
						className="w-full h-full absolute inset-0 resize-none border-none bg-transparent p-6 text-base outline-none focus:ring-0 leading-relaxed"
					/>
				</div>
			</div>

			<!-- Right Side: Statistics Dashboard -->
			<div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
				
				<!-- Grid Stats -->
				<div class="grid grid-cols-2 gap-4">
					
					<div class="flex flex-col justify-center rounded-2xl border border-base-content/10 bg-base-100/80 p-5 shadow-xl backdrop-blur-md">
						<div class="flex items-center gap-2 mb-2">
							<Type size={16} class="text-primary" />
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Kata</span>
						</div>
						<span class="text-3xl font-black text-base-content">{words().toLocaleString()}</span>
					</div>
					
					<div class="flex flex-col justify-center rounded-2xl border border-base-content/10 bg-base-100/80 p-5 shadow-xl backdrop-blur-md">
						<div class="flex items-center gap-2 mb-2">
							<Hash size={16} class="text-secondary" />
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Karakter</span>
						</div>
						<span class="text-3xl font-black text-base-content">{charsWithSpaces.toLocaleString()}</span>
						<span class="text-[10px] text-base-content/40 mt-1">{charsWithoutSpaces.toLocaleString()} tanpa spasi</span>
					</div>
					
					<div class="flex flex-col justify-center rounded-2xl border border-base-content/10 bg-base-100/80 p-5 shadow-xl backdrop-blur-md">
						<div class="flex items-center gap-2 mb-2">
							<AlignLeft size={16} class="text-accent" />
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Kalimat</span>
						</div>
						<span class="text-3xl font-black text-base-content">{sentences().toLocaleString()}</span>
					</div>
					
					<div class="flex flex-col justify-center rounded-2xl border border-base-content/10 bg-base-100/80 p-5 shadow-xl backdrop-blur-md">
						<div class="flex items-center gap-2 mb-2">
							<AlignJustify size={16} class="text-info" />
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Paragraf</span>
						</div>
						<span class="text-3xl font-black text-base-content">{paragraphs().toLocaleString()}</span>
					</div>
					
				</div>

				<!-- Reading Time -->
				<div class="flex items-center justify-between rounded-2xl border border-base-content/10 bg-base-100/80 p-5 shadow-xl backdrop-blur-md">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
							<Clock size={18} />
						</div>
						<div class="flex flex-col">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Estimasi Waktu Baca</span>
							<span class="text-sm font-semibold text-base-content/70">~250 wpm</span>
						</div>
					</div>
					<span class="text-xl font-black text-base-content">{readingTime()}</span>
				</div>

				<!-- Keyword Density -->
				<div class="flex flex-1 flex-col rounded-2xl border border-base-content/10 bg-base-100/80 shadow-xl backdrop-blur-md overflow-hidden">
					<div class="flex items-center gap-2 border-b border-base-content/10 bg-base-200/30 px-5 py-4">
						<Search size={16} class="text-warning" />
						<span class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Keyword Density</span>
					</div>
					<div class="p-5 flex-1 min-h-[160px] overflow-y-auto custom-scrollbar">
						{#if topKeywords().length > 0}
							<div class="space-y-3">
								{#each topKeywords() as [word, count]}
									<div class="flex items-center justify-between text-sm">
										<span class="font-medium text-base-content/80 truncate pr-4">{word}</span>
										<span class="flex items-center gap-1.5 shrink-0">
											<span class="text-base-content/50">{count}x</span>
											<span class="badge badge-sm badge-neutral text-[10px] font-mono">
												{Math.round((count / words()) * 100)}%
											</span>
										</span>
									</div>
									<progress class="progress progress-warning w-full h-1" value={count} max={topKeywords()[0][1]}></progress>
								{/each}
							</div>
						{:else}
							<div class="flex h-full flex-col items-center justify-center text-center text-base-content/30 pt-4">
								<Search size={24} class="mb-2 opacity-20" />
								<p class="text-xs font-medium">Ketik sesuatu untuk melihat<br>analisis kata kunci</p>
							</div>
						{/if}
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
