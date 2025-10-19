<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import SaveFiles from '$lib/components/SaveButton.svelte';

	let input = $state('');
	let output = $state('');
	let prefix = $state('');
	let suffix = $state('');
	let fileUpload: FileUploadInput;

	let inputTextarea: TextArea;
	let outputTextarea: TextArea;

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function applyFix() {
		const lines = input.split(/\r?\n/);
		output = lines.map((l) => prefix + l + suffix).join('\n');
	}

	function selectAll() {
		outputTextarea.select();
	}

	function clear() {
		input = '';
		output = '';
		prefix = '';
		suffix = '';
		fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
	}
</script>

<svelte:head><title>Add Prefix/Suffix into Line</title></svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<h2 class="pb-5 text-lg font-bold">Add Prefix/Suffix into Line</h2>

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

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
		<label class="input w-full rounded-sm">
			<span class="label">Prefix</span>
			<input type="text" bind:value={prefix} placeholder="Enter prefix here" />
		</label>

		<label class="input w-full rounded-sm">
			<span class="label">Suffix</span>
			<input type="text" bind:value={suffix} placeholder="Enter suffix here" />
		</label>
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
		<button class="btn rounded-sm btn-primary" onclick={applyFix}>Add prefix and/or suffix</button>
	</div>

	<div>
		<TextArea
			bind:this={outputTextarea}
			bind:value={output}
			placeholder="Output here..."
			rows={10}
			readonly={true}
		/>
	</div>

	<div class="flex items-center gap-2">
		<SaveFiles content={output} defaultName="output.txt" />
	</div>
</div>
