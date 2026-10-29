<script lang="ts">
	import { Copy, Check, Trash2, TextCursorInput, Play, Upload } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state('');
	let output = $state('');
	let prefix = $state('');
	let suffix = $state('');
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	function applyFix() {
		if (!input) return;
		const lines = input.split(/\r?\n/);
		output = lines.map((l) => prefix + l + suffix).join('\n');
	}

	// Auto-apply saat prefix/suffix/input berubah dan sudah ada output
	$effect(() => {
		if (input && (prefix || suffix)) {
			const lines = input.split(/\r?\n/);
			output = lines.map((l) => prefix + l + suffix).join('\n');
		} else if (!input) {
			output = '';
		}
	});

	function clear() {
		input = '';
		output = '';
		prefix = '';
		suffix = '';
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

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<TextCursorInput size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Add Prefix / Suffix
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Tambah teks di awal dan akhir setiap baris
			</p>
		</div>
	</div>

	<!-- Prefix / Suffix inputs + action toolbar -->
	<div
		class="flex flex-wrap items-center gap-3 rounded-xl border p-3 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<!-- Prefix input -->
		<div
			class="flex items-center gap-2 rounded-lg border px-3 py-2 {isDark
				? 'border-[#1e2e50] bg-[#111a2f]'
				: 'border-slate-200 bg-slate-50'}"
		>
			<span
				class="shrink-0 text-[10px] font-bold uppercase tracking-wider {isDark
					? 'text-slate-500'
					: 'text-slate-400'}"
			>
				Prefix
			</span>
			<input
				type="text"
				bind:value={prefix}
				placeholder="e.g. - "
				class="w-24 bg-transparent text-xs outline-none {isDark
					? 'text-slate-200 placeholder-slate-600'
					: 'text-slate-800 placeholder-slate-400'}"
			/>
		</div>

		<!-- Suffix input -->
		<div
			class="flex items-center gap-2 rounded-lg border px-3 py-2 {isDark
				? 'border-[#1e2e50] bg-[#111a2f]'
				: 'border-slate-200 bg-slate-50'}"
		>
			<span
				class="shrink-0 text-[10px] font-bold uppercase tracking-wider {isDark
					? 'text-slate-500'
					: 'text-slate-400'}"
			>
				Suffix
			</span>
			<input
				type="text"
				bind:value={suffix}
				placeholder="e.g. ;"
				class="w-24 bg-transparent text-xs outline-none {isDark
					? 'text-slate-200 placeholder-slate-600'
					: 'text-slate-800 placeholder-slate-400'}"
			/>
		</div>

		<div class="h-5 w-px {isDark ? 'bg-slate-800' : 'bg-slate-200'}"></div>

		<!-- Upload -->
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
			class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
				: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
		>
			<Upload size={13} /> Upload
		</button>

		{#if input}
			<button
				type="button"
				onclick={clear}
				class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
					? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
					: 'text-slate-400 hover:bg-red-50 hover:text-red-500'}"
			>
				<Trash2 size={11} /> Clear
			</button>
		{/if}

		<div class="ml-auto flex items-center gap-2">
			{#if lineCount > 0}
				<span class="text-[10px] {isDark ? 'text-slate-600' : 'text-slate-400'}">
					{lineCount} baris
				</span>
			{/if}
			<button
				type="button"
				onclick={applyFix}
				disabled={!input.trim()}
				class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 {isDark
					? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
			>
				<Play size={12} fill="currentColor" /> Generate
			</button>
		</div>
	</div>

	<!-- Split editor -->
	<div
		class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border sm:flex-row {isDark
			? 'border-[#1a253c]'
			: 'border-slate-200'}"
	>
		<!-- Input -->
		<div
			class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 {isDark
				? 'border-r border-[#1a253c]'
				: 'border-r border-slate-200'}"
		>
			<div
				class="flex h-11 shrink-0 items-center px-4 border-b {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Input
				</span>
			</div>
			<textarea
				bind:value={input}
				placeholder="Paste teks di sini..."
				class="w-full flex-1 resize-none p-4 font-mono text-sm outline-none {isDark
					? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
					: 'bg-white text-slate-800 placeholder-slate-400'}"
			></textarea>
		</div>

		<!-- Output -->
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
					Output
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
				{#if !output && !input}
					<div
						class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center {isDark
							? 'text-slate-700'
							: 'text-slate-300'}"
					>
						<TextCursorInput size={32} strokeWidth={1} class="mb-2" />
						<p class="text-xs">Preview output muncul di sini</p>
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
		</div>
	</div>
</div>

