<script lang="ts">
	import { WholeWord, Eraser } from '@lucide/svelte';
	let fileA: File | null = null;
	let fileB: File | null = null;
	let nameA = '';
	let nameB = '';

	let linesA: string[] = [];
	let linesB: string[] = [];

	let outA: string[] = []; // isi textarea kiri
	let outB: string[] = []; // isi textarea kanan

	let textA = ''; // isi file A
	let textB = ''; // isi file B

	let caseSensitive = false;
	let ignoreEmpty = false;
	let onlyDiff = false;

	let fileName = 'compare-result.txt';

	function key(s: string) {
		return caseSensitive ? s : s.toLowerCase();
	}
	async function loadText(file: File): Promise<string> {
		return file.text();
	}

	async function handleA(e: Event) {
		const t = (e.target as HTMLInputElement).files;
		if (!t?.length) return;
		fileA = t[0];
		nameA = fileA.name;
		textA = await loadText(fileA);
		linesA = textA.split(/\r?\n/);
		if (ignoreEmpty) linesA = linesA.filter((l) => l.trim() !== '');
	}
	async function handleB(e: Event) {
		const t = (e.target as HTMLInputElement).files;
		if (!t?.length) return;
		fileB = t[0];
		nameB = fileB.name;
		textB = await loadText(fileB);
		linesB = textB.split(/\r?\n/);
		if (ignoreEmpty) linesB = linesB.filter((l) => l.trim() !== '');
	}

	async function compare() {
		if (!fileA || !fileB) return;
		const textA = await fileA.text();
		const textB = await fileB.text();

		const dupA: Record<number, number> = {};
		const dupB: Record<number, number> = {};

		linesA = textA.split(/\r?\n/);
		linesB = textB.split(/\r?\n/);

		if (ignoreEmpty) {
			linesA = linesA.filter((l) => l.trim() !== '');
			linesB = linesB.filter((l) => l.trim() !== '');
		}

		const mapB = new Map(linesB.map((l, i) => [key(l), i]));
		const mapA = new Map(linesA.map((l, i) => [key(l), i]));

		// Catat baris duplikat
		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				dupA[i] = j + 1;
			}
		});
		linesB.forEach((l, i) => {
			const k = key(l);
			const j = mapA.get(k);
			if (j !== undefined) {
				dupB[i] = j + 1;
			}
		});

		outA = [];
		outB = [];

		// Untuk setiap baris A
		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				// Sama
				if (!onlyDiff) {
					outA.push(dupA[i] ? `${l}  (at ${nameB} ${dupA[i]})` : l);
					outB.push(l);
				}
			} else {
				// Hanya ada di A
				outA.push(`${l}  (no in ${nameB})`);
				outB.push('');
			}
		});

		// Untuk baris B yang tidak ada di A
		linesB.forEach((l, i) => {
			const k = key(l);
			if (!mapA.has(k)) {
				outA.push('');
				outB.push(`${l}  (no in ${nameA})`);
			}
		});
	}

	function selectSide(el: HTMLTextAreaElement) {
		el?.select();
	}
	function clearSide() {
		outA = [];
		outB = [];
	}
	function saveAs() {
		const merged = outA.map((a, i) => `A: ${a}\nB: ${outB[i] || ''}`).join('\n');
		const blob = new Blob([merged], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName.trim() || 'compare-result.txt';
		a.click();
	}
</script>

<svelte:head><title>Compare Two Files</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-3 bg-base-200 p-6 shadow-lg lg:rounded-2xl">
	<h2 class="text-lg font-bold">Compare Two Files</h2>
	<div class="flex flex-wrap items-center gap-3">
		<label class="form-control">
			<input
				type="file"
				accept="text/plain"
				on:change={handleA}
				class="file-input-bordered file-input w-full file-input-sm"
			/>
		</label>
		<label class="form-control">
			<input
				type="file"
				accept="text/plain"
				on:change={handleB}
				class="file-input-bordered file-input w-full file-input-sm"
			/>
		</label>
	</div>
	<div class="flex flex-wrap items-center gap-4">
		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={caseSensitive} /><span
				class="label-text">Case sensitive</span
			>
		</label>
		<label class="label cursor-pointer"
			><input type="checkbox" class="checkbox checkbox-sm" bind:checked={ignoreEmpty} /><span
				class="label-text">Ignore empty lines</span
			>
		</label>
		<label class="label cursor-pointer"
			><input type="checkbox" class="checkbox checkbox-sm" bind:checked={onlyDiff} /><span
				class="label-text">Only diffs</span
			>
		</label>

		<div class="tooltip" data-tip="Clear">
			<button class="btn btn-square btn-sm btn-accent" on:click={clearSide}>
				<Eraser size={16} />
			</button>
		</div>
	</div>

	<button class="btn btn-sm btn-primary" on:click={compare}>Compare</button>

	<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
		<label class="form-control">
			<span class="label-text">{nameA || 'File A'}</span>
			<textarea
				value={outA.length ? outA.join('\n') : textA}
				rows="14"
				class="textarea w-full resize-none font-mono text-base md:text-sm"
				readonly
			></textarea>
		</label>

		<label class="form-control">
			<span class="label-text">{nameB || 'File B'}</span>
			<textarea
				value={outB.length ? outB.join('\n') : textB}
				rows="14"
				class="textarea w-full resize-none font-mono text-base md:text-sm"
				readonly
			></textarea>
		</label>
	</div>

	<div class="flex items-center gap-2">
		<button class="btn btn-sm" on:click={saveAs}>Save as</button>
		<input type="text" bind:value={fileName} class="input-bordered input input-sm w-48" />
	</div>
</div>
