<script lang="ts">

	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import {
		FileText,
		Plus,
		Settings,
		LogOut,
		ArrowRight,
		Wrench,
		Crown,
		FilePen
	} from '@lucide/svelte';

	let { data } = $props();


	let supabase = $state<SupabaseClient | null>(null);

	let profile = $derived(data.profile);
	let docs = $derived(data.docs ?? []);
	let docLimit = $derived(data.docLimit);
	let isPro = $derived(data.isPro);

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
	<title>Dashboard - TEXY</title>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans">
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 md:px-8">

		<!-- Header: User Info -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
			<div class="flex items-center gap-4">
				<div class="avatar avatar-placeholder">
					<div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center">
						{initials}
					</div>
				</div>
				<div>
					<div class="flex items-center gap-2 flex-wrap">
						<h1 class="text-xl font-bold text-base-content">Halo, {displayName}</h1>
						{#if isPro}
							<span class="badge badge-warning gap-1 text-xs font-semibold">
								<Crown size={10} /> Pro
							</span>
						{:else}
							<span class="badge badge-ghost text-xs font-medium border border-base-content/15">Free</span>
						{/if}
					</div>
					<p class="text-sm text-base-content/50 mt-0.5">{data.user?.email}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<a href="/account" class="btn btn-ghost btn-sm gap-1.5 text-base-content/60">
					<Settings size={15} /> Pengaturan
				</a>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

			<!-- Dokumen (main area) -->
			<div class="lg:col-span-2 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<FilePen size={16} class="text-base-content/50" />
						<h2 class="text-sm font-bold text-base-content/50 uppercase tracking-widest">Dokumen Saya</h2>
					</div>
					<a href="/notepad2" class="btn btn-primary btn-sm gap-1.5 rounded-xl">
						<Plus size={14} /> Buka Editor
					</a>
				</div>

				<!-- Kuota (hanya free user) -->
				{#if !isPro}
					<div class="rounded-xl border border-base-content/10 bg-base-200/30 p-4">
						<div class="flex items-center justify-between mb-2">
							<span class="text-xs font-semibold text-base-content/60">Dokumen digunakan</span>
							<span class="text-xs font-mono font-bold {docCount >= docLimit ? 'text-error' : 'text-base-content/70'}">
								{docCount} / {docLimit}
							</span>
						</div>
						<progress
							class="progress w-full {docCount >= docLimit ? 'progress-error' : 'progress-primary'}"
							value={docQuotaPercent}
							max="100"
						></progress>
						{#if docCount >= docLimit}
							<p class="text-xs text-error/80 mt-2">Kuota penuh. Hapus dokumen lama atau upgrade ke Pro untuk menambah lebih banyak.</p>
						{:else}
							<p class="text-xs text-base-content/40 mt-2">{docLimit - docCount} slot tersisa pada plan Free.</p>
						{/if}
					</div>
				{/if}

				<!-- List Dokumen -->
				{#if docs.length === 0}
					<div class="rounded-2xl border border-base-content/10 bg-base-100/60 p-10 text-center">
						<FileText size={32} class="mx-auto mb-3 text-base-content/20" strokeWidth={1.5} />
						<p class="text-sm text-base-content/40">Belum ada dokumen.</p>
						<a href="/notepad2" class="btn btn-primary btn-sm mt-4 rounded-xl gap-1.5">
							<Plus size={14} /> Buat Dokumen Pertama
						</a>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each docs as doc}
							<a
								href="/notepad2/{doc.slug}"
								class="group flex items-center justify-between rounded-xl border border-base-content/10 bg-base-100/60 px-4 py-3.5 hover:border-primary/30 hover:bg-primary/5 transition-all"
							>
								<div class="flex items-center gap-3 min-w-0">
									<FileText size={16} class="shrink-0 text-base-content/30 group-hover:text-primary/60 transition-colors" />
									<div class="min-w-0">
										<p class="text-sm font-semibold text-base-content truncate">
											{doc.title || 'Untitled'}
										</p>
										<p class="text-xs text-base-content/40">
											Diedit {formatDate(doc.updated_at)}
										</p>
									</div>
								</div>
								<ArrowRight size={14} class="shrink-0 text-base-content/20 group-hover:text-primary/50 transition-colors" />
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Sidebar kanan -->
			<div class="flex flex-col gap-4">

				<!-- Tools Populer -->
				<div class="rounded-2xl border border-base-content/10 bg-base-100/60 p-5">
					<div class="flex items-center gap-2 mb-4">
						<Wrench size={14} class="text-base-content/40" />
						<h3 class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Tools Populer</h3>
					</div>
					<ul class="flex flex-col gap-1">
						{#each popularTools as tool}
							<li>
								<a
									href={tool.href}
									class="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-base-content/70 hover:bg-base-200/60 hover:text-base-content transition-colors group"
								>
									{tool.label}
									<ArrowRight size={13} class="text-base-content/20 group-hover:text-base-content/50 transition-colors" />
								</a>
							</li>
						{/each}
					</ul>
					<div class="border-t border-base-content/10 mt-3 pt-3">
						<a href="/" class="flex items-center justify-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors font-medium">
							Lihat semua tools <ArrowRight size={12} />
						</a>
					</div>
				</div>

				<!-- Upgrade card (hanya free) -->
				{#if !isPro}
					<div class="rounded-2xl border border-warning/20 bg-warning/5 p-5">
						<div class="flex items-center gap-2 mb-2">
							<Crown size={14} class="text-warning" />
							<h3 class="text-sm font-bold text-warning">Upgrade ke Pro</h3>
						</div>
						<p class="text-xs text-base-content/50 mb-3 leading-relaxed">
							Dokumen tak terbatas, akses ke fitur premium, dan lebih banyak tools eksklusif.
						</p>
						<a href="/pricing" class="btn btn-warning btn-sm w-full rounded-xl font-bold">
							Lihat Plans
						</a>
					</div>
				{/if}

			</div>
		</div>
	</div>
</div>
