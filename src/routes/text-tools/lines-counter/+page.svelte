<script lang="ts">
	let input = '';
	let output = '';
	let fileInput: HTMLInputElement;
	let outputEl: HTMLTextAreaElement;

	let totalLines = 0;
	let uniqueLines = 0;
	let dupLines = 0;

	let caseSensitive = false;
	let removeEmpty = false;

	function handleFile(e: Event) {
		const t = e.target as HTMLInputElement;
		if (!t.files?.length) return;
		const r = new FileReader();
		r.onload = () => {
			input = r.result as string;
		};
		r.readAsText(t.files[0]);
	}

	function count() {
		const raw = input.split(/\r?\n/);
		const lines = removeEmpty ? raw.filter((l) => l.trim() !== '') : raw;

		totalLines = lines.length;
		const first = new Map<string, number>();
		const out: string[] = [];

		lines.forEach((ln, idx) => {
			const key = caseSensitive ? ln : ln.toLowerCase();
			const f = first.get(key);
			if (f === undefined) {
				first.set(key, idx + 1);
				out.push(ln);
			} else {
				out.push(`${ln} dupe of ${f}`);
				dupLines++;
			}
		});

		uniqueLines = first.size;
		output = out.join('\n');
	}

	function selectAll() {
		outputEl?.select();
	}
	function clear() {
		input = '';
		output = '';
		totalLines = 0;
		uniqueLines = 0;
		dupLines = 0;
	}
	function saveAs() {
		const blob = new Blob([output], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'count-result.txt';
		a.click();
	}
</script>

<svelte:head><title>Count Lines & Duplicates</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-3 rounded-2xl bg-base-200 p-10 shadow-lg">
	<h2 class="text-lg font-bold">Count Lines & Duplicates</h2>

	<div class="flex flex-wrap items-center gap-3">
		<input
			type="file"
			accept="text/plain"
			bind:this={fileInput}
			on:change={handleFile}
			class="file-input-bordered file-input w-full max-w-xs file-input-sm"
		/>
		<label class="label cursor-pointer"
			><input type="checkbox" class="checkbox checkbox-sm" bind:checked={caseSensitive} /><span
				class="label-text ml-2">Case sensitive</span
			></label
		>
		<label class="label cursor-pointer"
			><input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeEmpty} /><span
				class="label-text ml-2">Remove empty lines</span
			></label
		>
		<div class="tooltip" data-tip="Select all">
			<button class="btn btn-square btn-sm" on:click={selectAll}>S</button>
		</div>
		<div class="tooltip" data-tip="Clear">
			<button class="btn btn-square btn-sm" on:click={clear}>C</button>
		</div>
	</div>
	<div>
		<label class="form-control">
			<textarea
				bind:value={input}
				rows="15"
				class="textarea w-full resize-none font-mono text-base md:text-sm"
				placeholder="Paste text here..."
			></textarea>
		</label>
	</div>
	<button class="btn btn-sm btn-primary" on:click={count}>Count</button>
	<div>
		{#if totalLines > 0}
			<div class="space-y-1 text-sm">
				<span class="">
					<span class="badge badge-soft badge-primary">
						Total lines: <span class="font-semibold">{totalLines}</span>
					</span>
					<span class="badge badge-soft badge-success">
						Unique lines:
						<span class="font-semibold">{uniqueLines}</span>
					</span>
					<span class="badge badge-soft badge-warning">
						Duplicate lines:
						<span class="font-semibold">{dupLines}</span>
					</span>
				</span>
			</div>
		{/if}
	</div>
	<div>
		<label class="form-control">
			<textarea
				bind:value={output}
				bind:this={outputEl}
				rows="5"
				class="textarea w-full resize-none font-mono text-base md:text-sm"
				readonly
			></textarea>
		</label>
	</div>

	<div class="flex items-center gap-2">
		<button class="btn btn-sm" on:click={saveAs}>Save as</button>
		<input
			type="text"
			value="count-result.txt"
			class="input-bordered input input-sm w-48"
			readonly
		/>
	</div>
</div>
