<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import SaveFiles from '$lib/components/SaveButton.svelte';

	let input = $state('');
	let output = $state('');
	let copied = $state(false);
	let delimiter = $state('');
	let customDelimiter = $state('');
	let delimiterOption = $state('');
	let segmen = $state<string[]>([]);
	let pickSet = $state(new Set<number>());
	let segCount = $state(0);
	let inputTextarea: TextArea;
	let outputTextarea: TextArea;
	let fileUpload: FileUploadInput;

	const maxLabelLength = 10;

	$effect(() => {
		if (input) preview();
	});

	$effect(() => {
		delimiter = delimiterOption === 'custom' ? customDelimiter || '|' : delimiterOption;
		if (delimiter) {
			preview();
			extract();
		} else {
			segCount = 0;
			segmen = [];
			output = '';
		}
	});

	function preview() {
		if (!delimiter) {
			segCount = 0;
			segmen = [];
			return;
		}

		const rows = input.split(/\r?\n/).filter((l) => l.includes(delimiter));
		if (!rows.length) {
			segmen = [];
			segCount = 0;
			pickSet.clear();
			output = '';
			return;
		}

		segCount = Math.max(...rows.map((r) => r.split(delimiter).length));
		pickSet.clear();
		for (let i = 0; i < segCount; i++) pickSet.add(i);
		pickSet = pickSet;

		segmen = rows[0].split(delimiter).map((s) => {
			const trimmed = s.trim();
			return trimmed.length > maxLabelLength
				? trimmed.substring(0, maxLabelLength) + '...'
				: trimmed;
		});
	}

	function extract() {
		if (!delimiter) {
			output = '';
			return;
		}

		const rows = input.split(/\r?\n/).filter((l) => l.includes(delimiter));
		const picks = Array.from(pickSet).sort((a, b) => a - b);
		output = rows
			.map((r) =>
				r
					.split(delimiter)
					.filter((_, i) => picks.includes(i))
					.join(delimiter)
			)
			.join('\n');
	}

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function selectAll() {
		outputTextarea.select();
	}

	function clear() {
		input = '';
		output = '';
		copied = false;
		delimiter = '';
		customDelimiter = '';
		delimiterOption = '';
		pickSet = new Set<number>();
		segCount = 0;
		segmen = [];
		fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function handleCheckboxChange(index: number, checked: boolean) {
		if (checked) {
			pickSet.add(index);
		} else {
			pickSet.delete(index);
		}
		pickSet = pickSet;
		extract();
	}
</script>

<svelte:head><title>Split Random Delimiter</title></svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<h2 class="pb-5 text-lg font-bold">Split Random Delimiter</h2>

	<div class="flex gap-2">
		<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="md" />
		<select bind:value={delimiterOption} class="select rounded-sm select-md">
			<option value="" disabled selected>Choose Delimiter</option>
			<option value="|">Pipe (|)</option>
			<option value="	">Tab</option>
			<option value=" ">Space</option>
			<option value=",">Comma (,)</option>
			<option value=";">Semicolon (;)</option>
			<option value=":">Colon (:)</option>
			<option value="custom">Custom</option>
		</select>

		{#if delimiterOption === 'custom'}
			<input type="text" bind:value={customDelimiter} maxlength="1" />
		{/if}

		<ActionButton
			showSelectAll={true}
			showClear={true}
			showCopy={true}
			onselectall={selectAll}
			onclear={clear}
			oncopy={copy}
		/>
	</div>

	<div>
		<TextArea
			bind:this={inputTextarea}
			bind:value={input}
			placeholder="Paste text here..."
			rows={6}
		/>
	</div>

	<div>
		<button class="btn rounded-sm btn-md btn-primary" onclick={extract}>Extract</button>
	</div>

	<div>
		<TextArea
			bind:this={outputTextarea}
			bind:value={output}
			placeholder="Output here..."
			rows={15}
			readonly={true}
		/>
	</div>

	{#if segCount}
		<div class="space-y-2">
			<p class="text-sm">
				Ada <span class="font-semibold">{segCount}</span> Segment per baris.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each Array(segCount) as _, i (i)}
					<label class="label cursor-pointer" title={segmen[i] || `seg ${i + 1}`}>
						<input
							type="checkbox"
							class="checkbox checkbox-sm"
							checked={pickSet.has(i)}
							onchange={(e) => handleCheckboxChange(i, e.currentTarget.checked)}
						/>
						<span class="label-text">{segmen[i] || `seg ${i + 1}`}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex items-center gap-2">
		<!-- <button class="btn rounded-sm btn-sm" disabled={!output} onclick={copy}>
			{copied ? '✓ Copied!' : 'Copy'}
		</button> -->
		<SaveFiles content={output} defaultName="output.txt" />
	</div>
</div>
