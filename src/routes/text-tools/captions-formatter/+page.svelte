<script lang="ts">
	let text = '';
	let isFormatted = false;
	let copied = false;

	const INVISIBLE_CHAR = '\u2800'; // Braille Pattern Blank

	function toggle() {
		if (isFormatted) {
			// Convert back: hapus invisible char
			text = text.replaceAll(INVISIBLE_CHAR, '');
			isFormatted = false;
		} else {
			// Format: tambah invisible char di baris kosong
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
	function clearOut() {
		text = '';
		isFormatted = false;
		copied = false;
	}
	function copyToClipboard() {
		if (!isFormatted) {
			toggle(); // Format dulu kalau belum
		}
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Caption Formatter</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-3 rounded-2xl bg-base-200 p-6 shadow-lg">
	<div class="space-y-2">
		<h1 class="text-2xl font-bold">Caption Formatter</h1>
		<p class="text-sm text-gray-600">
			Paste caption, klik Format untuk mengubah baris kosong, lalu Copy ke Instagram.
		</p>
	</div>

	<div class="space-y-2">
		<textarea
			bind:value={text}
			placeholder="Paste caption Instagram kamu di sini...&#10;&#10;Baris kosong akan otomatis diformat!"
			rows="15"
			class=" textarea w-full resize-none font-mono text-base md:text-sm"
		></textarea>
		<div class="flex items-center justify-between">
			<p class="text-xs text-gray-500">
				{text.length} characters
				{#if isFormatted}
					<span class="ml-2 badge badge-sm badge-success">Formatted</span>
				{/if}
			</p>
			<div class="flex gap-2">
				<button type="button" class="btn btn-sm" on:click={toggle} disabled={!text}>
					{isFormatted ? 'Reset' : 'Format'}
				</button>
				<button
					type="button"
					class="btn btn-sm btn-primary"
					on:click={copyToClipboard}
					disabled={!text}
				>
					{copied ? '✓ Copied!' : 'Copy'}
				</button>
				<div class="tooltip" data-tip="Clear output">
					<button type="button" class="btn btn-square btn-sm" on:click={clearOut}>C</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Info -->
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
				<li>Klik <strong>Format</strong> untuk convert baris kosong</li>
				<li>Klik <strong>Copy</strong> (akan auto-format jika belum)</li>
				<li>Paste ke Instagram</li>
				<li>Klik <strong>Reset</strong> untuk mengembalikan ke aslinya</li>
			</ol>
		</div>
	</div>

	<!-- Example -->
	<div class="collapse-arrow collapse bg-base-200">
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
