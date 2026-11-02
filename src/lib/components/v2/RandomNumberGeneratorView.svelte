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

<div class="flex flex-col gap-5 w-full flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
		>
			<Dices size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
				Random Number Generator
			</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">
				Hasilkan sekumpulan angka acak dengan rentang, prefix, suffix, dan padding yang dapat disesuaikan
			</p>
		</div>
	</div>

	<!-- Main Layout -->
	<div class="flex flex-col gap-4 lg:flex-row flex-1">
		<!-- Left Settings Panel -->
		<div
			class="flex w-full flex-col gap-4 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4 lg:w-72 lg:shrink-0"
		>
			<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
				Konfigurasi Angka
			</p>

			<div class="space-y-3">
				<div>
					<label
						for="rand-qty"
						class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
					>
						Jumlah Angka (Quantity)
					</label>
					<input
						id="rand-qty"
						type="number"
						bind:value={qty}
						min="1"
						max="10000"
						class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] outline-none focus:border-[var(--ttx-border-focus)]"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label
							for="rand-min"
							class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
						>
							Batas Min
						</label>
						<input
							id="rand-min"
							type="number"
							bind:value={min}
							class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] outline-none focus:border-[var(--ttx-border-focus)]"
						/>
					</div>
					<div>
						<label
							for="rand-max"
							class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
						>
							Batas Max
						</label>
						<input
							id="rand-max"
							type="number"
							bind:value={max}
							class="h-9 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] outline-none focus:border-[var(--ttx-border-focus)]"
						/>
					</div>
				</div>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Affixes -->
			<div class="space-y-3">
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label
							for="rand-prefix"
							class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
						>
							Prefix
						</label>
						<input
							id="rand-prefix"
							type="text"
							bind:value={prefix}
							placeholder="e.g. ID-"
							class="h-8 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none"
						/>
					</div>
					<div>
						<label
							for="rand-suffix"
							class="mb-1 block text-xs font-medium text-[var(--ttx-text-muted)]"
						>
							Suffix
						</label>
						<input
							id="rand-suffix"
							type="text"
							bind:value={suffix}
							placeholder="opsional"
							class="h-8 w-full rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none"
						/>
					</div>
				</div>

				<label class="flex cursor-pointer items-center gap-2 pt-1">
					<input
						type="checkbox"
						bind:checked={padOn}
						class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
					/>
					<div>
						<span class="text-xs text-[var(--ttx-text-muted)]">Padding Angka</span>
						<p class="text-[10px] text-[var(--ttx-text-dim)]">
							Tambah angka nol di depan (001, 002)
						</p>
					</div>
				</label>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Generate Button -->
			<button
				type="button"
				onclick={generate}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95"
			>
				<RefreshCw size={14} /> Generate Angka
			</button>
		</div>

		<!-- Right: Output Editor Panel (unified card) -->
		<div
			class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs"
		>
			<!-- Toolbar -->
			<div
				class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4"
			>
				<div class="flex items-center gap-2">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Hasil Angka Acak
					</span>
					{#if totalOutputLines > 0}
						<span
							class="rounded px-2 py-0.5 text-[10px] font-mono font-bold bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
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
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors text-[var(--ttx-text-dim)] hover:bg-[var(--ttx-accent-light)] hover:text-[var(--ttx-accent-text)]"
						>
							<Download size={11} /> Download .txt
						</button>
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
						<button
							type="button"
							onclick={clearAll}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors text-[var(--ttx-text-dim)] hover:bg-rose-500/10 hover:text-rose-500"
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
						class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[var(--ttx-text-dim)]"
					>
						<Dices size={36} strokeWidth={1} class="mb-2" />
						<p class="text-xs">Klik tombol "Generate Angka" untuk membuat angka acak</p>
					</div>
				{/if}
				<textarea
					value={output}
					readonly
					rows={18}
					class="absolute inset-0 h-full w-full resize-none bg-[var(--ttx-bg-card-subtle)] p-4 font-mono text-xs text-[var(--ttx-text-muted)] outline-none leading-relaxed"
				></textarea>
			</div>
		</div>
	</div>
</div>
