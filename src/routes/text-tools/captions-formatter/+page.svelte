<script lang="ts">
	let input = '';
	let output = '';
	let copied = false;

	$: if (input) format();

	function format() {
		const clean = (s: string) =>
			s
				.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '') // hapus zero-width & friends
				.trim();

		output = input
			.split(/\r?\n/)
			.map((l) => clean(l))
			.filter((l) => l || l === '') // tetap izinkan baris kosong asli
			.join('\n')
			.trim();
	}

	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<svelte:head><title>IG Caption Formatter</title></svelte:head>

<div class="mx-auto max-w-4xl space-y-3 p-4">
	<h2 class="text-lg font-bold">Caption Formatter</h2>
	<div>
		<label class="form-control">
			<textarea
				bind:value={input}
				rows="10"
				class="textarea-bordered textarea w-full"
				placeholder="Tulis caption di sini..."
			></textarea>
		</label>
	</div>
	<div>
		<label class="form-control">
			<textarea
				bind:value={output}
				rows="10"
				class="textarea-bordered textarea w-full"
				readonly
				placeholder="Output disini..."
			></textarea>
		</label>
	</div>

	<div class="flex items-center gap-2">
		<button class="btn btn-sm btn-primary" on:click={copy}>
			{copied ? 'Copied!' : 'Copy to clipboard'}
		</button>
	</div>
</div>
