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

<div class="space-y-4 animate-fade-in w-full flex flex-col flex-1">
	<!-- COMPACT SLIM HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--ttx-border-base)]">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 shrink-0">
				<Copy class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight text-[var(--ttx-text-main)]">
						Remove Duplicate Lines
					</h1>
					<span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
						Client-Side Fast
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Hapus baris duplikat dari teks Anda secara otomatis dengan urutan tetap dipertahankan.
				</p>
			</div>
		</div>

		<!-- Top Quick Actions: Sample & Reset -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
				onclick={loadSample}
				title="Muat teks contoh"
			>
				<RotateCcw size={13} />
				<span>Contoh Teks</span>
			</button>
		</div>
	</div>

	<!-- WORKSPACE CONTAINER -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Toolbar: Actions & Options -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
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
					class="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
					onclick={() => fileInputEl?.click()}
					title="Unggah file teks dari komputer"
				>
					<Upload size={13} />
					<span>Upload File</span>
				</button>

				<div class="h-4 w-px bg-[var(--ttx-border-base)]"></div>

				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-input)]"
					onclick={selectAll}
					title="Pilih semua teks"
				>
					<span>Select All</span>
				</button>

				<button
					type="button"
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-input)]"
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
					class="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors text-[var(--ttx-text-dim)] hover:bg-rose-500/10 hover:text-rose-500"
					onclick={clearAll}
					title="Kosongkan teks"
				>
					<Trash2 size={13} />
					<span>Clear</span>
				</button>
			</div>

			<!-- Right: Filter Options Checkboxes -->
			<div class="flex flex-wrap items-center gap-3">
				<label class="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--ttx-text-muted)]">
					<input
						type="checkbox"
						class="rounded accent-[var(--ttx-accent)] h-3.5 w-3.5"
						bind:checked={caseSensitive}
					/>
					<span>Case sensitive</span>
				</label>

				<label class="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--ttx-text-muted)]">
					<input
						type="checkbox"
						class="rounded accent-[var(--ttx-accent)] h-3.5 w-3.5"
						bind:checked={removeEmpty}
					/>
					<span>Hapus baris kosong</span>
				</label>

				<label class="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--ttx-text-muted)]">
					<input
						type="checkbox"
						class="rounded accent-[var(--ttx-accent)] h-3.5 w-3.5"
						bind:checked={showRemoved}
					/>
					<span>Tampilkan log duplikat</span>
				</label>
			</div>
		</div>

		<!-- Editor Area -->
		<div class="grid flex-1 {showRemoved ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x' : 'grid-cols-1'} divide-[var(--ttx-border-base)]">
			<!-- Main Text Area (Kept Lines) -->
			<div class="relative flex flex-col min-h-[360px]">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Teks Utama ({totalLines} baris)</span>
					<span class="font-mono text-[10px] text-[var(--ttx-accent-text)]">UTF-8</span>
				</div>
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					placeholder="Tempel atau ketik teks Anda di sini..."
					rows="14"
					class="w-full flex-1 resize-none bg-[var(--ttx-bg-card)] p-4 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none leading-relaxed"
				></textarea>
			</div>

			<!-- Removed Lines Log Panel (Only if checked) -->
			{#if showRemoved}
				<div class="relative flex flex-col min-h-[360px] bg-rose-950/10">
					<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-rose-950/30 px-4">
						<span class="text-[10px] font-bold uppercase tracking-wider text-rose-300">Log Baris Duplikat ({removedCount} baris)</span>
						<span class="text-[10px] text-rose-400">Terhapus</span>
					</div>
					<textarea
						bind:value={removed}
						placeholder="Baris-baris duplikat yang terhapus akan dicatat di sini..."
						rows="14"
						readonly
						class="w-full flex-1 resize-none bg-transparent p-4 font-mono text-xs sm:text-sm text-rose-300 placeholder-rose-400/40 outline-none leading-relaxed"
					></textarea>
				</div>
			{/if}
		</div>

		<!-- Bottom Action Bar -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
			<!-- Save to File Button -->
			<button
				type="button"
				class="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
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
					class="h-9.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-white bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] active:scale-95 shadow-md shadow-blue-500/25 transition-all"
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
	<div class="rounded-xl border overflow-hidden border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)]">
		<button
			type="button"
			class="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-card-subtle)]"
			onclick={() => (isGuideOpen = !isGuideOpen)}
		>
			<span class="flex items-center gap-2">
				<BookOpen size={14} class="text-[var(--ttx-accent-text)]" />
				<span>Panduan Singkat & Aturan Penghapusan Duplikat</span>
			</span>
			<div class="flex items-center gap-1.5 text-[var(--ttx-text-dim)] text-[11px]">
				<span>{isGuideOpen ? 'Sembunyikan' : 'Buka Detail'}</span>
				<ChevronDown size={14} class="transition-transform duration-200 {isGuideOpen ? 'rotate-180' : ''}" />
			</div>
		</button>

		{#if isGuideOpen}
			<div class="p-4 border-t border-[var(--ttx-border-base)] text-xs leading-relaxed space-y-2.5 text-[var(--ttx-text-muted)] bg-[var(--ttx-bg-card-subtle)]">
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div class="p-3 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)]">
						<h4 class="font-bold mb-1 text-[var(--ttx-text-main)]">1. Urutan Tetap Terjaga</h4>
						<p class="text-[11px] text-[var(--ttx-text-dim)]">Baris kemunculan pertama selalu dipertahankan di posisi aslinya. Baris duplikat berikutnya otomatis dihapus.</p>
					</div>
					<div class="p-3 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)]">
						<h4 class="font-bold mb-1 text-[var(--ttx-text-main)]">2. Case Sensitive</h4>
						<p class="text-[11px] text-[var(--ttx-text-dim)]">Jika dicentang, kata "Apple" dan "apple" dianggap berbeda dan tidak akan dihapus.</p>
					</div>
					<div class="p-3 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)]">
						<h4 class="font-bold mb-1 text-[var(--ttx-text-main)]">3. Privasi Penuh</h4>
						<p class="text-[11px] text-[var(--ttx-text-dim)]">Teks Anda diproses 100% di browser tanpa pernah dikirimkan ke server luar.</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
