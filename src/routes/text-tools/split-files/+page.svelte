<script lang="ts">
	let input = '';
	let linesPerFile = 200;
	let headerText = '';
	let footerText = '';
	let fileName = 'part';
	let fileInput: HTMLInputElement;
	let inputEl: HTMLTextAreaElement;
	let removeEmpty = false;

	type Link = { name: string; url: string };
	let links: Link[] = [];

	function handleFile(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files?.length) return;
		const reader = new FileReader();
		reader.onload = () => {
			input = reader.result as string;
		};
		reader.readAsText(target.files[0]);
	}

	function buildLinks() {
		links = []; // reset
		let lines = input.split(/\r?\n/);
		if (removeEmpty) lines = lines.filter((l) => l.trim() !== '');

		const total = lines.length;
		const chunk = Math.max(1, Math.floor(linesPerFile));
		let part = 1;

		for (let i = 0; i < total; i += chunk) {
			const slice = lines.slice(i, i + chunk);
			if (headerText) slice.unshift(headerText);
			if (footerText) slice.push(footerText);
			const blob = new Blob([slice.join('\n')], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			links.push({ name: `${fileName}${part}.txt`, url });
			part++;
		}
	}

	function selectAll() {
		inputEl.select();
	}
	function clear() {
		input = '';
		links = [];
	}
</script>

<svelte:head><title>Split File</title></svelte:head>

<div class="max-w-4xl space-y-3">
	<h2 class="text-lg font-bold">Split Text File</h2>

	<div class="flex items-center gap-2">
		<input
			type="file"
			accept="text/plain"
			bind:this={fileInput}
			on:change={handleFile}
			class="file-input-bordered file-input w-full max-w-xs file-input-sm"
		/>
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeEmpty} />
			<span class="label-text ml-2">Remove empty lines</span>
		</label>
		<div class="tooltip" data-tip="Select all">
			<button class="btn btn-square btn-sm" on:click={selectAll}>S</button>
		</div>
		<div class="tooltip" data-tip="Clear">
			<button class="btn btn-square btn-sm" on:click={clear}>C</button>
		</div>
	</div>

	<label class="form-control">
		<span class="label-text">Input (text to split)</span>
		<textarea
			bind:value={input}
			bind:this={inputEl}
			rows="10"
			class="textarea-bordered textarea w-full"
			placeholder="Paste or upload text..."
		></textarea>
	</label>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Lines per file</legend>
		<input type="number" bind:value={linesPerFile} class="input" placeholder="Min 1" min="1" />
	</fieldset>

	<label class="form-control">
		<span class="label-text">Add text to first line of each part (optional)</span>
		<input
			type="text"
			bind:value={headerText}
			placeholder="header text"
			class="input-bordered input w-full"
		/>
	</label>

	<label class="form-control">
		<span class="label-text">Add text to last line of each part (optional)</span>
		<input
			type="text"
			bind:value={footerText}
			placeholder="footer text"
			class="input-bordered input w-full"
		/>
	</label>

	<div class="my-2 join">
		<input
			type="text"
			bind:value={fileName}
			placeholder="part"
			class="input-bordered input join-item w-full max-w-xs"
		/>
		<button class="btn join-item" on:click={buildLinks}>Split files</button>
	</div>

	{#if links.length}
		<div class="space-y-2">
			<p class="text-sm">Ready to download:</p>
			{#each links as l}
				<a href={l.url} download={l.name} class="block link link-primary">{l.name}</a>
			{/each}
		</div>
	{/if}
</div>
