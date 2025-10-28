<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';

	import { page } from '$app/stores';

	let input =
		$state(`Enter your text, choose the options, then click the "Remove Duplicate Lines" button.
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
	<title>Remove Duplicate Lines</title>
	<meta
		name="description"
		content="Hapus baris duplikat dari teks Anda secara otomatis. Pertahankan urutan dan hapus hanya baris yang berulang."
	/>
	<meta
		name="keywords"
		content="remove duplicates, hapus duplikat, clean text, deduplicate, unique lines, text cleaner"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/text-tools/remove-duplicate-lines" />

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

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<div class="pb-5">
		<h2 class="text-lg font-bold">Remove Duplicate Lines</h2>
		<p class="text-sm text-gray-600">Hapus baris yang terduplikat</p>
	</div>

	<div class="flex gap-2">
		<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="md" />
		<ActionButton
			showSelectAll={true}
			showClear={true}
			showCopy={true}
			onselectall={selectAll}
			onclear={clear}
			oncopy={copy}
		/>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={caseSensitive} />
			<span class="label-text">Case sensitive</span>
		</label>
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeEmpty} />
			<span class="label-text">Remove empty lines</span>
		</label>
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={showRemoved} />
			<span class="label-text">Display removed</span>
		</label>
		{#if hasProcessed}
			<span class="label-text text-sm">{removedCount} lines removed</span>
		{/if}
	</div>

	<div>
		<TextArea
			bind:this={inputTextarea}
			bind:value={input}
			placeholder="Paste text here..."
			rows={15}
		/>
	</div>

	<div>
		<button class="btn rounded-sm btn-primary" onclick={removeDup}>Remove Duplicates</button>
	</div>

	{#if showRemoved}
		<div>
			<TextArea bind:value={removed} placeholder="Removed lines..." rows={6} readonly={true} />
		</div>
	{/if}

	<div class="flex items-center gap-2">
		<SaveFiles content={input} defaultName="output.txt" />
	</div>
</div>
