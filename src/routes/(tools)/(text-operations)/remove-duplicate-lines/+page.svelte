<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Copy, Play, FileMinus } from '@lucide/svelte';

	let input =		$state(`Enter your text, choose the options, then click the "Remove Duplicate Lines" button.
Only duplicate lines across new lines will be removed. Duplicates within the same line will stay.
Line order is preserved, only repeated lines are deleted.

Options:
Check "Case sensitive" to match upper and lower case differently.
Check "Remove empty lines" to delete blank lines.
Check "Display removed" to show removed lines with a note.

Example:
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.`);
	let removed = $state('');
	let caseSensitive = $state(false);
	let removeEmpty = $state(false);
	let showRemoved = $state(false);
	let removedCount = $state(0);
	let hasProcessed = $state(false);

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function removeDup() {
		const rawLines = input.split(/\r?\n/);
		const firstPos = new Map<string, number>();
		const kept: string[] = [];
		const gone: string[] = [];

		rawLines.forEach((line, idx) => {
			if (removeEmpty && line.trim() === '') {
				return;
			}

			if (line.trim() === '' && !removeEmpty) {
				kept.push(line);
				return;
			}

			const key = caseSensitive ? line : line.toLowerCase();
			const first = firstPos.get(key);

			if (first === undefined) {
				firstPos.set(key, idx);
				kept.push(line);
			} else {
				gone.push(`(${idx + 1} dupe of ${first + 1}): ${line}`);
			}
		});

		removedCount = gone.length;
		removed = gone.join('\n');
		input = kept.join('\n');
		hasProcessed = true;
	}

	function selectAll() {
		inputTextarea.select();
	}

	function clear() {
		input = '';
		removed = '';
		removedCount = 0;
		hasProcessed = false;
		fileUpload.reset();
		removeEmpty = false;
		caseSensitive = false;
		showRemoved = false;
	}

	function copy() {
		navigator.clipboard.writeText(input);
	}
</script>

<svelte:head>
	<title>Remove Duplicate Lines - TEXY Workspace</title>
	<meta
		name="description"
		content="Hapus baris duplikat dari teks Anda secara otomatis. Pertahankan urutan dan hapus hanya baris yang berulang."
	/>
	<meta
		name="keywords"
		content="remove duplicates, hapus duplikat, clean text, deduplicate, unique lines, text cleaner"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/remove-duplicate-lines" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Remove Duplicate Lines - Text Tools" />
	<meta property="og:description" content="Hapus baris duplikat dari teks Anda secara otomatis" />
	<meta property="og:url" content="{$page.url.origin}/text-tools/remove-duplicate-lines" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Remove Duplicate Lines - Text Tools" />
	<meta name="twitter:description" content="Hapus baris duplikat dari teks Anda secara otomatis" />
	<meta
		name="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Grid Background Pattern -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
		
		<!-- Header -->
		<div class="mb-8">
			<a href="/" class="mb-5 inline-flex items-center text-sm font-medium text-base-content/40 hover:text-base-content transition-colors">
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md">
					<Copy size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Remove Duplicate Lines</h1>
					<p class="mt-1 text-sm text-base-content/50">Hapus baris teks yang berulang secara instan. Urutan tetap dipertahankan.</p>
				</div>
			</div>
		</div>

		<!-- Tool Workspace (Unified Editor Panel) -->
		<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
			
			<!-- Top Toolbar: Actions & Options -->
			<div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-content/10 bg-base-200/30 rounded-t-2xl px-4 py-3 gap-4">
				
				<!-- Left: Actions & File Upload -->
				<div class="flex flex-wrap items-center gap-3">
					<div class="w-full sm:w-56 md:w-64">
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</div>
					<div class="h-4 w-px bg-base-content/20 hidden sm:block"></div>
					<ActionButton
						showSelectAll={true}
						showClear={true}
						showCopy={true}
						onselectall={selectAll}
						onclear={clear}
						oncopy={copy}
					/>
				</div>

				<!-- Right: Options -->
				<div class="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
					<label class="flex cursor-pointer items-center gap-2 text-xs font-medium text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={caseSensitive} />
						Case sensitive
					</label>
					<label class="flex cursor-pointer items-center gap-2 text-xs font-medium text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={removeEmpty} />
						Remove empty
					</label>
					<label class="flex cursor-pointer items-center gap-2 text-xs font-medium text-base-content/70 hover:text-primary transition-colors">
						<input type="checkbox" class="checkbox checkbox-xs rounded-sm" bind:checked={showRemoved} />
						Display removed
					</label>
				</div>

			</div>

			<!-- Main Editor -->
			<div class="relative bg-base-100/50">
				<TextArea
					bind:this={inputTextarea}
					bind:value={input}
					placeholder="Paste text here..."
					rows={24}
					className="w-full resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[500px]"
				/>
			</div>

			<!-- Bottom Toolbar: Save & Execute -->
			<div class="flex flex-col sm:flex-row items-center justify-between border-t border-base-content/10 bg-base-200/30 rounded-b-2xl px-4 py-3 gap-4">
				<div class="w-full sm:w-auto">
					<SaveFiles content={input} defaultName="output.txt" />
				</div>
				
				<div class="flex w-full sm:w-auto items-center justify-end gap-3">
					{#if hasProcessed}
						<span class="text-xs font-semibold text-success animate-in fade-in slide-in-from-right-4">
							{removedCount} baris dihapus
						</span>
					{/if}
					<button class="btn btn-primary btn-sm rounded-lg shadow-sm hover:scale-105 transition-all font-bold gap-2 w-full sm:w-auto" onclick={removeDup}>
						Remove Duplicates
						<Play size={14} fill="currentColor" />
					</button>
				</div>
			</div>
		</div>

		<!-- Log Output (Only visible if checked) -->
		{#if showRemoved}
			<div class="mt-6 rounded-2xl border border-error/20 bg-error/5 p-4 shadow-sm animate-in slide-in-from-top-2 fade-in">
				<h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-error/80">
					<FileMinus size={16} />
					Removed Lines Log
				</h3>
				<TextArea bind:value={removed} placeholder="Removed lines will appear here..." rows={6} readonly={true} className="w-full bg-transparent text-sm outline-none border-none focus:ring-0 font-mono text-error/80 resize-y" />
			</div>
		{/if}

	</div>
</div>
