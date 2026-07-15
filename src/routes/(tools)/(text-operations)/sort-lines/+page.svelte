<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from '@lucide/svelte';

	let input = $state('');
	let output = $state('');
	let order = $state<'asc' | 'desc'>('asc');
	let removeDup = $state(false);
	let caseSensitive = $state(false);
	let copied = $state(false);

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;
	let outputTextarea: TextArea;

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function sortLines() {
		let lines = input.split(/\r?\n/);
		if (!caseSensitive) lines = lines.map((l) => l.toLowerCase());
		lines.sort();
		if (order === 'desc') lines.reverse();
		if (removeDup) lines = [...new Set(lines)];
		output = lines.join('\n');
	}

	function selectAll() {
		inputTextarea.select();
	}

	function clear() {
		input = '';
		output = '';
		if (fileUpload) fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Sort Lines - TEXY Workspace</title>
	<meta name="description" content="Urutkan baris teks secara alfabetis. Pilih urutan A-Z atau Z-A, dengan opsi hapus duplikat dan case sensitive." />
	<meta name="keywords" content="sort lines, sort text, alphabetical sort, urut baris, sort abjad" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/sort-lines" />
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
					<ArrowUpDown size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Sort Lines</h1>
					<p class="mt-1 text-sm text-base-content/50">Urutkan baris teks secara alfabetis dengan opsi lengkap.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Sidebar + Split Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">

			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-7 shadow-xl backdrop-blur-md">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Configuration</h3>

				<div class="space-y-8">
					<!-- File Upload -->
					<div class="w-full">
						<div class="mb-2">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Load from File</span>
						</div>
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</div>

					<!-- Sort Order -->
					<div class="w-full">
						<div class="mb-2">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Sort Order</span>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								onclick={() => (order = 'asc')}
								class="h-10 flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all
									{order === 'asc'
										? 'bg-primary/10 border-primary/30 text-primary'
										: 'bg-base-200/40 border-base-content/10 text-base-content/50 hover:border-base-content/20'}"
							>
								<ArrowUp size={14} /> A → Z
							</button>
							<button
								type="button"
								onclick={() => (order = 'desc')}
								class="h-10 flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all
									{order === 'desc'
										? 'bg-primary/10 border-primary/30 text-primary'
										: 'bg-base-200/40 border-base-content/10 text-base-content/50 hover:border-base-content/20'}"
							>
								<ArrowDown size={14} /> Z → A
							</button>
						</div>
					</div>

					<!-- Toggles -->
					<div class="space-y-5">
						<label class="flex cursor-pointer items-start gap-3 group">
							<input type="checkbox" bind:checked={caseSensitive} class="checkbox checkbox-sm rounded-md border-base-content/20 bg-base-200/30 checked:border-primary transition-colors mt-0.5" />
							<div class="flex flex-col">
								<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Case Sensitive</span>
								<span class="text-[10px] text-base-content/40">Huruf besar/kecil dianggap berbeda</span>
							</div>
						</label>
						<label class="flex cursor-pointer items-start gap-3 group">
							<input type="checkbox" bind:checked={removeDup} class="checkbox checkbox-sm rounded-md border-base-content/20 bg-base-200/30 checked:border-primary transition-colors mt-0.5" />
							<div class="flex flex-col">
								<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Remove Duplicates</span>
								<span class="text-[10px] text-base-content/40">Hapus baris yang sama</span>
							</div>
						</label>
					</div>
				</div>

				<div class="mt-auto pt-6 border-t border-base-content/10">
					<button
						class="btn btn-primary w-full rounded-xl shadow-lg hover:scale-[1.02] transition-all font-bold gap-2 h-12"
						onclick={sortLines}
						disabled={!input}
					>
						<ArrowUpDown size={18} />
						Sort Lines
					</button>
				</div>
			</div>

			<!-- Right: Unified Split Editor -->
			<div class="w-full flex-1 flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md overflow-hidden">

				<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-content/10 bg-base-100/50 flex-1">
					
					<!-- Input Editor -->
					<div class="flex flex-col relative h-full min-h-[300px]">
						<div class="flex items-center justify-between border-b border-base-content/5 bg-base-200/20 h-14 px-4">
							<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Input</span>
							<ActionButton
								showSelectAll={true}
								showClear={true}
								showCopy={false}
								onselectall={selectAll}
								onclear={clear}
							/>
						</div>
						<TextArea
							bind:this={inputTextarea}
							bind:value={input}
							placeholder="Paste teks di sini, satu baris per entri..."
							rows={14}
							className="w-full h-full absolute inset-0 pt-14 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono"
						/>
					</div>

					<!-- Output Editor -->
					<div class="flex flex-col relative h-full min-h-[300px] bg-base-200/5">
						<div class="flex items-center justify-between border-b border-base-content/5 bg-base-200/30 h-14 px-4 z-10">
							<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output</span>
							<div class="flex items-center gap-2">
								<SaveFiles content={output} defaultName="sorted.txt" />
								<ActionButton
									showSelectAll={false}
									showClear={false}
									showCopy={true}
									oncopy={copy}
								/>
							</div>
						</div>
						<div class="flex-1 relative flex flex-col h-full">
							{#if !output}
								<div class="absolute inset-0 pt-14 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
									<ArrowUpDown size={40} strokeWidth={1} class="mb-3 opacity-50" />
									<p class="text-sm font-medium">Hasil sorting akan muncul di sini</p>
								</div>
							{/if}
							<TextArea
								bind:this={outputTextarea}
								bind:value={output}
								rows={14}
								readonly={true}
								placeholder=""
								className="w-full h-full absolute inset-0 pt-14 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono {output ? 'text-base-content/80' : ''}"
							/>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
