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

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<Regex size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Regex Tool & Tester
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Uji regular expression, ekstrak data pola, atau lakukan substitusi teks
			</p>
		</div>
	</div>

	<!-- Control Panel: Pattern, Modes, Flags, Presets -->
	<div
		class="space-y-4 rounded-xl border p-4 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<!-- Regex Pattern Input -->
		<div>
			<div class="mb-1.5 flex items-center justify-between">
				<label
					for="regex-pattern-input"
					class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-400'
						: 'text-slate-500'}"
				>
					<SlidersHorizontal size={12} /> Pola Regex
				</label>
				<div>
					{#if validation().error}
						<span class="flex items-center gap-1 text-[11px] font-medium text-rose-400">
							<AlertCircle size={12} /> Regex tidak valid
						</span>
					{:else if pattern}
						<span class="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
							<CheckCircle2 size={12} /> Valid
						</span>
					{/if}
				</div>
			</div>

			<div class="relative flex items-center">
				<span
					class="absolute left-3 select-none font-mono text-sm {isDark
						? 'text-slate-500'
						: 'text-slate-400'}">/</span
				>
				<input
					id="regex-pattern-input"
					type="text"
					bind:value={pattern}
					placeholder="Tuliskan ekspresi reguler di sini, contoh: \d+ atau [a-z]+"
					class="h-10 w-full rounded-lg pr-16 pl-7 font-mono text-xs outline-none transition-all {isDark
						? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
				/>
				<span
					class="absolute right-3 select-none font-mono text-xs {isDark
						? 'text-slate-400'
						: 'text-slate-500'}"
				>
					/{flagString()}
				</span>
			</div>
			{#if validation().error}
				<p class="mt-1 font-mono text-[11px] text-rose-400">{validation().error}</p>
			{/if}
		</div>

		<!-- Replace input (if in replace mode) -->
		{#if mode === 'replace'}
			<div>
				<label
					for="regex-replace-input"
					class="mb-1.5 block text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-400'
						: 'text-slate-500'}"
				>
					Substitusi Pengganti
				</label>
				<input
					id="regex-replace-input"
					type="text"
					bind:value={replaceValue}
					placeholder="Teks pengganti (mendukung $1, $2 untuk capture groups)..."
					class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none transition-all {isDark
						? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
				/>
			</div>
		{/if}

		<!-- Modes & Flags Bar -->
		<div
			class="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between border-t {isDark
				? 'border-[#1a253c]'
				: 'border-slate-200'}"
		>
			<!-- Mode buttons -->
			<div
				class="flex flex-wrap items-center gap-1 rounded-lg p-1 border {isDark
					? 'border-[#1e2e50] bg-[#111a2f]'
					: 'border-slate-200 bg-slate-100'}"
			>
				<button
					type="button"
					onclick={() => (mode = 'extract')}
					class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all {mode === 'extract'
						? isDark
							? 'bg-blue-600 text-white shadow-xs'
							: 'bg-white text-blue-600 shadow-xs'
						: isDark
							? 'text-slate-400 hover:text-slate-200'
							: 'text-slate-600 hover:text-slate-900'}"
				>
					Ekstrak
				</button>
				<button
					type="button"
					onclick={() => (mode = 'replace')}
					class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all {mode === 'replace'
						? isDark
							? 'bg-blue-600 text-white shadow-xs'
							: 'bg-white text-blue-600 shadow-xs'
						: isDark
							? 'text-slate-400 hover:text-slate-200'
							: 'text-slate-600 hover:text-slate-900'}"
				>
					Ganti (Replace)
				</button>
				<button
					type="button"
					onclick={() => (mode = 'filter-match')}
					class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all {mode === 'filter-match'
						? isDark
							? 'bg-blue-600 text-white shadow-xs'
							: 'bg-white text-blue-600 shadow-xs'
						: isDark
							? 'text-slate-400 hover:text-slate-200'
							: 'text-slate-600 hover:text-slate-900'}"
				>
					Filter Cocok
				</button>
				<button
					type="button"
					onclick={() => (mode = 'filter-non-match')}
					class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all {mode ===
					'filter-non-match'
						? isDark
							? 'bg-blue-600 text-white shadow-xs'
							: 'bg-white text-blue-600 shadow-xs'
						: isDark
							? 'text-slate-400 hover:text-slate-200'
							: 'text-slate-600 hover:text-slate-900'}"
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
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="font-mono text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">g (global)</span>
				</label>
				<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
					<input
						type="checkbox"
						bind:checked={flags.ignoreCase}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="font-mono text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">i (ignoreCase)</span>
				</label>
				<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
					<input
						type="checkbox"
						bind:checked={flags.multiline}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="font-mono text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">m (multiline)</span>
				</label>
				<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
					<input
						type="checkbox"
						bind:checked={flags.dotAll}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="font-mono text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">s (dotAll)</span>
				</label>
			</div>
		</div>

		<!-- Quick Presets -->
		<div
			class="pt-3 border-t {isDark ? 'border-[#1a253c]' : 'border-slate-200'}"
		>
			<div class="mb-2 flex items-center gap-1.5">
				<Sparkles size={13} class="text-blue-400" />
				<span
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-400'
						: 'text-slate-500'}"
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
						class="rounded-lg border px-2.5 py-1 text-xs font-medium transition-all {isDark
							? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-300'
							: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'}"
					>
						{preset.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Workspace Grid: Input & Output -->
	<div
		class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border lg:flex-row {isDark
			? 'border-[#1a253c]'
			: 'border-slate-200'}"
	>
		<!-- Left: Input Area -->
		<div
			class="flex flex-1 flex-col min-h-[300px] {isDark
				? 'border-b lg:border-b-0 lg:border-r border-[#1a253c]'
				: 'border-b lg:border-b-0 lg:border-r border-slate-200'}"
		>
			<!-- Input Toolbar -->
			<div
				class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div class="flex items-center gap-2">
					<span
						class="text-[10px] font-bold uppercase tracking-wider {isDark
							? 'text-slate-500'
							: 'text-slate-400'}"
					>
						Input Teks
					</span>
					{#if inputStats().lines > 0}
						<span
							class="rounded px-1.5 py-0.5 text-[10px] font-mono {isDark
								? 'bg-[#152037] text-slate-400'
								: 'bg-slate-200 text-slate-600'}"
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
						class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
							? 'text-slate-400 hover:bg-[#16223b] hover:text-slate-200'
							: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
					>
						<Upload size={11} /> Upload
					</button>
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
			</div>

			<textarea
				bind:value={input}
				placeholder="Ketik atau tempel teks dokumen di sini..."
				class="w-full flex-1 resize-none p-4 font-mono text-sm outline-none {isDark
					? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
					: 'bg-white text-slate-800 placeholder-slate-400'}"
			></textarea>
		</div>

		<!-- Right: Output Area -->
		<div class="flex flex-1 flex-col min-h-[300px]">
			<!-- Output Toolbar -->
			<div
				class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div class="flex items-center gap-2">
					<span
						class="text-[10px] font-bold uppercase tracking-wider {isDark
							? 'text-slate-500'
							: 'text-slate-400'}"
					>
						Hasil Output
					</span>
					<span
						class="rounded px-2 py-0.5 text-[10px] font-bold font-mono {matchCount > 0
							? isDark
								? 'bg-blue-600/20 text-blue-400'
								: 'bg-blue-100 text-blue-700'
							: isDark
								? 'bg-[#152037] text-slate-500'
								: 'bg-slate-200 text-slate-500'}"
					>
						{matchCount} cocok
					</span>
					{#if outputStats().lines > 0}
						<span
							class="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-mono {isDark
								? 'bg-[#152037] text-slate-400'
								: 'bg-slate-200 text-slate-600'}"
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
			</div>

			<!-- Output Textarea with Empty State -->
			<div class="relative flex-1">
				{#if !output && !errorMessage}
					<div
						class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center {isDark
							? 'text-slate-700'
							: 'text-slate-300'}"
					>
						<Regex size={36} strokeWidth={1} class="mb-2" />
						<p class="text-xs">Hasil regex akan muncul di sini</p>
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

			<!-- Bottom Action Bar -->
			<div
				class="flex h-11 shrink-0 items-center justify-between border-t px-4 {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<label class="flex cursor-pointer items-center gap-1.5 text-xs">
					<input
						type="checkbox"
						bind:checked={autoRun}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="{isDark ? 'text-slate-400' : 'text-slate-600'}">Proses Otomatis</span>
				</label>

				<button
					type="button"
					onclick={executeRegex}
					class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all {isDark
						? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
						: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
				>
					<Play size={12} fill="currentColor" /> Jalankan Regex
				</button>
			</div>
		</div>
	</div>
</div>

