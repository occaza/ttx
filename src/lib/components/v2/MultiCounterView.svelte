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
				class="flex h-10 w-10 items-center justify-center rounded-xl border {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
					: 'border-blue-200 bg-blue-50 text-blue-600'}"
			>
				<Hash size={20} />
			</div>
			<div>
				<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
					Multi Counter & Tally
				</h1>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Hitung lalu lintas (traffic), pengunjung, barang, atau apa pun dengan multi-kategori dan penamaan kustom
				</p>
			</div>
		</div>

		<!-- Action bar buttons -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={copySummary}
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white hover:border-blue-500/50'
					: 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-blue-400 shadow-xs'}"
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
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-rose-400 hover:border-rose-500/50'
					: 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-400 shadow-xs'}"
				title="Reset semua hitungan ke 0"
			>
				<RotateCcw size={14} />
				<span>Reset Semua</span>
			</button>
		</div>
	</div>

	<!-- Total Banner -->
	<div
		class="flex items-center justify-between rounded-xl border p-4 sm:px-6 transition-colors {isDark
			? 'border-[#1b2742] bg-gradient-to-r from-[#10192e] to-[#0d1525]'
			: 'border-slate-200 bg-gradient-to-r from-blue-50/50 to-white shadow-xs'}"
	>
		<div class="flex items-center gap-2">
			<Sparkles size={16} class="text-blue-500" />
			<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-700'}">
				Total Keseluruhan
			</span>
			<span class="text-[11px] {isDark ? 'text-slate-500' : 'text-slate-400'}">
				({counters.length} kategori)
			</span>
		</div>
		<div class="flex items-baseline gap-2">
			<span class="font-mono text-2xl sm:text-3xl font-black {isDark ? 'text-emerald-400' : 'text-emerald-600'}">
				{totalCount.toLocaleString('id-ID')}
			</span>
		</div>
	</div>

	<!-- Counters Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
		{#each counters as counter, i (counter.id)}
			<div
				class="flex flex-col justify-between rounded-xl border p-4 transition-all {isDark
					? 'border-[#1a253c] bg-[#0d1525] hover:border-[#223558]'
					: 'border-slate-200 bg-white hover:border-blue-200 shadow-xs'}"
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
								class="font-semibold text-xs rounded px-1.5 py-1 w-full outline-none transition-colors {isDark
									? 'bg-transparent text-slate-100 hover:bg-[#111a2f] focus:bg-[#111a2f] focus:ring-1 focus:ring-blue-500'
									: 'bg-transparent text-slate-900 hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-slate-200'}"
							/>
						</div>

						<div class="flex items-center gap-1 shrink-0">
							<button
								type="button"
								onclick={() => resetCounter(counter)}
								class="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
								title="Reset counter ini ke 0"
							>
								<RotateCcw size={13} />
							</button>
							<button
								type="button"
								onclick={() => removeCounter(counter.id)}
								disabled={counters.length <= 1}
								class="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-20 disabled:hover:text-slate-400"
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
							class="w-full group py-6 rounded-xl border transition-all active:scale-[0.98] {isDark
								? 'border-[#1b2742] bg-[#10192e] hover:border-blue-500/40 hover:bg-[#131f3a]'
								: 'border-slate-100 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/30'}"
							title="Klik untuk tambah (+{counter.step || 1})"
						>
							<span
								class="block font-mono text-4xl sm:text-5xl font-black tracking-tight select-none transition-transform group-active:scale-95"
								style="color: {counter.color};"
							>
								{counter.count.toLocaleString('id-ID')}
							</span>
							<span class="block mt-2 text-[10px] font-medium tracking-wider uppercase {isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600'}">
								Tap untuk +{counter.step || 1}
							</span>
						</button>
					</div>
				</div>

				<!-- Controls Row: Step & Decrement / Increment -->
				<div class="pt-2 border-t flex items-center justify-between gap-2 {isDark ? 'border-[#1a253c]' : 'border-slate-100'}">
					<div class="flex items-center gap-1.5">
						<span class="text-[10px] uppercase font-bold tracking-wider {isDark ? 'text-slate-500' : 'text-slate-400'}">
							Step:
						</span>
						<input
							type="number"
							bind:value={counter.step}
							min="1"
							class="w-12 h-7 rounded px-1.5 font-mono text-xs text-center outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 focus:border-blue-500'
								: 'border border-slate-200 bg-white text-slate-800 focus:border-blue-500'}"
						/>
					</div>

					<div class="flex items-center gap-1.5">
						<button
							type="button"
							onclick={() => decrement(counter)}
							class="flex h-8 w-8 items-center justify-center rounded-lg border font-bold text-sm transition-all active:scale-90 {isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white hover:bg-slate-800'
								: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'}"
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

		<!-- Add Counter Card (Same size as counter cards) -->
		<button
			type="button"
			onclick={addCounter}
			class="group flex flex-col items-center justify-center gap-3 min-h-[260px] rounded-xl border-2 border-dashed p-6 transition-all active:scale-[0.98] {isDark
				? 'border-[#1e2e50] hover:border-blue-500/60 hover:bg-[#111a2f]/40 text-slate-400 hover:text-blue-400'
				: 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-400 hover:text-blue-600'}"
			title="Tambah Counter Baru"
		>
			<div
				class="flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110 {isDark
					? 'border-[#223558] bg-[#111a2f] text-blue-400'
					: 'border-blue-200 bg-blue-50 text-blue-600'}"
			>
				<Plus size={28} />
			</div>
			<div class="text-center">
				<span class="block text-xs font-bold uppercase tracking-wider">
					Tambah Counter
				</span>
				<span class="block mt-0.5 text-[10px] {isDark ? 'text-slate-500' : 'text-slate-400'}">
					Klik untuk menambah kategori baru
				</span>
			</div>
		</button>
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
				class="relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl transition-all {isDark
					? 'border-[#223558] bg-[#0d1525] text-slate-100'
					: 'border-slate-200 bg-white text-slate-900'}"
			>
				<div class="flex items-center gap-3 mb-3">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
						<AlertTriangle size={20} />
					</div>
					<div>
						<h3 class="text-sm font-bold">Reset Semua Hitungan?</h3>
						<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
							Semua nilai counter akan dikembalikan ke 0.
						</p>
					</div>
				</div>

				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-600'} mb-5">
					Tindakan ini tidak dapat dibatalkan. Nama dan kategori counter Anda akan tetap tersimpan.
				</p>

				<div class="flex items-center justify-end gap-2">
					<button
						type="button"
						onclick={() => (showResetModal = false)}
						class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors {isDark
							? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white hover:bg-slate-800'
							: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}"
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

