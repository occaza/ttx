<script lang="ts">
	import { Copy, Check, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Upload } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state('');
	let output = $state('');
	let order = $state<'asc' | 'desc'>('asc');
	let removeDup = $state(false);
	let caseSensitive = $state(false);
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	function sortLines() {
		if (!input.trim()) return;
		let lines = input.split(/\r?\n/);
		const compare = caseSensitive
			? (a: string, b: string) => a.localeCompare(b)
			: (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
		lines.sort(compare);
		if (order === 'desc') lines.reverse();
		if (removeDup) {
			const seen = new Set<string>();
			lines = lines.filter((l) => {
				const key = caseSensitive ? l : l.toLowerCase();
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		output = lines.join('\n');
	}

	function clear() {
		input = '';
		output = '';
		if (fileInputEl) fileInputEl.value = '';
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
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

	const lineCount = $derived(input ? input.split(/\r?\n/).length : 0);
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<ArrowUpDown size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">Sort Lines</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Urutkan baris teks secara alfabetis
			</p>
		</div>
	</div>

	<!-- Main layout -->
	<div class="flex flex-col gap-4 lg:flex-row">
		<!-- Options panel -->
		<div
			class="flex w-full flex-col gap-4 rounded-xl border p-4 lg:w-52 lg:shrink-0 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<!-- Sort Order -->
			<div>
				<p
					class="mb-2 text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Sort Order
				</p>
				<div class="grid grid-cols-2 gap-1.5">
					<button
						type="button"
						onclick={() => (order = 'asc')}
						class="flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-all {order ===
						'asc'
							? isDark
								? 'border-blue-500/40 bg-blue-600/20 text-blue-300'
								: 'border-blue-300 bg-blue-50 text-blue-600'
							: isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
								: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
					>
						<ArrowUp size={13} /> A→Z
					</button>
					<button
						type="button"
						onclick={() => (order = 'desc')}
						class="flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-all {order ===
						'desc'
							? isDark
								? 'border-blue-500/40 bg-blue-600/20 text-blue-300'
								: 'border-blue-300 bg-blue-50 text-blue-600'
							: isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
								: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
					>
						<ArrowDown size={13} /> Z→A
					</button>
				</div>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Options -->
			<div class="space-y-3">
				<p
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Options
				</p>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={caseSensitive}
						class="h-4 w-4 rounded border {isDark
							? 'border-slate-700 bg-[#0d1525] accent-blue-500'
							: 'border-slate-300 accent-blue-600'}"
					/>
					<div>
						<span class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
							>Case Sensitive</span
						>
						<p class="text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">
							A ≠ a
						</p>
					</div>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={removeDup}
						class="h-4 w-4 rounded border {isDark
							? 'border-slate-700 bg-[#0d1525] accent-blue-500'
							: 'border-slate-300 accent-blue-600'}"
					/>
					<div>
						<span class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
							>Remove Duplicates</span
						>
						<p class="text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">
							Hapus baris sama
						</p>
					</div>
				</label>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Upload -->
			<div>
				<p
					class="mb-2 text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Upload File
				</p>
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
					class="flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
						: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
				>
					<Upload size={13} /> Upload .txt / .csv
				</button>
			</div>

			<!-- Execute -->
			<button
				type="button"
				onclick={sortLines}
				disabled={!input.trim()}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 {isDark
					? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
			>
				<ArrowUpDown size={14} /> Sort Lines
			</button>
		</div>

		<!-- Editor panel -->
		<div
			class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border sm:flex-row {isDark
				? 'border-[#1a253c]'
				: 'border-slate-200'}"
		>
			<!-- Input -->
			<div
				class="flex flex-1 flex-col {isDark
					? 'border-r border-[#1a253c]'
					: 'border-r border-slate-200'} min-h-[220px] sm:min-h-0"
			>
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
						Input
					</span>
					<div class="flex items-center gap-2">
						{#if lineCount > 0}
							<span class="text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">
								{lineCount} baris
							</span>
						{/if}
						{#if input}
							<button
								type="button"
								onclick={clear}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
									? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
									: 'text-slate-400 hover:bg-red-50 hover:text-red-500'}"
							>
								<Trash2 size={11} /> Clear
							</button>
						{/if}
					</div>
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks di sini, satu baris per entri..."
					class="w-full flex-1 resize-none p-4 font-mono text-sm outline-none {isDark
						? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
						: 'bg-white text-slate-800 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- Output -->
			<div class="flex flex-1 flex-col min-h-[180px] sm:min-h-0">
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
						Output
					</span>
					{#if output}
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
					{#if !output && !input}
						<div
							class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center {isDark
								? 'text-slate-700'
								: 'text-slate-300'}"
						>
							<ArrowUpDown size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Hasil sorting muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-sm outline-none {isDark
							? 'bg-[#08101e] text-slate-300'
							: 'bg-slate-50 text-slate-700'}"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>

