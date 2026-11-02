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

<div class="flex flex-1 flex-col gap-5">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]">
			<ArrowUpDown size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">Sort Lines</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">
				Urutkan baris teks secara alfabetis
			</p>
		</div>
	</div>

	<!-- Main layout -->
	<div class="flex flex-1 flex-col gap-4 lg:flex-row">
		<!-- Options panel -->
		<div class="flex w-full lg:w-72 shrink-0 flex-col gap-4 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4">
			<!-- Sort Order -->
			<div>
				<p class="mb-2 text-[10px] font-bold tracking-wider uppercase text-[var(--ttx-text-dim)]">
					Sort Order
				</p>
				<div class="grid grid-cols-2 gap-1.5">
					<button
						type="button"
						onclick={() => (order = 'asc')}
						class="flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-all {order === 'asc'
							? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]'
							: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]'}"
					>
						<ArrowUp size={13} /> A→Z
					</button>
					<button
						type="button"
						onclick={() => (order = 'desc')}
						class="flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-all {order === 'desc'
							? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]'
							: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]'}"
					>
						<ArrowDown size={13} /> Z→A
					</button>
				</div>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Options -->
			<div class="space-y-3">
				<p class="text-[10px] font-bold tracking-wider uppercase text-[var(--ttx-text-dim)]">
					Options
				</p>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={caseSensitive}
						class="h-4 w-4 rounded accent-[var(--ttx-accent)]"
					/>
					<div>
						<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Case Sensitive</span>
						<p class="text-[10px] text-[var(--ttx-text-dim)]">A ≠ a</p>
					</div>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={removeDup}
						class="h-4 w-4 rounded accent-[var(--ttx-accent)]"
					/>
					<div>
						<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Remove Duplicates</span>
						<p class="text-[10px] text-[var(--ttx-text-dim)]">
							Hapus baris sama
						</p>
					</div>
				</label>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Upload -->
			<div>
				<p class="mb-2 text-[10px] font-bold tracking-wider uppercase text-[var(--ttx-text-dim)]">
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
					class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
				>
					<Upload size={13} /> Upload .txt / .csv
				</button>
			</div>

			<!-- Execute -->
			<button
				type="button"
				onclick={sortLines}
				disabled={!input.trim()}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95"
			>
				<ArrowUpDown size={14} /> Sort Lines
			</button>
		</div>

		<!-- Editor panel -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs sm:flex-row">
			<!-- Input -->
			<div class="flex flex-1 flex-col border-r border-[var(--ttx-border-base)] min-h-[220px] sm:min-h-0">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold tracking-wider uppercase text-[var(--ttx-text-dim)]">
						Input
					</span>
					<div class="flex items-center gap-2">
						{#if lineCount > 0}
							<span class="text-[10px] text-[var(--ttx-text-dim)]">
								{lineCount} baris
							</span>
						{/if}
						{#if input}
							<button
								type="button"
								onclick={clear}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors text-[var(--ttx-text-dim)] hover:bg-rose-500/10 hover:text-rose-500"
							>
								<Trash2 size={11} /> Clear
							</button>
						{/if}
					</div>
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks di sini, satu baris per entri..."
					class="w-full flex-1 resize-none bg-[var(--ttx-bg-card)] p-4 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none"
				></textarea>
			</div>

			<!-- Output -->
			<div class="flex min-h-[180px] flex-1 flex-col sm:min-h-0">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold tracking-wider uppercase text-[var(--ttx-text-dim)]">
						Output
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
					{#if !output && !input}
						<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[var(--ttx-text-dim)]">
							<ArrowUpDown size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Hasil sorting muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 h-full w-full resize-none bg-[var(--ttx-bg-card-subtle)] p-4 font-mono text-sm text-[var(--ttx-text-muted)] outline-none"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>
