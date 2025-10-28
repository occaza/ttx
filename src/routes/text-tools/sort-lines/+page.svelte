<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';

	let input = $state('');
	let output = $state('');
	let order = $state<'asc' | 'desc'>('asc');
	let removeDup = $state(false);
	let caseSensitive = $state(false);
	let copied = $state(false);

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function sortLines() {
		let lines = input.split(/\r?\n/);
		if (!caseSensitive) lines = lines.map((l) => l.toLowerCase());
		lines.sort();
		if (order === 'desc') lines.reverse();
		if (removeDup) lines = [...new Set(lines)];
		output = lines.join('\n');
	}

	function selectAll() {
		inputTextarea.select();
	}

	function clear() {
		input = '';
		output = '';
		fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head><title>Sort Lines</title></svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<div class="pb-5">
		<h2 class="text-lg font-bold">Sort Lines</h2>
		<p class="text-sm text-gray-600">
			Urutkan baris teks secara alfabetis, dengan opsi menghapus duplikat dan mengatur urutan.
		</p>
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
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeDup} />
			<span class="label-text">Remove duplicates</span>
		</label>
		<select bind:value={order} class="select rounded-sm select-md">
			<option value="asc">A → Z</option>
			<option value="desc">Z → A</option>
		</select>
	</div>

	<div>
		<TextArea
			bind:this={inputTextarea}
			bind:value={input}
			placeholder="Paste text here..."
			rows={10}
		/>
	</div>

	<div>
		<button class="btn rounded-sm btn-sm btn-primary" onclick={sortLines}>Sort</button>
	</div>

	<div>
		<TextArea bind:value={output} placeholder="Output here..." rows={10} readonly={true} />
	</div>

	<div class="flex items-center gap-2">
		<SaveFiles content={output} defaultName="sorted.txt" />
	</div>
</div>
