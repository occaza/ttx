<script lang="ts">
	import {
		FileText,
		Plus,
		Settings,
		ArrowRight,
		Wrench,
		Crown,
		ChevronLeft,
		ChevronRight,
		Search,
		Sparkles,
		LayoutDashboard,
		ExternalLink,
		Check,
		Copy,
		ArrowUpRight,
		NotebookPen,
		SlidersHorizontal
	} from '@lucide/svelte';

	let { data } = $props();

	let profile = $derived(data.profile);
	let docs = $derived(data.docs ?? []);
	let docLimit = $derived(data.docLimit ?? 4);
	let isPro = $derived(data.isPro ?? false);

	let searchQuery = $state('');
	let sortBy = $state<'newest' | 'oldest' | 'az'>('newest');
	let currentPage = $state(1);
	const pageSize = 5;

	// State for copy link feedback
	let copiedSlug = $state<string | null>(null);
	let copyTimer: any = null;

	function copyDocLink(slug: string, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const url = `${window.location.origin}/notepad2/${slug}`;
		navigator.clipboard.writeText(url);
		copiedSlug = slug;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			copiedSlug = null;
		}, 2000);
	}

	let filteredDocs = $derived.by(() => {
		let list = searchQuery.trim() === ''
			? [...docs]
			: docs.filter((d) =>
					(d.title || 'Untitled Document').toLowerCase().includes(searchQuery.toLowerCase())
			  );

		if (sortBy === 'newest') {
			list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
		} else if (sortBy === 'oldest') {
			list.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
		} else if (sortBy === 'az') {
			list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
		}

		return list;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredDocs.length / pageSize)));

	let paginatedDocs = $derived(
		filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	$effect(() => {
		if (currentPage > totalPages) {
			currentPage = 1;
		}
	});

	let greetingName = $derived(
		profile?.first_name ||
			profile?.username ||
			data.user?.user_metadata?.full_name?.split(' ')[0] ||
			data.user?.email?.split('@')[0] ||
			'Pengguna'
	);

	let initials = $derived(
		(profile?.first_name
			? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`
			: greetingName.slice(0, 2)
		).toUpperCase()
	);

	let docCount = $derived(docs.length);
	let docQuotaPercent = $derived(isPro ? 100 : Math.min((docCount / docLimit) * 100, 100));

	const popularTools = [
		{ href: '/word-counter', label: 'Word Counter' },
		{ href: '/case-converter', label: 'Case Converter' },
		{ href: '/sort-lines', label: 'Sort Lines' },
		{ href: '/markdown-preview', label: 'Markdown Preview' },
		{ href: '/percentage-calculator', label: 'Kalkulator Persen' }
	];

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatRelativeTime(dateStr: string) {
		const date = new Date(dateStr);
		const diffMs = Date.now() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHours = Math.floor(diffMin / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffSec < 60) return 'Baru saja';
		if (diffMin < 60) return `${diffMin} menit yang lalu`;
		if (diffHours < 24) return `${diffHours} jam yang lalu`;
		if (diffDays === 1) return 'Kemarin';
		if (diffDays < 7) return `${diffDays} hari yang lalu`;
		return formatDate(dateStr);
	}
</script>

<svelte:head>
	<title>Dashboard - TEXY Workspace</title>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-[var(--ttx-bg-workspace)] text-[var(--ttx-text-main)] font-sans transition-colors duration-200">
	<!-- Background subtle pattern -->
	<div
		class="absolute inset-0 pointer-events-none opacity-30"
		style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, var(--ttx-hatch) 10px, var(--ttx-hatch) 11.5px);"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
		<!-- 1. HEADER PROFILE & QUICK ACTIONS -->
		<section
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs transition-colors"
			aria-label="Ringkasan Profil Pengguna"
		>
			<div class="flex items-center gap-4 min-w-0">
				<!-- Avatar with Initials -->
				<div
					class="w-14 h-14 rounded-2xl bg-[var(--ttx-accent)]/15 border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent)] font-bold text-lg flex items-center justify-center shadow-xs shrink-0"
				>
					{initials}
				</div>

				<!-- Identity Text -->
				<div class="min-w-0">
					<div class="flex items-center gap-2.5 flex-wrap">
						<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ttx-text-main)] truncate">
							Selamat datang, {greetingName}
						</h1>
						{#if isPro}
							<span
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400"
							>
								<Crown size={12} />
								<span>Pro Member</span>
							</span>
						{:else}
							<span
								class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]"
							>
								Free Tier
							</span>
						{/if}
					</div>
					<p class="text-xs text-[var(--ttx-text-dim)] truncate mt-1">
						{data.user?.email}
					</p>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
				<a
					href="/notepad2"
					class="inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-xl text-white bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)]"
				>
					<Plus size={14} />
					<span>Catatan Baru</span>
				</a>
				<a
					href="/account"
					class="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ttx-accent)]"
				>
					<Settings size={14} />
					<span>Pengaturan</span>
				</a>
			</div>
		</section>

		<!-- 2. MAIN WORKSPACE CONTENT: DOCUMENTS & SIDEBAR -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<!-- LEFT COLUMN: DOCUMENTS LIST (2 COLS) -->
			<div class="lg:col-span-2 space-y-5">
				<section
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 sm:p-6 shadow-xs space-y-5 transition-colors"
					aria-label="Daftar Dokumen Notepad"
				>
					<!-- Toolbar: Title, Search, and Sort -->
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div class="flex items-center gap-2.5">
							<div class="h-8 w-8 rounded-lg bg-[var(--ttx-accent)]/15 text-[var(--ttx-accent)] flex items-center justify-center">
								<NotebookPen size={16} />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<h2 class="text-sm font-bold text-[var(--ttx-text-main)]">Dokumen Saya</h2>
									<span class="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]">
										{docCount}
									</span>
								</div>
								<p class="text-[11px] text-[var(--ttx-text-dim)]">Catatan teks cloud tersinkronisasi</p>
							</div>
						</div>

						<!-- Search and Filter Controls -->
						<div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
							<div class="relative flex-1 sm:flex-initial">
								<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] pointer-events-none" />
								<input
									type="search"
									bind:value={searchQuery}
									placeholder="Cari dokumen..."
									class="w-full sm:w-44 h-8 pl-8 pr-3 text-xs rounded-lg bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
								/>
							</div>

							<!-- Sort Select -->
							<div class="relative">
								<select
									bind:value={sortBy}
									class="h-8 pl-2.5 pr-7 text-xs rounded-lg bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all appearance-none cursor-pointer"
									aria-label="Urutkan dokumen"
								>
									<option value="newest">Terbaru</option>
									<option value="oldest">Terlama</option>
									<option value="az">Nama (A-Z)</option>
								</select>
								<SlidersHorizontal
									size={12}
									class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] pointer-events-none"
								/>
							</div>
						</div>
					</div>

					<!-- Storage Quota Status Bar -->
					{#if isPro}
						<div class="flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5">
							<div class="flex items-center gap-2 text-xs font-medium text-amber-300">
								<Crown size={15} class="text-amber-400 shrink-0" />
								<span>Paket Pro Aktif: Penyimpanan cloud tanpa batas</span>
							</div>
							<span class="text-xs font-mono font-bold text-amber-400">
								{docCount} Dokumen
							</span>
						</div>
					{:else}
						<div class="rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-3.5 space-y-2">
							<div class="flex items-center justify-between text-xs">
								<span class="font-medium text-[var(--ttx-text-muted)]">Kuota Penyimpanan Cloud</span>
								<span class="font-mono font-bold {docCount >= docLimit ? 'text-rose-400' : 'text-[var(--ttx-text-main)]'}">
									{docCount} / {docLimit} Dokumen
								</span>
							</div>
							<div class="w-full bg-[var(--ttx-bg-input)] rounded-full h-2 overflow-hidden border border-[var(--ttx-border-subtle)]">
								<div
									class="h-full rounded-full transition-all duration-300 {docCount >= docLimit ? 'bg-rose-500' : 'bg-[var(--ttx-accent)]'}"
									style="width: {docQuotaPercent}%"
								></div>
							</div>
							<div class="flex items-center justify-between text-[11px] pt-0.5">
								{#if docCount >= docLimit}
									<span class="text-rose-400 font-medium">Batas tercapai. Upgrade ke Pro untuk dokumen baru.</span>
								{:else}
									<span class="text-[var(--ttx-text-dim)]">Tersisa {docLimit - docCount} slot dokumen pada plan Free.</span>
								{/if}
								<a href="/pricing" class="font-semibold text-[var(--ttx-accent-text)] hover:underline">
									Tingkatkan Kuota
								</a>
							</div>
						</div>
					{/if}

					<!-- Document Items List -->
					{#if docs.length === 0}
						<div class="rounded-xl border border-dashed border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]/50 p-10 text-center space-y-3">
							<div class="h-12 w-12 rounded-xl bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] flex items-center justify-center mx-auto">
								<FileText size={24} strokeWidth={1.5} />
							</div>
							<div>
								<p class="text-sm font-semibold text-[var(--ttx-text-main)]">Belum ada dokumen tersimpan</p>
								<p class="text-xs text-[var(--ttx-text-dim)] mt-0.5">
									Mulai buat dokumen cloud pertama Anda di Notepad Workspace.
								</p>
							</div>
							<a
								href="/notepad2"
								class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] rounded-xl shadow-xs transition-all"
							>
								<Plus size={14} />
								<span>Buat Dokumen Sekarang</span>
							</a>
						</div>
					{:else if filteredDocs.length === 0}
						<div class="rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-8 text-center text-xs text-[var(--ttx-text-dim)]">
							Tidak ditemukan dokumen yang cocok dengan kata kunci "{searchQuery}".
						</div>
					{:else}
						<div class="space-y-2">
							{#each paginatedDocs as doc (doc.id)}
								<div
									class="group flex items-center justify-between rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] p-3.5 hover:border-[var(--ttx-accent)] hover:bg-[var(--ttx-bg-hover)] transition-all"
								>
									<!-- Document Info & Link -->
									<a href="/notepad2/{doc.slug}" class="flex items-center gap-3 min-w-0 flex-1">
										<div class="h-9 w-9 rounded-lg bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent-text)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
											<FileText size={16} />
										</div>
										<div class="min-w-0 flex-1">
											<p class="text-xs font-semibold text-[var(--ttx-text-main)] truncate group-hover:text-[var(--ttx-accent-text)] transition-colors">
												{doc.title || 'Untitled Document'}
											</p>
											<div class="flex items-center gap-2 text-[11px] text-[var(--ttx-text-dim)] mt-0.5">
												<span>Diedit {formatRelativeTime(doc.updated_at)}</span>
												<span>•</span>
												<span class="font-mono text-[10px]">/{doc.slug}</span>
											</div>
										</div>
									</a>

									<!-- Quick Actions: Copy Link & Open Arrow -->
									<div class="flex items-center gap-1.5 shrink-0 ml-3">
										<button
											type="button"
											class="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors cursor-pointer"
											onclick={(e) => copyDocLink(doc.slug, e)}
											title="Salin tautan dokumen"
											aria-label="Salin tautan dokumen"
										>
											{#if copiedSlug === doc.slug}
												<Check size={14} class="text-emerald-400" />
											{:else}
												<Copy size={14} />
											{/if}
										</button>

										<a
											href="/notepad2/{doc.slug}"
											class="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] hover:text-[var(--ttx-accent-text)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
											title="Buka dokumen di editor"
											aria-label="Buka dokumen di editor"
										>
											<ArrowUpRight size={14} />
										</a>
									</div>
								</div>
							{/each}
						</div>

						<!-- Pagination Bar -->
						{#if totalPages > 1}
							<div class="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[var(--ttx-border-base)] text-xs text-[var(--ttx-text-dim)] gap-3">
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
				</section>
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
