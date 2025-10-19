<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';

	let input = $state('');
	let textA: TextArea;
	let outA: string[] = $state([]);
	let fileUpload: FileUploadInput;

	function selectAll() {
		textA.select();
	}

	function handleLoadA(content: string) {
		outA = content.split('\n');
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function clear() {
		input = '';
		outA = [];
	}

	function copy() {
		navigator.clipboard.writeText(input);
	}
</script>

<div class="gap-y=5 mx-auto flex max-w-4xl flex-col p-4">
	<div class="mb-4 flex gap-2">
		<FileUploadInput bind:this={fileUpload} onload={handleLoadA} onerror={handleError} size="md" />

		<ActionButton showCopy={true} onselectall={selectAll} onclear={clear} oncopy={copy} />
	</div>
	<div class="mb-4 flex gap-2">
		<TextArea
			bind:this={textA}
			value={outA.join('\n')}
			placeholder="Enter text here..."
			rows={15}
			readonly={true}
		/>
	</div>
</div>
