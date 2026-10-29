<script lang="ts">
	import { Copy, Check, Trash2, List, Upload } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state('');
	let caseSensitive = $state(false);
	let removeEmpty = $state(false);
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	const stats = $derived.by(() => {
		if (!input) return { total: 0, unique: 0, dup: 0, output: '' };

		const raw = input.split(/\r?\n/);
		const lines = removeEmpty ? raw.filter((l) => l.trim() !== '') : raw;

		const total = lines.length;
		const seen = new Map<string, number>();
		const outLines: string[] = [];
		let dup = 0;

		lines.forEach((ln, idx) => {
			const key = caseSensitive ? ln : ln.toLowerCase();
			const first = seen.get(key);
			if (first === undefined) {
				seen.set(key, idx + 1);
				outLines.push(`[${idx + 1}] ${ln}`);
			} else {
				outLines.push(`[${idx + 1}] ${ln}  (duplikat baris ${first})`);
				dup++;
			}
		});

		return { total, unique: seen.size, dup, output: outLines.join('\n') };
	});

	async function copyOutput() {
		if (!stats.output) return;
		await navigator.clipboard.writeText(stats.output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function clear() {
		input = '';
		if (fileInputEl) fileInputEl.value = '';
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			input = (ev.target?.result as string) || '';
		};
		reader.readAsText(file);
	}
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<List size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">Line Counter</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Hitung baris, baris unik, dan duplikat
			</p>
		</div>
	</div>

	<!-- Stats bar -->
	<div class="grid grid-cols-3 gap-3">
		<!-- Total -->
		<div
			class="rounded-xl border p-3.5 text-center transition-colors {isDark
				? 'border-[#1a253c] bg-[#10182b]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<p
				class="mb-1 text-[10px] font-bold uppercase tracking-wider {isDark
					? 'text-blue-400'
					: 'text-blue-600'}"
			>
				Total
			</p>
			<p class="text-2xl font-black {isDark ? 'text-white' : 'text-slate-900'}">
				{stats.total.toLocaleString()}
			</p>
			<p class="mt-0.5 text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">baris</p>
		</div>
		<!-- Unique -->
		<div
			class="rounded-xl border p-3.5 text-center transition-colors {isDark
				? 'border-[#1a253c] bg-[#10182b]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<p
				class="mb-1 text-[10px] font-bold uppercase tracking-wider {isDark
					? 'text-emerald-400'
					: 'text-emerald-600'}"
			>
				Unik
			</p>
			<p class="text-2xl font-black {isDark ? 'text-white' : 'text-slate-900'}">
				{stats.unique.toLocaleString()}
			</p>
			<p class="mt-0.5 text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">baris unik</p>
		</div>
		<!-- Duplicates -->
		<div
			class="rounded-xl border p-3.5 text-center transition-colors {isDark
				? 'border-[#1a253c] bg-[#10182b]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<p
				class="mb-1 text-[10px] font-bold uppercase tracking-wider {stats.dup > 0
					? isDark
						? 'text-rose-400'
						: 'text-rose-600'
					: isDark
						? 'text-slate-600'
						: 'text-slate-400'}"
			>
				Duplikat
			</p>
			<p
				class="text-2xl font-black {stats.dup > 0
					? isDark
						? 'text-rose-400'
						: 'text-rose-600'
					: isDark
						? 'text-slate-600'
						: 'text-slate-400'}"
			>
				{stats.dup.toLocaleString()}
			</p>
			<p class="mt-0.5 text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">duplikat</p>
		</div>
	</div>

	<!-- Toolbar -->
	<div
		class="flex flex-wrap items-center gap-3 rounded-xl border p-3 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<!-- Upload -->
		<input
			bind:this={fileInputEl}
			type="file"
			accept=".txt,.md,.csv"
			class="hidden"
			onchange={handleFileUpload}
		/>
		<button
			type="button"
			onclick={() => fileInputEl?.click()}
			class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
				: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
		>
			<Upload size={13} /> Upload
		</button>

		<div class="h-5 w-px {isDark ? 'bg-slate-800' : 'bg-slate-200'}"></div>

		<!-- Options -->
		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				bind:checked={caseSensitive}
				class="h-4 w-4 rounded border {isDark
					? 'border-slate-700 bg-[#0d1525] accent-blue-500'
					: 'border-slate-300 accent-blue-600'}"
			/>
			<span class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
				>Case Sensitive</span
			>
		</label>

		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				bind:checked={removeEmpty}
				class="h-4 w-4 rounded border {isDark
					? 'border-slate-700 bg-[#0d1525] accent-blue-500'
					: 'border-slate-300 accent-blue-600'}"
			/>
			<span class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
				>Abaikan Baris Kosong</span
			>
		</label>

		{#if input}
			<button
				type="button"
				onclick={clear}
				class="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
					? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
					: 'text-slate-400 hover:bg-red-50 hover:text-red-500'}"
			>
				<Trash2 size={11} /> Clear
			</button>
		{/if}
	</div>

	<!-- Split editor -->
	<div
		class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border sm:flex-row {isDark
			? 'border-[#1a253c]'
			: 'border-slate-200'}"
	>
		<!-- Input -->
		<div
			class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 {isDark
				? 'border-r border-[#1a253c]'
				: 'border-r border-slate-200'}"
		>
			<div
				class="flex h-11 shrink-0 items-center px-4 border-b {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Input
				</span>
			</div>
			<textarea
				bind:value={input}
				placeholder="Paste teks di sini untuk menghitung baris..."
				class="w-full flex-1 resize-none p-4 font-mono text-sm outline-none {isDark
					? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
					: 'bg-white text-slate-800 placeholder-slate-400'}"
			></textarea>
		</div>

		<!-- Output -->
		<div class="flex flex-1 flex-col min-h-[220px] sm:min-h-0">
			<div
				class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Detail Baris
				</span>
				{#if stats.output}
					<button
						type="button"
						onclick={copyOutput}
						class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {copied
							? isDark
								? 'bg-green-500/10 text-green-400'
								: 'bg-green-50 text-green-600'
							: isDark
								? 'text-slate-400 hover:bg-blue-500/10 hover:text-blue-300'
								: 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}"
					>
						{#if copied}
							<Check size={11} /> Copied!
						{:else}
							<Copy size={11} /> Copy
						{/if}
					</button>
				{/if}
			</div>
			<div class="relative flex-1">
				{#if !input}
					<div
						class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center {isDark
							? 'text-slate-700'
							: 'text-slate-300'}"
					>
						<List size={32} strokeWidth={1} class="mb-2" />
						<p class="text-xs">Detail baris muncul di sini</p>
					</div>
				{/if}
				<textarea
					value={stats.output}
					readonly
					class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-sm outline-none {isDark
						? 'bg-[#08101e] text-slate-300'
						: 'bg-slate-50 text-slate-700'}"
				></textarea>
			</div>
		</div>
	</div>
</div>

