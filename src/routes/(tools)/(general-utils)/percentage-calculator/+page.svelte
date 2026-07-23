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
    let c4_cut = $derived(c4_x != null && c4_y != null ? (c4_x * (c4_y / 100)) : null);
    let c4_result = $derived(c4_x != null && c4_y != null ? c4_x + c4_cut! : null);

    // Calculator 5: Subtract percentage X - Y%
    let c5_x_str = $state('');
    let c5_x = $derived(c5_x_str ? parseFloat(c5_x_str.replace(/\./g, '').replace(/,/g, '.')) || null : null);
    let c5_y = $state<number | null>(null);
    let c5_cut = $derived(c5_x != null && c5_y != null ? (c5_x * (c5_y / 100)) : null);
    let c5_result = $derived(c5_x != null && c5_y != null ? c5_x - c5_cut! : null);

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
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

    <div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div class="mb-8 flex items-center gap-4 border-b border-base-content/10 pb-4">
            <div class="p-3 bg-primary/10 text-primary rounded-xl shadow-sm">
                <Percent size={28} />
            </div>
            <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">Percentage Calculator</h1>
                <p class="text-sm opacity-50 mt-1">Berbagai perhitungan persentase instan dalam satu halaman.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Card 5: Diskon Harga (spans full width) -->
            <div class="card bg-base-200/50 border border-base-content/10 shadow-sm md:col-span-2">
                <div class="card-body p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-base">Diskon Harga</h3>
                        <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 gap-1"
                            onclick={() => { c5_x_str = ''; c5_y = null; }}>
                            <RotateCcw size={13} /> Reset
                        </button>
                    </div>

                    <!-- Inputs: 2 cols on mobile, inline on md -->
                    <div class="grid grid-cols-2 md:flex md:items-center gap-3">
                        <div class="col-span-2 md:col-span-1 md:flex-1 flex flex-col gap-1">
                            <span >Harga Awal</span>
                            <input type="text" value={c5_x_str}
                                oninput={(e) => c5_x_str = formatInputCurrency(e.currentTarget.value)}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                        <div class="col-span-1 md:w-32 flex flex-col gap-1">
                            <span >Diskon (%)</span>
                            <div class="relative">
                                <input type="number" bind:value={c5_y}
                                    class="input input-sm input-bordered w-full font-mono shadow-inner pr-7"
                                    placeholder="0" />
                                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40 pointer-events-none">%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Result box -->
                    <div class="mt-4 grid grid-cols-2 gap-3 p-3 bg-base-100 rounded-xl border border-base-content/5 shadow-inner">
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs opacity-40 font-medium">Potongan</span>
                            <span class="text-lg font-bold text-error font-mono">-{formatCurrency(c5_cut)}</span>
                        </div>
                        <div class="flex flex-col gap-0.5 items-end">
                            <span class="text-xs opacity-40 font-medium">Harga Akhir</span>
                            <span class="text-lg font-bold text-primary font-mono">{formatCurrency(c5_result)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 1: Berapa X% dari Y? -->
            <div class="card bg-base-200/50 border border-base-content/10 shadow-sm">
                <div class="card-body p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-base">Berapa X% dari Y?</h3>
                        <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 gap-1"
                            onclick={() => { c1_x = null; c1_y = null; }}>
                            <RotateCcw size={13} /> Reset
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <span >Persen (X)</span>
                            <div class="relative">
                                <input type="number" bind:value={c1_x}
                                    class="input input-sm input-bordered w-full font-mono shadow-inner pr-7"
                                    placeholder="0" />
                                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40 pointer-events-none">%</span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span >Dari (Y)</span>
                            <input type="number" bind:value={c1_y}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                    </div>
                    <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                        <span class="text-sm opacity-40 font-medium">Hasil</span>
                        <span class="text-xl font-bold text-primary font-mono">{format(c1_result)}</span>
                    </div>
                </div>
            </div>

            <!-- Card 2: X adalah berapa persen dari Y? -->
            <div class="card bg-base-200/50 border border-base-content/10 shadow-sm">
                <div class="card-body p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-base">X adalah berapa % dari Y?</h3>
                        <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 gap-1"
                            onclick={() => { c2_x = null; c2_y = null; }}>
                            <RotateCcw size={13} /> Reset
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <span >Nilai (X)</span>
                            <input type="number" bind:value={c2_x}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <span >Dari (Y)</span>
                            <input type="number" bind:value={c2_y}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                    </div>
                    <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                        <span class="text-sm opacity-40 font-medium">Hasil</span>
                        <span class="text-xl font-bold text-primary font-mono">{format(c2_result)}{c2_result != null ? '%' : ''}</span>
                    </div>
                </div>
            </div>

            <!-- Card 3: Perubahan % -->
            <div class="card bg-base-200/50 border border-base-content/10 shadow-sm">
                <div class="card-body p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-base">Perubahan (Naik/Turun)</h3>
                        <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 gap-1"
                            onclick={() => { c3_x = null; c3_y = null; }}>
                            <RotateCcw size={13} /> Reset
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <span >Nilai Awal</span>
                            <input type="number" bind:value={c3_x}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <span >Nilai Akhir</span>
                            <input type="number" bind:value={c3_y}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                    </div>
                    <div class="mt-4 p-3 bg-base-100 rounded-xl border border-base-content/5 flex items-center justify-between shadow-inner">
                        <span class="text-sm opacity-40 font-medium">Perubahan</span>
                        <span class="text-xl font-bold font-mono {c3_result != null ? (c3_result > 0 ? 'text-success' : c3_result < 0 ? 'text-error' : 'text-base-content') : 'text-primary'}">
                            {c3_result != null && c3_result > 0 ? '+' : ''}{format(c3_result)}{c3_result != null ? '%' : ''}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Card 4: Tambah Pajak/Margin -->
            <div class="card bg-base-200/50 border border-base-content/10 shadow-sm">
                <div class="card-body p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-base">Tambah Pajak / Margin</h3>
                        <button class="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 gap-1"
                            onclick={() => { c4_x_str = ''; c4_y = null; }}>
                            <RotateCcw size={13} /> Reset
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <span >Nilai Awal</span>
                            <input type="text" value={c4_x_str}
                                oninput={(e) => c4_x_str = formatInputCurrency(e.currentTarget.value)}
                                class="input input-sm input-bordered w-full font-mono shadow-inner"
                                placeholder="0" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <span >Tambah (%)</span>
                            <div class="relative">
                                <input type="number" bind:value={c4_y}
                                    class="input input-sm input-bordered w-full font-mono shadow-inner pr-7"
                                    placeholder="0" />
                                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40 pointer-events-none">%</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-3 p-3 bg-base-100 rounded-xl border border-base-content/5 shadow-inner">
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs opacity-40 font-medium">Tambahan</span>
                            <span class="text-lg font-bold text-success font-mono">+{formatCurrency(c4_cut)}</span>
                        </div>
                        <div class="flex flex-col gap-0.5 items-end">
                            <span class="text-xs opacity-40 font-medium">Total Akhir</span>
                            <span class="text-lg font-bold text-primary font-mono">{formatCurrency(c4_result)}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
