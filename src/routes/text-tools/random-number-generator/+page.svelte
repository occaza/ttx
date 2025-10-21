<script lang="ts">
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import SaveFiles from '$lib/components/SaveButton.svelte';
	import { page } from '$app/stores';

	let qty = $state(10);
	let min = $state(0);
	let max = $state(1000);
	let prefix = $state('');
	let suffix = $state('');
	let padOn = $state(false);
	let output = $state('');

	let outputTextarea: TextArea;

	function selectAll() {
		outputTextarea.select();
	}

	function clear() {
		output = '';
	}

	function copy() {
		navigator.clipboard.writeText(output);
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
</script>

<svelte:head>
	<title>Random Number Generator</title>
	<meta
		name="description"
		content="Generate angka acak dengan range dan jumlah yang bisa dikustomisasi. Tambahkan prefix, suffix, dan padding angka."
	/>
	<meta
		name="keywords"
		content="random number, number generator, random generator, angka acak, generate number, random tool"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/text-tools/random-number-generator" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Random Number Generator - Text Tools" />
	<meta
		property="og:description"
		content="Generate angka acak dengan range dan jumlah yang bisa dikustomisasi"
	/>
	<meta property="og:url" content="https://yoursite.com/text-tools/random-number-generator" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Random Number Generator - Text Tools" />
	<meta
		name="twitter:description"
		content="Generate angka acak dengan range dan jumlah yang bisa dikustomisasi"
	/>
	<meta
		name="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<div class="pb-5">
		<h2 class=" text-lg font-bold">Random Number Generator</h2>
		<p class="text-sm text-gray-600">Generate angka acak dengan mudah.</p>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<label class="input w-full rounded-sm">
			<span class="label">Quantity</span>
			<input type="number" bind:value={qty} min="1" />
		</label>
		<label class="input w-full rounded-sm">
			<span class="label">Min</span>
			<input type="number" bind:value={min} />
		</label>
		<label class="input w-full rounded-sm">
			<span class="label">Max</span>
			<input type="number" bind:value={max} />
		</label>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<label class="input w-full rounded-sm">
			<span class="label">Prefix</span>
			<input type="text" bind:value={prefix} placeholder="Enter prefix here" />
		</label>

		<label class="input w-full rounded-sm">
			<span class="label">Suffix</span>
			<input type="text" bind:value={suffix} placeholder="Enter suffix here" />
		</label>

		<label class="label cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={padOn} />
			<span class="label-text">Pad Numbers</span>
		</label>
	</div>

	<div class="flex gap-2">
		<button class="btn rounded-sm btn-md btn-primary" onclick={generate}>Generate</button>
		<ActionButton
			showSelectAll={true}
			showClear={true}
			showCopy={true}
			onselectall={selectAll}
			onclear={clear}
			oncopy={copy}
		/>
	</div>

	<div>
		<TextArea
			bind:this={outputTextarea}
			bind:value={output}
			placeholder="Output here..."
			rows={10}
			readonly={true}
		/>
	</div>

	<div class="flex items-center gap-2">
		<SaveFiles content={output} defaultName="random.txt" />
	</div>
</div>
