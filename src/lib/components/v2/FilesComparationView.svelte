<script lang="ts">
	import {
		ArrowRightLeft,
		Copy,
		Check,
		Trash2,
		Upload,
		Download,
		Sparkles,
		Eye,
		FileText
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	const SAMPLE_A = `apple
banana
cherry
date
fig
grape
honeydew`;

	const SAMPLE_B = `banana
date
elderberry
fig
grape
kiwi
lemon`;

	let textA = $state(SAMPLE_A);
	let textB = $state(SAMPLE_B);
	let nameA = $state('File A');
	let nameB = $state('File B');

	let caseSensitive = $state(false);
	let ignoreEmpty = $state(true);
	let onlyDiff = $state(false);

	let outA = $state<string[]>([]);
	let outB = $state<string[]>([]);
	let hasCompared = $state(false);
	let copied = $state(false);

	let fileInputA: HTMLInputElement | null = $state(null);
	let fileInputB: HTMLInputElement | null = $state(null);

	function key(s: string) {
		return caseSensitive ? s : s.toLowerCase();
	}

	function compare() {
		hasCompared = true;

		let linesA = textA.split(/\r?\n/);
		let linesB = textB.split(/\r?\n/);

		if (ignoreEmpty) {
			linesA = linesA.filter((l) => l.trim() !== '');
			linesB = linesB.filter((l) => l.trim() !== '');
		}

		const mapB = new Map(linesB.map((l, i) => [key(l), i]));
		const mapA = new Map(linesA.map((l, i) => [key(l), i]));

		const dupA: Record<number, number> = {};
		const dupB: Record<number, number> = {};

		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				dupA[i] = j + 1;
			}
		});

		linesB.forEach((l, i) => {
			const k = key(l);
			const j = mapA.get(k);
			if (j !== undefined) {
				dupB[i] = j + 1;
			}
		});

		const nextOutA: string[] = [];
		const nextOutB: string[] = [];

		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				if (!onlyDiff) {
					nextOutA.push(dupA[i] ? `${l}  (cocok di ${nameB || 'B'} L${dupA[i]})` : l);
					nextOutB.push(l);
				}
			} else {
				nextOutA.push(`${l}  (tidak ada di ${nameB || 'B'})`);
				nextOutB.push('');
			}
		});

		linesB.forEach((l, i) => {
			const k = key(l);
			if (!mapA.has(k)) {
				nextOutA.push('');
				nextOutB.push(`${l}  (tidak ada di ${nameA || 'A'})`);
			}
		});

		outA = nextOutA;
		outB = nextOutB;
	}

	function loadSample() {
		textA = SAMPLE_A;
		textB = SAMPLE_B;
		nameA = 'Sample_A.txt';
		nameB = 'Sample_B.txt';
		compare();
	}

	function clearAll() {
		textA = '';
		textB = '';
		nameA = 'File A';
		nameB = 'File B';
		outA = [];
		outB = [];
		hasCompared = false;
	}

	function handleUploadA(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		nameA = file.name;
		const reader = new FileReader();
		reader.onload = (ev) => {
			textA = (ev.target?.result as string) || '';
			hasCompared = false;
		};
		reader.readAsText(file);
	}

	function handleUploadB(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		nameB = file.name;
		const reader = new FileReader();
		reader.onload = (ev) => {
			textB = (ev.target?.result as string) || '';
			hasCompared = false;
		};
		reader.readAsText(file);
	}

	async function copyCombined() {
		const combined = outA
			.map((lineA, idx) => {
				const lineB = outB[idx] || '';
				if (!lineA && !lineB) return '';
				if (lineA && lineB) return `[A]: ${lineA}  |  [B]: ${lineB}`;
				if (lineA) return `[A]: ${lineA}`;
				return `[B]: ${lineB}`;
			})
			.filter(Boolean)
			.join('\n');

		await navigator.clipboard.writeText(combined || outA.join('\n'));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadResult() {
		const combined = outA
			.map((lineA, idx) => {
				const lineB = outB[idx] || '';
				if (!lineA && !lineB) return '';
				if (lineA && lineB) return `[A]: ${lineA}  |  [B]: ${lineB}`;
				if (lineA) return `[A]: ${lineA}`;
				return `[B]: ${lineB}`;
			})
			.filter(Boolean)
			.join('\n');

		const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `diff_${nameA || 'A'}_vs_${nameB || 'B'}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	const stats = $derived(() => {
		const linesA = textA.split(/\r?\n/).filter((l) => (ignoreEmpty ? l.trim() !== '' : true));
		const linesB = textB.split(/\r?\n/).filter((l) => (ignoreEmpty ? l.trim() !== '' : true));

		const setB = new Set(linesB.map((l) => key(l)));
		const setA = new Set(linesA.map((l) => key(l)));

		let inBoth = 0;
		let onlyInA = 0;
		linesA.forEach((l) => {
			if (setB.has(key(l))) inBoth++;
			else onlyInA++;
		});

		let onlyInB = 0;
		linesB.forEach((l) => {
			if (!setA.has(key(l))) onlyInB++;
		});

		return {
			totalA: linesA.length,
			totalB: linesB.length,
			inBoth,
			onlyInA,
			onlyInB
		};
	});
</script>

<div class="flex flex-col gap-5 w-full flex-1">
	<!-- Hidden File Inputs -->
	<input
		type="file"
		accept=".txt,.csv,.json,.md,.log,.xml,.yaml,.yml,text/plain"
		bind:this={fileInputA}
		onchange={handleUploadA}
		class="hidden"
	/>
	<input
		type="file"
		accept=".txt,.csv,.json,.md,.log,.xml,.yaml,.yml,text/plain"
		bind:this={fileInputB}
		onchange={handleUploadB}
		class="hidden"
	/>

	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
			>
				<ArrowRightLeft size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
					Files Comparation
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Bandingkan dua file teks berdampingan untuk menemukan baris yang berbeda atau duplikat
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={loadSample}
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
			>
				<Sparkles size={13} />
				Contoh Data
			</button>
			<button
				type="button"
				onclick={clearAll}
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-dim)] transition-all hover:bg-rose-500/10 hover:text-rose-500"
			>
				<Trash2 size={13} />
				Reset
			</button>
		</div>
	</div>

	<!-- Unified Card: stats strip + toolbar + dual editor -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Stats Strip -->
		<div class="grid grid-cols-2 sm:grid-cols-5 divide-x divide-[var(--ttx-border-base)] border-b border-[var(--ttx-border-base)]">
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Total Baris A</p>
				<p class="text-2xl font-black text-[var(--ttx-text-main)]">{stats().totalA}</p>
			</div>
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Total Baris B</p>
				<p class="text-2xl font-black text-[var(--ttx-text-main)]">{stats().totalB}</p>
			</div>
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Cocok di Keduanya</p>
				<p class="text-2xl font-black text-emerald-400">{stats().inBoth}</p>
			</div>
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hanya di A</p>
				<p class="text-2xl font-black text-amber-400">{stats().onlyInA}</p>
			</div>
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-purple-400">Hanya di B</p>
				<p class="text-2xl font-black text-purple-400">{stats().onlyInB}</p>
			</div>
		</div>

		<!-- Toolbar Strip -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
			<div class="flex flex-wrap items-center gap-4 text-xs font-medium">
				<label class="flex items-center gap-2 cursor-pointer select-none">
					<input
						type="checkbox"
						bind:checked={caseSensitive}
						class="rounded accent-[var(--ttx-accent)]"
					/>
					<span class="text-[var(--ttx-text-muted)]">Case Sensitive</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer select-none">
					<input
						type="checkbox"
						bind:checked={ignoreEmpty}
						class="rounded accent-[var(--ttx-accent)]"
					/>
					<span class="text-[var(--ttx-text-muted)]">Abaikan Baris Kosong</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer select-none">
					<input
						type="checkbox"
						bind:checked={onlyDiff}
						class="rounded accent-[var(--ttx-accent)]"
					/>
					<span class="text-[var(--ttx-text-muted)]">Hanya Baris Berbeda</span>
				</label>
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={compare}
					disabled={!textA.trim() && !textB.trim()}
					class="flex items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[var(--ttx-accent-hover)] disabled:opacity-40 disabled:pointer-events-none"
				>
					<ArrowRightLeft size={14} />
					Bandingkan Sekarang
				</button>
				{#if hasCompared}
					<button
						type="button"
						onclick={copyCombined}
						class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
					>
						{#if copied}
							<Check size={14} class="text-emerald-400" />
							<span class="text-emerald-400">Tersalin</span>
						{:else}
							<Copy size={14} />
							<span>Salin Hasil</span>
						{/if}
					</button>
					<button
						type="button"
						onclick={downloadResult}
						class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
					>
						<Download size={14} />
						<span>Download .txt</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Dual Pane Editor & Diff View -->
		<div class="flex min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
			<!-- Left Pane: File / Text A -->
			<div class="flex flex-col flex-1 min-h-[260px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-[var(--ttx-border-base)]">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<div class="flex items-center gap-2">
						<FileText size={14} class="text-blue-400" />
						<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
							{nameA}
						</span>
						<span class="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400">
							{textA.split(/\r?\n/).filter((l) => (ignoreEmpty ? l.trim() !== '' : true)).length} baris
						</span>
					</div>
					<div class="flex items-center gap-1.5">
						<button
							type="button"
							onclick={() => fileInputA?.click()}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-[11px] font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
						>
							<Upload size={12} />
							Unggah
						</button>
					</div>
				</div>

				{#if hasCompared && outA.length > 0}
					<div class="flex-1 min-h-[360px] overflow-y-auto p-3 font-mono text-xs leading-relaxed space-y-1 bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)]">
						{#each outA as line, idx}
							<div
								class="flex items-start gap-2.5 px-2 py-1 rounded {line.includes('(tidak ada di')
									? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
									: line.includes('(cocok di')
										? 'bg-emerald-950/20 text-emerald-300'
										: 'text-[var(--ttx-text-dim)]'}"
							>
								<span class="w-8 shrink-0 text-right select-none opacity-40 font-mono text-[10px]">{idx + 1}</span>
								<span class="flex-1 break-all">{line || '—'}</span>
							</div>
						{/each}
					</div>
				{:else}
					<textarea
						bind:value={textA}
						placeholder="Ketik teks A di sini atau klik Unggah File..."
						class="w-full flex-1 min-h-[360px] resize-none p-4 font-mono text-xs sm:text-sm outline-none bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
					></textarea>
				{/if}
			</div>

			<!-- Right Pane: File / Text B -->
			<div class="flex flex-col flex-1 min-h-[260px] lg:min-h-0">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<div class="flex items-center gap-2">
						<FileText size={14} class="text-purple-400" />
						<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
							{nameB}
						</span>
						<span class="rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400">
							{textB.split(/\r?\n/).filter((l) => (ignoreEmpty ? l.trim() !== '' : true)).length} baris
						</span>
					</div>
					<div class="flex items-center gap-1.5">
						<button
							type="button"
							onclick={() => fileInputB?.click()}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-[11px] font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
						>
							<Upload size={12} />
							Unggah
						</button>
					</div>
				</div>

				{#if hasCompared && outB.length > 0}
					<div class="flex-1 min-h-[380px] overflow-y-auto p-3 font-mono text-xs leading-relaxed space-y-1 bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)]">
						{#each outB as line, idx}
							<div
								class="flex items-start gap-2.5 px-2 py-1 rounded {line.includes('(tidak ada di')
									? 'bg-purple-950/40 text-purple-300 border-l-2 border-purple-500'
									: line
										? 'bg-emerald-950/20 text-emerald-300'
										: 'text-[var(--ttx-text-dim)]'}"
							>
								<span class="w-8 shrink-0 text-right select-none opacity-40 font-mono text-[10px]">{idx + 1}</span>
								<span class="flex-1 break-all">{line || '—'}</span>
							</div>
						{/each}
					</div>
				{:else}
					<textarea
						bind:value={textB}
						placeholder="Ketik teks B di sini atau klik Unggah File..."
						class="w-full flex-1 min-h-[360px] resize-none p-4 font-mono text-xs sm:text-sm outline-none bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
					></textarea>
				{/if}
			</div>
		</div>
	</div>
</div>
