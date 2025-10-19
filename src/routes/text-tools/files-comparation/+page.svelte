<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import SaveFiles from '$lib/components/SaveButton.svelte';
	import { page } from '$app/stores';

	let fileA: File | null = null;
	let fileB: File | null = null;
	let nameA = $state('');
	let nameB = $state('');

	let linesA: string[] = [];
	let linesB: string[] = [];

	let outA: string[] = $state([]);
	let outB: string[] = $state([]);

	let textA = $state('');
	let textB = $state('');

	let caseSensitive = $state(false);
	let ignoreEmpty = $state(false);
	let onlyDiff = $state(false);

	let fileUploadA: FileUploadInput;
	let fileUploadB: FileUploadInput;
	let textAreaA: TextArea;

	function key(s: string) {
		return caseSensitive ? s : s.toLowerCase();
	}

	async function handleA(content: string) {
		fileA = new File([content], nameA);
		nameA = nameA || 'File A';
		textA = content;
		linesA = textA.split(/\r?\n/);
		if (ignoreEmpty) linesA = linesA.filter((l) => l.trim() !== '');
	}

	async function handleB(content: string) {
		fileB = new File([content], nameB);
		nameB = nameB || 'File B';
		textB = content;
		linesB = textB.split(/\r?\n/);
		if (ignoreEmpty) linesB = linesB.filter((l) => l.trim() !== '');
	}

	function handleError(error: Error) {
		console.error(error);
	}

	async function compare() {
		if (!fileA || !fileB) return;
		const textAContent = await fileA.text();
		const textBContent = await fileB.text();

		const dupA: Record<number, number> = {};
		const dupB: Record<number, number> = {};

		linesA = textAContent.split(/\r?\n/);
		linesB = textBContent.split(/\r?\n/);

		if (ignoreEmpty) {
			linesA = linesA.filter((l) => l.trim() !== '');
			linesB = linesB.filter((l) => l.trim() !== '');
		}

		const mapB = new Map(linesB.map((l, i) => [key(l), i]));
		const mapA = new Map(linesA.map((l, i) => [key(l), i]));

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

		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				if (!onlyDiff) {
					outA.push(dupA[i] ? `${l}  (at ${nameB} ${dupA[i]})` : l);
					outB.push(l);
				}
			} else {
				outA.push(`${l}  (no in ${nameB})`);
				outB.push('');
			}
		});

		linesB.forEach((l, i) => {
			const k = key(l);
			if (!mapA.has(k)) {
				outA.push('');
				outB.push(`${l}  (no in ${nameA})`);
			}
		});
	}

	function selectAll() {
		textAreaA.select();
	}

	function clear() {
		outA = [];
		outB = [];
		textA = '';
		textB = '';
		nameA = '';
		nameB = '';
		fileA = null;
		fileB = null;
		fileUploadA.reset();
		fileUploadB.reset();
	}

	function copy() {
		navigator.clipboard.writeText(outA.join('\n'));
	}
</script>

<svelte:head>
	<title>Compare Two Files</title>
	<meta
		name="description"
		content="Bandingkan dua file teks dan temukan perbedaannya. Deteksi duplikat dan baris yang tidak cocok dengan mudah."
	/>
	<meta
		name="keywords"
		content="compare files, file comparison, text diff, bandingkan file, cek duplikat, file tool"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/text-tools/files-comparation" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Compare Two Files - Text Tools" />
	<meta
		property="og:description"
		content="Bandingkan dua file teks dan temukan perbedaannya dengan mudah"
	/>
	<meta property="og:url" content="{$page.url.origin}/text-tools/files-comparation" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Compare Two Files - Text Tools" />
	<meta name="twitter:description" content="Bandingkan dua file teks dan temukan perbedaannya" />
	<meta
		name="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<h2 class="pb-5 text-lg font-bold">Compare Two Files</h2>

	<div class="mb-4 grid max-w-7xl grid-cols-1 gap-2 lg:grid-cols-2">
		<div>
			<FileUploadInput bind:this={fileUploadA} onload={handleA} onerror={handleError} size="md" />
		</div>
		<div>
			<FileUploadInput bind:this={fileUploadB} onload={handleB} onerror={handleError} size="md" />
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<div>
			<label class="label cursor-pointer">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={caseSensitive} />
				<span class="label-text">Case sensitive</span>
			</label>
		</div>
		<div>
			<label class="label cursor-pointer">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={ignoreEmpty} />
				<span class="label-text">Ignore empty lines</span>
			</label>
		</div>
		<div>
			<label class="label cursor-pointer">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={onlyDiff} />
				<span class="label-text">Only diffs</span>
			</label>
		</div>
		<div>
			<ActionButton
				showSelectAll={false}
				showClear={true}
				showCopy={true}
				onclear={clear}
				oncopy={copy}
			/>
		</div>
	</div>
	<div>
		<button class="btn rounded-sm btn-md btn-primary" onclick={compare}>Compare</button>
	</div>
	<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
		<label class="form-control">
			<span class="label-text">{nameA || 'File A'}</span>
			<TextArea
				bind:this={textAreaA}
				value={outA.length ? outA.join('\n') : textA}
				rows={14}
				readonly={true}
			/>
		</label>

		<label class="form-control">
			<span class="label-text">{nameB || 'File B'}</span>
			<TextArea value={outB.length ? outB.join('\n') : textB} rows={14} readonly={true} />
		</label>
	</div>

	<div class="flex items-center gap-2">
		<SaveFiles content={outA.length ? outA.join('\n') : textA} defaultName="compare-result.txt" />
	</div>
</div>
