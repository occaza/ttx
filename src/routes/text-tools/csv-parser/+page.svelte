<script lang="ts">
	import FileUploadInput from '$lib/components/FileUpload.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import SaveFiles from '$lib/components/SaveButton.svelte';

	let input = $state('');
	let output = $state('');
	let fileUpload: FileUploadInput;
	let inputEl: TextArea | undefined;

	let totalContacts = $state(0);
	let withPhone = $state(0);
	let withoutPhone = $state(0);

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function parseVCard() {
		const vcards = input.split('BEGIN:VCARD');
		const results: string[] = [];

		totalContacts = 0;
		withPhone = 0;
		withoutPhone = 0;

		vcards.forEach((vcard) => {
			if (!vcard.trim()) return;

			totalContacts++;

			let name = '';
			let phone = '';

			const lines = vcard.split('\n');

			lines.forEach((line) => {
				line = line.trim();

				if (line.startsWith('FN:')) {
					name = line.substring(3).trim();
					// Hapus karakter | dan bersihkan spasi berlebih
					name = name.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
				}

				if (line.includes('TEL') && line.includes(':')) {
					const colonIndex = line.indexOf(':');
					if (colonIndex !== -1) {
						const phoneNumber = line.substring(colonIndex + 1).trim();
						if (!phone && phoneNumber) {
							phone = phoneNumber;
						}
					}
				}
			});

			if (name) {
				if (phone) {
					results.push(`${name} | ${phone}`);
					withPhone++;
				} else {
					results.push(`${name} | No phone`);
					withoutPhone++;
				}
			}
		});

		output = results.join('\n');
	}

	function selectAll() {
		inputEl?.select();
	}

	function clear() {
		input = '';
		output = '';
		totalContacts = 0;
		withPhone = 0;
		withoutPhone = 0;
		fileUpload?.reset();
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(output);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

<svelte:head><title>VCard Parser</title></svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<div class="pb-5">
		<h2 class="text-lg font-bold">VCard Parser</h2>
		<p class="text-sm text-gray-600">Extract nama dan nomor telepon dari file VCard (.vcf)</p>
	</div>

	<div class="flex gap-2">
		<FileUploadInput
			bind:this={fileUpload}
			onload={handleLoad}
			onerror={handleError}
			accept=".vcf,.vcard,text/vcard"
			size="md"
		/>
		<ActionButton onselectall={selectAll} onclear={clear} showCopy={true} oncopy={copy} />
	</div>

	<div>
		<TextArea
			bind:this={inputEl}
			bind:value={input}
			rows={10}
			placeholder="Paste VCard content here or upload .vcf file..."
		/>
	</div>

	<div class="flex items-center gap-3">
		<button class="btn rounded-sm btn-md btn-primary" onclick={parseVCard} disabled={!input}>
			Parse VCard
		</button>

		{#if totalContacts > 0}
			<div class="flex flex-wrap gap-2">
				<span class="badge badge-soft badge-primary">
					Total: <span class="font-semibold">{totalContacts}</span>
				</span>
				<span class="badge badge-soft badge-success">
					With Phone: <span class="font-semibold">{withPhone}</span>
				</span>
				<span class="badge badge-soft badge-warning">
					No Phone: <span class="font-semibold">{withoutPhone}</span>
				</span>
			</div>
		{/if}
	</div>

	{#if output}
		<div>
			<TextArea bind:value={output} rows={12} readonly={true} placeholder="Result..." />
		</div>

		<div class="flex items-center gap-2">
			<SaveFiles content={output} defaultName="contacts.txt" />
		</div>
	{/if}
</div>
