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

<div class="flex flex-col gap-5 w-full">
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
				class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
					: 'border-blue-200 bg-blue-50 text-blue-600'}"
			>
				<ArrowRightLeft size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
					Files Comparation
				</h1>
				<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
					Bandingkan dua file teks berdampingan untuk menemukan baris yang berbeda atau duplikat
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={loadSample}
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white hover:border-blue-500/50'
					: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300'}"
			>
				<Sparkles size={13} />
				Contoh Data
			</button>
			<button
				type="button"
				onclick={clearAll}
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
					: 'border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200'}"
			>
				<Trash2 size={13} />
				Reset
			</button>
		</div>
	</div>

	<!-- Options & Action Bar -->
	<div
		class="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<div class="flex flex-wrap items-center gap-4 text-xs font-medium">
			<label class="flex items-center gap-2 cursor-pointer select-none">
				<input
					type="checkbox"
					bind:checked={caseSensitive}
					class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class={isDark ? 'text-slate-300' : 'text-slate-700'}>Case Sensitive</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer select-none">
				<input
					type="checkbox"
					bind:checked={ignoreEmpty}
					class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class={isDark ? 'text-slate-300' : 'text-slate-700'}>Abaikan Baris Kosong</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer select-none">
				<input
					type="checkbox"
					bind:checked={onlyDiff}
					class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class={isDark ? 'text-slate-300' : 'text-slate-700'}>Hanya Baris Berbeda</span>
			</label>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={compare}
				disabled={!textA.trim() && !textB.trim()}
				class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none"
			>
				<ArrowRightLeft size={14} />
				Bandingkan Sekarang
			</button>
			{#if hasCompared}
				<button
					type="button"
					onclick={copyCombined}
					class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
						: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
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
					class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
						: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
				>
					<Download size={14} />
					<span>Download .txt</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Statistics Badges -->
	<div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
		<div
			class="rounded-xl border p-3 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Total Baris A</span>
			<p class="text-base font-bold mt-0.5 {isDark ? 'text-white' : 'text-slate-900'}">{stats().totalA}</p>
		</div>
		<div
			class="rounded-xl border p-3 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Total Baris B</span>
			<p class="text-base font-bold mt-0.5 {isDark ? 'text-white' : 'text-slate-900'}">{stats().totalB}</p>
		</div>
		<div
			class="rounded-xl border p-3 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Cocok di Keduanya</span>
			<p class="text-base font-bold mt-0.5 text-emerald-400">{stats().inBoth}</p>
		</div>
		<div
			class="rounded-xl border p-3 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hanya di A</span>
			<p class="text-base font-bold mt-0.5 text-amber-400">{stats().onlyInA}</p>
		</div>
		<div
			class="rounded-xl border p-3 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<span class="text-[10px] font-bold uppercase tracking-wider text-purple-400">Hanya di B</span>
			<p class="text-base font-bold mt-0.5 text-purple-400">{stats().onlyInB}</p>
		</div>
	</div>

	<!-- Dual Pane Editor & Diff View -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<!-- Left Pane: File / Text A -->
		<div
			class="flex flex-col rounded-xl border overflow-hidden {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<div
				class="flex items-center justify-between border-b px-4 py-3 {isDark
					? 'border-[#1a253c] bg-[#11192c]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div class="flex items-center gap-2">
					<FileText size={14} class="text-blue-400" />
					<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-200' : 'text-slate-800'}">
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
						class="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors {isDark
							? 'border-[#223150] bg-[#141e33] text-slate-300 hover:text-white'
							: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
					>
						<Upload size={12} />
						Unggah
					</button>
				</div>
			</div>

			<div class="p-3">
				{#if hasCompared && outA.length > 0}
					<div
						class="min-h-[380px] max-h-[500px] overflow-y-auto rounded-lg border p-3 font-mono text-xs leading-relaxed space-y-1 {isDark
							? 'border-[#1a253c] bg-[#080d1a] text-slate-300'
							: 'border-slate-200 bg-slate-50 text-slate-800'}"
					>
						{#each outA as line, idx}
							<div
								class="flex items-start gap-2.5 px-2 py-1 rounded {line.includes('(tidak ada di')
									? isDark ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500' : 'bg-rose-50 text-rose-800 border-l-2 border-rose-500'
									: line.includes('(cocok di')
										? isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
										: isDark ? 'text-slate-500' : 'text-slate-400'}"
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
						rows={16}
						class="w-full resize-none rounded-lg p-3 font-mono text-xs outline-none transition-all {isDark
							? 'border border-[#1a253c] bg-[#080d1a] text-slate-100 placeholder-slate-500 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
					></textarea>
				{/if}
			</div>
		</div>

		<!-- Right Pane: File / Text B -->
		<div
			class="flex flex-col rounded-xl border overflow-hidden {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<div
				class="flex items-center justify-between border-b px-4 py-3 {isDark
					? 'border-[#1a253c] bg-[#11192c]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div class="flex items-center gap-2">
					<FileText size={14} class="text-purple-400" />
					<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-200' : 'text-slate-800'}">
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
						class="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors {isDark
							? 'border-[#223150] bg-[#141e33] text-slate-300 hover:text-white'
							: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
					>
						<Upload size={12} />
						Unggah
					</button>
				</div>
			</div>

			<div class="p-3">
				{#if hasCompared && outB.length > 0}
					<div
						class="min-h-[380px] max-h-[500px] overflow-y-auto rounded-lg border p-3 font-mono text-xs leading-relaxed space-y-1 {isDark
							? 'border-[#1a253c] bg-[#080d1a] text-slate-300'
							: 'border-slate-200 bg-slate-50 text-slate-800'}"
					>
						{#each outB as line, idx}
							<div
								class="flex items-start gap-2.5 px-2 py-1 rounded {line.includes('(tidak ada di')
									? isDark ? 'bg-purple-950/40 text-purple-300 border-l-2 border-purple-500' : 'bg-purple-50 text-purple-800 border-l-2 border-purple-500'
									: line
										? isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
										: isDark ? 'text-slate-500' : 'text-slate-400'}"
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
						rows={16}
						class="w-full resize-none rounded-lg p-3 font-mono text-xs outline-none transition-all {isDark
							? 'border border-[#1a253c] bg-[#080d1a] text-slate-100 placeholder-slate-500 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
					></textarea>
				{/if}
			</div>
		</div>
	</div>
</div>

