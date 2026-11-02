<script lang="ts">
	import { Percent, RotateCcw, Plus, Trash2 } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	// Calculator 1: Berapa X% dari Y?
	let c1_x = $state<number | null>(null);
	let c1_y = $state<number | null>(null);
	let c1_result = $derived(c1_x != null && c1_y != null ? (c1_x / 100) * c1_y : null);

	// Calculator 2: X adalah berapa % dari Y?
	let c2_x = $state<number | null>(null);
	let c2_y = $state<number | null>(null);
	let c2_result = $derived(
		c2_x != null && c2_y != null && c2_y !== 0 ? (c2_x / c2_y) * 100 : null
	);

	// Calculator 3: Perubahan (Naik/Turun %) dari X ke Y
	let c3_x = $state<number | null>(null);
	let c3_y = $state<number | null>(null);
	let c3_result = $derived(
		c3_x != null && c3_y != null && c3_x !== 0 ? ((c3_y - c3_x) / c3_x) * 100 : null
	);

	// Calculator 4: Tambah Pajak / Margin X + Y%
	let c4_x_str = $state('');
	let c4_x = $derived(
		c4_x_str ? parseFloat(c4_x_str.replace(/\./g, '').replace(/,/g, '.')) || null : null
	);
	let c4_y = $state<number | null>(null);
	let c4_cut = $derived(c4_x != null && c4_y != null ? c4_x * (c4_y / 100) : null);
	let c4_result = $derived(c4_x != null && c4_y != null ? c4_x + c4_cut! : null);

	// Calculator 5: Diskon Harga X - Y%
	let c5_x_str = $state('');
	let c5_x = $derived(
		c5_x_str ? parseFloat(c5_x_str.replace(/\./g, '').replace(/,/g, '.')) || null : null
	);
	let c5_y = $state<number | null>(null);
	let c5_cut = $derived(c5_x != null && c5_y != null ? c5_x * (c5_y / 100) : null);
	let c5_result = $derived(c5_x != null && c5_y != null ? c5_x - c5_cut! : null);

	// Calculator 6: Diskon Multi Harga
	type DiscountItem = { id: number; price_str: string; discount: number | null };
	let multiIdCounter = $state(3);
	let multiItems = $state<DiscountItem[]>([
		{ id: 1, price_str: '', discount: null },
		{ id: 2, price_str: '', discount: null }
	]);

	function parsePrice(str: string): number | null {
		if (!str) return null;
		return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || null;
	}

	function addMultiItem() {
		multiItems.push({ id: multiIdCounter++, price_str: '', discount: null });
	}

	function removeMultiItem(id: number) {
		if (multiItems.length <= 1) return;
		multiItems = multiItems.filter((item) => item.id !== id);
	}

	function resetMultiItems() {
		multiIdCounter = 3;
		multiItems = [
			{ id: 1, price_str: '', discount: null },
			{ id: 2, price_str: '', discount: null }
		];
	}

	let multiSummary = $derived.by(() => {
		let totalOriginal = 0;
		let totalFinal = 0;
		let totalSaved = 0;
		let validCount = 0;

		for (const item of multiItems) {
			const price = parsePrice(item.price_str);
			if (price == null || item.discount == null) continue;
			const cut = price * (item.discount / 100);
			totalOriginal += price;
			totalFinal += price - cut;
			totalSaved += cut;
			validCount++;
		}

		return { totalOriginal, totalFinal, totalSaved, validCount };
	});

	function formatInputCurrency(val: string) {
		if (!val) return '';
		let raw = val.replace(/\./g, '');
		let parts = raw.split(',');
		let intPart = parts[0].replace(/\D/g, '');
		let decPart = parts[1] !== undefined ? parts[1].replace(/\D/g, '') : undefined;

		let formatted = intPart ? new Intl.NumberFormat('id-ID').format(parseInt(intPart, 10)) : '';
		if (decPart !== undefined) {
			formatted += ',' + decPart;
		} else if (val.endsWith(',')) {
			formatted += ',';
		}
		return formatted;
	}

	function format(num: number | null) {
		if (num === null) return '-';
		if (Number.isInteger(num)) return num.toString();
		let str = num.toFixed(4);
		return str.replace(/\.?0+$/, '');
	}

	function formatCurrency(num: number | null) {
		if (num === null) return '-';
		return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num);
	}
</script>

<div class="flex flex-col gap-5 w-full">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
		>
			<Percent size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
				Percentage Calculator
			</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">
				Kalkulator berbagai perhitungan persentase, diskon belanja, pajak, dan perubahan nilai
			</p>
		</div>
	</div>

	<!-- Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Card 5: Diskon Harga (Single) -->
		<div
			class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 sm:p-5 transition-colors shadow-xs"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					Hitung Diskon Harga
				</h3>
				<button
					type="button"
					onclick={() => {
						c5_x_str = '';
						c5_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
				<div class="sm:col-span-7">
					<label
						for="discount-original-price"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Harga Awal (Rp)</label
					>
					<input
						id="discount-original-price"
						type="text"
						value={c5_x_str}
						oninput={(e) => (c5_x_str = formatInputCurrency(e.currentTarget.value))}
						placeholder="contoh: 250.000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>

				<div class="sm:col-span-5">
					<label
						for="discount-percentage"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Diskon (%)</label
					>
					<div class="relative">
						<input
							id="discount-percentage"
							type="number"
							bind:value={c5_y}
							placeholder="contoh: 20"
							class="h-9 w-full rounded-lg px-3 pr-7 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
						/>
						<span
							class="pointer-events-none absolute right-2.5 top-2.5 text-xs font-mono text-[var(--ttx-text-dim)]">%</span
						>
					</div>
				</div>
			</div>

			<!-- Result Box -->
			<div
				class="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-3"
			>
				<div>
					<span class="block text-[10px] font-bold uppercase tracking-wider text-rose-500"
						>Hemat (Potongan)</span
					>
					<span class="font-mono text-base font-bold text-rose-500"
						>-Rp {formatCurrency(c5_cut)}</span
					>
				</div>
				<div class="text-right">
					<span
						class="block text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-accent-text)]">Harga Akhir</span
					>
					<span
						class="font-mono text-lg font-black text-emerald-500">Rp {formatCurrency(c5_result)}</span
					>
				</div>
			</div>
		</div>

		<!-- Card 6: Diskon Multi Harga (Kasir) -->
		<div
			class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 sm:p-5 transition-colors shadow-xs"
		>
			<div class="mb-3 flex items-center justify-between">
				<div>
					<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
						Diskon Multi Harga
					</h3>
					<p class="text-[10px] mt-0.5 text-[var(--ttx-text-muted)]">
						Hitung diskon berbeda untuk beberapa produk sekaligus
					</p>
				</div>
				<button
					type="button"
					onclick={resetMultiItems}
					class="flex items-center gap-1 text-[11px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<!-- POS / Cashier Style Table -->
			<div class="overflow-x-auto rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]">
				<table class="w-full text-left border-collapse text-xs">
					<thead>
						<tr class="border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)]">
							<th class="py-2 px-2 w-8 text-center font-semibold text-[10px] uppercase tracking-wider">#</th>
							<th class="py-2 px-2 min-w-[110px] font-semibold text-[10px] uppercase tracking-wider">Harga (Rp)</th>
							<th class="py-2 px-2 w-20 font-semibold text-[10px] uppercase tracking-wider">Diskon</th>
							<th class="py-2 px-2 min-w-[90px] text-right font-semibold text-[10px] uppercase tracking-wider">Potongan</th>
							<th class="py-2 px-2 min-w-[100px] text-right font-semibold text-[10px] uppercase tracking-wider">Harga Akhir</th>
							<th class="py-2 px-1 w-8 text-center"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[var(--ttx-border-base)]">
						{#each multiItems as item, i (item.id)}
							{@const price = parsePrice(item.price_str)}
							{@const cut = price != null && item.discount != null ? price * (item.discount / 100) : null}
							{@const final_price = price != null && cut != null ? price - cut : null}
							<tr class="hover:bg-[var(--ttx-accent-light)] transition-colors">
								<td class="py-1.5 px-2 text-center font-mono text-[11px] text-[var(--ttx-text-dim)]">
									{i + 1}
								</td>
								<td class="py-1.5 px-2">
									<input
										type="text"
										value={item.price_str}
										oninput={(e) => (item.price_str = formatInputCurrency(e.currentTarget.value))}
										placeholder="50.000"
										class="h-7 w-full rounded px-2 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
									/>
								</td>
								<td class="py-1.5 px-2">
									<div class="relative">
										<input
											type="number"
											bind:value={item.discount}
											placeholder="0"
											min="0"
											max="100"
											class="h-7 w-full rounded px-2 pr-5 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
										/>
										<span class="pointer-events-none absolute right-1.5 top-1.5 text-[10px] font-mono text-[var(--ttx-text-dim)]">%</span>
									</div>
								</td>
								<td class="py-1.5 px-2 text-right font-mono">
									{#if cut != null}
										<span class="text-rose-500 text-xs font-medium">-Rp {formatCurrency(cut)}</span>
									{:else}
										<span class="text-[var(--ttx-text-dim)]">-</span>
									{/if}
								</td>
								<td class="py-1.5 px-2 text-right font-mono">
									{#if final_price != null}
										<span class="font-bold text-xs text-emerald-500">Rp {formatCurrency(final_price)}</span>
									{:else}
										<span class="text-[var(--ttx-text-dim)]">-</span>
									{/if}
								</td>
								<td class="py-1.5 px-1 text-center">
									<button
										type="button"
										onclick={() => removeMultiItem(item.id)}
										disabled={multiItems.length <= 1}
										class="inline-flex h-6 w-6 items-center justify-center rounded transition-colors text-[var(--ttx-text-dim)] hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--ttx-text-dim)]"
									>
										<Trash2 size={12} />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Add Button -->
			<button
				type="button"
				onclick={addMultiItem}
				class="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--ttx-border-subtle)] py-2 text-xs font-medium transition-colors text-[var(--ttx-text-muted)] hover:border-[var(--ttx-accent)] hover:text-[var(--ttx-accent-text)]"
			>
				<Plus size={14} /> Tambah Item
			</button>

			<!-- Summary -->
			{#if multiSummary.validCount > 0}
				<div class="mt-3 flex justify-end">
					<div
						class="w-full sm:max-w-xs rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-3"
					>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="text-[var(--ttx-text-muted)]">Total Awal</span>
								<span class="font-mono font-medium text-[var(--ttx-text-main)]">Rp {formatCurrency(multiSummary.totalOriginal)}</span>
							</div>
							<div class="flex items-center justify-between text-xs">
								<span class="text-rose-500 font-medium">Total Hemat</span>
								<span class="font-mono font-medium text-rose-500">-Rp {formatCurrency(multiSummary.totalSaved)}</span>
							</div>
							<div class="my-1 border-t border-dashed border-[var(--ttx-border-base)]"></div>
							<div class="flex items-baseline justify-between">
								<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-accent-text)]">Total Bayar</span>
								<span class="font-mono text-base font-black text-emerald-500">Rp {formatCurrency(multiSummary.totalFinal)}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Card 1: Berapa X% dari Y? -->
		<div
			class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 transition-colors shadow-xs"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					Berapa X% dari Y?
				</h3>
				<button
					type="button"
					onclick={() => {
						c1_x = null;
						c1_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="calc1-x"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Persen (X)</label
					>
					<div class="relative">
						<input
							id="calc1-x"
							type="number"
							bind:value={c1_x}
							placeholder="25"
							class="h-9 w-full rounded-lg px-3 pr-7 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
						/>
						<span
							class="pointer-events-none absolute right-2.5 top-2.5 text-xs font-mono text-[var(--ttx-text-dim)]">%</span
						>
					</div>
				</div>

				<div>
					<label
						for="calc1-y"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Dari Nilai (Y)</label
					>
					<input
						id="calc1-y"
						type="number"
						bind:value={c1_y}
						placeholder="500000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-3"
			>
				<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Hasil</span>
				<span class="font-mono text-lg font-black text-[var(--ttx-accent-text)]">{format(c1_result)}</span>
			</div>
		</div>

		<!-- Card 2: X adalah berapa % dari Y? -->
		<div
			class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 transition-colors shadow-xs"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					X adalah berapa % dari Y?
				</h3>
				<button
					type="button"
					onclick={() => {
						c2_x = null;
						c2_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="calc2-x"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Nilai (X)</label
					>
					<input
						id="calc2-x"
						type="number"
						bind:value={c2_x}
						placeholder="45"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>

				<div>
					<label
						for="calc2-y"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Total (Y)</label
					>
					<input
						id="calc2-y"
						type="number"
						bind:value={c2_y}
						placeholder="200"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-3"
			>
				<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Hasil</span>
				<span class="font-mono text-lg font-black text-[var(--ttx-accent-text)]"
					>{format(c2_result)}{c2_result != null ? '%' : ''}</span
				>
			</div>
		</div>

		<!-- Card 3: Perubahan (Naik/Turun %) -->
		<div
			class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 transition-colors shadow-xs"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					Perubahan Nilai (Naik / Turun)
				</h3>
				<button
					type="button"
					onclick={() => {
						c3_x = null;
						c3_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="calc3-x"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Nilai Awal (X)</label
					>
					<input
						id="calc3-x"
						type="number"
						bind:value={c3_x}
						placeholder="1000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>

				<div>
					<label
						for="calc3-y"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Nilai Akhir (Y)</label
					>
					<input
						id="calc3-y"
						type="number"
						bind:value={c3_y}
						placeholder="1250"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-3"
			>
				<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Persentase</span>
				<span
					class="font-mono text-lg font-black {c3_result != null
						? c3_result > 0
							? 'text-emerald-500'
							: c3_result < 0
								? 'text-rose-500'
								: 'text-[var(--ttx-text-main)]'
						: 'text-[var(--ttx-accent-text)]'}"
				>
					{c3_result != null && c3_result > 0 ? '+' : ''}{format(c3_result)}{c3_result != null
						? '%'
						: ''}
				</span>
			</div>
		</div>

		<!-- Card 4: Tambah Pajak / Margin -->
		<div
			class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 transition-colors shadow-xs"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					Tambah Pajak / Margin
				</h3>
				<button
					type="button"
					onclick={() => {
						c4_x_str = '';
						c4_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 transition-colors"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="tax-original-value"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Nilai Awal (Rp)</label
					>
					<input
						id="tax-original-value"
						type="text"
						value={c4_x_str}
						oninput={(e) => (c4_x_str = formatInputCurrency(e.currentTarget.value))}
						placeholder="100.000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
					/>
				</div>

				<div>
					<label
						for="tax-percentage"
						class="mb-1 block text-xs text-[var(--ttx-text-muted)]"
						>Tambah (%)</label
					>
					<div class="relative">
						<input
							id="tax-percentage"
							type="number"
							bind:value={c4_y}
							placeholder="11"
							class="h-9 w-full rounded-lg px-3 pr-7 font-mono text-xs outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
						/>
						<span
							class="pointer-events-none absolute right-2.5 top-2.5 text-xs font-mono text-[var(--ttx-text-dim)]">%</span
						>
					</div>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-3"
			>
				<div>
					<span class="block text-[10px] font-bold uppercase tracking-wider text-emerald-500"
						>Tambahan</span
					>
					<span class="font-mono text-xs font-bold text-emerald-500"
						>+Rp {formatCurrency(c4_cut)}</span
					>
				</div>
				<div class="text-right">
					<span
						class="block text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-accent-text)]">Total Akhir</span
					>
					<span
						class="font-mono text-base font-black text-[var(--ttx-text-main)]">Rp {formatCurrency(c4_result)}</span
					>
				</div>
			</div>
		</div>
	</div>
</div>

