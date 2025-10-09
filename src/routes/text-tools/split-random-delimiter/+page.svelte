<script lang="ts">
	import { WholeWord, Eraser } from '@lucide/svelte';

	let input = '';
	let output = '';
	let copied = false;
	let fileName = 'output.txt';
	let delimiter = '|';
	let customDelimiter = '';
	let delimiterOption = '|';
	let segmen: string[] = [];
	let pickSet = new Set<number>();
	let segCount = 0;
	let inputEl: HTMLTextAreaElement;
	const maxLabelLength = 10;

	$: if (input) preview();
	$: (pickSet, extract());
	$: delimiter = delimiterOption === 'custom' ? customDelimiter || '|' : delimiterOption;

	function preview() {
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

		segmen = rows[0].split(delimiter).map((s) => {
			const trimmed = s.trim();
			return trimmed.length > maxLabelLength
				? trimmed.substring(0, maxLabelLength) + '...'
				: trimmed;
		});
	}

	function extract() {
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

	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}

	async function saveAs() {
		const element = document.createElement('a');
		const file = new Blob([output], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = fileName.endsWith('.txt') ? fileName : fileName + '.txt';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
	function selectAll() {
		inputEl.select();
	}
	function clear() {
		input = '';
		output = '';
		copied = false;
		fileName = 'output.txt';
		delimiter = '|';
		customDelimiter = '';
		delimiterOption = '|';
		pickSet = new Set<number>();
		segCount = 0;
	}
</script>

<svelte:head><title>Split Random Delimiter</title></svelte:head>

<div class="mx-auto max-w-4xl space-y-3 p-4">
	<h2 class="text-lg font-bold">Split Random Delimiter</h2>

	<div class="form-control">
		<label class="label" for="delimiter-select">
			<span class="label-text font-medium">Delimiter</span>
		</label>

		<div class="flex flex-wrap items-center gap-2">
			<!-- Select -->
			<select id="delimiter-select" bind:value={delimiterOption} class=" select w-40 select-md">
				<option value="|">Pipe (|)</option>
				<option value="	">Tab</option>
				<option value=" ">Space</option>
				<option value=",">Comma (,)</option>
				<option value=";">Semicolon (;)</option>
				<option value=":">Colon (:)</option>
				<option value="custom">Custom</option>
			</select>

			<!-- Custom input muncul jika pilih "Custom" -->
			{#if delimiterOption === 'custom'}
				<input
					type="text"
					bind:value={customDelimiter}
					maxlength="1"
					class="input-bordered input input-sm w-20"
					placeholder="e.g. -"
				/>
			{/if}

			<!-- Tombol tindakan -->
			<div class="flex items-center gap-2">
				<div class="tooltip" data-tip="Select all">
					<button class="btn btn-square btn-sm btn-secondary" on:click={selectAll}>
						<WholeWord />
					</button>
				</div>
				<div class="tooltip" data-tip="Clear">
					<button class="btn btn-square btn-sm btn-accent" on:click={clear}> <Eraser /> </button>
				</div>
			</div>
		</div>
	</div>

	<div>
		<label class="form-control">
			<span class="label-text">Input text</span>
			<textarea bind:value={input} rows="6" class="textarea-bordered textarea w-full resize-none"
			></textarea>
		</label>
	</div>

	<div>
		<button class="btn btn-sm btn-primary" on:click={extract}>Extract</button>
	</div>

	<label class="form-control">
		<span class="label-text">Output text</span>

		<textarea
			bind:value={output}
			bind:this={inputEl}
			rows="15"
			class="textarea-bordered textarea w-full resize-none"
			readonly
		></textarea>
	</label>
	<div>
		{#if segCount}
			<div class="mb-2 text-sm">
				There are <b>{segCount}</b> Segments per row.
			</div>
			<div class="mb-2 flex flex-wrap gap-2">
				{#each Array(segCount) as _, i}
					<label class="label cursor-pointer" title={segmen[i] || `seg ${i + 1}`}>
						<input
							type="checkbox"
							class="checkbox checkbox-sm"
							checked={pickSet.has(i)}
							on:change={(e) => {
								if (e.currentTarget.checked) {
									pickSet = new Set([...pickSet, i]);
								} else {
									pickSet = new Set([...pickSet].filter((x) => x !== i));
								}
							}}
						/>
						<span class="label-text">{segmen[i] || `seg ${i + 1}`}</span>
					</label>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex justify-between gap-2">
		<div>
			<button class="btn btn-sm" disabled={!output} on:click={copy}>
				{copied ? 'Copied!' : 'Copy'}
			</button>
		</div>
		<div class="flex items-center gap-2">
			<input type="text" bind:value={fileName} class="input-bordered input input-sm w-48" />
			<button class="btn btn-sm" disabled={!output} on:click={saveAs}>Save as</button>
		</div>
	</div>
</div>
