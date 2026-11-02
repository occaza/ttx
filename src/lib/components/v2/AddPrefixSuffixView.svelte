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

<div class="flex flex-col gap-5 flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]">
			<TextCursorInput size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">Add Prefix / Suffix</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">Tambah teks di awal dan akhir setiap baris</p>
		</div>
	</div>

	<!-- Unified card -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Toolbar strip -->
		<div class="flex flex-wrap items-center gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
			<!-- Prefix input -->
			<div class="flex items-center gap-2 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2">
				<span class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
					Prefix
				</span>
				<input
					type="text"
					bind:value={prefix}
					placeholder="e.g. - "
					class="w-24 bg-transparent text-xs outline-none text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				/>
			</div>

			<!-- Suffix input -->
			<div class="flex items-center gap-2 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2">
				<span class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
					Suffix
				</span>
				<input
					type="text"
					bind:value={suffix}
					placeholder="e.g. ;"
					class="w-24 bg-transparent text-xs outline-none text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				/>
			</div>

			<div class="h-4 w-px bg-[var(--ttx-border-base)]"></div>

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
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)] transition-all"
			>
				<Upload size={13} /> Upload
			</button>

			{#if input}
				<button
					type="button"
					onclick={clear}
					class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors text-[var(--ttx-text-dim)] hover:bg-rose-500/10 hover:text-rose-500"
				>
					<Trash2 size={11} /> Clear
				</button>
			{/if}

			<div class="ml-auto flex items-center gap-2">
				{#if lineCount > 0}
					<span class="text-[10px] text-[var(--ttx-text-dim)]">{lineCount} baris</span>
				{/if}
				<button
					type="button"
					onclick={applyFix}
					disabled={!input.trim()}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95"
				>
					<Play size={12} fill="currentColor" /> Generate
				</button>
			</div>
		</div>

		<!-- Split editor area -->
		<div class="flex min-w-0 flex-1 flex-col overflow-hidden sm:flex-row">
			<!-- Input -->
			<div class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 border-r border-[var(--ttx-border-base)]">
				<div class="flex h-9 shrink-0 items-center border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Input</span>
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks di sini..."
					class="w-full flex-1 resize-none bg-[var(--ttx-bg-card)] p-4 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none"
				></textarea>
			</div>

			<!-- Output -->
			<div class="flex flex-1 flex-col min-h-[220px] sm:min-h-0">
				<div class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Output</span>
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
							<TextCursorInput size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Preview output muncul di sini</p>
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
