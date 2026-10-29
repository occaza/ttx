<script lang="ts">
	import {
		Copy,
		Play,
		Trash2,
		Check,
		Download,
		Upload,
		FileText,
		Sparkles,
		RotateCcw,
		BookOpen,
		ChevronDown,
		SlidersHorizontal
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	const SAMPLE_TEXT = `Enter your text, choose the options, then click the "Remove Duplicate Lines" button.
Only duplicate lines across new lines will be removed. Duplicates within the same line will stay.
Line order is preserved, only repeated lines are deleted.

Options:
Check "Case sensitive" to match upper and lower case differently.
Check "Remove empty lines" to delete blank lines.
Check "Display removed" to show removed lines with a note.

Example:
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.`;

	let input = $state(SAMPLE_TEXT);
	let removed = $state('');
	let caseSensitive = $state(false);
	let removeEmpty = $state(false);
	let showRemoved = $state(false);
	let removedCount = $state(0);
	let hasProcessed = $state(false);
	let copied = $state(false);
	let isGuideOpen = $state(false);

	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let fileInputEl: HTMLInputElement | null = $state(null);

	// Real-time line count
	const totalLines = $derived(input === '' ? 0 : input.split(/\r?\n/).length);

	function removeDup() {
		const rawLines = input.split(/\r?\n/);
		const firstPos = new Map<string, number>();
		const kept: string[] = [];
		const gone: string[] = [];

		rawLines.forEach((line, idx) => {
			if (removeEmpty && line.trim() === '') {
				return;
			}

			if (line.trim() === '' && !removeEmpty) {
				kept.push(line);
				return;
			}

			const key = caseSensitive ? line : line.toLowerCase();
			const first = firstPos.get(key);

			if (first === undefined) {
				firstPos.set(key, idx);
				kept.push(line);
			} else {
				gone.push(`(Baris ${idx + 1} duplikat baris ${first + 1}): ${line}`);
			}
		});

		removedCount = gone.length;
		removed = gone.join('\n');
		input = kept.join('\n');
		hasProcessed = true;
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			input = (event.target?.result as string) || '';
			hasProcessed = false;
			removed = '';
			removedCount = 0;
		};
		reader.readAsText(file);
	}

	function selectAll() {
		textareaEl?.focus();
		textareaEl?.select();
	}

	function clearAll() {
		input = '';
		removed = '';
		removedCount = 0;
		hasProcessed = false;
		if (fileInputEl) fileInputEl.value = '';
	}

	function loadSample() {
		input = SAMPLE_TEXT;
		removed = '';
		removedCount = 0;
		hasProcessed = false;
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

	function downloadTextFile() {
		if (!input) return;
		const blob = new Blob([input], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'cleaned-lines.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-4 animate-fade-in w-full">
	<!-- COMPACT SLIM HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b {isDark ? 'border-[#1a253c]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 shrink-0">
				<Copy class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
						Remove Duplicate Lines
					</h1>
					<span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
						Client-Side Fast
					</span>
				</div>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Hapus baris duplikat dari teks Anda secara otomatis dengan urutan tetap dipertahankan.
				</p>
			</div>
		</div>

		<!-- Top Quick Actions: Sample & Reset -->
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

	<!-- WORKSPACE CONTAINER -->
	<div class="rounded-2xl border transition-colors overflow-hidden {isDark ? 'border-[#1a253c] bg-[#10182b] shadow-xl' : 'border-slate-200 bg-white shadow-sm'}">
		<!-- Toolbar: Actions & Options -->
		<div class="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 border-b {isDark ? 'border-[#1a253c] bg-[#0c1424]' : 'border-slate-200 bg-slate-50'}">
			<!-- Left: File Upload & Text Operations -->
			<div class="flex flex-wrap items-center gap-2">
				<input
					bind:this={fileInputEl}
					type="file"
					accept=".txt,.csv,.log,.md"
					class="hidden"
					onchange={handleFileUpload}
				/>
				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all {isDark
						? 'border-[#223356] bg-[#131d33] text-slate-300 hover:text-white hover:bg-[#1a2845]'
						: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}"
					onclick={() => fileInputEl?.click()}
					title="Unggah file teks dari komputer"
				>
					<Upload size={13} />
					<span>Upload File</span>
				</button>

				<div class="h-4 w-px {isDark ? 'bg-slate-800' : 'bg-slate-200'}"></div>

				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors {isDark
						? 'text-slate-400 hover:text-white hover:bg-slate-800'
						: 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}"
					onclick={selectAll}
					title="Pilih semua teks"
				>
					<span>Select All</span>
				</button>

				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors {isDark
						? 'text-slate-400 hover:text-white hover:bg-slate-800'
						: 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}"
					onclick={copyToClipboard}
					title="Salin hasil ke clipboard"
				>
					{#if copied}
						<Check size={13} class="text-emerald-400" />
						<span class="text-emerald-400">Tersalin!</span>
					{:else}
						<Copy size={13} />
						<span>Copy</span>
					{/if}
				</button>

				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
					onclick={clearAll}
					title="Kosongkan teks"
				>
					<Trash2 size={13} />
					<span>Clear</span>
				</button>
			</div>

			<!-- Right: Filter Options Checkboxes -->
			<div class="flex flex-wrap items-center gap-3">
				<label class="flex items-center gap-1.5 cursor-pointer text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">
					<input
						type="checkbox"
						class="rounded text-blue-500 focus:ring-blue-500 h-3.5 w-3.5"
						bind:checked={caseSensitive}
					/>
					<span>Case sensitive</span>
				</label>

				<label class="flex items-center gap-1.5 cursor-pointer text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">
					<input
						type="checkbox"
						class="rounded text-blue-500 focus:ring-blue-500 h-3.5 w-3.5"
						bind:checked={removeEmpty}
					/>
					<span>Hapus baris kosong</span>
				</label>

				<label class="flex items-center gap-1.5 cursor-pointer text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">
					<input
						type="checkbox"
						class="rounded text-blue-500 focus:ring-blue-500 h-3.5 w-3.5"
						bind:checked={showRemoved}
					/>
					<span>Tampilkan log duplikat</span>
				</label>
			</div>
		</div>

		<!-- Editor Area -->
		<div class="grid {showRemoved ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x' : 'grid-cols-1'} {isDark ? 'divide-[#1a253c]' : 'divide-slate-200'}">
			<!-- Main Text Area (Kept Lines) -->
			<div class="relative flex flex-col min-h-[360px]">
				<div class="flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b {isDark ? 'border-[#1a253c] bg-[#0c1424]/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}">
					<span>Teks Utama ({totalLines} baris)</span>
					<span class="font-mono text-[10px] text-blue-400">UTF-8</span>
				</div>
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					placeholder="Tempel atau ketik teks Anda di sini..."
					rows="14"
					class="w-full flex-1 p-4 font-mono text-xs sm:text-sm resize-y outline-none leading-relaxed transition-colors {isDark
						? 'bg-transparent text-slate-100 placeholder-slate-500'
						: 'bg-transparent text-slate-900 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- Removed Lines Log Panel (Only if checked) -->
			{#if showRemoved}
				<div class="relative flex flex-col min-h-[360px] {isDark ? 'bg-rose-950/10' : 'bg-rose-50/50'}">
					<div class="flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b {isDark ? 'border-[#1a253c] bg-rose-950/30 text-rose-300' : 'border-slate-200 bg-rose-100 text-rose-700'}">
						<span>Log Baris Duplikat ({removedCount} baris)</span>
						<span class="text-[10px] text-rose-400">Terhapus</span>
					</div>
					<textarea
						bind:value={removed}
						placeholder="Baris-baris duplikat yang terhapus akan dicatat di sini..."
						rows="14"
						readonly
						class="w-full flex-1 p-4 font-mono text-xs sm:text-sm resize-y outline-none leading-relaxed {isDark
							? 'bg-transparent text-rose-300 placeholder-rose-400/40'
							: 'bg-transparent text-rose-800 placeholder-rose-300'}"
					></textarea>
				</div>
			{/if}
		</div>

		<!-- Bottom Action Bar -->
		<div class="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-4 border-t {isDark ? 'border-[#1a253c] bg-[#0c1424]' : 'border-slate-200 bg-slate-50'}">
			<!-- Save to File Button -->
			<button
				type="button"
				class="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all {isDark
					? 'border-[#223356] bg-[#121c32] text-slate-200 hover:text-white hover:bg-[#1a2845]'
					: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}"
				onclick={downloadTextFile}
				disabled={!input}
			>
				<Download size={14} />
				<span>Download (.txt)</span>
			</button>

			<!-- Execute Button & Processed Feedback -->
			<div class="flex items-center gap-3">
				{#if hasProcessed}
					<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-fade-in">
						<Check size={13} />
						<span>{removedCount} duplikat dibersihkan</span>
					</div>
				{/if}

				<button
					type="button"
					class="h-9.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/25 transition-all"
					onclick={removeDup}
					disabled={!input}
				>
					<Sparkles size={15} />
					<span>Hapus Duplikat Sekarang</span>
				</button>
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
				<BookOpen size={14} class="text-blue-400" />
				<span>Panduan Singkat & Aturan Penghapusan Duplikat</span>
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
						<h4 class="font-bold mb-1 {isDark ? 'text-white' : 'text-slate-900'}">1. Urutan Tetap Terjaga</h4>
						<p class="text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">Baris kemunculan pertama selalu dipertahankan di posisi aslinya. Baris duplikat berikutnya otomatis dihapus.</p>
					</div>
					<div class="p-3 rounded-lg border {isDark ? 'border-[#1e2d4d] bg-[#142038]' : 'border-slate-200 bg-white'}">
						<h4 class="font-bold mb-1 {isDark ? 'text-white' : 'text-slate-900'}">2. Case Sensitive</h4>
						<p class="text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">Jika dicentang, kata "Apple" dan "apple" dianggap berbeda dan tidak akan dihapus.</p>
					</div>
					<div class="p-3 rounded-lg border {isDark ? 'border-[#1e2d4d] bg-[#142038]' : 'border-slate-200 bg-white'}">
						<h4 class="font-bold mb-1 {isDark ? 'text-white' : 'text-slate-900'}">3. Privasi Penuh</h4>
						<p class="text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">Teks Anda diproses 100% di browser tanpa pernah dikirimkan ke server luar.</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
