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
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--ttx-border-base)]">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-border-subtle)] shrink-0">
				<MapPin class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight text-[var(--ttx-text-main)]">
						Page Identifier & Tab Title Modifier
					</h1>
					<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-accent)]/20">
						Live Tab Sync
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Ubah judul tab browser secara real-time melalui parameter query <code class="font-mono text-[var(--ttx-accent-text)]">?id=...</code>
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={copyUrl}
				class="flex items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[var(--ttx-accent-hover)]"
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
	<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4 sm:p-5 transition-colors">
		<div class="flex items-center justify-between mb-3">
			<span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[var(--ttx-text-main)]">
				<Sparkles size={14} class="text-[var(--ttx-accent-text)]" />
				Pratinjau Tab Browser Anda Saat Ini:
			</span>
			<span class="text-[11px] font-medium text-[var(--ttx-text-dim)]">
				Perhatikan perubahan tab browser di bagian atas layar
			</span>
		</div>

		<!-- Mock Browser Tab Header -->
		<div class="w-full max-w-md rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-workspace)] p-1 shadow-inner">
			<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] border border-[var(--ttx-border-subtle)]">
				<div class="w-3.5 h-3.5 rounded-full bg-[var(--ttx-accent)] flex items-center justify-center shrink-0">
					<div class="w-1.5 h-1.5 rounded-full bg-[var(--ttx-bg-card)]"></div>
				</div>
				<span class="text-xs font-bold font-mono truncate flex-1 tracking-tight text-[var(--ttx-text-main)]">
					{tabTitle}
				</span>
				<span class="text-[10px] text-[var(--ttx-accent-text)] font-semibold px-1.5 py-0.5 rounded bg-[var(--ttx-accent-light)]">
					Active Tab
				</span>
			</div>
		</div>

		<p class="text-xs mt-3 leading-relaxed text-[var(--ttx-text-muted)]">
			Ketik identifier di bawah ini atau coba buka URL langsung seperti <code class="px-1.5 py-0.5 rounded font-mono text-[11px] bg-[var(--ttx-bg-input)] text-[var(--ttx-accent-text)]">/pageid?id=42</code>. Judul tab jendela browser Anda akan langsung berubah mengikuti nilai tersebut.
		</p>
	</div>

	<!-- MAIN CONFIGURATION CARD -->
	<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 sm:p-5 shadow-xs transition-colors space-y-4">
		<!-- Primary ID input -->
		<div class="space-y-1.5">
			<label
				for="page-id-input"
				class="text-xs font-bold uppercase tracking-wider block text-[var(--ttx-text-main)]"
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
						class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 font-mono text-sm sm:text-base text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					/>
				</div>
				{#if currentId}
					<button
						type="button"
						onclick={() => (currentId = '')}
						class="px-3 h-11 rounded-xl text-xs font-medium border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
					>
						Kosongkan
					</button>
				{/if}
			</div>

			<!-- Quick Preset Buttons -->
			<div class="flex flex-wrap items-center gap-1.5 pt-1">
				<span class="text-[11px] text-[var(--ttx-text-dim)] mr-1">Contoh Cepat:</span>
				{#each ['Demo', '42', 'My Project', 'Production Server', 'Dashboard View'] as preset}
					<button
						type="button"
						class="px-2.5 py-1 text-xs font-mono rounded-lg border transition-all {currentId === preset
							? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border-[var(--ttx-accent)]/40 font-bold'
							: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] border-[var(--ttx-border-subtle)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
						onclick={() => setQuickId(preset)}
					>
						{preset}
					</button>
				{/each}
			</div>
		</div>

		<!-- Extra Parameters list -->
		<div class="space-y-3 pt-3 border-t border-[var(--ttx-border-base)]">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
					Parameter URL Tambahan (Opsional)
				</span>
				<button
					type="button"
					onclick={addParam}
					class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				>
					<Plus size={13} />
					<span>Tambah Parameter</span>
				</button>
			</div>

			{#if customParams.length === 0}
				<p class="text-xs italic text-[var(--ttx-text-dim)]">
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
								class="h-9 flex-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)]"
							/>
							<span class="font-bold text-[var(--ttx-text-dim)]">=</span>
							<input
								type="text"
								bind:value={param.value}
								placeholder="Nilai parameter"
								class="h-9 flex-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)]"
							/>
							<button
								type="button"
								onclick={() => removeParam(idx)}
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-rose-500 hover:border-rose-500/40 transition-colors"
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
		<div class="rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-workspace)] p-3.5 space-y-1.5">
			<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
				Pratinjau Tautan Lengkap:
			</span>
			<div class="flex items-center gap-2 overflow-x-auto">
				<code class="text-xs font-mono text-[var(--ttx-accent-text)] break-all select-all">
					{generatedUrl()}
				</code>
			</div>
		</div>
	</div>
</div>
