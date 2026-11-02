<script lang="ts">
	import { Scissors, Download, FileText, Trash2, Upload } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state(`Part 1 - Item 01
Part 1 - Item 02
Part 1 - Item 03
Part 2 - Item 04
Part 2 - Item 05
Part 2 - Item 06
Part 3 - Item 07
Part 3 - Item 08
Part 3 - Item 09
Part 4 - Item 10`);

	let linesPerFile = $state(3);
	let headerText = $state('');
	let footerText = $state('');
	let fileName = $state('Part');
	let removeEmpty = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	type PartLink = { name: string; url: string; lineCount: number };
	let links = $state<PartLink[]>([]);

	function buildLinks() {
		links = [];
		if (!input.trim()) return;

		let lines = input.split(/\r?\n/);
		if (removeEmpty) lines = lines.filter((l) => l.trim() !== '');

		const total = lines.length;
		const chunk = Math.max(1, Math.floor(linesPerFile));
		let part = 1;

		for (let i = 0; i < total; i += chunk) {
			const slice = lines.slice(i, i + chunk);
			if (headerText) slice.unshift(headerText);
			if (footerText) slice.push(footerText);
			const blob = new Blob([slice.join('\n')], { type: 'text/plain;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			links.push({
				name: `${fileName}_${part}.txt`,
				url,
				lineCount: slice.length
			});
			part++;
		}
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			input = (ev.target?.result as string) || '';
			links = [];
		};
		reader.readAsText(file);
	}

	function clearAll() {
		input = '';
		links = [];
		if (fileInputEl) fileInputEl.value = '';
	}

	const totalInputLines = $derived(input ? input.split(/\r?\n/).length : 0);
</script>

<div class="flex flex-col gap-4 w-full flex-1">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-subtle)] text-[var(--ttx-accent-text)]">
				<Scissors size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">Split Text File</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Pisahkan file teks besar menjadi beberapa file bagian berdasarkan jumlah baris
				</p>
			</div>
		</div>
	</div>

	<!-- Unified Card Container -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Top Controls Strip -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center gap-1.5">
					<label for="lines-per-file" class="text-xs font-medium text-[var(--ttx-text-muted)]">Baris per file:</label>
					<input
						id="lines-per-file"
						type="number"
						bind:value={linesPerFile}
						min="1"
						class="h-7 w-16 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 text-center font-mono text-xs text-[var(--ttx-text-main)] focus:border-[var(--ttx-accent)] outline-none transition-colors"
					/>
				</div>

				<div class="flex items-center gap-1.5">
					<label for="base-file-name" class="text-xs font-medium text-[var(--ttx-text-muted)]">Prefix:</label>
					<input
						id="base-file-name"
						type="text"
						bind:value={fileName}
						placeholder="Part"
						class="h-7 w-20 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 font-mono text-xs text-[var(--ttx-text-main)] focus:border-[var(--ttx-accent)] outline-none transition-colors"
					/>
				</div>

				<div class="flex items-center gap-1.5">
					<label for="header-text" class="text-xs font-medium text-[var(--ttx-text-muted)]">Header:</label>
					<input
						id="header-text"
						type="text"
						bind:value={headerText}
						placeholder="Opsional"
						class="h-7 w-24 sm:w-28 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)] outline-none transition-colors"
					/>
				</div>

				<div class="flex items-center gap-1.5">
					<label for="footer-text" class="text-xs font-medium text-[var(--ttx-text-muted)]">Footer:</label>
					<input
						id="footer-text"
						type="text"
						bind:value={footerText}
						placeholder="Opsional"
						class="h-7 w-24 sm:w-28 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)] outline-none transition-colors"
					/>
				</div>

				<label class="flex cursor-pointer items-center gap-1.5">
					<input
						type="checkbox"
						bind:checked={removeEmpty}
						class="h-3.5 w-3.5 rounded accent-[var(--ttx-accent)]"
					/>
					<span class="text-xs text-[var(--ttx-text-muted)]">Abaikan Kosong</span>
				</label>
			</div>

			<div class="flex items-center gap-2">
				<input
					bind:this={fileInputEl}
					type="file"
					accept=".txt,.csv,.log,.md"
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
				<button
					type="button"
					onclick={buildLinks}
					disabled={!input.trim()}
					class="flex items-center justify-center gap-1.5 rounded-md bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] active:scale-95 px-3 py-1 text-xs font-bold text-white transition-all shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
				>
					<Scissors size={13} /> Pisah File
				</button>
			</div>
		</div>

		<!-- Editor Area -->
		<div class="relative flex-1 flex flex-col min-h-[220px]">
			<textarea
				bind:value={input}
				placeholder="Ketik atau tempel teks dokumen di sini untuk dipecah..."
				class="w-full flex-1 resize-none p-4 font-mono text-xs sm:text-sm outline-none leading-relaxed bg-transparent text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
			></textarea>
		</div>

		<!-- Download Tray Strip / Footer -->
		<div class="border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-3">
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Download
						size={14}
						class={links.length > 0 ? 'text-emerald-500' : 'text-[var(--ttx-text-dim)]'}
					/>
					<span
						class="text-xs font-bold uppercase tracking-wider {links.length > 0 ? 'text-emerald-500' : 'text-[var(--ttx-text-muted)]'}"
					>
						File Siap Diunduh ({links.length} bagian)
					</span>
				</div>
				<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">Total: {totalInputLines} baris</span>
			</div>

			{#if links.length > 0}
				<div class="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
					{#each links as link}
						<a
							href={link.url}
							download={link.name}
							class="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-mono font-medium transition-all"
						>
							<FileText size={13} />
							<span>{link.name}</span>
							<span class="text-[10px] opacity-75">({link.lineCount} baris)</span>
						</a>
					{/each}
				</div>
			{:else}
				<div class="flex items-center justify-center py-3 text-xs text-[var(--ttx-text-dim)]">
					Klik "Pisah File" untuk menghasilkan file unduhan.
				</div>
			{/if}
		</div>
	</div>
</div>

