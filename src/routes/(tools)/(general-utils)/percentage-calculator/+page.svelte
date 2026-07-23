<script lang="ts">
    import { Percent, RotateCcw } from '@lucide/svelte';
    
    // Calculator 1: What is X% of Y?
    let c1_x = $state<number | null>(null);
    let c1_y = $state<number | null>(null);
    let c1_result = $derived(c1_x != null && c1_y != null ? (c1_x / 100) * c1_y : null);

    // Calculator 2: X is what percent of Y?
    let c2_x = $state<number | null>(null);
    let c2_y = $state<number | null>(null);
    let c2_result = $derived(c2_x != null && c2_y != null && c2_y !== 0 ? (c2_x / c2_y) * 100 : null);

    // Calculator 3: Percentage increase/decrease from X to Y
    let c3_x = $state<number | null>(null);
    let c3_y = $state<number | null>(null);
    let c3_result = $derived(c3_x != null && c3_y != null && c3_x !== 0 ? ((c3_y - c3_x) / c3_x) * 100 : null);

    // Calculator 4: Add percentage X + Y%
    let c4_x_str = $state('');
    let c4_x = $derived(c4_x_str ? parseFloat(c4_x_str.replace(/\./g, '').replace(/,/g, '.')) || null : null);
    let c4_y = $state<number | null>(null);
    let c4_result = $derived(c4_x != null && c4_y != null ? c4_x + (c4_x * (c4_y / 100)) : null);

    // Calculator 5: Subtract percentage X - Y%
    let c5_x_str = $state('');
    let c5_x = $derived(c5_x_str ? parseFloat(c5_x_str.replace(/\./g, '').replace(/,/g, '.')) || null : null);
    let c5_y = $state<number | null>(null);
    let c5_result = $derived(c5_x != null && c5_y != null ? c5_x - (c5_x * (c5_y / 100)) : null);

    // Input Currency Formatter
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

    // Formatter
    function format(num: number | null) {
        if (num === null) return '-';
        if (Number.isInteger(num)) return num.toString();
        let str = num.toFixed(6);
        return str.replace(/\.?0+$/, '');
    }

    // Currency/Large Number Formatter
    function formatCurrency(num: number | null) {
        if (num === null) return '-';
        return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 6 }).format(num);
    }
</script>

<svelte:head>
    <title>Percentage Calculator - TEXY Workspace</title>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
    <!-- Grid Background Pattern -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

    <div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div class="mb-8 flex items-center gap-4 border-b border-base-content/10 pb-4 shrink-0">
            <div class="p-3 bg-primary/10 text-primary rounded-xl shadow-sm">
                <Percent size={28} />
            </div>
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-base-content">Percentage Calculator</h1>
                <p class="text-sm opacity-50 mt-1">Berbagai perhitungan persentase instan dalam satu halaman.</p>
            </div>
        </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card 5 (Diskon) -->
        <div class="card bg-base-200/50 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
            <div class="card-body p-5 flex-row items-center justify-between flex-wrap gap-4">
                <div class="flex-1">
                    <div class="w-full flex justify-between items-start mb-2">
                        <h3 class="card-title text-base">Kurangi Persentase (Diskon Harga)</h3>
                        <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10" onclick={() => { c5_x_str = ''; c5_y = null; }} title="Clear">
                            <RotateCcw size={14} />
                        </button>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <input type="text" value={c5_x_str} oninput={(e) => c5_x_str = formatInputCurrency(e.currentTarget.value)} class="input input-sm input-bordered w-32 text-center font-mono shadow-inner" placeholder="Harga Awal" />
                        <span class="text-sm font-medium opacity-70">didiskon</span>
                        <input type="number" bind:value={c5_y} class="input input-sm input-bordered w-20 text-center font-mono shadow-inner" placeholder="%" />
                        <span class="text-sm font-medium opacity-70">%</span>
                    </div>
                </div>
                <div class="p-3 bg-base-100 rounded-xl border border-base-content/5 flex flex-col justify-center min-w-[200px] shadow-inner">
                    <span class="text-xs font-semibold opacity-50">Harga Setelah Diskon:</span>
                    <span class="text-2xl font-bold text-primary font-mono">{formatCurrency(c5_result)}</span>
                </div>
            </div>
        </div>

        <!-- Card 1 -->
        <div class="card bg-base-200/50 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="card-title text-base">Berapa X% dari Y?</h3>
                    <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10" onclick={() => { c1_x = null; c1_y = null; }} title="Clear">
                        <RotateCcw size={14} />
                    </button>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium opacity-70">Berapa</span>
                    <input type="number" bind:value={c1_x} class="input input-sm input-bordered w-20 text-center font-mono shadow-inner" placeholder="X" />
                    <span class="text-sm font-medium opacity-70">% dari</span>
                    <input type="number" bind:value={c1_y} class="input input-sm input-bordered w-24 text-center font-mono shadow-inner" placeholder="Y" />
                    <span class="text-sm font-medium opacity-70">?</span>
                </div>
                <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                    <span class="text-sm font-semibold opacity-50">Hasil:</span>
                    <span class="text-xl font-bold text-primary font-mono">{format(c1_result)}</span>
                </div>
            </div>
        </div>

        <!-- Card 2 -->
        <div class="card bg-base-200/50 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="card-title text-base">X adalah berapa persen dari Y?</h3>
                    <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10" onclick={() => { c2_x = null; c2_y = null; }} title="Clear">
                        <RotateCcw size={14} />
                    </button>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <input type="number" bind:value={c2_x} class="input input-sm input-bordered w-20 text-center font-mono shadow-inner" placeholder="X" />
                    <span class="text-sm font-medium opacity-70">brp % dari</span>
                    <input type="number" bind:value={c2_y} class="input input-sm input-bordered w-24 text-center font-mono shadow-inner" placeholder="Y" />
                    <span class="text-sm font-medium opacity-70">?</span>
                </div>
                <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                    <span class="text-sm font-semibold opacity-50">Hasil:</span>
                    <span class="text-xl font-bold text-primary font-mono">{format(c2_result)}{c2_result != null ? '%' : ''}</span>
                </div>
            </div>
        </div>

        <!-- Card 3 -->
        <div class="card bg-base-200/50 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="card-title text-base">Perubahan (Kenaikan/Penurunan)</h3>
                    <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10" onclick={() => { c3_x = null; c3_y = null; }} title="Clear">
                        <RotateCcw size={14} />
                    </button>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium opacity-70">Dari</span>
                    <input type="number" bind:value={c3_x} class="input input-sm input-bordered w-24 text-center font-mono shadow-inner" placeholder="Awal" />
                    <span class="text-sm font-medium opacity-70">menjadi</span>
                    <input type="number" bind:value={c3_y} class="input input-sm input-bordered w-24 text-center font-mono shadow-inner" placeholder="Akhir" />
                </div>
                <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                    <span class="text-sm font-semibold opacity-50">Perubahan:</span>
                    <span class="text-xl font-bold font-mono {c3_result != null ? (c3_result > 0 ? 'text-success' : c3_result < 0 ? 'text-error' : 'text-base-content') : 'text-primary'}">
                        {c3_result != null && c3_result > 0 ? '+' : ''}{format(c3_result)}{c3_result != null ? '%' : ''}
                    </span>
                </div>
            </div>
        </div>

        <!-- Card 4 -->
        <div class="card bg-base-200/50 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="card-title text-base">Tambah Persentase (Pajak/Margin)</h3>
                    <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10" onclick={() => { c4_x_str = ''; c4_y = null; }} title="Clear">
                        <RotateCcw size={14} />
                    </button>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <input type="text" value={c4_x_str} oninput={(e) => c4_x_str = formatInputCurrency(e.currentTarget.value)} class="input input-sm input-bordered w-28 text-center font-mono shadow-inner" placeholder="Nilai" />
                    <span class="text-sm font-medium opacity-70">ditambah</span>
                    <input type="number" bind:value={c4_y} class="input input-sm input-bordered w-20 text-center font-mono shadow-inner" placeholder="%" />
                    <span class="text-sm font-medium opacity-70">%</span>
                </div>
                <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                    <span class="text-sm font-semibold opacity-50">Total Akhir:</span>
                    <span class="text-xl font-bold text-primary font-mono">{formatCurrency(c4_result)}</span>
                </div>
            </div>
        </div>

    </div>
    </div>
</div>
