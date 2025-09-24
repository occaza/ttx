<script lang="ts">
	let input = '';
	let output = '';
	let prefix = '';
	let suffix = '';
	let fileName = 'output.txt';
	let fileInput: HTMLInputElement;
	let inputEl: HTMLTextAreaElement;

	function handleFile(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files?.length) return;
		const reader = new FileReader();
		reader.onload = () => {
			input = reader.result as string;
		};
		reader.readAsText(target.files[0]);
	}

	function applyFix() {
		const lines = input.split(/\r?\n/);
		output = lines.map((l) => prefix + l + suffix).join('\n');
	}

	function selectAll() {
		inputEl.select();
	}
	function clear() {
		input = '';
		output = '';
	}

	function saveAs() {
		const blob = new Blob([output], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName.trim() || 'output.txt';
		a.click();
	}
</script>

<svelte:head><title>Add Prefix/Suffix into Line</title></svelte:head>

<div class="max-w-4xl space-y-3">
	<h2 class="text-lg font-bold">Add Prefix/Suffix into Line</h2>

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
	</div>

	<label class="form-control">
		<textarea
			bind:value={input}
			bind:this={inputEl}
			rows="10"
			class="textarea-bordered textarea w-full"
			placeholder="Paste text here..."
		></textarea>
	</label>

	<label class="form-control">
		<span class="label-text">Add this prefix into the beginning of each line:</span>
		<input
			type="text"
			bind:value={prefix}
			placeholder="enter prefix here"
			class="input-bordered input w-full"
		/>
	</label>

	<label class="form-control">
		<span class="label-text">Add this suffix into the end of each line:</span>
		<input
			type="text"
			bind:value={suffix}
			placeholder="enter suffix here"
			class="input-bordered input w-full"
		/>
	</label>

	<button class="btn btn-sm btn-primary" on:click={applyFix}>Apply</button>

	<label class="form-control">
		<textarea bind:value={output} rows="10" class="textarea-bordered textarea w-full" readonly
		></textarea>
	</label>

	<div class="flex items-center gap-2">
		<button class="btn btn-sm" on:click={saveAs}>Save as</button>
		<input type="text" bind:value={fileName} class="input-bordered input input-sm w-48" />
	</div>
</div>
