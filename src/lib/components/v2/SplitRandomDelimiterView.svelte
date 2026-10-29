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
				Split by Delimiter
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Pisahkan teks berdasarkan delimiter kustom dan pilih segmen kolom yang ingin dipertahankan
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
				Pilihan Delimiter
			</p>

			<!-- Delimiter Selector -->
			<div class="relative">
				<select
					bind:value={delimiterOption}
					class="h-9 w-full rounded-lg px-3 pr-8 text-xs outline-none transition-all appearance-none cursor-pointer {isDark
						? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 focus:border-blue-500'
						: 'border border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500'}"
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
					size={14}
					class="pointer-events-none absolute right-2.5 top-2.5 {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				/>
			</div>

			{#if delimiterOption === 'custom'}
				<div>
					<label
						for="custom-delimiter-input"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Karakter Kustom
					</label>
					<input
						id="custom-delimiter-input"
						type="text"
						bind:value={customDelimiter}
						placeholder="contoh: ~ atau ::"
						maxlength={5}
						class="h-8 w-full rounded-lg px-2.5 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>
			{/if}

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Segment Picker Pills -->
			{#if segCount > 0}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span
							class="text-[10px] font-bold uppercase tracking-wider {isDark
								? 'text-slate-400'
								: 'text-slate-500'}"
						>
							Pilih Segmen Kolom
						</span>
						<span class="text-[10px] font-mono {isDark ? 'text-slate-500' : 'text-slate-400'}">
							{segCount} kolom
						</span>
					</div>

					<div class="flex flex-wrap gap-1.5">
						{#each Array(segCount) as _, i (i)}
							{@const kept = picks[i] !== false}
							<button
								type="button"
								onclick={() => togglePick(i)}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all {kept
									? isDark
										? 'border border-emerald-500/40 bg-emerald-600/20 text-emerald-300'
										: 'border border-emerald-300 bg-emerald-50 text-emerald-700'
									: isDark
										? 'border border-slate-700/60 bg-[#11192b] text-slate-500 line-through opacity-60'
										: 'border border-slate-200 bg-slate-100 text-slate-400 line-through opacity-60'}"
								title={kept ? 'Pertahankan kolom ini' : 'Abaikan kolom ini'}
							>
								{#if kept}
									<CheckIcon size={11} class="text-emerald-400" />
								{:else}
									<XIcon size={11} class="text-rose-400" />
								{/if}
								<span>{segmen[i] || `Kolom ${i + 1}`}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Upload Action -->
			<div class="mt-auto pt-2">
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
					class="flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
						: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
				>
					<Upload size={13} /> Upload File Data
				</button>
			</div>
		</div>

		<!-- Right: Split Editors (Input & Output) -->
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
						Input Data ({rows.length} baris cocok)
					</span>
					{#if input}
						<button
							type="button"
							onclick={clearAll}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
						>
							<Trash2 size={11} /> Clear
						</button>
					{/if}
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks berdelimiter di sini...&#10;&#10;Contoh: nama|email|kota|status"
					rows={14}
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
						Hasil Ekstraksi Segmen
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
							class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center {isDark
								? 'text-slate-700'
								: 'text-slate-300'}"
						>
							<Scissors size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Hasil ekstraksi segmen akan muncul di sini</p>
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

