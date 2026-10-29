<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		MapPin,
		Copy,
		Check,
		ExternalLink,
		Plus,
		Trash2,
		Sparkles,
		RotateCcw,
		Globe,
		SlidersHorizontal
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	// Ambil ID dari search params URL jika ada
	const initialParamId = $page.url.searchParams.get('id');
	let currentId = $state(initialParamId ?? 'Demo');

	let customParams = $state<{ key: string; value: string }[]>([]);
	let copied = $state(false);

	// Title yang dipasang ke tab browser
	const tabTitle = $derived(currentId.trim() ? currentId.trim() : 'tanpa-id');

	// Sinkronisasi document.title dan URL query parameter secara real-time
	$effect(() => {
		const title = tabTitle;
		if (browser) {
			document.title = title;

			// Perbarui query parameter di address bar secara halus tanpa reload
			try {
				const currentUrl = new URL(window.location.href);
				if (currentId.trim()) {
					currentUrl.searchParams.set('id', currentId.trim());
				} else {
					currentUrl.searchParams.delete('id');
				}
				customParams.forEach((p) => {
					if (p.key.trim()) {
						currentUrl.searchParams.set(p.key.trim(), p.value);
					}
				});
				window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
			} catch (e) {
				// Abaikan jika error history
			}
		}
	});

	onMount(() => {
		if (browser) {
			document.title = tabTitle;
		}
	});

	function addParam() {
		customParams = [...customParams, { key: '', value: '' }];
	}

	function removeParam(index: number) {
		customParams = customParams.filter((_, i) => i !== index);
	}

	const generatedUrl = $derived(() => {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://texy.vercel.app';
		const pathname = typeof window !== 'undefined' ? window.location.pathname : '/pageid';
		const params = new URLSearchParams();
		if (currentId.trim()) params.set('id', currentId.trim());
		customParams.forEach((p) => {
			if (p.key.trim()) params.set(p.key.trim(), p.value);
		});
		const qs = params.toString();
		return `${origin}${pathname}${qs ? '?' + qs : ''}`;
	});

	async function copyUrl() {
		await navigator.clipboard.writeText(generatedUrl());
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function setQuickId(val: string) {
		currentId = val;
	}
</script>

<svelte:head>
	<title>{tabTitle}</title>
	<meta property="og:title" content={tabTitle} />
	<meta name="twitter:title" content={tabTitle} />
</svelte:head>

<div class="space-y-4 w-full">
	<!-- HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b {isDark ? 'border-[#152037]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/20 shrink-0">
				<MapPin class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
						Page Identifier & Tab Title Modifier
					</h1>
					<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
						Live Tab Sync
					</span>
				</div>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Ubah judul tab browser secara real-time melalui parameter query <code class="font-mono text-cyan-400">?id=...</code>
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={copyUrl}
				class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-500"
			>
				{#if copied}
					<Check size={14} />
					<span>URL Tersalin</span>
				{:else}
					<Copy size={14} />
					<span>Salin URL Lengkap</span>
				{/if}
			</button>
		</div>
	</div>

	<!-- LIVE BROWSER TAB PREVIEW CARD -->
	<div class="rounded-2xl border p-4 sm:p-5 transition-colors {isDark ? 'border-[#1a253c] bg-[#0c1424]' : 'border-slate-200 bg-slate-50'}">
		<div class="flex items-center justify-between mb-3">
			<span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 {isDark ? 'text-slate-300' : 'text-slate-700'}">
				<Sparkles size={14} class="text-cyan-400" />
				Pratinjau Tab Browser Anda Saat Ini:
			</span>
			<span class="text-[11px] font-medium {isDark ? 'text-slate-500' : 'text-slate-400'}">
				Perhatikan perubahan tab browser di bagian atas layar
			</span>
		</div>

		<!-- Mock Browser Tab Header -->
		<div class="w-full max-w-md rounded-xl border p-1 shadow-inner {isDark ? 'border-[#1e2e50] bg-[#070c18]' : 'border-slate-300 bg-white'}">
			<div class="flex items-center gap-2 px-3 py-2 rounded-lg {isDark ? 'bg-[#121c33] text-white border border-[#23355d]' : 'bg-slate-100 text-slate-800 border border-slate-200'}">
				<div class="w-3.5 h-3.5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
					<div class="w-1.5 h-1.5 rounded-full bg-[#070c18]"></div>
				</div>
				<span class="text-xs font-bold font-mono truncate flex-1 tracking-tight">
					{tabTitle}
				</span>
				<span class="text-[10px] text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10">
					Active Tab
				</span>
			</div>
		</div>

		<p class="text-xs mt-3 leading-relaxed {isDark ? 'text-slate-400' : 'text-slate-600'}">
			Ketik identifier di bawah ini atau coba buka URL langsung seperti <code class="px-1.5 py-0.5 rounded font-mono text-[11px] {isDark ? 'bg-slate-800 text-cyan-300' : 'bg-slate-200 text-blue-700'}">/pageid?id=42</code>. Judul tab jendela browser Anda akan langsung berubah mengikuti nilai tersebut.
		</p>
	</div>

	<!-- MAIN CONFIGURATION CARD -->
	<div class="rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors {isDark ? 'border-[#152037] bg-[#0c1427]' : 'border-slate-200 bg-white'} space-y-4">
		<!-- Primary ID input -->
		<div class="space-y-1.5">
			<label
				for="page-id-input"
				class="text-xs font-bold uppercase tracking-wider block {isDark ? 'text-slate-300' : 'text-slate-700'}"
			>
				Nilai Parameter ID (?id=...)
			</label>
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
				<div class="relative flex-1">
					<input
						id="page-id-input"
						type="text"
						bind:value={currentId}
						placeholder="Ketik judul/id tab yang diinginkan..."
						class="h-11 w-full rounded-xl px-3.5 font-mono text-sm sm:text-base outline-none transition-all {isDark
							? 'border border-[#1e2e50] bg-[#111a2f] text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30'
							: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20'}"
					/>
				</div>
				{#if currentId}
					<button
						type="button"
						onclick={() => (currentId = '')}
						class="px-3 h-11 rounded-xl text-xs font-medium border transition-colors {isDark
							? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-white'
							: 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'}"
					>
						Kosongkan
					</button>
				{/if}
			</div>

			<!-- Quick Preset Buttons -->
			<div class="flex flex-wrap items-center gap-1.5 pt-1">
				<span class="text-[11px] {isDark ? 'text-slate-500' : 'text-slate-400'} mr-1">Contoh Cepat:</span>
				{#each ['Demo', '42', 'My Project', 'Production Server', 'Dashboard View'] as preset}
					<button
						type="button"
						class="px-2.5 py-1 text-xs font-mono rounded-lg border transition-all {currentId === preset
							? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
							: isDark
								? 'bg-[#111a2f] text-slate-400 border-[#1e2e50] hover:text-white hover:border-slate-600'
								: 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'}"
						onclick={() => setQuickId(preset)}
					>
						{preset}
					</button>
				{/each}
			</div>
		</div>

		<!-- Extra Parameters list -->
		<div class="space-y-3 pt-3 border-t {isDark ? 'border-[#1a253c]' : 'border-slate-200'}">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-300' : 'text-slate-700'}">
					Parameter URL Tambahan (Opsional)
				</span>
				<button
					type="button"
					onclick={addParam}
					class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
						: 'border-slate-200 bg-slate-50 text-slate-700 hover:text-blue-600'}"
				>
					<Plus size={13} />
					<span>Tambah Parameter</span>
				</button>
			</div>

			{#if customParams.length === 0}
				<p class="text-xs italic {isDark ? 'text-slate-600' : 'text-slate-400'}">
					Belum ada parameter tambahan. Klik "Tambah Parameter" untuk menambahkan key-value query string baru.
				</p>
			{:else}
				<div class="space-y-2">
					{#each customParams as param, idx}
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={param.key}
								placeholder="Key (mis: utm_source)"
								class="h-9 flex-1 rounded-lg px-3 font-mono text-xs outline-none transition-all {isDark
									? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-cyan-500'
									: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
							/>
							<span class="font-bold {isDark ? 'text-slate-600' : 'text-slate-400'}">=</span>
							<input
								type="text"
								bind:value={param.value}
								placeholder="Nilai parameter"
								class="h-9 flex-1 rounded-lg px-3 font-mono text-xs outline-none transition-all {isDark
									? 'border border-[#1e2e50] bg-[#111a2f] text-slate-100 placeholder-slate-500 focus:border-cyan-500'
									: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
							/>
							<button
								type="button"
								onclick={() => removeParam(idx)}
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors {isDark
									? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
									: 'border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600'}"
								title="Hapus parameter"
							>
								<Trash2 size={14} />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Live Result Preview -->
		<div class="rounded-xl border p-3.5 space-y-1.5 {isDark ? 'border-[#1e2e50] bg-[#080d1a]' : 'border-slate-200 bg-slate-50'}">
			<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">
				Pratinjau Tautan Lengkap:
			</span>
			<div class="flex items-center gap-2 overflow-x-auto">
				<code class="text-xs font-mono text-cyan-400 break-all select-all">
					{generatedUrl()}
				</code>
			</div>
		</div>
	</div>
</div>
