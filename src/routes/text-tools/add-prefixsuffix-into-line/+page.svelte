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

<div class="mx-auto max-w-5xl space-y-3 bg-base-200 p-6 shadow-lg lg:rounded-2xl">
	<h2 class="text-lg font-bold">Add Prefix/Suffix into Line</h2>

	<div class="flex items-center gap-2">
		<input
			type="file"
			accept="text/plain"
			bind:this={fileInput}
			on:change={handleFile}
			class="file-input-bordered file-input w-full max-w-sm file-input-sm"
		/>
		<div class="tooltip" data-tip="Select all">
			<button class="btn btn-square btn-sm" on:click={selectAll}>S</button>
		</div>
		<div class="tooltip" data-tip="Clear">
			<button class="btn btn-square btn-sm" on:click={clear}>C</button>
		</div>
	</div>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
		<label class="input w-full">
			<span class="label">Prefix </span>
			<input type="text" bind:value={prefix} placeholder="Enter prefix here" />
		</label>

		<label class="input w-full">
			<span class="label">Suffix </span>
			<input type="text" bind:value={suffix} placeholder="Enter suffix here" />
		</label>
	</div>
	<div>
		<label class="form-control">
			<textarea
				bind:value={input}
				rows="10"
				class="textarea w-full resize-none font-mono text-base md:text-sm"
				placeholder="Paste text here..."
			></textarea>
		</label>
	</div>

	<div class="my-2">
		<button class="btn btn-sm btn-primary" on:click={applyFix}>Add prefix and/or suffix</button>
	</div>

	<label class="form-control">
		<textarea
			bind:this={inputEl}
			bind:value={output}
			rows="10"
			class="textarea w-full resize-none font-mono text-base md:text-sm"
			readonly
		></textarea>
	</label>

	<div class="my-2 flex items-center gap-2">
		<button class="btn btn-sm" on:click={saveAs}>Save as</button>
		<input type="text" bind:value={fileName} class="input-bordered input input-sm w-48" />
	</div>
</div>
