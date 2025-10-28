<script lang="ts">
	import { ActionButton, TextArea } from '$lib';

	import { page } from '$app/stores';

	let text = $state('');
	let isFormatted = $state(false);
	let copied = $state(false);

	let textAreaRef: TextArea;

	const INVISIBLE_CHAR = '\u2800';

	function handleLoad(content: string) {
		text = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function toggle() {
		if (isFormatted) {
			text = text.replaceAll(INVISIBLE_CHAR, '');
			isFormatted = false;
		} else {
			text = text.replace(/\n\n+/g, (match) => {
				const lineCount = match.length;
				let result = '\n';
				for (let i = 1; i < lineCount; i++) {
					result += INVISIBLE_CHAR + '\n';
				}
				return result;
			});
			isFormatted = true;
		}
	}

	function selectAll() {
		textAreaRef.select();
	}

	function clear() {
		text = '';
		isFormatted = false;
		copied = false;
	}

	function copyToClipboard() {
		if (!isFormatted) {
			toggle();
		}
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Caption Formatter</title>
	<meta
		name="description"
		content="Format caption Instagram Anda dengan baris kosong yang benar. Buat caption lebih menarik dan mudah dibaca di Instagram."
	/>
	<meta
		name="keywords"
		content="instagram caption, format caption, instagram formatter, caption tool, beautify caption, instagram tips"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/text-tools/captions-formatter" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Caption Formatter - Format Caption Instagram" />
	<meta
		property="og:description"
		content="Format caption Instagram dengan baris kosong yang benar. Buat caption lebih menarik."
	/>
	<meta property="og:url" content="{$page.url.origin}/text-tools/captions-formatter" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Caption Formatter - Format Caption Instagram" />
	<meta
		name="twitter:description"
		content="Format caption Instagram dengan baris kosong yang benar"
	/>
	<meta
		name="twitter:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<div class="pb-5">
		<h1 class="text-lg font-bold">Caption Formatter</h1>
		<p class="text-sm text-gray-600">
			Paste caption, klik Format untuk mengubah baris kosong, lalu Copy ke Instagram.
		</p>
	</div>

	<TextArea
		bind:this={textAreaRef}
		bind:value={text}
		placeholder="Paste caption Instagram kamu di sini...&#10;&#10;Baris kosong akan otomatis diformat!"
		rows={15}
	/>

	<div class="flex items-center justify-between">
		<div class="flex gap-2">
			<button type="button" class="btn rounded-sm btn-md" onclick={toggle} disabled={!text}>
				{isFormatted ? 'Reset' : 'Format'}
			</button>
			<button
				type="button"
				class="btn rounded-sm btn-md btn-primary"
				onclick={copyToClipboard}
				disabled={!text}
			>
				{copied ? '✓ Copied!' : 'Copy'}
			</button>
			<ActionButton
				showSelectAll={true}
				showClear={true}
				showCopy={false}
				onselectall={selectAll}
				onclear={clear}
			/>
		</div>

		<p class="badge badge-sm text-xs text-gray-500 badge-success">
			{text.length} characters
			{#if isFormatted}
				<span>Formatted</span>
			{/if}
		</p>
	</div>

	<div class="alert alert-info">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<div class="text-sm">
			<p class="font-semibold">Cara pakai:</p>
			<ol class="ml-4 list-decimal">
				<li>Paste caption kamu</li>
				<li>Klik Format untuk convert baris kosong</li>
				<li>Klik Copy (akan auto-format jika belum)</li>
				<li>Paste ke Instagram</li>
				<li>Klik Reset untuk mengembalikan ke aslinya</li>
			</ol>
		</div>
	</div>

	<div class="collapse-arrow collapse bg-base-100">
		<input type="checkbox" />
		<div class="collapse-title font-medium">Lihat Contoh</div>
		<div class="collapse-content">
			<div class="space-y-2">
				<p class="font-semibold">Before (Normal Enter):</p>
				<pre class="bg-base-300 p-2 text-sm">Ini paragraf pertama


Ini paragraf kedua</pre>
				<p class="font-semibold">After Format (Siap untuk IG):</p>
				<pre class="bg-base-300 p-2 text-sm">Ini paragraf pertama
⠀
⠀
Ini paragraf kedua</pre>
			</div>
		</div>
	</div>
</div>
