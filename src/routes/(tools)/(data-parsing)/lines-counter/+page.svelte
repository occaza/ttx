<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Hash } from '@lucide/svelte';

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
		if (fileUpload) fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
	}
	
	function copyOutput() {
		navigator.clipboard.writeText(output);
	}
</script>

<svelte:head>
	<title>Line Counter - TEXY Workspace</title>
	<meta name="description" content="Hitung jumlah baris, baris unik, dan duplikat dalam teks Anda. Deteksi duplikat dengan case sensitive atau tidak." />
	<meta name="keywords" content="line counter, count duplicates, text counter, hitung baris, cek duplikat, line tool" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/lines-counter" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Count Lines & Duplicates - Text Tools" />
	<meta property="og:description" content="Hitung jumlah baris, baris unik, dan duplikat dalam teks" />
	<meta property="og:url" content="{$page.url.origin}/text-tools/lines-counter" />
	<meta property="og:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Count Lines & Duplicates - Text Tools" />
	<meta name="twitter:description" content="Hitung jumlah baris, baris unik, dan duplikat dalam teks" />
	<meta name="twitter:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />
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
					<Hash size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Count Lines & Duplicates</h1>
					<p class="mt-1 text-sm text-base-content/50">Hitung statistik baris teks dan temukan duplikat dengan presisi.</p>
				</div>
			</div>
		</div>

		<!-- Unified Editor Panel -->
		<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
			
			<!-- Top Toolbar (Settings & Actions) -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-base-content/10 bg-base-200/30 p-3 sm:px-4 sm:h-14 gap-3 rounded-t-2xl">
				<div class="flex flex-wrap items-center gap-4">
					<div class="w-48">
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</div>
					<div class="h-4 w-px bg-base-content/10 hidden sm:block"></div>
					<label class="flex cursor-pointer items-center gap-2 group">
						<input type="checkbox" bind:checked={caseSensitive} class="checkbox checkbox-xs rounded-sm border-base-content/20 checked:border-primary" />
						<span class="text-[11px] font-bold uppercase tracking-widest text-base-content/50 group-hover:text-base-content transition-colors">Case Sensitive</span>
					</label>
					<label class="flex cursor-pointer items-center gap-2 group">
						<input type="checkbox" bind:checked={removeEmpty} class="checkbox checkbox-xs rounded-sm border-base-content/20 checked:border-primary" />
						<span class="text-[11px] font-bold uppercase tracking-widest text-base-content/50 group-hover:text-base-content transition-colors">Remove Empty</span>
					</label>
				</div>
				<div class="flex items-center gap-2 w-full sm:w-auto">
					<button class="btn btn-sm btn-primary rounded-lg font-bold shadow-sm flex-1 sm:flex-none" onclick={count}>
						Count Lines
					</button>
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

			<!-- Stats Bar -->
			<div class="grid grid-cols-3 divide-x divide-base-content/10 border-b border-base-content/10 bg-base-100/50">
				<div class="flex flex-col items-center py-4 transition-all {totalLines > 0 ? 'bg-primary/5' : ''}">
					<span class="text-[10px] uppercase tracking-widest font-bold mb-1 {totalLines > 0 ? 'text-primary' : 'text-base-content/40'}">Total Lines</span>
					<span class="text-3xl font-black {totalLines > 0 ? 'text-primary' : 'text-base-content/20'}">{totalLines}</span>
				</div>
				<div class="flex flex-col items-center py-4 transition-all {uniqueLines > 0 ? 'bg-secondary/5' : ''}">
					<span class="text-[10px] uppercase tracking-widest font-bold mb-1 {uniqueLines > 0 ? 'text-secondary' : 'text-base-content/40'}">Unique Lines</span>
					<span class="text-3xl font-black {uniqueLines > 0 ? 'text-secondary' : 'text-base-content/20'}">{uniqueLines}</span>
				</div>
				<div class="flex flex-col items-center py-4 transition-all {dupLines > 0 ? 'bg-accent/5' : ''}">
					<span class="text-[10px] uppercase tracking-widest font-bold mb-1 {dupLines > 0 ? 'text-accent' : 'text-base-content/40'}">Duplicate Lines</span>
					<span class="text-3xl font-black {dupLines > 0 ? 'text-accent' : 'text-base-content/20'}">{dupLines}</span>
				</div>
			</div>

			<!-- Split Editor Area -->
			<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-content/10 bg-base-100/50 rounded-b-2xl">
				
				<!-- Input Area -->
				<div class="relative group flex flex-col">
					<div class="flex h-12 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/10">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Input</span>
					</div>
					<TextArea
						bind:this={inputTextarea}
						bind:value={input}
						placeholder="Paste text here to count..."
						rows={16}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px]"
					/>
				</div>

				<!-- Output Area -->
				<div class="relative group flex flex-col bg-base-200/5 rounded-br-2xl">
					<div class="flex h-12 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/20">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Duplicate Details</span>
						<div class="flex items-center gap-2">
							<SaveFiles content={output} defaultName="count-result.txt" />
							<ActionButton
								showSelectAll={true}
								showClear={false}
								showCopy={true}
								onselectall={() => outputTextarea.select()}
								oncopy={copyOutput}
							/>
						</div>
					</div>
					<div class="flex-1 flex flex-col relative">
						{#if !output && totalLines === 0}
							<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
								<Hash size={48} strokeWidth={1} class="mb-4 opacity-50" />
								<p class="text-sm font-medium">Hit "Count Lines" to view details</p>
							</div>
						{/if}
						<TextArea
							bind:this={outputTextarea}
							bind:value={output}
							placeholder=""
							rows={16}
							readonly={true}
							className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px] {output ? 'text-base-content/80' : ''}"
						/>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
