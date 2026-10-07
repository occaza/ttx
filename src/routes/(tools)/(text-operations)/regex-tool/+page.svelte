<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import {
		ArrowLeft,
		Regex,
		Play,
		CheckCircle2,
		AlertCircle,
		Sparkles,
		SlidersHorizontal
	} from '@lucide/svelte';
	import {
		REGEX_PRESETS,
		processRegex,
		compileRegex,
		type RegexFlags,
		type RegexMode,
		type RegexPreset
	} from '$lib/utils/regex';

	let input = $state(`Selamat datang di TEXY Regex Tool.
Anda bisa memproses teks langsung atau mengunggah file.

Contoh data uji:
Email admin: admin@domain.com, support: halo@texy.workspace.id
Website: https://texy.workspace.dev dan http://example.org/docs
Nomor HP: +62 812-3456-7890 atau 08123456789
IP Server: 192.168.1.1, 10.0.0.254
Kode produk: PRD-1029, PRD-8821, SKU-9912`);

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

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;
	let outputTextarea: TextArea;

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
		// Re-run automatically if autoRun is active
		if (autoRun) {
			// Read reactive dependencies
			const _in = input;
			const _p = pattern;
			const _f = { ...flags };
			const _m = mode;
			const _r = replaceValue;

			executeRegex();
		}
	});

	function handleLoad(content: string) {
		input = content;
		if (!autoRun) {
			executeRegex();
		}
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function handleSelectAll() {
		inputTextarea.select();
	}

	function handleClearInput() {
		input = '';
		output = '';
		matchCount = 0;
		errorMessage = null;
		if (fileUpload) fileUpload.reset();
	}

	function handleCopyOutput() {
		if (output) {
			navigator.clipboard.writeText(output);
		}
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

<svelte:head>
	<title>Regex Tool & Tester - TEXY Workspace</title>
	<meta
		name="description"
		content="Uji ekspresi reguler (Regex), ekstrak pola teks, atau ganti konten dokumen secara instan dengan dukungan input file."
	/>
	<meta
		name="keywords"
		content="regex tool, regex tester, ekstrak regex, regular expression, text extractor, regex replace"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/regex-tool" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Regex Tool & Tester - TEXY Workspace" />
	<meta
		property="og:description"
		content="Uji ekspresi reguler (Regex), ekstrak pola teks, atau ganti konten dokumen secara instan."
	/>
	<meta property="og:url" content="{$page.url.origin}/regex-tool" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Regex Tool & Tester - TEXY Workspace" />
	<meta
		name="twitter:description"
		content="Uji ekspresi reguler (Regex), ekstrak pola teks, atau ganti konten dokumen secara instan."
	/>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Background Grid Pattern -->
	<div
		class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
		<!-- Header -->
		<div class="mb-6">
			<a
				href="/"
				class="mb-4 inline-flex items-center text-sm font-medium text-base-content/50 hover:text-base-content transition-colors"
			>
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md"
				>
					<Regex size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Regex Tool & Tester</h1>
					<p class="mt-1 text-sm text-base-content/60">
						Uji pola Regular Expression, ekstrak data penting, atau lakukan substitusi teks dari file dokumen.
					</p>
				</div>
			</div>
		</div>

		<!-- Control Center Panel: Regex Pattern, Modes & Flags -->
		<div
			class="mb-6 rounded-2xl border border-base-content/10 bg-base-100/90 shadow-xl backdrop-blur-md p-5 md:p-6 space-y-5"
		>
			<!-- Top Row: Regex Pattern Input -->
			<div>
				<div class="flex items-center justify-between mb-2">
					<label for="regex-pattern" class="text-xs font-bold text-base-content/60 uppercase tracking-wider flex items-center gap-1.5">
						<SlidersHorizontal size={14} />
						Pola Regular Expression
					</label>
					<div class="flex items-center gap-2">
						{#if validation().error}
							<span class="text-xs text-error font-medium flex items-center gap-1">
								<AlertCircle size={13} />
								Regex tidak valid
							</span>
						{:else if pattern}
							<span class="text-xs text-success font-medium flex items-center gap-1">
								<CheckCircle2 size={13} />
								Regex valid
							</span>
						{/if}
					</div>
				</div>

				<div class="relative flex items-center">
					<span class="absolute left-3.5 text-base-content/40 font-mono text-base select-none">/</span>
					<input
						id="regex-pattern"
						type="text"
						bind:value={pattern}
						placeholder="Tuliskan ekspresi reguler di sini, contoh: \d+ atau [a-z]+"
						class="input input-bordered w-full pl-8 pr-16 font-mono text-sm bg-base-200/40 border-base-content/15 focus:border-primary/50 focus:bg-base-100 transition-all rounded-xl"
					/>
					<span class="absolute right-3.5 text-base-content/50 font-mono text-xs select-none">
						/{flagString()}
					</span>
				</div>

				{#if validation().error}
					<p class="mt-1.5 text-xs text-error font-mono">{validation().error}</p>
				{/if}
			</div>

			<!-- Middle Row: Replacement Input (Visible only in Replace mode) -->
			{#if mode === 'replace'}
				<div class="animate-in fade-in slide-in-from-top-1">
					<label for="replace-input" class="text-xs font-bold text-base-content/60 uppercase tracking-wider block mb-2">
						Substitusi Pengganti (Replace Value)
					</label>
					<input
						id="replace-input"
						type="text"
						bind:value={replaceValue}
						placeholder="Teks pengganti (mendukung $1, $2 untuk capture groups)..."
						class="input input-bordered w-full font-mono text-sm bg-base-200/40 border-base-content/15 focus:border-primary/50 focus:bg-base-100 transition-all rounded-xl"
					/>
				</div>
			{/if}

			<!-- Bottom Options: Modes, Flags, and Presets -->
			<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-base-content/5">
				<!-- Operation Modes -->
				<div class="flex flex-wrap items-center gap-1.5 bg-base-200/40 p-1 rounded-xl border border-base-content/5">
					<button
						type="button"
						class="btn btn-xs rounded-lg font-semibold transition-all {mode === 'extract' ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content/70'}"
						onclick={() => (mode = 'extract')}
					>
						Ekstrak Kecocokan
					</button>
					<button
						type="button"
						class="btn btn-xs rounded-lg font-semibold transition-all {mode === 'replace' ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content/70'}"
						onclick={() => (mode = 'replace')}
					>
						Ganti Teks (Replace)
					</button>
					<button
						type="button"
						class="btn btn-xs rounded-lg font-semibold transition-all {mode === 'filter-match' ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content/70'}"
						onclick={() => (mode = 'filter-match')}
					>
						Filter Baris Cocok
					</button>
					<button
						type="button"
						class="btn btn-xs rounded-lg font-semibold transition-all {mode === 'filter-non-match' ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content/70'}"
						onclick={() => (mode = 'filter-non-match')}
					>
						Filter Baris Tak Cocok
					</button>
				</div>

				<!-- Flags Checkboxes -->
				<div class="flex flex-wrap items-center gap-3 sm:gap-4">
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={flags.global} />
						<span class="font-mono">g</span> (global)
					</label>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={flags.ignoreCase} />
						<span class="font-mono">i</span> (ignoreCase)
					</label>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={flags.multiline} />
						<span class="font-mono">m</span> (multiline)
					</label>
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={flags.dotAll} />
						<span class="font-mono">s</span> (dotAll)
					</label>
				</div>
			</div>

			<!-- Preset Quick Buttons -->
			<div class="pt-3 border-t border-base-content/5">
				<div class="flex items-center gap-2 mb-2">
					<Sparkles size={14} class="text-primary" />
					<span class="text-xs font-bold text-base-content/50 uppercase tracking-wider">Template Pola Cepat</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each REGEX_PRESETS as preset}
						<button
							type="button"
							class="badge badge-sm badge-outline border-base-content/15 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer py-2.5 px-3 rounded-lg text-xs"
							title={preset.description}
							onclick={() => applyPreset(preset)}
						>
							{preset.name}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Workspaces: Two Columns (Input vs Output) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
			<!-- Left Column: Input File / Text -->
			<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md overflow-hidden min-h-[520px]">
				<!-- Input Top Bar -->
				<div class="flex flex-wrap items-center justify-between border-b border-base-content/10 bg-base-200/30 px-4 py-3 gap-3">
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold text-base-content/70 uppercase tracking-wider">Input Teks</span>
						<span class="badge badge-sm badge-ghost text-[10px] font-mono">
							{inputStats().lines} baris, {inputStats().chars} kar
						</span>
					</div>

					<div class="flex items-center gap-2">
						<ActionButton
							showSelectAll={true}
							showClear={true}
							showCopy={false}
							onselectall={handleSelectAll}
							onclear={handleClearInput}
						/>
					</div>
				</div>

				<!-- File Upload Field -->
				<div class="p-3 bg-base-200/15 border-b border-base-content/5">
					<FileUploadInput
						bind:this={fileUpload}
						onload={handleLoad}
						onerror={handleError}
						accept=".txt,.csv,.log,.json,.md,.xml,.html,text/*"
						size="xs"
					/>
				</div>

				<!-- Input Textarea -->
				<div class="relative flex-1 bg-transparent p-2">
					<TextArea
						bind:this={inputTextarea}
						bind:value={input}
						placeholder="Ketik atau tempel teks dokumen di sini..."
						rows={18}
						className="w-full h-full resize-none border-none bg-transparent p-3 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[380px]"
					/>
				</div>
			</div>

			<!-- Right Column: Result Output -->
			<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md overflow-hidden min-h-[520px]">
				<!-- Output Top Bar -->
				<div class="flex flex-wrap items-center justify-between border-b border-base-content/10 bg-base-200/30 px-4 py-3 gap-3">
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold text-base-content/70 uppercase tracking-wider">Hasil Output</span>
						<span class="badge badge-sm badge-primary font-mono text-[11px]">
							{matchCount} cocok
						</span>
						{#if outputStats().lines > 0}
							<span class="badge badge-sm badge-ghost text-[10px] font-mono hidden sm:inline-flex">
								{outputStats().lines} baris
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						<SaveFiles content={output} defaultName="hasil_regex.txt" />
						<ActionButton
							showSelectAll={false}
							showClear={false}
							showCopy={true}
							oncopy={handleCopyOutput}
						/>
					</div>
				</div>

				<!-- Output Textarea -->
				<div class="relative flex-1 bg-base-200/5 p-2">
					{#if !output && !errorMessage}
						<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/30 pointer-events-none p-4 text-center">
							<Regex size={40} strokeWidth={1} class="mb-2 opacity-40" />
							<p class="text-sm font-medium">Hasil proses regex akan muncul di sini</p>
							<p class="text-xs opacity-75 mt-1">Gunakan tombol atau ubah pola regex untuk memproses</p>
						</div>
					{/if}
					<TextArea
						bind:this={outputTextarea}
						value={output}
						rows={18}
						readonly={true}
						placeholder=""
						className="w-full h-full resize-none border-none bg-transparent p-3 text-base md:text-sm outline-none focus:ring-0 font-mono {output ? 'text-base-content/90' : ''} min-h-[380px]"
					/>
				</div>

				<!-- Bottom Status Bar -->
				<div class="flex flex-col sm:flex-row items-center justify-between border-t border-base-content/10 bg-base-200/30 px-4 py-3 gap-3">
					<div class="flex items-center gap-3">
						<label class="flex cursor-pointer items-center gap-2 text-xs font-medium text-base-content/70">
							<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={autoRun} />
							Proses Otomatis
						</label>
					</div>

					<button
						type="button"
						class="btn btn-primary btn-sm rounded-lg shadow-sm font-bold gap-2 w-full sm:w-auto"
						onclick={executeRegex}
					>
						Jalankan Regex
						<Play size={14} fill="currentColor" />
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
