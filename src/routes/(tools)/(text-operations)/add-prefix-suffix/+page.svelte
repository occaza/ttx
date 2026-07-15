<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, TextCursorInput, Play } from '@lucide/svelte';

	let input = $state('');
	let output = $state('');
	let prefix = $state('');
	let suffix = $state('');
	let fileUpload: FileUploadInput;

	let inputTextarea: TextArea;
	let outputTextarea: TextArea;

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function applyFix() {
		const lines = input.split(/\r?\n/);
		output = lines.map((l) => prefix + l + suffix).join('\n');
	}

	function clear() {
		input = '';
		output = '';
		prefix = '';
		suffix = '';
		fileUpload.reset();
	}

	function copyInput() {
		navigator.clipboard.writeText(input);
	}

	function copyOutput() {
		navigator.clipboard.writeText(output);
	}
</script>

<svelte:head>
	<title>Add Prefix/Suffix - TEXY Workspace</title>
	<meta
		name="description"
		content="Tambahkan prefix atau suffix ke setiap baris teks secara otomatis. Hemat waktu untuk editing teks massal."
	/>
	<meta
		name="keywords"
		content="add prefix, add suffix, text prefix, text suffix, bulk edit, text formatter"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/add-prefixsuffix-into-line" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Add Prefix/Suffix into Line - Text Tools" />
	<meta
		property="og:description"
		content="Tambahkan prefix atau suffix ke setiap baris teks secara otomatis"
	/>
	<meta property="og:url" content="{$page.url.origin}/text-tools/add-prefixsuffix-into-line" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Add Prefix/Suffix into Line - Text Tools" />
	<meta
		name="twitter:description"
		content="Tambahkan prefix atau suffix ke setiap baris teks secara otomatis"
	/>
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
					<TextCursorInput size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Add Prefix/Suffix</h1>
					<p class="mt-1 text-sm text-base-content/50">Tambah teks di awal (prefix) dan di akhir (suffix) setiap baris secara otomatis.</p>
				</div>
			</div>
		</div>

		<!-- Tool Workspace (Unified Editor Panel) -->
		<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
			
			<!-- Top Toolbar: Actions & Options -->
			<div class="flex flex-col md:flex-row md:items-center justify-between border-b border-base-content/10 bg-base-200/30 rounded-t-2xl px-4 py-3 gap-4">
				
				<!-- Left: Actions & File Upload -->
				<div class="flex flex-wrap items-center gap-3">
					<div class="w-full sm:w-56 md:w-64">
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</div>
					<div class="h-4 w-px bg-base-content/20 hidden sm:block"></div>
					<ActionButton
						showSelectAll={true}
						showClear={true}
						showCopy={true}
						onselectall={() => inputTextarea.select()}
						onclear={clear}
						oncopy={copyInput}
					/>
				</div>

				<!-- Right: Options -->
				<div class="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
					<div class="flex items-center gap-2 rounded-xl bg-base-100 px-3 py-1.5 border border-base-content/10 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full sm:w-auto">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Prefix</span>
						<input type="text" bind:value={prefix} placeholder="e.g. -" class="bg-transparent border-none outline-none text-sm w-full sm:w-24 text-base-content placeholder:text-base-content/20" />
					</div>
					<div class="flex items-center gap-2 rounded-xl bg-base-100 px-3 py-1.5 border border-base-content/10 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full sm:w-auto">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Suffix</span>
						<input type="text" bind:value={suffix} placeholder="e.g. ;" class="bg-transparent border-none outline-none text-sm w-full sm:w-24 text-base-content placeholder:text-base-content/20" />
					</div>
				</div>
			</div>

			<!-- Main Editor Grid (Split View) -->
			<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-content/10 bg-base-100/50">
				<!-- Input Area -->
				<div class="relative group flex flex-col">
					<div class="flex h-14 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/10">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Input</span>
					</div>
					<TextArea
						bind:this={inputTextarea}
						bind:value={input}
						placeholder="Paste text here..."
						rows={16}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px]"
					/>
				</div>

				<!-- Output Area -->
				<div class="relative group flex flex-col bg-base-200/5">
					<div class="flex h-14 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/20">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output</span>
						<!-- Output-specific mini action button -->
						<ActionButton
							showSelectAll={true}
							showClear={false}
							showCopy={true}
							onselectall={() => outputTextarea.select()}
							oncopy={copyOutput}
						/>
					</div>
					<TextArea
						bind:this={outputTextarea}
						bind:value={output}
						placeholder="Output will appear here..."
						rows={16}
						readonly={true}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px] text-base-content/80"
					/>
				</div>
			</div>

			<!-- Bottom Toolbar: Save & Execute -->
			<div class="flex flex-col sm:flex-row items-center justify-between border-t border-base-content/10 bg-base-200/30 rounded-b-2xl px-4 py-3 gap-4">
				<div class="w-full sm:w-auto">
					<SaveFiles content={output} defaultName="output.txt" />
				</div>
				
				<div class="flex w-full sm:w-auto items-center justify-end">
					<button class="btn btn-primary btn-sm rounded-xl shadow-sm hover:scale-105 transition-all font-bold gap-2 w-full sm:w-auto" onclick={applyFix}>
						Generate Output
						<Play size={14} fill="currentColor" />
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
