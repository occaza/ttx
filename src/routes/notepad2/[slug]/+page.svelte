<script lang="ts">
	import { tick, onMount, onDestroy, untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		Save,
		Trash2,
		Edit2,
		Check,
		Clock,
		Search,
		ChevronDown,
		ChevronUp,
		X,
		Share2
	} from '@lucide/svelte';
	import { ThemeSwitcher } from '$lib';
	import type { PageData } from './$types';

	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import {
		search,
		SearchQuery,
		setSearchQuery,
		findNext,
		findPrevious,
		replaceNext,
		replaceAll
	} from '@codemirror/search';
	import { keymap } from '@codemirror/view';

	let { data }: { data: PageData } = $props();

	let title = $state(data.doc.title);
	let content = $state(data.doc.content);
	let isEditingTitle = $state(false);
	let isSaving = $state(false);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error' | 'pending'>('idle');

	let editorContainer: HTMLDivElement | undefined = $state();
	let view: EditorView | undefined;
	let titleInputRef: HTMLInputElement | undefined = $state();

	let currentDocId = $state(data.doc.id);
	let isOwner = $derived(data.isOwner);
	let isPublic = $state(data.isPublic);
	let isCopying = $state(false);

	let showShareDropdown = $state(false);
	let showDeleteDropdown = $state(false);

	let saveTimeout: NodeJS.Timeout;

	let wordCount = $derived((content.match(/\S+/g) || []).length);
	let charCount = $derived(content ? content.length : 0);
	let lineCount = $derived((content.match(/\n/g) || []).length + 1);

	// Custom Find & Replace State
	let showFindReplace = $state(false);
	let findText = $state('');
	let replaceText = $state('');
	let matchCase = $state(false);

	$effect(() => {
		if (data.doc.id) {
			title = data.doc.title;

			if (view && currentDocId !== data.doc.id) {
				currentDocId = data.doc.id;
				saveStatus = 'idle';
				view.dispatch({
					changes: { from: 0, to: view.state.doc.length, insert: data.doc.content }
				});
				content = data.doc.content;
			}
		}
	});

	$effect(() => {
		if (isEditingTitle && titleInputRef) {
			titleInputRef.focus();
		}
	});

	$effect(() => {
		if (view && showFindReplace) {
			const currentFind = findText;
			const currentCase = matchCase;

			untrack(() => {
				if (!view) return;
				view.dispatch({
					effects: setSearchQuery.of(
						new SearchQuery({
							search: currentFind,
							caseSensitive: currentCase,
							replace: replaceText
						})
					)
				});
			});
		} else if (view && !showFindReplace) {
			view.dispatch({
				effects: setSearchQuery.of(
					new SearchQuery({
						search: '',
						caseSensitive: false,
						replace: ''
					})
				)
			});
		}
	});

	function syncSearchQuery() {
		if (!view) return;
		view.dispatch({
			effects: setSearchQuery.of(
				new SearchQuery({
					search: findText,
					caseSensitive: matchCase,
					replace: replaceText
				})
			)
		});
	}

	function handleContentChange() {
		saveStatus = 'pending';
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			autoSave();
		}, 3000);
	}

	async function autoSave() {
		isSaving = true;
		saveStatus = 'saving';

		const formData = new FormData();
		formData.append('content', content);

		try {
			const response = await fetch(`?/save`, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				saveStatus = 'saved';
				await invalidateAll();
				setTimeout(() => {
					if (saveStatus === 'saved') saveStatus = 'idle';
				}, 2000);
			} else {
				saveStatus = 'error';
			}
		} catch (e) {
			saveStatus = 'error';
		} finally {
			isSaving = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			if (isOwner) {
				clearTimeout(saveTimeout);
				autoSave();
			}
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
			e.preventDefault();
			openSearch();
		} else if (e.key === 'Escape' && showFindReplace) {
			showFindReplace = false;
		}
	}

	function openSearch() {
		showFindReplace = true;
		setTimeout(() => document.getElementById('find-input')?.focus(), 50);
	}

	function handleNextMatch() {
		syncSearchQuery();
		if (view) findNext(view);
	}
	function handlePrevMatch() {
		syncSearchQuery();
		if (view) findPrevious(view);
	}
	function handleReplace() {
		syncSearchQuery();
		if (view) replaceNext(view);
	}
	function handleReplaceAll() {
		syncSearchQuery();
		if (view) replaceAll(view);
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function copyLink() {
		isCopying = true;
		const url = window.location.href;
		await navigator.clipboard.writeText(url);
		setTimeout(() => (isCopying = false), 2000);
	}

	onMount(() => {
		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				content = update.state.doc.toString();
				handleContentChange();
			}
		});

		const customKeymap = keymap.of([
			{
				key: 'Mod-f',
				run: () => {
					openSearch();
					return true;
				}
			}
		]);

		const theme = EditorView.theme({
			'&': {
				height: '100%',
				width: '100%',
				outline: 'none',
				backgroundColor: 'transparent'
			},
			'.cm-scroller': {
				overflow: 'auto',
				fontFamily:
					"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
			},
			'.cm-content': {
				padding: '16px 0',
				fontSize: '14px',
				lineHeight: '1.6',
				color: 'var(--ttx-text-main)'
			},
			'.cm-lineNumbers': {
				padding: '0 12px 0 8px'
			},
			'.cm-gutters': {
				backgroundColor: 'var(--ttx-bg-card-subtle)',
				borderRight: '1px solid var(--ttx-border-subtle)',
				color: 'var(--ttx-text-dim)'
			},
			'.cm-activeLineGutter': {
				backgroundColor: 'var(--ttx-accent-light)',
				color: 'var(--ttx-accent-text)'
			},
			'.cm-activeLine': {
				backgroundColor: 'transparent'
			},
			'.cm-cursor, .cm-dropCursor': {
				borderLeftColor: 'var(--ttx-accent)',
				borderLeftWidth: '2px'
			},
			'.cm-searchMatch': {
				backgroundColor: 'var(--ttx-accent-light)',
				border: '1px solid var(--ttx-border-focus)'
			},
			'.cm-searchMatch.cm-searchMatch-selected': {
				backgroundColor: 'var(--ttx-bg-active)',
				border: '1px solid var(--ttx-accent)',
				outline: '2px solid var(--ttx-accent-light)'
			},
			'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
				backgroundColor: 'var(--ttx-accent-light)'
			}
		});

		if (editorContainer) {
			const extensions = [
				customKeymap,
				basicSetup,
				search(),
				updateListener,
				theme
			];

			if (!isOwner) {
				extensions.push(EditorState.readOnly.of(true));
			}

			view = new EditorView({
				state: EditorState.create({
					doc: content,
					extensions: extensions
				}),
				parent: editorContainer
			});
		}
	});

	onDestroy(() => {
		if (view) view.destroy();
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="relative flex h-full flex-col bg-[var(--ttx-bg-workspace)]" style="height: 100vh; height: 100dvh">
	<!-- Grid Background Pattern -->
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--ttx-border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--ttx-border-subtle)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"
	></div>

	<!-- Top Toolbar -->
	<header
		class="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-header)] pl-14 pr-4 sm:pl-16 sm:pr-6"
	>
		<div class="flex flex-1 items-center gap-3 overflow-hidden">
			<!-- Title Edit -->
			{#if isEditingTitle}
				<form
					method="POST"
					action="?/rename"
					class="flex items-center gap-2"
					use:enhance={() => {
						return async ({ update }) => {
							isEditingTitle = false;
							await update();
						};
					}}
				>
					<input
						bind:this={titleInputRef}
						type="text"
						name="title"
						bind:value={title}
						class="h-8 w-52 sm:w-64 rounded-lg border border-[var(--ttx-border-focus)] bg-[var(--ttx-bg-input)] px-2.5 text-xs text-[var(--ttx-text-main)] outline-none focus:ring-1 focus:ring-[var(--ttx-accent)]"
						onblur={() => {
							setTimeout(() => {
								isEditingTitle = false;
							}, 150);
						}}
					/>
					<button
						type="submit"
						class="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
					>
						<Check size={16} />
					</button>
				</form>
			{:else}
				<button
					type="button"
					class="group flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors {isOwner
						? 'cursor-pointer hover:bg-[var(--ttx-bg-hover)]'
						: 'cursor-default'}"
					onclick={() => {
						if (isOwner) isEditingTitle = true;
					}}
					title={isOwner ? 'Klik untuk ubah judul' : ''}
				>
					<span
						class="max-w-[150px] truncate text-xs font-semibold text-[var(--ttx-text-main)] sm:max-w-md sm:text-sm"
					>
						{title}
					</span>
					{#if !isOwner}
						<span
							class="rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--ttx-text-dim)]"
						>
							Read Only
						</span>
					{:else}
						<Edit2
							size={13}
							class="text-[var(--ttx-text-dim)] opacity-0 transition-opacity group-hover:opacity-100"
						/>
					{/if}
				</button>
			{/if}

			<!-- Save Status -->
			<div class="hidden items-center gap-2 text-xs text-[var(--ttx-text-dim)] sm:flex ml-2">
				{#if saveStatus === 'saving'}
					<span class="flex items-center gap-1.5">
						<span
							class="h-3 w-3 animate-spin rounded-full border-2 border-[var(--ttx-accent)] border-t-transparent"
						></span>
						Menyimpan...
					</span>
				{:else if saveStatus === 'pending'}
					<span class="opacity-70">Perubahan belum disimpan...</span>
				{:else if saveStatus === 'saved'}
					<span class="flex items-center gap-1 text-emerald-500 font-medium">
						<Check size={13} />
						Tersimpan
					</span>
				{:else if saveStatus === 'error'}
					<span class="text-rose-500 font-medium">Gagal menyimpan</span>
				{:else}
					<span class="flex items-center gap-1">
						<Clock size={13} />
						{formatDate(data.doc.updated_at)}
					</span>
				{/if}
			</div>
		</div>

		<!-- Action Controls -->
		<div class="flex items-center gap-1.5 sm:gap-2">
			<!-- Find button -->
			<button
				type="button"
				class="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 text-xs font-semibold text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] active:scale-95"
				onclick={openSearch}
				title="Cari & Ganti (Ctrl+F)"
			>
				<Search size={14} />
				<span class="hidden sm:inline">Cari</span>
			</button>

			<div class="mx-0.5 h-5 w-px bg-[var(--ttx-border-subtle)]"></div>

			<!-- Theme Switcher -->
			<ThemeSwitcher />

			<div class="mx-0.5 h-5 w-px bg-[var(--ttx-border-subtle)]"></div>

			{#if isOwner}
				<!-- Share Popover -->
				<div class="relative">
					<button
						type="button"
						class="flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors active:scale-95 {isPublic
							? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
							: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]'}"
						onclick={() => (showShareDropdown = !showShareDropdown)}
						title="Bagikan dokumen"
					>
						<Share2 size={13} />
						<span class="hidden sm:inline">{isPublic ? 'Dibagikan' : 'Bagikan'}</span>
					</button>

					{#if showShareDropdown}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="fixed inset-0 z-30"
							onclick={() => (showShareDropdown = false)}
							onkeydown={() => {}}
						></div>
						<div
							class="absolute right-0 top-full mt-2 z-40 w-72 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 text-[var(--ttx-text-main)] shadow-xl"
						>
							<p class="mb-1 text-sm font-semibold">Bagikan Dokumen</p>
							<p class="mb-3 text-xs text-[var(--ttx-text-muted)]">
								Izinkan siapa saja dengan tautan untuk membaca catatan ini.
							</p>

							<div class="mb-3 flex items-center justify-between">
								<span class="text-xs font-medium">Akses Publik</span>
								<form
									method="POST"
									action="?/togglePublic"
									use:enhance={() => {
										return async ({ update, result }) => {
											if (result.type === 'success' && result.data) {
												isPublic = result.data.isPublic as boolean;
											}
											await update({ reset: false });
										};
									}}
								>
									<input
										type="checkbox"
										class="h-4 w-4 cursor-pointer rounded accent-[var(--ttx-accent)]"
										checked={isPublic}
										onchange={(e) => e.currentTarget.form?.requestSubmit()}
									/>
								</form>
							</div>

							<div class="flex gap-1.5">
								<input
									type="text"
									value={typeof window !== 'undefined' ? window.location.href : ''}
									class="h-8 flex-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 font-mono text-[11px] text-[var(--ttx-text-main)] outline-none"
									readonly
								/>
								<button
									type="button"
									class="h-8 rounded-lg bg-[var(--ttx-accent)] px-3 text-xs font-semibold text-[var(--ttx-accent-contrast)] shadow-xs transition-colors hover:bg-[var(--ttx-accent-hover)] active:scale-95"
									onclick={copyLink}
								>
									{isCopying ? 'Disalin!' : 'Salin'}
								</button>
							</div>
						</div>
					{/if}
				</div>

				<div class="mx-0.5 h-5 w-px bg-[var(--ttx-border-subtle)]"></div>

				<!-- Save button -->
				<form
					method="POST"
					action="?/save"
					use:enhance={() => {
						isSaving = true;
						saveStatus = 'saving';
						return async ({ update, result }) => {
							isSaving = false;
							if (result.type === 'success') {
								saveStatus = 'saved';
								setTimeout(() => {
									if (saveStatus === 'saved') saveStatus = 'idle';
								}, 2000);
							} else {
								saveStatus = 'error';
							}
							await update({ reset: false });
						};
					}}
				>
					<input type="hidden" name="content" value={content} />
					<button
						type="submit"
						class="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-3 text-xs font-semibold text-[var(--ttx-accent-contrast)] shadow-xs transition-all hover:bg-[var(--ttx-accent-hover)] active:scale-95 disabled:opacity-40"
						disabled={isSaving}
						title="Simpan (Ctrl+S)"
					>
						<Save size={14} />
						<span class="hidden sm:inline">Simpan</span>
					</button>
				</form>

				<!-- Delete Popover -->
				<div class="relative">
					<button
						type="button"
						class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-dim)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
						onclick={() => (showDeleteDropdown = !showDeleteDropdown)}
						title="Hapus dokumen"
					>
						<Trash2 size={14} />
					</button>

					{#if showDeleteDropdown}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="fixed inset-0 z-30"
							onclick={() => (showDeleteDropdown = false)}
							onkeydown={() => {}}
						></div>
						<div
							class="absolute right-0 top-full mt-2 z-40 w-64 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 text-[var(--ttx-text-main)] shadow-xl"
						>
							<p class="mb-1 text-sm font-semibold">Hapus dokumen?</p>
							<p class="mb-4 text-xs text-[var(--ttx-text-muted)]">
								Tindakan ini tidak dapat dibatalkan.
							</p>
							<div class="flex justify-end gap-2">
								<button
									type="button"
									class="h-7 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 text-xs font-medium text-[var(--ttx-text-main)] transition-colors hover:bg-[var(--ttx-bg-hover)]"
									onclick={() => (showDeleteDropdown = false)}
								>
									Batal
								</button>
								<form method="POST" action="?/delete" use:enhance>
									<button
										type="submit"
										class="h-7 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
									>
										Hapus
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</header>

	<!-- Find & Replace Custom UI -->
	{#if showFindReplace}
		<div
			class="relative z-20 flex flex-wrap items-center gap-2 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2 text-xs shrink-0"
		>
			<!-- Find row -->
			<div class="flex flex-wrap items-center gap-1.5">
				<div class="flex items-center">
					<input
						id="find-input"
						type="text"
						bind:value={findText}
						placeholder="Cari..."
						class="h-8 w-40 sm:w-52 rounded-l-lg border border-r-0 border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)]"
						onkeydown={(e) => {
							if (e.key === 'Enter') handleNextMatch();
						}}
					/>
					<button
						type="button"
						class="h-8 px-2.5 rounded-r-lg border border-[var(--ttx-border-subtle)] font-serif font-bold text-xs transition-colors {matchCase
							? 'bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] border-[var(--ttx-accent)]'
							: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)]'}"
						title="Cocokkan Huruf Besar/Kecil"
						onclick={() => (matchCase = !matchCase)}
					>
						Aa
					</button>
				</div>

				<!-- Prev / Next -->
				<div class="flex items-center">
					<button
						type="button"
						class="flex h-8 w-8 items-center justify-center rounded-l-lg border border-r-0 border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]"
						onclick={handlePrevMatch}
						title="Sebelumnya"
					>
						<ChevronUp size={14} />
					</button>
					<button
						type="button"
						class="flex h-8 w-8 items-center justify-center rounded-r-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]"
						onclick={handleNextMatch}
						title="Berikutnya"
					>
						<ChevronDown size={14} />
					</button>
				</div>
			</div>

			<div class="mx-1 hidden h-5 w-px bg-[var(--ttx-border-subtle)] sm:block"></div>

			<!-- Replace row -->
			<div class="flex items-center gap-1.5">
				<input
					type="text"
					bind:value={replaceText}
					placeholder="Ganti dengan..."
					class="h-8 w-40 sm:w-52 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)]"
					onkeydown={(e) => {
						if (e.key === 'Enter') handleReplace();
					}}
				/>
				<button
					type="button"
					class="h-8 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 text-xs font-medium text-[var(--ttx-text-muted)] transition-colors hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]"
					onclick={handleReplace}
					title="Ganti satu"
				>
					Ganti
				</button>
				<button
					type="button"
					class="h-8 rounded-lg border border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] px-2.5 text-xs font-semibold text-[var(--ttx-accent-text)] transition-colors hover:bg-[var(--ttx-accent)] hover:text-white"
					onclick={handleReplaceAll}
					title="Ganti semua"
				>
					Semua
				</button>
			</div>

			<div class="flex-1"></div>
			<button
				type="button"
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-dim)] transition-colors hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)]"
				onclick={() => (showFindReplace = false)}
				title="Tutup (Esc)"
			>
				<X size={15} />
			</button>
		</div>
	{/if}

	<!-- CodeMirror Editor Container -->
	<div
		class="relative z-0 m-3 sm:m-4 md:m-6 mt-3 sm:mt-4 flex-1 overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs"
		bind:this={editorContainer}
	>
		<!-- CodeMirror injects here -->
	</div>

	<!-- Status Bar -->
	<footer
		class="flex h-8 shrink-0 items-center justify-end gap-4 border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 font-mono text-[11px] text-[var(--ttx-text-dim)]"
	>
		<span>{wordCount} kata</span>
		<span>{charCount} karakter</span>
		<span>{lineCount} baris</span>
		<span>
			<kbd
				class="rounded border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-1.5 py-0.5 text-[10px] text-[var(--ttx-text-muted)]"
			>
				Ctrl
			</kbd>
			+
			<kbd
				class="rounded border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-1.5 py-0.5 text-[10px] text-[var(--ttx-text-muted)]"
			>
				F
			</kbd>
			cari
		</span>
	</footer>
</div>
