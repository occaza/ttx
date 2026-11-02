<script lang="ts">
	import {
		Regex,
		Play,
		CheckCircle2,
		AlertCircle,
		Sparkles,
		SlidersHorizontal,
		Copy,
		Check,
		Trash2,
		Upload
	} from '@lucide/svelte';
	import {
		REGEX_PRESETS,
		processRegex,
		compileRegex,
		type RegexFlags,
		type RegexMode,
		type RegexPreset
	} from '$lib/utils/regex';

	let { isDark = true }: { isDark?: boolean } = $props();

	const SAMPLE_INPUT = `Selamat datang di TEXY Regex Tool.
Anda bisa memproses teks langsung atau mengunggah file.

Contoh data uji:
Email admin: admin@domain.com, support: halo@texy.workspace.id
Website: https://texy.workspace.dev dan http://example.org/docs
Nomor HP: +62 812-3456-7890 atau 08123456789
IP Server: 192.168.1.1, 10.0.0.254
Kode produk: PRD-1029, PRD-8821, SKU-9912`;

	let input = $state(SAMPLE_INPUT);
	let pattern = $state('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
	let replaceValue = $state('');
	let mode = $state<RegexMode>('extract');
	let autoRun = $state(true);

	let flags = $state<RegexFlags>({
		global: true,
		ignoreCase: true,
		multiline: false,
		dotAll: false,
		unicode: false
	});

	let output = $state('');
	let matchCount = $state(0);
	let errorMessage = $state<string | null>(null);
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	const flagString = $derived(() => {
		let str = '';
		if (flags.global) str += 'g';
		if (flags.ignoreCase) str += 'i';
		if (flags.multiline) str += 'm';
		if (flags.dotAll) str += 's';
		if (flags.unicode) str += 'u';
		return str;
	});

	const validation = $derived(() => {
		return compileRegex(pattern, flags);
	});

	const inputStats = $derived(() => {
		if (!input) return { lines: 0, chars: 0 };
		const lines = input.split(/\r?\n/).length;
		return { lines, chars: input.length };
	});

	const outputStats = $derived(() => {
		if (!output) return { lines: 0, chars: 0 };
		const lines = output.split(/\r?\n/).length;
		return { lines, chars: output.length };
	});

	function executeRegex() {
		const result = processRegex({
			text: input,
			pattern,
			flags,
			mode,
			replaceValue
		});

		output = result.output;
		matchCount = result.matchCount;
		errorMessage = result.errorMessage;
	}

	$effect(() => {
		if (autoRun) {
			const _in = input;
			const _p = pattern;
			const _f = { ...flags };
			const _m = mode;
			const _r = replaceValue;

			executeRegex();
		}
	});

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			input = (ev.target?.result as string) || '';
			if (!autoRun) executeRegex();
		};
		reader.readAsText(file);
	}

	function clearAll() {
		input = '';
		output = '';
		matchCount = 0;
		errorMessage = null;
		if (fileInputEl) fileInputEl.value = '';
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function applyPreset(preset: RegexPreset) {
		pattern = preset.pattern;
		flags.global = preset.flags.global ?? true;
		flags.ignoreCase = preset.flags.ignoreCase ?? false;
		flags.multiline = preset.flags.multiline ?? false;
		flags.dotAll = preset.flags.dotAll ?? false;
		flags.unicode = preset.flags.unicode ?? false;
		mode = 'extract';
	}
</script>

<div class="flex flex-col gap-5 flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
		>
			<Regex size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
				Regex Tool & Tester
			</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">
				Uji regular expression, ekstrak data pola, atau lakukan substitusi teks
			</p>
		</div>
	</div>

	<!-- Unified Card: Control Panel + Split Editor -->
	<div
		class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs"
	>
		<!-- Control Panel: Pattern, Modes, Flags, Presets -->
		<div class="space-y-3.5 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4">
			<!-- Regex Pattern Input -->
			<div>
				<div class="mb-1.5 flex items-center justify-between">
					<label
						for="regex-pattern-input"
						class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]"
					>
						<SlidersHorizontal size={12} /> Pola Regex
					</label>
					<div>
						{#if validation().error}
							<span class="flex items-center gap-1 text-[11px] font-medium text-rose-500">
								<AlertCircle size={12} /> Regex tidak valid
							</span>
						{:else if pattern}
							<span class="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
								<CheckCircle2 size={12} /> Valid
							</span>
						{/if}
					</div>
				</div>

				<div class="relative flex items-center">
					<span
						class="absolute left-3 select-none font-mono text-sm text-[var(--ttx-text-dim)]"
					>/</span
					>
					<input
						id="regex-pattern-input"
						type="text"
						bind:value={pattern}
						placeholder="Tuliskan ekspresi reguler di sini, contoh: \d+ atau [a-z]+"
						class="h-10 w-full rounded-xl pr-16 pl-7 font-mono text-xs outline-none transition-all border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
					<span
						class="absolute right-3 select-none font-mono text-xs text-[var(--ttx-text-dim)]"
					>
						/{flagString()}
					</span>
				</div>
				{#if validation().error}
					<p class="mt-1 font-mono text-[11px] text-rose-500">{validation().error}</p>
				{/if}
			</div>

			<!-- Replace input (if in replace mode) -->
			{#if mode === 'replace'}
				<div>
					<label
						for="regex-replace-input"
						class="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]"
					>
						Substitusi Pengganti
					</label>
					<input
						id="regex-replace-input"
						type="text"
						bind:value={replaceValue}
						placeholder="Teks pengganti (mendukung $1, $2 untuk capture groups)..."
						class="h-9 w-full rounded-xl px-3 font-mono text-xs outline-none transition-all border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>
			{/if}

			<!-- Modes & Flags Bar -->
			<div
				class="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--ttx-border-base)]"
			>
				<!-- Mode buttons -->
				<div
					class="flex flex-wrap items-center gap-1 rounded-xl p-1 border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]"
				>
					<button
						type="button"
						onclick={() => (mode = 'extract')}
						class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all {mode === 'extract'
							? 'bg-[var(--ttx-accent)] text-white shadow-xs'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
					>
						Ekstrak
					</button>
					<button
						type="button"
						onclick={() => (mode = 'replace')}
						class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all {mode === 'replace'
							? 'bg-[var(--ttx-accent)] text-white shadow-xs'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
					>
						Ganti (Replace)
					</button>
					<button
						type="button"
						onclick={() => (mode = 'filter-match')}
						class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all {mode === 'filter-match'
							? 'bg-[var(--ttx-accent)] text-white shadow-xs'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
					>
						Filter Cocok
					</button>
					<button
						type="button"
						onclick={() => (mode = 'filter-non-match')}
						class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all {mode === 'filter-non-match'
							? 'bg-[var(--ttx-accent)] text-white shadow-xs'
							: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
					>
						Filter Tak Cocok
					</button>
				</div>

				<!-- Flags -->
				<div class="flex flex-wrap items-center gap-3">
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
						<input
							type="checkbox"
							bind:checked={flags.global}
							class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
						/>
						<span class="font-mono text-xs text-[var(--ttx-text-main)]">g (global)</span>
					</label>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
						<input
							type="checkbox"
							bind:checked={flags.ignoreCase}
							class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
						/>
						<span class="font-mono text-xs text-[var(--ttx-text-main)]">i (ignoreCase)</span>
					</label>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
						<input
							type="checkbox"
							bind:checked={flags.multiline}
							class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
						/>
						<span class="font-mono text-xs text-[var(--ttx-text-main)]">m (multiline)</span>
					</label>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
						<input
							type="checkbox"
							bind:checked={flags.dotAll}
							class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
						/>
						<span class="font-mono text-xs text-[var(--ttx-text-main)]">s (dotAll)</span>
					</label>
				</div>
			</div>

			<!-- Quick Presets -->
			<div
				class="pt-3 border-t border-[var(--ttx-border-base)]"
			>
				<div class="mb-2 flex items-center gap-1.5">
					<Sparkles size={13} class="text-[var(--ttx-accent-text)]" />
					<span
						class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]"
					>
						Pola Cepat (Presets)
					</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each REGEX_PRESETS as preset}
						<button
							type="button"
							onclick={() => applyPreset(preset)}
							title={preset.description}
							class="rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--ttx-text-muted)] hover:border-[var(--ttx-accent)] hover:text-[var(--ttx-accent-text)] hover:bg-[var(--ttx-accent-light)] transition-all"
						>
							{preset.name}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Workspace Grid: Input & Output -->
		<div
			class="flex min-w-0 flex-1 flex-col lg:flex-row"
		>
			<!-- Left: Input Area -->
			<div
				class="flex flex-1 flex-col min-h-[300px] border-b lg:border-b-0 lg:border-r border-[var(--ttx-border-base)]"
			>
				<!-- Input Toolbar -->
				<div
					class="flex h-10 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4"
				>
					<div class="flex items-center gap-2">
						<span
							class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]"
						>
							Input Teks
						</span>
						{#if inputStats().lines > 0}
							<span
								class="rounded px-1.5 py-0.5 text-[10px] font-mono bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] border border-[var(--ttx-border-subtle)]"
							>
								{inputStats().lines} baris, {inputStats().chars} kar
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						<input
							bind:this={fileInputEl}
							type="file"
							accept=".txt,.csv,.log,.json,.md,.xml,.html,text/*"
							class="hidden"
							onchange={handleFileUpload}
						/>
						<button
							type="button"
							onclick={() => fileInputEl?.click()}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
						>
							<Upload size={11} /> Upload
						</button>
						{#if input}
							<button
								type="button"
								onclick={clearAll}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
							>
								<Trash2 size={11} /> Clear
							</button>
						{/if}
					</div>
				</div>

				<textarea
					bind:value={input}
					placeholder="Ketik atau tempel teks dokumen di sini..."
					class="w-full flex-1 resize-none p-4 font-mono text-sm outline-none bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				></textarea>
			</div>

			<!-- Right: Output Area -->
			<div class="flex flex-1 flex-col min-h-[300px]">
				<!-- Output Toolbar -->
				<div
					class="flex h-10 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4"
				>
					<div class="flex items-center gap-2">
						<span
							class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]"
						>
							Hasil Output
						</span>
						<span
							class="rounded px-2 py-0.5 text-[10px] font-bold font-mono {matchCount > 0
								? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-border-subtle)]'
								: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)]'}"
						>
							{matchCount} cocok
						</span>
						{#if outputStats().lines > 0}
							<span
								class="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-mono bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)]"
							>
								{outputStats().lines} baris
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						{#if output}
							<button
								type="button"
								onclick={copyOutput}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {copied
									? 'bg-emerald-500/10 text-emerald-500'
									: 'text-[var(--ttx-text-dim)] hover:text-[var(--ttx-accent-text)] hover:bg-[var(--ttx-accent-light)]'}"
							>
								{#if copied}
									<Check size={11} /> Copied!
								{:else}
									<Copy size={11} /> Copy
								{/if}
							</button>
						{/if}
					</div>
				</div>

				<!-- Output Textarea with Empty State -->
				<div class="relative flex-1">
					{#if !output && !errorMessage}
						<div
							class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[var(--ttx-text-dim)]"
						>
							<Regex size={36} strokeWidth={1} class="mb-2 opacity-40" />
							<p class="text-xs">Hasil regex akan muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-sm outline-none bg-[var(--ttx-bg-card-subtle)] text-[var(--ttx-text-muted)]"
					></textarea>
				</div>

				<!-- Bottom Action Bar -->
				<div
					class="flex h-11 shrink-0 items-center justify-between border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4"
				>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs">
						<input
							type="checkbox"
							bind:checked={autoRun}
							class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
						/>
						<span class="text-[var(--ttx-text-muted)]">Proses Otomatis</span>
					</label>

					<button
						type="button"
						onclick={executeRegex}
						class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95 shadow-xs"
					>
						<Play size={12} fill="currentColor" /> Jalankan Regex
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

