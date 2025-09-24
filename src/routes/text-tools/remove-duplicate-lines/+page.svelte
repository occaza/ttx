<script lang="ts">
	let input = `Enter your text, choose the options, then click the "Remove Duplicate Lines" button.
Only duplicate lines across new lines will be removed. Duplicates within the same line will stay.
Line order is preserved, only repeated lines are deleted.

Options:
Check "Case sensitive" to match upper and lower case differently.
Check "Remove empty lines" to delete blank lines.
Check "Display removed" to show removed lines with a note.

Example:
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.
Click "Remove Duplicate Lines" and duplicate lines will be reduced to one.`;
	let removed = '';
	let caseSensitive = false;
	let removeEmpty = false;
	let showRemoved = false;
	let fileName = 'output.txt';
	let removedCount = 0;
	let fileInput: HTMLInputElement;
	let inputEl: HTMLTextAreaElement;
	let hasProcessed = false;

	function handleFile(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files?.length) return;
		const reader = new FileReader();
		reader.onload = () => {
			input = reader.result as string;
		};
		reader.readAsText(target.files[0]);
	}

	function removeDup() {
		const rawLines = input.split(/\r?\n/);

		const firstPos = new Map<string, number>();
		const kept: string[] = [];
		const gone: string[] = [];

		rawLines.forEach((line, idx) => {
			// Jika removeEmpty true dan line kosong, skip
			if (removeEmpty && line.trim() === '') {
				return;
			}

			// Jika line kosong tapi removeEmpty false, langsung masukkan ke kept
			if (line.trim() === '' && !removeEmpty) {
				kept.push(line);
				return;
			}

			// Proses normal untuk line yang tidak kosong
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
		hasProcessed = true; // Set ke true setelah proses
	}

	function selectAll() {
		inputEl.select();
	}
	function clear() {
		input = '';
		removed = '';
		removedCount = 0;
		hasProcessed = false; // Reset saat clear
	}

	function saveAs() {
		const blob = new Blob([input], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName.trim() || 'output.txt';
		a.click();
	}
</script>

<svelte:head><title>Remove Duplicate Lines</title></svelte:head>

<div class="max-w-4xl space-y-3">
	<h2 class="text-lg font-bold">Remove Duplicate Lines</h2>

	<div class="flex flex-wrap items-center gap-4">
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={caseSensitive} />
			<span class="label-text ml-2">Case sensitive</span>
		</label>
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeEmpty} />
			<span class="label-text ml-2">Remove empty lines</span>
		</label>
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={showRemoved} />
			<span class="label-text ml-2">Display removed</span>
		</label>
	</div>

	<div class="flex items-center gap-2">
		<input
			type="file"
			accept="text/plain"
			bind:this={fileInput}
			on:change={handleFile}
			class="file-input-bordered file-input w-full max-w-xs file-input-sm"
		/>
		<div class="tooltip" data-tip="Select all">
			<button class="btn btn-square btn-sm" on:click={selectAll}>S</button>
		</div>
		<div class="tooltip" data-tip="Clear">
			<button class="btn btn-square btn-sm" on:click={clear}>C</button>
		</div>
		{#if hasProcessed}
			<span class="label-text">{removedCount} lines removed</span>
		{/if}
	</div>

	<div>
		<label class="form-control">
			<textarea
				bind:value={input}
				bind:this={inputEl}
				rows="16"
				class="textarea-bordered textarea w-full"
				placeholder=""
			></textarea>
		</label>

		<button class="btn my-2 btn-sm btn-primary" on:click={removeDup}>Remove Duplicates</button>
	</div>

	<div>
		{#if showRemoved}
			<label class="form-control">
				<textarea bind:value={removed} rows="6" class="textarea-bordered textarea w-full" readonly
					>asdasd</textarea
				>
			</label>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<button class="btn btn-sm" on:click={saveAs}>Save as</button>
		<input type="text" bind:value={fileName} class="input-bordered input input-sm w-48" />
	</div>
</div>
