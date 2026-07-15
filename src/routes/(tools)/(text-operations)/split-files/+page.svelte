<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Scissors, Download, FileText } from '@lucide/svelte';

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
	<title>Split File - TEXY Workspace</title>
	<meta
		name="description"
		content="Pisah file teks besar menjadi beberapa file kecil. Atur jumlah baris per file dan tambahkan header/footer otomatis."
	/>
	<meta
		name="keywords"
		content="split file, file splitter, pisah file, divide text, text splitter, file tool"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/split-files" />

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
					<Scissors size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Split Text File</h1>
					<p class="mt-1 text-sm text-base-content/50">Pisah file teks besar menjadi beberapa file kecil berdasarkan jumlah baris secara otomatis.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Sidebar Settings + Main Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">
			
			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-6 shadow-xl backdrop-blur-md">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Configuration</h3>
				
				<div class="space-y-6">
					
					<!-- Primary Settings (Side-by-side) -->
					<div class="grid grid-cols-2 gap-4">
						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5"><span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Lines</span></div>
							<input type="number" bind:value={linesPerFile} min="1" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm shadow-sm" />
						</label>

						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5"><span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Base Name</span></div>
							<input type="text" bind:value={fileName} placeholder="part" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm shadow-sm" />
						</label>
					</div>

					<!-- Optional Additions -->
					<div class="space-y-4">
						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5">
								<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Header Text</span>
								<span class="label-text-alt text-[10px] text-base-content/30">Optional</span>
							</div>
							<input type="text" bind:value={headerText} placeholder="Added to first line" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" />
						</label>

						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5">
								<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Footer Text</span>
								<span class="label-text-alt text-[10px] text-base-content/30">Optional</span>
							</div>
							<input type="text" bind:value={footerText} placeholder="Added to last line" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" />
						</label>
					</div>
					
					<!-- Toggles -->
					<label class="flex cursor-pointer items-center gap-3 px-1 pt-2 group">
						<input type="checkbox" class="checkbox checkbox-sm rounded-md border-base-content/20 bg-base-200/30 checked:border-primary transition-colors" bind:checked={removeEmpty} />
						<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Remove empty lines</span>
					</label>
				</div>

				<div class="mt-auto pt-6 border-t border-base-content/10">
					<button class="btn btn-primary w-full rounded-xl shadow-lg hover:scale-[1.02] transition-all font-bold gap-2 h-12" onclick={buildLinks}>
						<Scissors size={18} fill="currentColor" />
						Split File
					</button>
				</div>
			</div>

			<!-- Right Content: Editor & Outputs -->
			<div class="w-full flex-1 flex flex-col gap-6">
				
				<!-- Unified Editor for Input -->
				<div class="flex flex-col flex-1 rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
					<!-- Top Toolbar -->
					<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
						<div class="flex items-center gap-3">
							<div class="w-48 sm:w-64">
								<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
							</div>
						</div>
						<ActionButton
							showSelectAll={true}
							showClear={true}
							showCopy={true}
							onselectall={selectAll}
							onclear={clear}
							oncopy={copy}
						/>
					</div>
					<!-- Main Editor -->
					<div class="bg-base-100/50 flex-1 flex flex-col rounded-b-2xl">
						<TextArea
							bind:this={inputTextarea}
							bind:value={input}
							placeholder="Paste your massive text here to split..."
							rows={18}
							className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono lg:min-h-[400px]"
						/>
					</div>
			</div>
		</div>
		</div>

		<!-- Outputs Section (Full Width Bottom Tray) -->
		<div class="mt-6 rounded-2xl border p-5 shadow-sm transition-colors duration-300 {links.length > 0 ? 'border-success/30 bg-success/10' : 'border-base-content/10 bg-base-100/50'}">
			<h3 class="mb-4 flex items-center gap-2 text-sm font-bold transition-colors {links.length > 0 ? 'text-success' : 'text-base-content/40'}">
				<Download size={18} />
				Ready to Download ({links.length} parts)
			</h3>
			
			{#if links.length > 0}
				<div class="flex flex-wrap gap-2.5 animate-in fade-in">
					{#each links as l}
						<a href={l.url} download={l.name} class="btn btn-sm btn-success bg-success/20 hover:bg-success text-success-content border-none rounded-lg gap-1.5 font-mono text-xs shadow-sm hover:scale-[1.03] transition-all">
							<FileText size={14} />
							{l.name}
						</a>
					{/each}
				</div>
			{:else}
				<div class="flex items-center justify-center py-6 text-sm text-base-content/30 font-medium border-2 border-dashed border-base-content/10 rounded-xl bg-base-200/20">
					No files generated yet.
				</div>
			{/if}
		</div>

	</div>
</div>
