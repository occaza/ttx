<script lang="ts">
	let input = '';
	let output = '';
	let copied = false;

	// Invisible character yang diterima Instagram
	const INVISIBLE_CHAR = '\u2800'; // Braille Pattern Blank (paling aman untuk IG)

	function formatCaption() {
		// Replace multiple line breaks dengan line break + invisible char
		output = input.replace(/\n\n+/g, (match) => {
			const lineCount = match.length;
			let result = '\n';
			// Tambah invisible char untuk setiap line kosong
			for (let i = 1; i < lineCount; i++) {
				result += INVISIBLE_CHAR + '\n';
			}
			return result;
		});
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// Auto format saat user mengetik
	$: if (input) formatCaption();
</script>

<svelte:head>
	<title>Instagram Caption Formatter</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-4 p-4">
	<div class="space-y-2">
		<h1 class="text-2xl font-bold">Instagram Caption Formatter</h1>
		<p class="text-sm text-gray-600">
			Paste caption kamu di bawah, baris kosong akan otomatis diformat agar bisa muncul di
			Instagram.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<!-- Input -->
		<div class="space-y-2">
			<label for="input" class="label">
				<span class="label-text font-semibold">Input (Paste di sini)</span>
			</label>
			<textarea
				id="input"
				bind:value={input}
				placeholder="Paste caption Instagram kamu di sini...&#10;&#10;Baris kosong akan otomatis diformat!"
				rows="15"
				class="textarea-bordered textarea w-full font-mono text-sm"
			></textarea>
			<p class="text-xs text-gray-500">{input.length} characters</p>
		</div>

		<!-- Output -->
		<div class="space-y-2">
			<label for="output" class="label">
				<span class="label-text font-semibold">Output (Copy ini ke Instagram)</span>
			</label>
			<textarea
				id="output"
				bind:value={output}
				readonly
				placeholder="Hasil format akan muncul di sini..."
				rows="15"
				class="textarea-bordered textarea w-full font-mono text-sm"
			></textarea>
			<div class="flex items-center justify-between">
				<p class="text-xs text-gray-500">{output.length} characters</p>
				<button
					type="button"
					class="btn btn-sm btn-primary"
					on:click={copyToClipboard}
					disabled={!output}
				>
					{copied ? '✓ Copied!' : 'Copy'}
				</button>
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
				<li>Paste caption kamu di kotak kiri</li>
				<li>Baris kosong otomatis diformat dengan karakter invisible</li>
				<li>Copy hasil dari kotak kanan</li>
				<li>Paste ke Instagram caption/bio</li>
			</ol>
		</div>
	</div>

	<!-- Example -->
	<div class="collapse-arrow collapse bg-base-200">
		<input type="checkbox" />
		<div class="collapse-title font-medium">Lihat Contoh</div>
		<div class="collapse-content">
			<div class="space-y-2">
				<p class="font-semibold">Before:</p>
				<pre class="bg-base-300 p-2 text-sm">Ini paragraf pertama


Ini paragraf kedua setelah 2 baris kosong</pre>
				<p class="font-semibold">After (akan tetap ada jarak di Instagram):</p>
				<pre class="bg-base-300 p-2 text-sm">Ini paragraf pertama
⠀
⠀
Ini paragraf kedua setelah 2 baris kosong</pre>
			</div>
		</div>
	</div>
</div>
