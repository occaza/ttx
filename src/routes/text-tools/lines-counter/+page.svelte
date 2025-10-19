<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import SaveFiles from '$lib/components/SaveButton.svelte';
	import { page } from '$app/stores';

	let input = $state('');
	let output = $state('');
	let totalLines = $state(0);
	let uniqueLines = $state(0);
	let dupLines = $state(0);
	let caseSensitive = $state(false);
	let removeEmpty = $state(false);

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;
	let outputTextarea: TextArea;

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
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
		inputTextarea.select();
	}

	function clear() {
		input = '';
		output = '';
		totalLines = 0;
		uniqueLines = 0;
		dupLines = 0;
		fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
	}
</script>

<svelte:head>
	<title>Count Lines & Duplicates</title>
	<meta
		name="description"
		content="Hitung jumlah baris, baris unik, dan duplikat dalam teks Anda. Deteksi duplikat dengan case sensitive atau tidak."
	/>
	<meta
		name="keywords"
		content="line counter, count duplicates, text counter, hitung baris, cek duplikat, line tool"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/text-tools/lines-counter" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Count Lines & Duplicates - Text Tools" />
	<meta
		property="og:description"
		content="Hitung jumlah baris, baris unik, dan duplikat dalam teks"
	/>
	<meta property="og:url" content="{$page.url.origin}/text-tools/lines-counter" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Count Lines & Duplicates - Text Tools" />
	<meta
		name="twitter:description"
		content="Hitung jumlah baris, baris unik, dan duplikat dalam teks"
	/>
	<meta
		name="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<h2 class="pb-5 text-lg font-bold">Count Lines & Duplicates</h2>

	<div class="flex flex-col gap-2">
		<div>
			<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="md" />
		</div>
		<div class="flex flex-wrap items-center gap-4">
			<label class="label cursor-pointer">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={caseSensitive} />
				<span class="label-text">Case sensitive</span>
			</label>
			<label class="label cursor-pointer">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeEmpty} />
				<span class="label-text">Remove empty lines</span>
			</label>
		</div>
		<div>
			<ActionButton
				showSelectAll={true}
				showClear={true}
				showCopy={true}
				onselectall={selectAll}
				onclear={clear}
				oncopy={copy}
			/>
		</div>
	</div>

	<div>
		<TextArea
			bind:this={inputTextarea}
			bind:value={input}
			placeholder="Paste text here..."
			rows={10}
		/>
	</div>
	<div class="flex items-center justify-between gap-3">
		<div>
			<button class="btn rounded-sm btn-primary" onclick={count}>Count</button>
		</div>
		<div>
			{#if totalLines > 0}
				<div class="">
					<span class="badge badge-soft badge-primary">
						Total lines: <span class="font-semibold">{totalLines}</span>
					</span>
					<span class="badge badge-soft badge-secondary">
						Unique lines: <span class="font-semibold">{uniqueLines}</span>
					</span>
					<span class="badge badge-soft badge-accent">
						Duplicate lines: <span class="font-semibold">{dupLines}</span>
					</span>
				</div>
			{/if}
		</div>
	</div>

	<div>
		<TextArea
			bind:this={outputTextarea}
			bind:value={output}
			placeholder="Output here..."
			rows={5}
			readonly={true}
		/>
	</div>

	<div class="flex items-center gap-2">
		<SaveFiles content={output} defaultName="count-result.txt" />
	</div>
</div>
