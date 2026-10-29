<script lang="ts">
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import {
		FileText,
		Plus,
		Settings,
		ArrowRight,
		Wrench,
		Crown,
		FilePen,
		ChevronLeft,
		ChevronRight,
		Search,
		Sparkles,
		LayoutDashboard,
		ExternalLink
	} from '@lucide/svelte';

	let { data } = $props();

	let supabase = $state<SupabaseClient | null>(null);

	let profile = $derived(data.profile);
	let docs = $derived(data.docs ?? []);
	let docLimit = $derived(data.docLimit);
	let isPro = $derived(data.isPro);

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 5;

	let filteredDocs = $derived(
		searchQuery.trim() === ''
			? docs
			: docs.filter((d) =>
					(d.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
			  )
	);

	let totalPages = $derived(Math.max(1, Math.ceil(filteredDocs.length / pageSize)));

	let paginatedDocs = $derived(
		filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	$effect(() => {
		if (currentPage > totalPages) {
			currentPage = 1;
		}
	});

	let displayName = $derived(
		profile?.first_name ||
			profile?.username ||
			data.user?.user_metadata?.full_name?.split(' ')[0] ||
			data.user?.email?.split('@')[0] ||
			'User'
	);

	let initials = $derived(displayName.slice(0, 2).toUpperCase());

	let docCount = $derived(docs.length);
	let docQuotaPercent = $derived(isPro ? 100 : Math.min((docCount / docLimit) * 100, 100));

	const popularTools = [
		{ href: '/word-counter', label: 'Word Counter' },
		{ href: '/case-converter', label: 'Case Converter' },
		{ href: '/sort-lines', label: 'Sort Lines' },
		{ href: '/markdown-preview', label: 'Markdown Preview' },
		{ href: '/percentage-calculator', label: 'Kalkulator Persen' }
	];

	onMount(async () => {
		supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Dashboard - TEXY Workspace</title>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-[var(--ttx-bg-workspace)] text-[var(--ttx-text-main)] font-sans transition-colors duration-200">
	<!-- Subtle diagonal pattern background matching workspace -->
	<div
		class="absolute inset-0 pointer-events-none opacity-40"
		style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, var(--ttx-hatch) 10px, var(--ttx-hatch) 11.5px);"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- HEADER: USER INFO & QUICK ACTIONS -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs mb-8 transition-colors">
			<div class="flex items-center gap-4">
				<div class="w-14 h-14 rounded-2xl bg-[var(--ttx-accent-light)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent-text)] font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
					{initials}
				</div>
				<div>
					<div class="flex items-center gap-2.5 flex-wrap">
						<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)]">
							Halo, {displayName}
						</h1>
						{#if isPro}
							<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
								<Crown size={12} />
								Pro
							</span>
						{:else}
							<span class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]">
								Free Tier
							</span>
						{/if}
					</div>
					<p class="text-xs text-[var(--ttx-text-muted)] mt-1">{data.user?.email}</p>
				</div>
			</div>

			<div class="flex items-center gap-2.5">
				<a
					href="/"
					class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all"
				>
					<LayoutDashboard size={14} />
					<span>Buka Workspace</span>
				</a>
				<a
					href="/account"
					class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all"
				>
					<Settings size={14} />
					<span>Pengaturan</span>
				</a>
			</div>
		</div>

		<!-- WORKSPACE GRID -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<!-- MAIN COLUMN: DOCUMENTS (2 COLS) -->
			<div class="lg:col-span-2 flex flex-col gap-5">
				<!-- Document List Container -->
				<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 sm:p-6 shadow-xs flex flex-col gap-5 transition-colors">
					<!-- Header Bar -->
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<FilePen size={17} class="text-[var(--ttx-accent-text)]" />
							<h2 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
								Dokumen Saya
							</h2>
							{#if docs.length > 0}
								<span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]">
									{docs.length}
								</span>
							{/if}
						</div>

						<div class="flex items-center gap-2.5">
							{#if docs.length > pageSize}
								<div class="relative">
									<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)]" />
									<input
										type="search"
										bind:value={searchQuery}
										placeholder="Cari dokumen..."
										class="w-40 sm:w-48 h-9 pl-8 pr-3 text-xs rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
									/>
								</div>
							{/if}
							<a
								href="/notepad2"
								class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all"
							>
								<Plus size={14} />
								<span>Buka Editor</span>
							</a>
						</div>
					</div>

					<!-- Storage Quota Status -->
					{#if isPro}
						<div class="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
							<div class="flex items-center gap-2.5">
								<Crown size={16} class="text-amber-400 shrink-0" />
								<span class="text-xs font-semibold text-amber-300">Paket Pro Aktif</span>
								<span class="text-xs text-[var(--ttx-text-muted)] hidden sm:inline">• Kuota dokumen cloud tak terbatas</span>
							</div>
							<span class="font-mono text-xs font-bold text-amber-400 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
								{docCount} Dokumen
							</span>
						</div>
					{:else}
						<div class="rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-4">
							<div class="flex items-center justify-between mb-2">
								<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Penyimpanan Dokumen Cloud</span>
								<span class="text-xs font-mono font-bold {docCount >= docLimit ? 'text-rose-400' : 'text-[var(--ttx-text-main)]'}">
									{docCount} / {docLimit} Dokumen
								</span>
							</div>
							<div class="w-full bg-[var(--ttx-bg-input)] rounded-full h-2 overflow-hidden border border-[var(--ttx-border-subtle)]">
								<div
									class="h-full rounded-full transition-all duration-300 {docCount >= docLimit ? 'bg-rose-500' : 'bg-blue-600'}"
									style="width: {docQuotaPercent}%"
								></div>
							</div>
							<div class="flex items-center justify-between mt-2 text-[11px]">
								{#if docCount >= docLimit}
									<p class="text-rose-400 font-medium">Kuota penuh. Tingkatkan ke Pro untuk menambah dokumen baru.</p>
								{:else}
									<p class="text-[var(--ttx-text-dim)]">{docLimit - docCount} slot dokumen tersisa pada plan Free.</p>
								{/if}
								<a href="/pricing" class="text-[var(--ttx-accent-text)] hover:underline font-semibold">Tingkatkan Plan</a>
							</div>
						</div>
					{/if}

					<!-- Document List Content -->
					{#if docs.length === 0}
						<div class="rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-12 text-center">
							<FileText size={36} class="mx-auto mb-3 text-[var(--ttx-text-dim)]" strokeWidth={1.5} />
							<p class="text-sm font-medium text-[var(--ttx-text-muted)]">Belum ada dokumen tersimpan.</p>
							<p class="text-xs text-[var(--ttx-text-dim)] mt-1">Mulai buat dan simpan catatan cloud pertama Anda di Notepad Pro.</p>
							<a
								href="/notepad2"
								class="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all"
							>
								<Plus size={14} />
								<span>Buat Dokumen Sekarang</span>
							</a>
						</div>
					{:else if filteredDocs.length === 0}
						<div class="rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-8 text-center">
							<p class="text-sm text-[var(--ttx-text-muted)]">Tidak ditemukan dokumen dengan judul "{searchQuery}".</p>
						</div>
					{:else}
						<div class="flex flex-col gap-2.5">
							{#each paginatedDocs as doc (doc.id)}
								<a
									href="/notepad2/{doc.slug}"
									class="group flex items-center justify-between rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] px-4 py-3 hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-bg-hover)] transition-all"
								>
									<div class="flex items-center gap-3.5 min-w-0">
										<div class="p-2 rounded-lg bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent-text)] group-hover:scale-105 transition-transform shrink-0">
											<FileText size={16} />
										</div>
										<div class="min-w-0">
											<p class="text-sm font-medium text-[var(--ttx-text-main)] truncate group-hover:text-[var(--ttx-accent-text)] transition-colors">
												{doc.title || 'Untitled Document'}
											</p>
											<p class="text-[11px] text-[var(--ttx-text-dim)]">
												Terakhir diedit: {formatDate(doc.updated_at)}
											</p>
										</div>
									</div>
									<ArrowRight size={14} class="shrink-0 text-[var(--ttx-text-dim)] group-hover:text-[var(--ttx-accent-text)] group-hover:translate-x-1 transition-all" />
								</a>
							{/each}
						</div>

						<!-- Pagination Bar -->
						{#if totalPages > 1}
							<div class="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[var(--ttx-border-base)] text-xs text-[var(--ttx-text-muted)] gap-3">
								<span>
									Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredDocs.length)} dari {filteredDocs.length} dokumen
								</span>
								<div class="flex items-center gap-2 self-end sm:self-auto">
									<button
										type="button"
										class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
										disabled={currentPage <= 1}
										onclick={() => (currentPage = Math.max(1, currentPage - 1))}
									>
										<ChevronLeft size={13} />
										<span>Sebelumnya</span>
									</button>
									<span class="px-2 font-mono font-medium">{currentPage} / {totalPages}</span>
									<button
										type="button"
										class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
										disabled={currentPage >= totalPages}
										onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
									>
										<span>Selanjutnya</span>
										<ChevronRight size={13} />
									</button>
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- SIDEBAR COLUMN: QUICK TOOLS & SUBSCRIPTION -->
			<div class="flex flex-col gap-5">
				<!-- Tools Populer Card -->
				<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-xs transition-colors">
					<div class="flex items-center gap-2 mb-4">
						<Wrench size={15} class="text-[var(--ttx-accent-text)]" />
						<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
							Tools Populer
						</h3>
					</div>
					<div class="flex flex-col gap-1.5">
						{#each popularTools as tool}
							<a
								href={tool.href}
								class="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all group"
							>
								<span>{tool.label}</span>
								<ArrowRight size={13} class="text-[var(--ttx-text-dim)] group-hover:text-[var(--ttx-accent-text)] group-hover:translate-x-0.5 transition-all" />
							</a>
						{/each}
					</div>
					<div class="border-t border-[var(--ttx-border-base)] mt-4 pt-3.5">
						<a
							href="/"
							class="flex items-center justify-center gap-1.5 text-xs text-[var(--ttx-accent-text)] hover:underline font-semibold"
						>
							<span>Buka Direktori Tools</span>
							<ArrowRight size={12} />
						</a>
					</div>
				</div>

				<!-- Membership / Subscription Card -->
				{#if isPro}
					<div class="rounded-2xl border border-amber-500/30 bg-[var(--ttx-bg-card)] p-5 shadow-xs">
						<div class="flex items-center justify-between mb-2.5">
							<div class="flex items-center gap-2">
								<Crown size={16} class="text-amber-400" />
								<h3 class="text-xs font-bold uppercase tracking-wider text-amber-300">
									Keanggotaan Pro
								</h3>
							</div>
							<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
								ACTIVE
							</span>
						</div>
						<p class="text-xs text-[var(--ttx-text-muted)] leading-relaxed">
							Semua fitur premium aktif. Anda menikmati akses tanpa batas pada dokumen Notepad Pro dan fitur eksklusif lainnya.
						</p>
					</div>
				{:else}
					<div class="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent p-5 shadow-xs">
						<div class="flex items-center gap-2 mb-2">
							<Crown size={16} class="text-amber-400" />
							<h3 class="text-sm font-bold text-amber-300">Upgrade ke Pro</h3>
						</div>
						<p class="text-xs text-[var(--ttx-text-muted)] mb-4 leading-relaxed">
							Dapatkan kuota dokumen cloud tak terbatas, enkripsi tingkat lanjut, dan prioritas akses fitur workspace.
						</p>
						<a
							href="/pricing"
							class="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all"
						>
							<span>Lihat Pilihan Paket</span>
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
