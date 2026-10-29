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
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">Split Text File</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Pisahkan file teks besar menjadi beberapa file bagian berdasarkan jumlah baris
			</p>
		</div>
	</div>

	<!-- Main Workspace -->
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
				Konfigurasi Pemisahan
			</p>

			<div class="space-y-3">
				<div>
					<label
						for="lines-per-file"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Baris per file
					</label>
					<input
						id="lines-per-file"
						type="number"
						bind:value={linesPerFile}
						min="1"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
					/>
				</div>

				<div>
					<label
						for="base-file-name"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Nama awalan file
					</label>
					<input
						id="base-file-name"
						type="text"
						bind:value={fileName}
						placeholder="Part"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500'}"
					/>
				</div>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Header & Footer Additions -->
			<div class="space-y-3">
				<div>
					<label
						for="header-text"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Teks Header (opsional)
					</label>
					<input
						id="header-text"
						type="text"
						bind:value={headerText}
						placeholder="Disisipkan di awal tiap file"
						class="h-8 w-full rounded-lg px-2.5 text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-600'
							: 'border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400'}"
					/>
				</div>

				<div>
					<label
						for="footer-text"
						class="mb-1 block text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}"
					>
						Teks Footer (opsional)
					</label>
					<input
						id="footer-text"
						type="text"
						bind:value={footerText}
						placeholder="Disisipkan di akhir tiap file"
						class="h-8 w-full rounded-lg px-2.5 text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-600'
							: 'border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400'}"
					/>
				</div>

				<label class="flex cursor-pointer items-center gap-2 pt-1">
					<input
						type="checkbox"
						bind:checked={removeEmpty}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>Abaikan Baris Kosong</span
					>
				</label>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Split Button -->
			<button
				type="button"
				onclick={buildLinks}
				disabled={!input.trim()}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 {isDark
					? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
			>
				<Scissors size={14} /> Pisah Menjadi File
			</button>
		</div>

		<!-- Right: Editor & Generated Files Output -->
		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<!-- Text Input Box -->
			<div
				class="flex flex-1 flex-col overflow-hidden rounded-xl border {isDark
					? 'border-[#1a253c] bg-[#0d1525]'
					: 'border-slate-200 bg-white'}"
			>
				<!-- Toolbar -->
				<div
					class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
						? 'border-[#1a253c] bg-[#10192d]'
						: 'border-slate-200 bg-slate-50'}"
				>
					<span
						class="text-[10px] font-bold uppercase tracking-wider {isDark
							? 'text-slate-500'
							: 'text-slate-400'}"
					>
						Input Teks ({totalInputLines} baris)
					</span>
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
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
								? 'text-slate-400 hover:bg-[#16223b] hover:text-slate-200'
								: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
						>
							<Upload size={11} /> Upload .txt
						</button>
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
				</div>

				<textarea
					bind:value={input}
					placeholder="Ketik atau tempel teks dokumen besar di sini untuk dipecah..."
					rows={14}
					class="w-full flex-1 resize-none p-4 font-mono text-xs outline-none leading-relaxed min-h-[240px] {isDark
						? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
						: 'bg-white text-slate-800 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- Download Tray for Split Parts -->
			<div
				class="rounded-xl border p-4 transition-colors {links.length > 0
					? isDark
						? 'border-emerald-500/30 bg-emerald-950/15'
						: 'border-emerald-200 bg-emerald-50'
					: isDark
						? 'border-[#1a253c] bg-[#0d1525]'
						: 'border-slate-200 bg-white'}"
			>
				<div class="mb-3 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Download
							size={15}
							class={links.length > 0
								? 'text-emerald-400'
								: isDark
									? 'text-slate-500'
									: 'text-slate-400'}
						/>
						<span
							class="text-xs font-bold uppercase tracking-wider {links.length > 0
								? isDark
									? 'text-emerald-300'
									: 'text-emerald-800'
								: isDark
									? 'text-slate-400'
									: 'text-slate-600'}"
						>
							File Siap Diunduh ({links.length} bagian)
						</span>
					</div>
				</div>

				{#if links.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each links as link}
							<a
								href={link.url}
								download={link.name}
								class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-medium transition-all {isDark
									? 'border-emerald-500/40 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-400'
									: 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400'}"
							>
								<FileText size={13} />
								<span>{link.name}</span>
								<span class="text-[10px] opacity-75">({link.lineCount} baris)</span>
							</a>
						{/each}
					</div>
				{:else}
					<div
						class="flex items-center justify-center py-6 text-xs {isDark
							? 'text-slate-600'
							: 'text-slate-400'}"
					>
						Klik "Pisah Menjadi File" untuk menghasilkan file unduhan.
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

