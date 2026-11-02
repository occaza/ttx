<script lang="ts">
	import {
		Scissors,
		Copy,
		Check,
		Trash2,
		Upload,
		X as XIcon,
		Check as CheckIcon,
		ChevronDown
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state(`John Doe|john@example.com|Jakarta|Admin
Jane Smith|jane@example.com|Surabaya|Editor
Bob Wilson|bob@example.com|Bandung|Member
Alice Brown|alice@example.com|Yogyakarta|User`);

	let copied = $state(false);
	let customDelimiter = $state('');
	let delimiterOption = $state('|');
	let fileInputEl: HTMLInputElement | null = $state(null);

	const maxLabelLength = 10;

	let delimiter = $derived(
		delimiterOption === 'custom' ? customDelimiter || '|' : delimiterOption
	);

	let rows = $derived.by(() => {
		if (!delimiter || !input) return [];
		return input.split(/\r?\n/).filter((l) => l.includes(delimiter));
	});

	let segCount = $derived.by(() => {
		if (!rows.length || !delimiter) return 0;
		return Math.max(...rows.map((r) => r.split(delimiter).length));
	});

	let segmen = $derived.by(() => {
		if (!rows.length || !delimiter) return [];
		return rows[0].split(delimiter).map((s) => {
			const trimmed = s.trim();
			return trimmed.length > maxLabelLength
				? trimmed.substring(0, maxLabelLength) + '...'
				: trimmed;
		});
	});

	let picks = $state<boolean[]>([]);

	$effect(() => {
		if (segCount !== picks.length) {
			picks = Array(segCount).fill(true);
		}
	});

	let output = $derived.by(() => {
		if (!rows.length || !delimiter) return '';
		return rows
			.map((r) =>
				r
					.split(delimiter)
					.filter((_, i) => picks[i] !== false)
					.join(delimiter)
			)
			.join('\n');
	});

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
		copied = false;
		customDelimiter = '';
		if (fileInputEl) fileInputEl.value = '';
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function togglePick(index: number) {
		picks[index] = !picks[index];
	}
</script>

<div class="flex flex-col gap-4 w-full flex-1">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-subtle)] text-[var(--ttx-accent-text)]">
				<Scissors size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
					Split by Delimiter
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Pisahkan teks berdasarkan delimiter kustom dan pilih segmen kolom yang ingin dipertahankan
				</p>
			</div>
		</div>
	</div>

	<!-- Unified Card Container -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Top Controls Strip -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
			<div class="flex flex-wrap items-center gap-2.5">
				<!-- Delimiter Selector -->
				<div class="flex items-center gap-1.5">
					<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Delimiter:</span>
					<div class="relative">
						<select
							bind:value={delimiterOption}
							class="h-7 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 pr-7 text-xs text-[var(--ttx-text-main)] focus:border-[var(--ttx-accent)] outline-none appearance-none cursor-pointer transition-colors"
						>
							<option value="|">Pipe (|)</option>
							<option value="&#9;">Tab</option>
							<option value=" ">Spasi (Space)</option>
							<option value=",">Koma (,)</option>
							<option value=";">Titik Koma (;)</option>
							<option value=":">Titik Dua (:)</option>
							<option value="custom">Kustom...</option>
						</select>
						<ChevronDown
							size={13}
							class="pointer-events-none absolute right-2 top-2 text-[var(--ttx-text-dim)]"
						/>
					</div>
				</div>

				{#if delimiterOption === 'custom'}
					<input
						type="text"
						bind:value={customDelimiter}
						placeholder="~ atau ::"
						maxlength={5}
						class="h-7 w-20 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)] outline-none transition-colors"
					/>
				{/if}

				<!-- Segment Picker Pills -->
				{#if segCount > 0}
					<div class="flex items-center gap-1.5 ml-1 border-l border-[var(--ttx-border-subtle)] pl-2.5">
						<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-muted)] hidden sm:inline">
							Kolom ({segCount}):
						</span>
						<div class="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
							{#each Array(segCount) as _, i (i)}
								{@const kept = picks[i] !== false}
								<button
									type="button"
									onclick={() => togglePick(i)}
									class="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all {kept
										? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
										: 'border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-dim)] line-through opacity-60'}"
									title={kept ? 'Pertahankan kolom ini' : 'Abaikan kolom ini'}
								>
									{#if kept}
										<CheckIcon size={10} class="text-emerald-500" />
									{:else}
										<XIcon size={10} class="text-rose-500" />
									{/if}
									<span>{segmen[i] || `K${i + 1}`}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Actions Strip -->
			<div class="flex items-center gap-2">
				<input
					bind:this={fileInputEl}
					type="file"
					accept=".txt,.csv,.log,.tsv"
					class="hidden"
					onchange={handleFileUpload}
				/>
				<button
					type="button"
					onclick={() => fileInputEl?.click()}
					class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors shadow-xs"
				>
					<Upload size={12} /> Upload
				</button>
				{#if input}
					<button
						type="button"
						onclick={clearAll}
						class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
					>
						<Trash2 size={12} /> Clear
					</button>
				{/if}
				{#if output}
					<button
						type="button"
						onclick={copyOutput}
						class="flex items-center gap-1 rounded-md bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] active:scale-95 px-3 py-1 text-xs font-bold text-white transition-all shadow-xs"
					>
						{#if copied}
							<Check size={12} /> Tersalin!
						{:else}
							<Copy size={12} /> Salin Hasil
						{/if}
					</button>
				{/if}
			</div>
		</div>

		<!-- Split Pane: Input & Output -->
		<div class="flex flex-1 flex-col sm:flex-row min-h-[300px]">
			<!-- Input Side -->
			<div class="flex flex-1 flex-col border-b sm:border-b-0 sm:border-r border-[var(--ttx-border-base)]">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
					<span>Input Data ({rows.length} baris cocok)</span>
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks berdelimiter di sini...&#10;&#10;Contoh: nama|email|kota|status"
					class="w-full flex-1 resize-none p-4 font-mono text-xs sm:text-sm outline-none leading-relaxed bg-transparent text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				></textarea>
			</div>

			<!-- Output Side -->
			<div class="flex flex-1 flex-col bg-[var(--ttx-bg-card-subtle)]">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] px-4 text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
					<span>Hasil Ekstraksi Segmen</span>
				</div>
				<div class="relative flex-1">
					{#if !output}
						<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[var(--ttx-text-dim)]">
							<Scissors size={28} strokeWidth={1.5} class="mb-2 opacity-50" />
							<p class="text-xs">Hasil ekstraksi segmen akan muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-xs sm:text-sm outline-none leading-relaxed bg-transparent text-[var(--ttx-text-main)]"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>

