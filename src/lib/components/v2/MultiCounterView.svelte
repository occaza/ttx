<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import {
		Hash,
		Plus,
		Minus,
		RotateCcw,
		Trash2,
		Copy,
		Check,
		Edit2,
		Sparkles,
		AlertTriangle
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let showResetModal = $state(false);

	interface CounterItem {
		id: string;
		name: string;
		count: number;
		step: number;
		color: string;
	}

	const PRESET_COLORS = [
		'#3b82f6', // blue
		'#10b981', // emerald
		'#f59e0b', // amber
		'#ef4444', // rose
		'#8b5cf6', // purple
		'#ec4899', // pink
		'#06b6d4', // cyan
		'#6366f1'  // indigo
	];

	const STORAGE_KEY = 'ttx_multi_counters_v1';

	let counters = $state<CounterItem[]>([
		{ id: '1', name: 'Mobil / Roda 4', count: 0, step: 1, color: '#3b82f6' },
		{ id: '2', name: 'Motor / Roda 2', count: 0, step: 1, color: '#10b981' },
		{ id: '3', name: 'Truk / Bus', count: 0, step: 1, color: '#f59e0b' }
	]);

	let isLoaded = $state(false);
	let copiedSummary = $state(false);

	onMount(() => {
		if (browser) {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed) && parsed.length > 0) {
						counters = parsed;
					}
				} catch {
					// fallback to default
				}
			}
			isLoaded = true;
		}
	});

	$effect(() => {
		if (browser && isLoaded) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
		}
	});

	function addCounter() {
		const newId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
		const nextColor = PRESET_COLORS[counters.length % PRESET_COLORS.length];
		counters.push({
			id: newId,
			name: `Counter #${counters.length + 1}`,
			count: 0,
			step: 1,
			color: nextColor
		});
	}

	function removeCounter(id: string) {
		if (counters.length <= 1) return;
		counters = counters.filter((c) => c.id !== id);
	}

	function increment(counter: CounterItem) {
		counter.count += counter.step || 1;
	}

	function decrement(counter: CounterItem) {
		counter.count = Math.max(0, counter.count - (counter.step || 1));
	}

	function resetCounter(counter: CounterItem) {
		counter.count = 0;
	}

	function resetAll() {
		showResetModal = true;
	}

	function confirmResetAll() {
		for (const c of counters) {
			c.count = 0;
		}
		showResetModal = false;
	}

	let totalCount = $derived(counters.reduce((acc, c) => acc + c.count, 0));

	async function copySummary() {
		const lines = [
			'=== LAPORAN MULTI COUNTER ===',
			...counters.map((c, i) => `${i + 1}. ${c.name || 'Tanpa Nama'}: ${c.count}`),
			'-----------------------------',
			`TOTAL KESELURUHAN: ${totalCount}`
		];
		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			copiedSummary = true;
			setTimeout(() => {
				copiedSummary = false;
			}, 2000);
		} catch {
			// ignore
		}
	}
</script>

<div class="flex flex-col gap-5 w-full">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
			>
				<Hash size={20} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
					Multi Counter & Tally
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Hitung lalu lintas (traffic), pengunjung, barang, atau apa pun dengan multi-kategori dan penamaan kustom
				</p>
			</div>
		</div>

		<!-- Action bar buttons -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={copySummary}
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors shadow-xs"
				title="Salin ringkasan hasil"
			>
				{#if copiedSummary}
					<Check size={14} class="text-emerald-500" />
					<span class="text-emerald-500">Tersalin!</span>
				{:else}
					<Copy size={14} />
					<span>Salin Data</span>
				{/if}
			</button>

			<button
				type="button"
				onclick={resetAll}
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-dim)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors shadow-xs"
				title="Reset semua hitungan ke 0"
			>
				<RotateCcw size={14} />
				<span>Reset Semua</span>
			</button>
		</div>
	</div>

	<!-- UNIFIED CARD -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Total Banner Strip -->
		<div
			class="flex items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-6 py-4"
		>
			<div class="flex items-center gap-2">
				<Sparkles size={16} class="text-[var(--ttx-accent-text)]" />
				<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					Total Keseluruhan
				</span>
				<span class="text-[11px] text-[var(--ttx-text-dim)]">
					({counters.length} kategori)
				</span>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="font-mono text-2xl sm:text-3xl font-black text-emerald-500">
					{totalCount.toLocaleString('id-ID')}
				</span>
			</div>
		</div>

		<!-- Counters Grid Area -->
		<div class="p-5">
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
				{#each counters as counter, i (counter.id)}
					<div
						class="flex flex-col justify-between rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-4 transition-all hover:border-[var(--ttx-border-focus)] shadow-xs"
					>
						<!-- Top Bar: Name & Actions -->
						<div>
							<div class="flex items-center justify-between gap-2 mb-3">
								<div class="flex items-center gap-2 min-w-0 flex-1">
									<!-- Color accent dot -->
									<span
										class="h-3 w-3 rounded-full shrink-0 shadow-xs"
										style="background-color: {counter.color};"
									></span>

									<!-- Name input (editable inline) -->
									<input
										type="text"
										bind:value={counter.name}
										placeholder="Nama Counter..."
										class="font-semibold text-xs rounded px-1.5 py-1 w-full outline-none bg-transparent text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-input)] focus:bg-[var(--ttx-bg-input)] focus:ring-1 focus:ring-[var(--ttx-accent)] transition-colors"
									/>
								</div>

								<div class="flex items-center gap-1 shrink-0">
									<button
										type="button"
										onclick={() => resetCounter(counter)}
										class="p-1 rounded text-[var(--ttx-text-dim)] hover:text-amber-500 transition-colors"
										title="Reset counter ini ke 0"
									>
										<RotateCcw size={13} />
									</button>
									<button
										type="button"
										onclick={() => removeCounter(counter.id)}
										disabled={counters.length <= 1}
										class="p-1 rounded text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors disabled:opacity-20 disabled:hover:text-[var(--ttx-text-dim)]"
										title="Hapus counter ini"
									>
										<Trash2 size={13} />
									</button>
								</div>
							</div>

							<!-- Counter Value (Big Display & Click to increment) -->
							<div class="my-4 text-center">
								<button
									type="button"
									onclick={() => increment(counter)}
									class="w-full group py-6 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] hover:border-[var(--ttx-accent)]/40 hover:bg-[var(--ttx-bg-hover)] transition-all active:scale-[0.98]"
									title="Klik untuk tambah (+{counter.step || 1})"
								>
									<span
										class="block font-mono text-4xl sm:text-5xl font-black tracking-tight select-none transition-transform group-active:scale-95"
										style="color: {counter.color};"
									>
										{counter.count.toLocaleString('id-ID')}
									</span>
									<span class="block mt-2 text-[10px] font-medium tracking-wider uppercase text-[var(--ttx-text-dim)] group-hover:text-[var(--ttx-text-muted)]">
										Tap untuk +{counter.step || 1}
									</span>
								</button>
							</div>
						</div>

						<!-- Controls Row: Step & Decrement / Increment -->
						<div class="pt-2 border-t border-[var(--ttx-border-base)] flex items-center justify-between gap-2">
							<div class="flex items-center gap-1.5">
								<span class="text-[10px] uppercase font-bold tracking-wider text-[var(--ttx-text-dim)]">
									Step:
								</span>
								<input
									type="number"
									bind:value={counter.step}
									min="1"
									class="w-12 h-7 rounded px-1.5 font-mono text-xs text-center outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] focus:border-[var(--ttx-accent)]"
								/>
							</div>

							<div class="flex items-center gap-1.5">
								<button
									type="button"
									onclick={() => decrement(counter)}
									class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] font-bold text-sm transition-all active:scale-90 shadow-xs"
									title="Kurang (-{counter.step || 1})"
								>
									<Minus size={15} />
								</button>

								<button
									type="button"
									onclick={() => increment(counter)}
									class="flex h-8 w-10 items-center justify-center rounded-lg font-bold text-sm text-white shadow-sm transition-all active:scale-95"
									style="background-color: {counter.color};"
									title="Tambah (+{counter.step || 1})"
								>
									<Plus size={16} />
								</button>
							</div>
						</div>
					</div>
				{/each}

				<!-- Add Counter Card -->
				<button
					type="button"
					onclick={addCounter}
					class="group flex flex-col items-center justify-center gap-3 min-h-[260px] rounded-xl border-2 border-dashed border-[var(--ttx-border-subtle)] p-6 transition-all hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-light)] text-[var(--ttx-text-dim)] hover:text-[var(--ttx-accent-text)] active:scale-[0.98]"
					title="Tambah Counter Baru"
				>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-accent-text)] transition-transform group-hover:scale-110"
					>
						<Plus size={28} />
					</div>
					<div class="text-center">
						<span class="block text-xs font-bold uppercase tracking-wider">
							Tambah Counter
						</span>
						<span class="block mt-0.5 text-[10px] text-[var(--ttx-text-dim)]">
							Klik untuk menambah kategori baru
						</span>
					</div>
				</button>
			</div>
		</div>
	</div>

	<!-- Custom Modal Konfirmasi Reset -->
	{#if showResetModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<!-- Backdrop -->
			<button
				type="button"
				class="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
				onclick={() => (showResetModal = false)}
				aria-label="Tutup modal"
			></button>

			<!-- Modal Box -->
			<div
				class="relative w-full max-w-sm rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-2xl transition-all text-[var(--ttx-text-main)]"
			>
				<div class="flex items-center gap-3 mb-3">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
						<AlertTriangle size={20} />
					</div>
					<div>
						<h3 class="text-sm font-bold">Reset Semua Hitungan?</h3>
						<p class="text-xs text-[var(--ttx-text-muted)]">
							Semua nilai counter akan dikembalikan ke 0.
						</p>
					</div>
				</div>

				<p class="text-xs text-[var(--ttx-text-muted)] mb-5">
					Tindakan ini tidak dapat dibatalkan. Nama dan kategori counter Anda akan tetap tersimpan.
				</p>

				<div class="flex items-center justify-end gap-2">
					<button
						type="button"
						onclick={() => (showResetModal = false)}
						class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
					>
						Batal
					</button>
					<button
						type="button"
						onclick={confirmResetAll}
						class="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/30 transition-all active:scale-95"
					>
						Ya, Reset Semua
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

