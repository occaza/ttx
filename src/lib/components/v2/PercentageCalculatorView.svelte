<script lang="ts">
	import { Percent, RotateCcw } from '@lucide/svelte';

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
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<Percent size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Percentage Calculator
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Kalkulator berbagai perhitungan persentase, diskon belanja, pajak, dan perubahan nilai
			</p>
		</div>
	</div>

	<!-- Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Card 5: Diskon Harga (Full width on top) -->
		<div
			class="md:col-span-2 rounded-xl border p-4 sm:p-5 transition-colors {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-800'}">
					Hitung Diskon Harga
				</h3>
				<button
					type="button"
					onclick={() => {
						c5_x_str = '';
						c5_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium {isDark
						? 'text-slate-500 hover:text-rose-400'
						: 'text-slate-400 hover:text-rose-600'}"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
				<div class="sm:col-span-7">
					<label
						for="discount-original-price"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Harga Awal (Rp)</label
					>
					<input
						id="discount-original-price"
						type="text"
						value={c5_x_str}
						oninput={(e) => (c5_x_str = formatInputCurrency(e.currentTarget.value))}
						placeholder="contoh: 250.000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>

				<div class="sm:col-span-5">
					<label
						for="discount-percentage"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Diskon (%)</label
					>
					<div class="relative">
						<input
							id="discount-percentage"
							type="number"
							bind:value={c5_y}
							placeholder="contoh: 20"
							class="h-9 w-full rounded-lg px-3 pr-7 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
								: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
						/>
						<span
							class="pointer-events-none absolute right-2.5 top-2.5 text-xs font-mono {isDark
								? 'text-slate-500'
								: 'text-slate-400'}">%</span
						>
					</div>
				</div>
			</div>

			<!-- Result Box -->
			<div
				class="mt-3 grid grid-cols-2 gap-3 rounded-lg border p-3 {isDark
					? 'border-[#1b2742] bg-[#10192e]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div>
					<span class="block text-[10px] font-bold uppercase tracking-wider text-rose-400"
						>Hemat (Potongan)</span
					>
					<span class="font-mono text-base font-bold text-rose-400"
						>-Rp {formatCurrency(c5_cut)}</span
					>
				</div>
				<div class="text-right">
					<span
						class="block text-[10px] font-bold uppercase tracking-wider {isDark
							? 'text-blue-400'
							: 'text-blue-600'}">Harga Akhir</span
					>
					<span
						class="font-mono text-lg font-black {isDark
							? 'text-emerald-400'
							: 'text-emerald-600'}">Rp {formatCurrency(c5_result)}</span
					>
				</div>
			</div>
		</div>

		<!-- Card 1: Berapa X% dari Y? -->
		<div
			class="rounded-xl border p-4 transition-colors {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-800'}">
					Berapa X% dari Y?
				</h3>
				<button
					type="button"
					onclick={() => {
						c1_x = null;
						c1_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium {isDark
						? 'text-slate-500 hover:text-rose-400'
						: 'text-slate-400 hover:text-rose-600'}"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="calc1-x"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Persen (X)</label
					>
					<div class="relative">
						<input
							id="calc1-x"
							type="number"
							bind:value={c1_x}
							placeholder="25"
							class="h-9 w-full rounded-lg px-3 pr-7 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
								: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
						/>
						<span
							class="pointer-events-none absolute right-2.5 top-2.5 text-xs font-mono {isDark
								? 'text-slate-500'
								: 'text-slate-400'}">%</span
						>
					</div>
				</div>

				<div>
					<label
						for="calc1-y"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Dari Nilai (Y)</label
					>
					<input
						id="calc1-y"
						type="number"
						bind:value={c1_y}
						placeholder="500000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-lg border p-3 {isDark
					? 'border-[#1b2742] bg-[#10192e]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span class="text-xs font-medium {isDark ? 'text-slate-400' : 'text-slate-500'}">Hasil</span>
				<span class="font-mono text-lg font-black text-blue-500">{format(c1_result)}</span>
			</div>
		</div>

		<!-- Card 2: X adalah berapa % dari Y? -->
		<div
			class="rounded-xl border p-4 transition-colors {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-800'}">
					X adalah berapa % dari Y?
				</h3>
				<button
					type="button"
					onclick={() => {
						c2_x = null;
						c2_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium {isDark
						? 'text-slate-500 hover:text-rose-400'
						: 'text-slate-400 hover:text-rose-600'}"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="calc2-x"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Nilai (X)</label
					>
					<input
						id="calc2-x"
						type="number"
						bind:value={c2_x}
						placeholder="45"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>

				<div>
					<label
						for="calc2-y"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Total (Y)</label
					>
					<input
						id="calc2-y"
						type="number"
						bind:value={c2_y}
						placeholder="200"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-lg border p-3 {isDark
					? 'border-[#1b2742] bg-[#10192e]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span class="text-xs font-medium {isDark ? 'text-slate-400' : 'text-slate-500'}">Hasil</span>
				<span class="font-mono text-lg font-black text-blue-500"
					>{format(c2_result)}{c2_result != null ? '%' : ''}</span
				>
			</div>
		</div>

		<!-- Card 3: Perubahan (Naik/Turun %) -->
		<div
			class="rounded-xl border p-4 transition-colors {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-800'}">
					Perubahan Nilai (Naik / Turun)
				</h3>
				<button
					type="button"
					onclick={() => {
						c3_x = null;
						c3_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium {isDark
						? 'text-slate-500 hover:text-rose-400'
						: 'text-slate-400 hover:text-rose-600'}"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="calc3-x"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Nilai Awal (X)</label
					>
					<input
						id="calc3-x"
						type="number"
						bind:value={c3_x}
						placeholder="1000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>

				<div>
					<label
						for="calc3-y"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Nilai Akhir (Y)</label
					>
					<input
						id="calc3-y"
						type="number"
						bind:value={c3_y}
						placeholder="1250"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-lg border p-3 {isDark
					? 'border-[#1b2742] bg-[#10192e]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span class="text-xs font-medium {isDark ? 'text-slate-400' : 'text-slate-500'}">Persentase</span>
				<span
					class="font-mono text-lg font-black {c3_result != null
						? c3_result > 0
							? 'text-emerald-400'
							: c3_result < 0
								? 'text-rose-400'
								: isDark
									? 'text-slate-200'
									: 'text-slate-800'
						: 'text-blue-500'}"
				>
					{c3_result != null && c3_result > 0 ? '+' : ''}{format(c3_result)}{c3_result != null
						? '%'
						: ''}
				</span>
			</div>
		</div>

		<!-- Card 4: Tambah Pajak / Margin -->
		<div
			class="rounded-xl border p-4 transition-colors {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white shadow-xs'}"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-800'}">
					Tambah Pajak / Margin
				</h3>
				<button
					type="button"
					onclick={() => {
						c4_x_str = '';
						c4_y = null;
					}}
					class="flex items-center gap-1 text-[11px] font-medium {isDark
						? 'text-slate-500 hover:text-rose-400'
						: 'text-slate-400 hover:text-rose-600'}"
				>
					<RotateCcw size={12} /> Reset
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2.5">
				<div>
					<label
						for="tax-original-value"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Nilai Awal (Rp)</label
					>
					<input
						id="tax-original-value"
						type="text"
						value={c4_x_str}
						oninput={(e) => (c4_x_str = formatInputCurrency(e.currentTarget.value))}
						placeholder="100.000"
						class="h-9 w-full rounded-lg px-3 font-mono text-xs outline-none {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
					/>
				</div>

				<div>
					<label
						for="tax-percentage"
						class="mb-1 block text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}"
						>Tambah (%)</label
					>
					<div class="relative">
						<input
							id="tax-percentage"
							type="number"
							bind:value={c4_y}
							placeholder="11"
							class="h-9 w-full rounded-lg px-3 pr-7 font-mono text-xs outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-600 focus:border-blue-500'
								: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500'}"
						/>
						<span
							class="pointer-events-none absolute right-2.5 top-2.5 text-xs font-mono {isDark
								? 'text-slate-500'
								: 'text-slate-400'}">%</span
						>
					</div>
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between rounded-lg border p-3 {isDark
					? 'border-[#1b2742] bg-[#10192e]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div>
					<span class="block text-[10px] font-bold uppercase tracking-wider text-emerald-400"
						>Tambahan</span
					>
					<span class="font-mono text-xs font-bold text-emerald-400"
						>+Rp {formatCurrency(c4_cut)}</span
					>
				</div>
				<div class="text-right">
					<span
						class="block text-[10px] font-bold uppercase tracking-wider {isDark
							? 'text-blue-400'
							: 'text-blue-600'}">Total Akhir</span
					>
					<span
						class="font-mono text-base font-black {isDark
							? 'text-white'
							: 'text-slate-900'}">Rp {formatCurrency(c4_result)}</span
					>
				</div>
			</div>
		</div>
	</div>
</div>

