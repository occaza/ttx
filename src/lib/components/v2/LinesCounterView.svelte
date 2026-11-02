<script lang="ts">
	import { Copy, Check, Trash2, List, Upload } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state('');
	let caseSensitive = $state(false);
	let removeEmpty = $state(false);
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	const stats = $derived.by(() => {
		if (!input) return { total: 0, unique: 0, dup: 0, output: '' };

		const raw = input.split(/\r?\n/);
		const lines = removeEmpty ? raw.filter((l) => l.trim() !== '') : raw;

		const total = lines.length;
		const seen = new Map<string, number>();
		const outLines: string[] = [];
		let dup = 0;

		lines.forEach((ln, idx) => {
			const key = caseSensitive ? ln : ln.toLowerCase();
			const first = seen.get(key);
			if (first === undefined) {
				seen.set(key, idx + 1);
				outLines.push(`[${idx + 1}] ${ln}`);
			} else {
				outLines.push(`[${idx + 1}] ${ln}  (duplikat baris ${first})`);
				dup++;
			}
		});

		return { total, unique: seen.size, dup, output: outLines.join('\n') };
	});

	async function copyOutput() {
		if (!stats.output) return;
		await navigator.clipboard.writeText(stats.output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function clear() {
		input = '';
		if (fileInputEl) fileInputEl.value = '';
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
</script>

<div class="flex flex-col gap-5 flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
		>
			<List size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">Line Counter</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">Hitung baris, baris unik, dan duplikat</p>
		</div>
	</div>

	<!-- Main Card: Stats + Toolbar + Editor dalam satu container -->
	<div
		class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs"
	>
		<!-- Stats Strip -->
		<div class="grid grid-cols-3 divide-x divide-[var(--ttx-border-base)] border-b border-[var(--ttx-border-base)]">
			<!-- Total -->
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-accent-text)]">Total</p>
				<p class="text-2xl font-black text-[var(--ttx-text-main)]">{stats.total.toLocaleString()}</p>
				<p class="text-[10px] text-[var(--ttx-text-dim)]">baris</p>
			</div>
			<!-- Unik -->
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p class="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Unik</p>
				<p class="text-2xl font-black text-[var(--ttx-text-main)]">{stats.unique.toLocaleString()}</p>
				<p class="text-[10px] text-[var(--ttx-text-dim)]">baris unik</p>
			</div>
			<!-- Duplikat -->
			<div class="flex flex-col items-center justify-center gap-0.5 px-4 py-3">
				<p
					class="text-[10px] font-bold uppercase tracking-wider {stats.dup > 0
						? 'text-rose-500'
						: 'text-[var(--ttx-text-dim)]'}"
				>
					Duplikat
				</p>
				<p
					class="text-2xl font-black {stats.dup > 0
						? 'text-rose-500'
						: 'text-[var(--ttx-text-dim)]'}"
				>
					{stats.dup.toLocaleString()}
				</p>
				<p class="text-[10px] text-[var(--ttx-text-dim)]">duplikat</p>
			</div>
		</div>

		<!-- Toolbar -->
		<div
			class="flex flex-wrap items-center gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5"
		>
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
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
			>
				<Upload size={13} /> Upload
			</button>

			<div class="h-4 w-px bg-[var(--ttx-border-base)]"></div>

			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					bind:checked={caseSensitive}
					class="h-4 w-4 rounded border border-[var(--ttx-border-subtle)] accent-[var(--ttx-accent)]"
				/>
				<span class="text-xs font-medium text-[var(--ttx-text-main)]">Case Sensitive</span>
			</label>

			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					bind:checked={removeEmpty}
					class="h-4 w-4 rounded border border-[var(--ttx-border-subtle)] accent-[var(--ttx-accent)]"
				/>
				<span class="text-xs font-medium text-[var(--ttx-text-main)]">Abaikan Baris Kosong</span>
			</label>

			{#if input}
				<button
					type="button"
					onclick={clear}
					class="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[var(--ttx-text-dim)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
				>
					<Trash2 size={11} /> Clear
				</button>
			{/if}
		</div>

		<!-- Split Editor -->
		<div class="flex min-w-0 flex-1 flex-col sm:flex-row">
			<!-- Input -->
			<div class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 border-r border-[var(--ttx-border-base)]">
				<div
					class="flex h-9 shrink-0 items-center border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4"
				>
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Input
					</span>
				</div>
				<textarea
					bind:value={input}
					placeholder="Paste teks di sini untuk menghitung baris..."
					class="w-full flex-1 resize-none bg-[var(--ttx-bg-card)] p-4 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none"
				></textarea>
			</div>

			<!-- Output -->
			<div class="flex flex-1 flex-col min-h-[220px] sm:min-h-0">
				<div
					class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4"
				>
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Detail Baris
					</span>
					{#if stats.output}
						<button
							type="button"
							onclick={copyOutput}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {copied
								? 'bg-emerald-500/10 text-emerald-500'
								: 'text-[var(--ttx-text-dim)] hover:bg-[var(--ttx-accent-light)] hover:text-[var(--ttx-accent-text)]'}"
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
					{#if !input}
						<div
							class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[var(--ttx-text-dim)]"
						>
							<List size={32} strokeWidth={1} class="mb-2 opacity-40" />
							<p class="text-xs opacity-60">Detail baris muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={stats.output}
						readonly
						class="absolute inset-0 h-full w-full resize-none bg-[var(--ttx-bg-card-subtle)] p-4 font-mono text-sm text-[var(--ttx-text-muted)] outline-none"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>

