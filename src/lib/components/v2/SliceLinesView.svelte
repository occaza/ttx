<script lang="ts">
	import { Scissors, Copy, Check, Trash2, Upload, Play } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state(`Line 1: Alpha
Line 2: Bravo
Line 3: Charlie
Line 4: Delta
Line 5: Echo
Line 6: Foxtrot
Line 7: Golf
Line 8: Hotel
Line 9: India
Line 10: Juliet`);

	let startLine = $state(1);
	let lineCount = $state(5);
	let removeEmpty = $state(false);
	let includeLineNumbers = $state(false);
	let output = $state('');
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	const maxLines = $derived.by(() => {
		if (!input) return 0;
		let lines = input.split(/\r?\n/);
		if (removeEmpty) {
			lines = lines.filter((l) => l.trim() !== '');
		}
		return lines.length;
	});

	function extractLines() {
		if (!input) return;

		let rawLines = input.split(/\r?\n/);
		let lines = rawLines.map((text, index) => ({ text, originalIndex: index, originalLine: index + 1 }));

		if (removeEmpty) {
			lines = lines.filter((l) => l.text.trim() !== '');
		}

		const startIdx = Math.max(0, startLine - 1);
		const endIdx = startIdx + Math.max(0, lineCount);

		const slicedLines = lines.slice(startIdx, endIdx);

		if (includeLineNumbers) {
			output = slicedLines.map((l) => `${l.originalLine} | ${l.text}`).join('\n');
		} else {
			output = slicedLines.map((l) => l.text).join('\n');
		}

		const indicesToRemove = new Set(slicedLines.map((l) => l.originalIndex));
		rawLines = rawLines.filter((_, idx) => !indicesToRemove.has(idx));

		input = rawLines.join('\n');
		startLine = 1;
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

	function clearAll() {
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
</script>

<div class="flex flex-col gap-5 w-full">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<Scissors size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Extract / Slice Lines
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Potong dan ambil jumlah baris spesifik dari dokumen teks Anda
			</p>
		</div>
	</div>

	<!-- Main Workspace -->
	<div class="flex flex-col gap-4 lg:flex-row">
		<!-- Left Settings Panel -->
		<div
			class="flex w-full flex-col gap-4 rounded-xl border p-4 lg:w-64 lg:shrink-0 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<p
				class="text-[10px] font-bold uppercase tracking-wider {isDark
					? 'text-slate-500'
					: 'text-slate-400'}"
			>
				Pengaturan Baris
			</p>

			<div class="space-y-3">
				<div>
					<label
						for="slice-start-line"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Mulai dari baris ke-
					</label>
					<input
						id="slice-start-line"
						type="number"
						bind:value={startLine}
						min="1"
						max={maxLines > 0 ? maxLines : undefined}
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
					/>
				</div>

				<div>
					<label
						for="slice-line-count"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Jumlah baris diambil
					</label>
					<input
						id="slice-line-count"
						type="number"
						bind:value={lineCount}
						min="1"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
					/>
				</div>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Toggles -->
			<div class="space-y-2">
				<p
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Opsi
				</p>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={removeEmpty}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>Abaikan Baris Kosong</span
					>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={includeLineNumbers}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>Sertakan Nomor Baris</span
					>
				</label>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Upload -->
			<input
				bind:this={fileInputEl}
				type="file"
				accept=".txt,.csv,.md"
				class="hidden"
				onchange={handleFileUpload}
			/>
			<button
				type="button"
				onclick={() => fileInputEl?.click()}
				class="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
					: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
			>
				<Upload size={13} /> Upload File
			</button>

			<!-- Extract Action -->
			<button
				type="button"
				onclick={extractLines}
				disabled={!input.trim()}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 {isDark
					? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
			>
				<Scissors size={14} /> Potong & Ambil Baris
			</button>
		</div>

		<!-- Right: Editors -->
		<div
			class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border sm:flex-row {isDark
				? 'border-[#1a253c]'
				: 'border-slate-200'}"
		>
			<!-- Input Pane -->
			<div
				class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 {isDark
					? 'border-r border-[#1a253c]'
					: 'border-r border-slate-200'}"
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
						Input ({maxLines} baris)
					</span>
					{#if input}
						<button
							type="button"
							onclick={clearAll}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
								? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
								: 'text-slate-400 hover:bg-red-50 hover:text-red-500'}"
						>
							<Trash2 size={11} /> Clear
						</button>
					{/if}
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks di sini, satu baris per entri..."
					class="w-full flex-1 resize-none p-4 font-mono text-xs outline-none leading-relaxed {isDark
						? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
						: 'bg-white text-slate-800 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- Output Pane -->
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
						Hasil Potongan
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
					{#if !output}
						<div
							class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center {isDark
								? 'text-slate-700'
								: 'text-slate-300'}"
						>
							<Scissors size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Hasil potongan baris akan muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-xs outline-none leading-relaxed {isDark
							? 'bg-[#08101e] text-slate-300'
							: 'bg-slate-50 text-slate-700'}"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>

