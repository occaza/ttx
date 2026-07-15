<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Contact, Users, Phone, PhoneOff } from '@lucide/svelte';

	let input = $state('');
	let output = $state('');
	let fileUpload: FileUploadInput;
	let inputEl: TextArea | undefined;
	let outputEl: TextArea | undefined;

	let totalContacts = $state(0);
	let withPhone = $state(0);
	let withoutPhone = $state(0);
	let hasParsed = $state(false);

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
		hasParsed = true;
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
		hasParsed = false;
		fileUpload?.reset();
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(output);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function copyOutput() {
		navigator.clipboard.writeText(output);
	}
</script>

<svelte:head>
	<title>CSV & VCard Parser - TEXY Workspace</title>
	<meta name="description" content="Extract nama dan nomor telepon dari file VCard (.vcf) dengan mudah. Parse kontak dalam hitungan detik." />
	<meta name="keywords" content="vcard parser, vcf parser, extract contacts, parse vcard, kontak vcf" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/csv-parser" />
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Grid Background Pattern -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
		
		<!-- Header -->
		<div class="mb-8">
			<a href="/" class="mb-5 inline-flex items-center text-sm font-medium text-base-content/40 hover:text-base-content transition-colors">
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md">
					<Contact size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">VCard Parser</h1>
					<p class="mt-1 text-sm text-base-content/50">Extract nama dan nomor telepon dari file VCard (.vcf).</p>
				</div>
			</div>
		</div>

		<!-- Stats Bar (visible after parse) -->
		{#if hasParsed}
			<div class="grid grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
				<div class="flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
						<Users size={20} />
					</div>
					<div>
						<p class="text-[10px] font-bold uppercase tracking-widest text-base-content/40">Total</p>
						<p class="text-2xl font-black text-primary">{totalContacts}</p>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success flex-shrink-0">
						<Phone size={20} />
					</div>
					<div>
						<p class="text-[10px] font-bold uppercase tracking-widest text-base-content/40">With Phone</p>
						<p class="text-2xl font-black text-success">{withPhone}</p>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning flex-shrink-0">
						<PhoneOff size={20} />
					</div>
					<div>
						<p class="text-[10px] font-bold uppercase tracking-widest text-base-content/40">No Phone</p>
						<p class="text-2xl font-black text-warning">{withoutPhone}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Unified Split Editor -->
		<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
			
			<!-- Top Toolbar -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-base-content/10 bg-base-200/30 p-3 sm:px-4 sm:h-14 gap-3 rounded-t-2xl">
				<div class="flex items-center gap-3">
					<div class="w-48">
						<FileUploadInput
							bind:this={fileUpload}
							onload={handleLoad}
							onerror={handleError}
							accept=".vcf,.vcard,text/vcard"
							size="xs"
						/>
					</div>
					<button
						class="btn btn-sm btn-primary rounded-lg font-bold shadow-sm gap-1.5"
						onclick={parseVCard}
						disabled={!input}
					>
						<Contact size={14} /> Parse VCard
					</button>
				</div>
				<div class="flex items-center gap-2">
					<ActionButton
						showSelectAll={true}
						showClear={true}
						showCopy={false}
						onselectall={selectAll}
						onclear={clear}
					/>
				</div>
			</div>

			<!-- Split Editor Area -->
			<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-content/10 bg-base-100/50 rounded-b-2xl">
				
				<!-- Input -->
				<div class="flex flex-col">
					<div class="flex h-12 items-center px-4 border-b border-base-content/5 bg-base-200/10">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">VCard Input</span>
					</div>
					<TextArea
						bind:this={inputEl}
						bind:value={input}
						rows={16}
						placeholder="Paste VCard content here atau upload file .vcf..."
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px]"
					/>
				</div>

				<!-- Output -->
				<div class="flex flex-col bg-base-200/5 rounded-br-2xl">
					<div class="flex h-12 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/20">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Contacts Result</span>
						<div class="flex items-center gap-2">
							<SaveFiles content={output} defaultName="contacts.txt" />
							<ActionButton
								showSelectAll={false}
								showClear={false}
								showCopy={true}
								oncopy={copyOutput}
							/>
						</div>
					</div>
					<div class="flex-1 relative flex flex-col">
						{#if !output}
							<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
								<Contact size={48} strokeWidth={1} class="mb-4 opacity-50" />
								<p class="text-sm font-medium">Kontak akan muncul di sini setelah di-parse</p>
							</div>
						{/if}
						<TextArea
							bind:this={outputEl}
							bind:value={output}
							rows={16}
							readonly={true}
							placeholder=""
							className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px] {output ? 'text-base-content/80' : ''}"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
