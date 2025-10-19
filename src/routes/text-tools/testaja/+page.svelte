<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';

	let input = $state('');
	let textarea: TextArea;

	let textA: TextArea;
	let textB: TextArea;

	let outA: string[] = $state([]);
	let outB: string[] = $state([]);

	let fileUpload: FileUploadInput;

	function selectAll() {
		textarea.select();
	}

	function handleLoadA(content: string) {
		outA = content.split('\n');
	}

	function handleLoadB(content: string) {
		outB = content.split('\n');
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function clear() {
		input = '';
		outA = [];
		outB = [];
	}

	function copy() {
		navigator.clipboard.writeText(input);
	}
</script>

<FileUploadInput bind:this={fileUpload} onload={handleLoadA} onerror={handleError} size="lg" />
<FileUploadInput className="ml-2" onload={handleLoadB} onerror={handleError} size="lg" />
<ActionButton showCopy={true} onselectall={selectAll} onclear={clear} oncopy={copy} />
<TextArea bind:this={textarea} bind:value={input} placeholder="Enter text here..." rows={15} />
<TextArea
	bind:this={textA}
	value={outA.join('\n')}
	placeholder="Output A"
	rows={10}
	readonly={true}
	className="mt-4"
/>
<TextArea
	bind:this={textB}
	value={outB.join('\n')}
	placeholder="Output B"
	rows={10}
	readonly={true}
	className="mt-4"
/>
