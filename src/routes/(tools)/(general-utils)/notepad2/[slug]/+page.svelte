<script lang="ts">
	import { tick, onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Save, Trash2, Edit2, Check, Clock, Search, ChevronDown, ChevronUp, X } from '@lucide/svelte';
	import type { PageData } from './$types';

	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { search, SearchQuery, setSearchQuery, findNext, findPrevious, replaceNext, replaceAll } from '@codemirror/search';
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

	import { untrack } from 'svelte';

	$effect(() => {
		if (view && showFindReplace) {
			const currentFind = findText;
			const currentCase = matchCase;
			
			untrack(() => {
				if (!view) return;
				view.dispatch({
					effects: setSearchQuery.of(new SearchQuery({
						search: currentFind,
						caseSensitive: currentCase,
						replace: replaceText
					}))
				});
			});
		} else if (view && !showFindReplace) {
			// Clear search when closed
			view.dispatch({
				effects: setSearchQuery.of(new SearchQuery({
					search: '',
					caseSensitive: false,
					replace: ''
				}))
			});
		}
	});

	function syncSearchQuery() {
		if (!view) return;
		view.dispatch({
			effects: setSearchQuery.of(new SearchQuery({
				search: findText,
				caseSensitive: matchCase,
				replace: replaceText
			}))
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

	function handleNextMatch() { syncSearchQuery(); if (view) findNext(view); }
	function handlePrevMatch() { syncSearchQuery(); if (view) findPrevious(view); }
	function handleReplace() { syncSearchQuery(); if (view) replaceNext(view); }
	function handleReplaceAll() { syncSearchQuery(); if (view) replaceAll(view); }

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

		const customKeymap = keymap.of([{
			key: "Mod-f",
			run: () => {
				openSearch();
				return true;
			}
		}]);

		const theme = EditorView.theme({
			"&": { height: "100%", width: "100%", outline: "none", backgroundColor: "transparent" },
			".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
			".cm-content": {
				padding: "16px 0",
				fontSize: "14px",
				lineHeight: "1.6",
				color: "oklch(var(--bc))"
			},
			".cm-lineNumbers": {
				padding: "0 12px 0 8px"
			},
			".cm-gutters": {
				backgroundColor: "oklch(var(--b2) / 0.5)",
				borderRight: "1px solid oklch(var(--bc) / 0.05)",
				color: "oklch(var(--bc) / 0.3)"
			},
			".cm-activeLineGutter": {
				backgroundColor: "oklch(var(--p) / 0.1)",
				color: "oklch(var(--p))"
			},
			".cm-activeLine": {
				backgroundColor: "transparent"
			},
			".cm-cursor, .cm-dropCursor": {
				borderLeftColor: "#ffffff",
				borderLeftWidth: "2px"
			},
			".cm-searchMatch": {
				backgroundColor: "oklch(var(--wa) / 0.4)",
				border: "1px solid transparent"
			},
			".cm-searchMatch.cm-searchMatch-selected": {
				backgroundColor: "oklch(var(--su) / 0.5)",
				border: "1px solid oklch(var(--su))",
				outline: "2px solid oklch(var(--su) / 0.3)"
			},
			"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
				backgroundColor: "oklch(var(--p) / 0.3)"
			}
		});

		if (editorContainer) {
			const extensions = [
				customKeymap,
				basicSetup,
				search(), // Headless search extension (no panel)
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

<div class="flex flex-col h-full relative" style="height: 100vh">
	<!-- Grid Background Pattern -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<!-- Toolbar -->
	<div class="flex h-14 items-center justify-between border-b border-base-content/10 bg-base-100 px-4 pl-12 shrink-0">
		<div class="flex items-center gap-4 flex-1">
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
						class="input input-sm input-bordered focus:outline-none w-64"
						onblur={() => {
							setTimeout(() => { isEditingTitle = false; }, 150);
						}}
					/>
					<button type="submit" class="btn btn-sm btn-ghost btn-square text-success">
						<Check size={16} />
					</button>
				</form>
			{:else}
				<button
					class="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors {isOwner ? 'hover:bg-base-200 cursor-pointer' : 'cursor-default'}"
					onclick={() => { if (isOwner) isEditingTitle = true; }}
					title={isOwner ? "Click to rename" : ""}
				>
					<span class="font-semibold text-base-content max-w-[200px] sm:max-w-md truncate">{title}</span>
					{#if !isOwner}
						<span class="badge badge-sm badge-ghost text-xs">Read Only</span>
					{:else}
						<Edit2 size={14} class="opacity-0 group-hover:opacity-100 text-base-content/50 transition-opacity" />
					{/if}
				</button>
			{/if}

			<!-- Save Status -->
			<div class="hidden sm:flex items-center gap-2 text-xs text-base-content/50 ml-4">
				{#if saveStatus === 'saving'}
					<span class="flex items-center gap-1.5"><span class="loading loading-spinner w-3 h-3 text-primary"></span> Saving...</span>
				{:else if saveStatus === 'pending'}
					<span class="flex items-center gap-1.5 opacity-70">Unsaved changes...</span>
				{:else if saveStatus === 'saved'}
					<span class="flex items-center gap-1.5 text-success"><Check size={14} /> Saved</span>
				{:else if saveStatus === 'error'}
					<span class="text-error">Save failed</span>
				{:else}
					<span class="flex items-center gap-1.5"><Clock size={14} /> Last edited: {formatDate(data.doc.updated_at)}</span>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-1">
			<!-- Find button -->
			<button
				class="btn btn-sm btn-ghost gap-1.5 text-base-content/60 hover:text-base-content"
				onclick={openSearch}
				title="Find & Replace (Ctrl+F)"
			>
				<Search size={15} />
				<span class="hidden sm:inline text-xs">Find</span>
			</button>

			<div class="w-px h-5 bg-base-content/10 mx-1"></div>

			{#if isOwner}
				<!-- Share button -->
				<div class="dropdown dropdown-end">
					<button
						tabindex="0"
						class="btn btn-sm gap-1.5 {isPublic ? 'btn-success btn-outline' : 'btn-ghost text-base-content/60'}"
						title="Share document"
					>
						<span class="hidden sm:inline text-xs">{isPublic ? 'Shared' : 'Share'}</span>
					</button>
					<div tabindex="-1" class="dropdown-content z-[1] p-4 shadow-xl bg-base-100 rounded-box w-72 border border-base-content/10 mt-2">
						<p class="font-semibold text-sm mb-1">Share Document</p>
						<p class="text-xs text-base-content/50 mb-4">Allow others to read this document with the link.</p>
						
						<div class="flex items-center justify-between mb-4">
							<span class="text-sm">Public Access</span>
							<form method="POST" action="?/togglePublic" use:enhance={() => {
								return async ({ update, result }) => {
									if (result.type === 'success' && result.data) {
										isPublic = result.data.isPublic as boolean;
									}
									await update({ reset: false });
								};
							}}>
								<input type="checkbox" class="toggle toggle-success toggle-sm" checked={isPublic} onchange={(e) => e.currentTarget.form?.requestSubmit()} />
							</form>
						</div>

						<div class="flex gap-2">
							<input type="text" value="{typeof window !== 'undefined' ? window.location.href : ''}" class="input input-sm input-bordered flex-1 text-xs" readonly />
							<button class="btn btn-sm btn-primary" onclick={copyLink}>
								{isCopying ? 'Copied!' : 'Copy'}
							</button>
						</div>
					</div>
				</div>

				<div class="w-px h-5 bg-base-content/10 mx-1"></div>

				<!-- Save button -->
				<form method="POST" action="?/save" use:enhance={() => {
					isSaving = true;
					saveStatus = 'saving';
					return async ({ update, result }) => {
						isSaving = false;
						if (result.type === 'success') {
							saveStatus = 'saved';
							setTimeout(() => { if (saveStatus === 'saved') saveStatus = 'idle'; }, 2000);
						} else {
							saveStatus = 'error';
						}
						await update({ reset: false });
					};
				}}>
					<input type="hidden" name="content" value={content} />
					<button
						type="submit"
						class="btn btn-sm btn-primary gap-1.5"
						disabled={isSaving}
						title="Save (Ctrl+S)"
					>
						<Save size={15} />
						<span class="hidden sm:inline text-xs">Save</span>
					</button>
				</form>

				<!-- Delete with confirmation popover -->
				<div class="dropdown dropdown-end">
					<button
						tabindex="0"
						class="btn btn-sm btn-ghost btn-square text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
						title="Delete document"
					>
						<Trash2 size={15} />
					</button>
					<div tabindex="-1" class="dropdown-content z-[1] p-4 shadow-xl bg-base-100 rounded-box w-64 border border-base-content/10 mt-2">
						<p class="font-semibold text-sm mb-1">Delete document?</p>
						<p class="text-xs text-base-content/50 mb-4">This action cannot be undone.</p>
						<div class="flex justify-end gap-2">
							<button class="btn btn-xs btn-ghost" onclick={() => (document.activeElement as HTMLElement)?.blur()}>Cancel</button>
							<form method="POST" action="?/delete" use:enhance>
								<button type="submit" class="btn btn-xs btn-error">Delete</button>
							</form>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Find & Replace Custom UI -->
	{#if showFindReplace}
		<div class="flex flex-wrap items-center gap-2 border-b border-base-content/10 bg-base-200/30 px-4 py-2 shrink-0 text-sm z-10">
			<!-- Find row -->
			<div class="flex items-center gap-1.5 flex-wrap">
				<div class="join">
					<input 
						id="find-input"
						type="text" 
						bind:value={findText} 
						placeholder="Find..." 
						class="input input-sm input-bordered join-item w-40 sm:w-52 focus:outline-none"
						onkeydown={(e) => { if(e.key === 'Enter') handleNextMatch(); }}
					/>
					<button 
						class="btn btn-sm join-item border border-base-content/20 {matchCase ? 'bg-primary text-primary-content' : 'bg-base-100'}"
						title="Match Case"
						onclick={() => (matchCase = !matchCase)}
					>
						<span class="font-serif font-bold text-xs">Aa</span>
					</button>
				</div>

				<!-- Prev / Next -->
				<div class="join">
					<button class="btn btn-sm btn-ghost join-item border border-base-content/20" onclick={handlePrevMatch} title="Previous match">
						<ChevronUp size={14} />
					</button>
					<button class="btn btn-sm btn-ghost join-item border border-base-content/20" onclick={handleNextMatch} title="Next match">
						<ChevronDown size={14} />
					</button>
				</div>
			</div>

			<!-- Separator -->
			<div class="w-px h-5 bg-base-content/15 hidden sm:block"></div>

			<!-- Replace row -->
			<div class="flex items-center gap-1.5">
				<input 
					type="text" 
					bind:value={replaceText} 
					placeholder="Replace with..." 
					class="input input-sm input-bordered w-40 sm:w-52 focus:outline-none"
					onkeydown={(e) => { if(e.key === 'Enter') handleReplace(); }}
				/>
				<button class="btn btn-sm btn-ghost border border-base-content/20" onclick={handleReplace} title="Replace current match">Replace</button>
				<button class="btn btn-sm btn-primary btn-outline" onclick={handleReplaceAll} title="Replace all matches">All</button>
			</div>

			<div class="flex-1"></div>
			<button class="btn btn-sm btn-ghost btn-square" onclick={() => (showFindReplace = false)} title="Close (Esc)">
				<X size={16} />
			</button>
		</div>
	{/if}

	<!-- CodeMirror Editor Container -->
	<div class="flex-1 overflow-hidden bg-base-100 relative m-4 md:m-6 mt-4 border border-base-content/10 rounded-xl shadow-sm z-10" bind:this={editorContainer}>
		<!-- CodeMirror injects here -->
	</div>

	<!-- Status Bar -->
	<div class="flex h-8 items-center justify-end border-t border-base-content/10 bg-base-200/50 px-4 shrink-0 text-xs text-base-content/50 gap-4">
		<span>{wordCount} words</span>
		<span>{charCount} chars</span>
		<span>{lineCount} lines</span>
		<span><kbd class="kbd kbd-xs">Ctrl</kbd> + <kbd class="kbd kbd-xs">F</kbd> to search</span>
	</div>
</div>
