<script lang="ts">
	let qty = 10;
	let min = 0;
	let max = 1000;
	let prefix = '';
	let suffix = '';
	let padOn = false; // checkbox
	let output = '';
	let fileName = 'random.txt';
	let outputEl: HTMLTextAreaElement;

	function selectAll() {
		outputEl?.select();
	}
	function clearOut() {
		output = '';
	}

	function digits(n: number): number {
		return n.toString().length;
	}

	function generate() {
		const list: string[] = [];
		const padLen = padOn ? digits(max) : 0;
		for (let i = 0; i < qty; i++) {
			const raw = Math.floor(Math.random() * (max - min + 1)) + min;
			const padded = padLen > 0 ? raw.toString().padStart(padLen, '0') : raw.toString();
			list.push(prefix + padded + suffix);
		}
		output = list.join('\n');
	}

	function saveAs() {
		const blob = new Blob([output], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName.trim() || 'random.txt';
		a.click();
	}
</script>

<svelte:head><title>Random Number Generator</title></svelte:head>

<div class="mx-auto max-w-4xl space-y-3">
	<h2 class="text-lg font-bold">Random Number Generator</h2>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<label class="input">
			<span class="label">Quantity </span>
			<input type="number" bind:value={qty} min="1" />
		</label>
		<label class="input">
			<span class="label">Min </span>
			<input type="number" bind:value={min} />
		</label>
		<label class="input">
			<span class="label">Max </span>
			<input type="number" bind:value={max} />
		</label>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<label class="input">
			<span class="label">Prefix </span>
			<input type="text" bind:value={prefix} placeholder="Enter prefix here" />
		</label>

		<label class="input">
			<span class="label">Suffix </span>
			<input type="text" bind:value={suffix} placeholder="Enter suffix here" />
		</label>
		<div class="flex items-center gap-2">
			<label class="label cursor-pointer">
				<span class="label-text">Pad numbers</span>
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={padOn} />
			</label>
			<div class="tooltip" data-tip="Select all">
				<button class="btn btn-square btn-sm" on:click={selectAll}>S</button>
			</div>
			<div class="tooltip" data-tip="Clear output">
				<button class="btn btn-square btn-sm" on:click={clearOut}>C</button>
			</div>
		</div>
	</div>

	<button class="btn btn-sm btn-primary" on:click={generate}>Generate</button>
	<div>
		<label class="form-control">
			<textarea
				bind:value={output}
				bind:this={outputEl}
				rows="10"
				class="textarea w-full resize-none"
				readonly
				placeholder="Output here"
			></textarea>
		</label>
	</div>

	<div class="flex items-center gap-2">
		<button class="btn btn-sm" on:click={saveAs}>Save as</button>
		<input type="text" bind:value={fileName} class="input-bordered input input-sm w-48" />
	</div>
</div>
