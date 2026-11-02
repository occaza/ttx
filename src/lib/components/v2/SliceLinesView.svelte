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

<div class="flex flex-col gap-5 w-full flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]">
			<Scissors size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
				Extract / Slice Lines
			</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">
				Potong dan ambil jumlah baris spesifik dari dokumen teks Anda
			</p>
		</div>
	</div>

	<!-- Main Workspace -->
	<div class="flex flex-col gap-4 lg:flex-row flex-1 min-h-[520px] lg:min-h-[calc(100dvh-13.5rem)]">
		<!-- Left Settings Panel -->
		<div class="flex w-full lg:w-72 shrink-0 flex-col gap-4 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4">
			<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
				Pengaturan Baris
			</p>

			<div class="space-y-3">
				<div>
					<label
						for="slice-start-line"
						class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
					>
						Mulai dari baris ke-
					</label>
					<input
						id="slice-start-line"
						type="number"
						bind:value={startLine}
						min="1"
						max={maxLines > 0 ? maxLines : undefined}
						class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] outline-none focus:border-[var(--ttx-border-focus)]"
					/>
				</div>

				<div>
					<label
						for="slice-line-count"
						class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
					>
						Jumlah baris diambil
					</label>
					<input
						id="slice-line-count"
						type="number"
						bind:value={lineCount}
						min="1"
						class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] outline-none focus:border-[var(--ttx-border-focus)]"
					/>
				</div>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Toggles -->
			<div class="space-y-2">
				<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
					Opsi
				</p>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={removeEmpty}
						class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
					/>
					<span class="text-xs text-[var(--ttx-text-muted)]">Abaikan Baris Kosong</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={includeLineNumbers}
						class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
					/>
					<span class="text-xs text-[var(--ttx-text-muted)]">Sertakan Nomor Baris</span>
				</label>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

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
				class="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
			>
				<Upload size={13} /> Upload File
			</button>

			<!-- Extract Action -->
			<button
				type="button"
				onclick={extractLines}
				disabled={!input.trim()}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95"
			>
				<Scissors size={14} /> Potong & Ambil Baris
			</button>
		</div>

		<!-- Right: Editors -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs sm:flex-row">
			<!-- Input Pane -->
			<div class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 border-r border-[var(--ttx-border-base)]">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Input ({maxLines} baris)
					</span>
					{#if input}
						<button
							type="button"
							onclick={clearAll}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors text-[var(--ttx-text-dim)] hover:bg-rose-500/10 hover:text-rose-500"
						>
							<Trash2 size={11} /> Clear
						</button>
					{/if}
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks di sini, satu baris per entri..."
					class="w-full flex-1 resize-none bg-[var(--ttx-bg-card)] p-4 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none leading-relaxed"
				></textarea>
			</div>

			<!-- Output Pane -->
			<div class="flex flex-1 flex-col min-h-[220px] sm:min-h-0">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Hasil Potongan
					</span>
					{#if output}
						<button
							type="button"
							onclick={copyOutput}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {copied ? 'bg-emerald-500/10 text-emerald-500' : 'text-[var(--ttx-text-dim)] hover:bg-[var(--ttx-accent-light)] hover:text-[var(--ttx-accent-text)]'}"
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
						<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[var(--ttx-text-dim)]">
							<Scissors size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Hasil potongan baris akan muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 h-full w-full resize-none bg-[var(--ttx-bg-card-subtle)] p-4 font-mono text-xs text-[var(--ttx-text-muted)] outline-none leading-relaxed"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>
