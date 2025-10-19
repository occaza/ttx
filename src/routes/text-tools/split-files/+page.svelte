<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import { page } from '$app/stores';

	let input = $state('');
	let linesPerFile = $state(100);
	let headerText = $state('');
	let footerText = $state('');
	let fileName = $state('Part');
	let removeEmpty = $state(false);

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;

	type Link = { name: string; url: string };
	let links = $state<Link[]>([]);

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function buildLinks() {
		links = [];
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
		inputTextarea.select();
	}

	function clear() {
		input = '';
		links = [];
		fileUpload.reset();
		linesPerFile = 100;
		headerText = '';
		footerText = '';
	}

	function copy() {
		navigator.clipboard.writeText(input);
	}
</script>

<svelte:head>
	<title>Split File</title>
	<meta
		name="description"
		content="Pisah file teks besar menjadi beberapa file kecil. Atur jumlah baris per file dan tambahkan header/footer otomatis."
	/>
	<meta
		name="keywords"
		content="split file, file splitter, pisah file, divide text, text splitter, file tool"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/text-tools/split-files" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Split Text File - Text Tools" />
	<meta
		property="og:description"
		content="Pisah file teks besar menjadi beberapa file kecil dengan mudah"
	/>
	<meta property="og:url" content="{$page.url.origin}/text-tools/split-files" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Split Text File - Text Tools" />
	<meta name="twitter:description" content="Pisah file teks besar menjadi beberapa file kecil" />
	<meta
		name="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<h2 class="pb-5 text-lg font-bold">Split Text File</h2>

	<div class="flex gap-2">
		<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="md" />
		<ActionButton
			showSelectAll={true}
			showClear={true}
			showCopy={true}
			onselectall={selectAll}
			onclear={clear}
			oncopy={copy}
		/>
	</div>

	<div class="grid grid-cols-1 items-center gap-2 md:flex">
		<div>
			<label class="input w-full rounded-sm">
				<span class="label">Lines per file</span>
				<input type="number" bind:value={linesPerFile} placeholder="Min 1" min="1" />
			</label>
		</div>
		<div>
			<label class="label cursor-pointer">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={removeEmpty} />
				<span class="label-text">Remove empty lines</span>
			</label>
		</div>
	</div>

	<div>
		<TextArea
			bind:this={inputTextarea}
			bind:value={input}
			placeholder="Paste your text here or upload your text file..."
			rows={10}
		/>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
		<label class="form-control">
			<span class="label-text">Add text to first line of each part (optional)</span>
			<input
				type="text"
				bind:value={headerText}
				placeholder="Header text"
				class="input-bordered input w-full rounded-sm"
			/>
		</label>

		<label class="form-control">
			<span class="label-text">Add text to last line of each part (optional)</span>
			<input
				type="text"
				bind:value={footerText}
				placeholder="Footer text"
				class="input-bordered input w-full rounded-sm"
			/>
		</label>
	</div>

	<div class="join">
		<button class="btn join-item rounded-l-sm btn-primary" onclick={buildLinks}>Split files</button>
		<input
			type="text"
			bind:value={fileName}
			placeholder="part"
			class="input join-item rounded-r-sm"
		/>
	</div>

	{#if links.length}
		<p class="text-md">Ready to download:</p>
		<div class="flex flex-wrap">
			<br />
			{#each links as l}
				<a href={l.url} download={l.name} class="m-0.5 badge rounded-sm badge-soft badge-primary"
					>{l.name}</a
				>
			{/each}
		</div>
	{/if}
</div>
