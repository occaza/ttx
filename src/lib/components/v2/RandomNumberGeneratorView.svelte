<script lang="ts">
	import { Dices, Copy, Check, Trash2, Download, RefreshCw } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let qty = $state(15);
	let min = $state(1);
	let max = $state(100);
	let prefix = $state('');
	let suffix = $state('');
	let padOn = $state(false);
	let output = $state('');
	let copied = $state(false);

	function digits(n: number): number {
		return n.toString().length;
	}

	function generate() {
		const list: string[] = [];
		const safeMin = Math.min(min, max);
		const safeMax = Math.max(min, max);
		const padLen = padOn ? digits(safeMax) : 0;

		for (let i = 0; i < qty; i++) {
			const raw = Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
			const padded = padLen > 0 ? raw.toString().padStart(padLen, '0') : raw.toString();
			list.push(prefix + padded + suffix);
		}
		output = list.join('\n');
	}

	function clearAll() {
		output = '';
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function downloadOutput() {
		if (!output) return;
		const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'random_numbers.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	const totalOutputLines = $derived(output ? output.split(/\r?\n/).length : 0);
</script>

<div class="flex flex-col gap-5 w-full">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<Dices size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Random Number Generator
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Hasilkan sekumpulan angka acak dengan rentang, prefix, suffix, dan padding yang dapat disesuaikan
			</p>
		</div>
	</div>

	<!-- Main Layout -->
	<div class="flex flex-col gap-4 lg:flex-row">
		<!-- Left Settings Panel -->
		<div
			class="flex w-full flex-col gap-4 rounded-xl border p-4 lg:w-72 lg:shrink-0 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<p
				class="text-[10px] font-bold uppercase tracking-wider {isDark
					? 'text-slate-500'
					: 'text-slate-400'}"
			>
				Konfigurasi Angka
			</p>

			<div class="space-y-3">
				<div>
					<label
						for="rand-qty"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Jumlah Angka (Quantity)
					</label>
					<input
						id="rand-qty"
						type="number"
						bind:value={qty}
						min="1"
						max="10000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label
							for="rand-min"
							class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>
							Batas Min
						</label>
						<input
							id="rand-min"
							type="number"
							bind:value={min}
							class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
								: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
						/>
					</div>
					<div>
						<label
							for="rand-max"
							class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>
							Batas Max
						</label>
						<input
							id="rand-max"
							type="number"
							bind:value={max}
							class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
								: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
						/>
					</div>
				</div>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Affixes -->
			<div class="space-y-3">
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label
							for="rand-prefix"
							class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>
							Prefix
						</label>
						<input
							id="rand-prefix"
							type="text"
							bind:value={prefix}
							placeholder="e.g. ID-"
							class="h-8 w-full rounded-lg px-2.5 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-600'
								: 'border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400'}"
						/>
					</div>
					<div>
						<label
							for="rand-suffix"
							class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>
							Suffix
						</label>
						<input
							id="rand-suffix"
							type="text"
							bind:value={suffix}
							placeholder="opsional"
							class="h-8 w-full rounded-lg px-2.5 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-600'
								: 'border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400'}"
						/>
					</div>
				</div>

				<label class="flex cursor-pointer items-center gap-2 pt-1">
					<input
						type="checkbox"
						bind:checked={padOn}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<div>
						<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">Padding Angka</span>
						<p class="text-[10px] {isDark ? 'text-slate-500' : 'text-slate-400'}">
							Tambah angka nol di depan (001, 002)
						</p>
					</div>
				</label>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Generate Button -->
			<button
				type="button"
				onclick={generate}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all {isDark
					? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
			>
				<RefreshCw size={14} /> Generate Angka
			</button>
		</div>

		<!-- Right: Output Editor Panel -->
		<div
			class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<!-- Toolbar -->
			<div
				class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
					? 'border-[#1a253c] bg-[#10192d]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div class="flex items-center gap-2">
					<span
						class="text-[10px] font-bold uppercase tracking-wider {isDark
							? 'text-slate-500'
							: 'text-slate-400'}"
					>
						Hasil Angka Acak
					</span>
					{#if totalOutputLines > 0}
						<span
							class="rounded px-2 py-0.5 text-[10px] font-mono font-bold {isDark
								? 'bg-[#16223b] text-blue-400'
								: 'bg-blue-50 text-blue-700'}"
						>
							{totalOutputLines} angka
						</span>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					{#if output}
						<button
							type="button"
							onclick={downloadOutput}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
								? 'text-slate-400 hover:bg-[#16223b] hover:text-slate-200'
								: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
						>
							<Download size={11} /> Download .txt
						</button>
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
						<button
							type="button"
							onclick={clearAll}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
						>
							<Trash2 size={11} /> Clear
						</button>
					{/if}
				</div>
			</div>

			<!-- Output Area -->
			<div class="relative flex-1 min-h-[380px]">
				{#if !output}
					<div
						class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center {isDark
							? 'text-slate-700'
							: 'text-slate-300'}"
					>
						<Dices size={36} strokeWidth={1} class="mb-2" />
						<p class="text-xs">Klik tombol "Generate Angka" untuk membuat angka acak</p>
					</div>
				{/if}
				<textarea
					value={output}
					readonly
					rows={18}
					class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-xs outline-none leading-relaxed {isDark
						? 'bg-[#08101e] text-slate-200'
						: 'bg-slate-50 text-slate-800'}"
				></textarea>
			</div>
		</div>
	</div>
</div>

