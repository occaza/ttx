<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Scissors, ChevronDown } from '@lucide/svelte';

	let input = $state('');
	let startLine = $state(1);
	let lineCount = $state(20);
	let removeEmpty = $state(false);
	let includeLineNumbers = $state(false);

	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea;
	let outputTextarea: TextArea;
	let inputLinesEl: HTMLDivElement;

	let output = $state('');

	function syncScroll(e: Event) {
		if (inputLinesEl) {
			inputLinesEl.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
		}
	}

	let maxLines = $derived.by(() => {
		if (!input) return 0;
		let lines = input.split(/\r?\n/);
		if (removeEmpty) {
			lines = lines.filter((l) => l.trim() !== '');
		}
		return lines.length;
	});

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function handleSelectAll() {
		inputTextarea.select();
	}

	function handleClear() {
		input = '';
		output = '';
		if (fileUpload) fileUpload.reset();
	}

	function handleCopy() {
		navigator.clipboard.writeText(output);
	}

	function extractLines() {
		if (!input) return;
		
		let rawLines = input.split(/\r?\n/);
		let lines = rawLines.map((text, index) => ({ text, originalIndex: index, originalLine: index + 1 }));
		
		if (removeEmpty) {
			lines = lines.filter((l) => l.text.trim() !== '');
		}
		
		const startIdx = Math.max(0, startLine - 1);
		const endIdx = startIdx + Math.max(0, lineCount);
		
		const slicedLines = lines.slice(startIdx, endIdx);
		
		if (includeLineNumbers) {
			output = slicedLines.map(l => `${l.originalLine} | ${l.text}`).join('\n');
		} else {
			output = slicedLines.map(l => l.text).join('\n');
		}
		
		const indicesToRemove = new Set(slicedLines.map(l => l.originalIndex));
		rawLines = rawLines.filter((_, idx) => !indicesToRemove.has(idx));
		
		input = rawLines.join('\n');
		navigator.clipboard.writeText(output); // Salin otomatis juga
		
		startLine = 1; // Reset ke 1 untuk kelancaran
	}
</script>

<svelte:head>
	<title>Slice / Extract Lines - TEXY Workspace</title>
	<meta name="description" content="Ambil sejumlah baris dari teks dimulai dari baris tertentu. Cocok untuk memotong teks panjang secara spesifik." />
	<meta name="keywords" content="slice lines, extract lines, potong teks, ambil baris" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/slice-lines" />
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
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Extract Lines</h1>
					<p class="mt-1 text-sm text-base-content/50">Potong dan ambil jumlah baris tertentu dari dokumen teks Anda.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Sidebar + Split Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:h-[600px] min-h-[560px]">

			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-7 shadow-xl backdrop-blur-md overflow-y-auto">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Configuration</h3>

				<div class="space-y-8">
					<!-- File Upload -->
					<div class="w-full">
						<div class="mb-2">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Load from File</span>
						</div>
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</div>

					<!-- Settings -->
					<div class="w-full space-y-4">
						<div class="form-control">
							<label class="label pt-0" for="startLine">
								<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Mulai dari baris ke-</span>
							</label>
							<input type="number" id="startLine" bind:value={startLine} min="1" max={maxLines > 0 ? maxLines : undefined} class="input input-sm input-bordered w-full bg-base-200/30 font-mono" />
						</div>

						<div class="form-control">
							<label class="label pt-0" for="lineCount">
								<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Jumlah baris diambil</span>
							</label>
							<input type="number" id="lineCount" bind:value={lineCount} min="1" class="input input-sm input-bordered w-full bg-base-200/30 font-mono" />
						</div>
					</div>

					<!-- Toggles -->
					<div class="space-y-5">
						<label class="flex cursor-pointer items-start gap-3 group">
							<input type="checkbox" bind:checked={removeEmpty} class="checkbox checkbox-sm rounded-md border-base-content/20 bg-base-200/30 checked:border-primary transition-colors mt-0.5" />
							<div class="flex flex-col">
								<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Abaikan Baris Kosong</span>
								<span class="text-[10px] text-base-content/40">Hapus baris kosong sebelum dihitung</span>
							</div>
						</label>

						<label class="flex cursor-pointer items-start gap-3 group">
							<input type="checkbox" bind:checked={includeLineNumbers} class="checkbox checkbox-sm rounded-md border-base-content/20 bg-base-200/30 checked:border-primary transition-colors mt-0.5" />
							<div class="flex flex-col">
								<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Sertakan Nomor Baris</span>
								<span class="text-[10px] text-base-content/40">Tampilkan nomor baris asli di awal teks</span>
							</div>
						</label>
					</div>
				</div>

				<div class="mt-auto pt-6 border-t border-base-content/10">
					<button
						class="btn btn-primary w-full rounded-xl shadow-lg hover:scale-[1.02] transition-all font-bold gap-2 h-12"
						onclick={extractLines}
						disabled={!input}
					>
						<Scissors size={18} />
						Extract & Copy
					</button>
					<p class="text-center text-[10px] text-base-content/40 mt-3 px-2">Memotong teks ke output & clipboard</p>
				</div>
			</div>

			<!-- Right: Unified Split Editor -->
			<div class="w-full flex-1 flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md overflow-hidden min-h-0">

				<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-content/10 bg-base-100/50 flex-1 min-h-0">
					
					<!-- Input Editor -->
					<div class="flex flex-col relative h-full min-h-[300px] lg:min-h-0">
						<div class="flex items-center justify-between border-b border-base-content/5 bg-base-200/20 h-14 px-4 shrink-0">
							<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Input ({maxLines} baris)</span>
							<ActionButton
								showSelectAll={true}
								showClear={true}
								showCopy={false}
								onselectall={handleSelectAll}
								onclear={handleClear}
							/>
						</div>
						<div class="flex flex-1 w-full relative overflow-hidden bg-transparent min-h-0">
							<div
								bind:this={inputLinesEl}
								class="w-12 shrink-0 bg-base-200/20 border-r border-base-content/5 text-right pr-3 py-5 overflow-hidden text-base-content/30 font-mono text-base md:text-sm select-none"
							>
								{#each Array(maxLines || 1) as _, i}
									<div>{i + 1}</div>
								{/each}
							</div>
							<TextArea
								bind:this={inputTextarea}
								bind:value={input}
								placeholder="Paste teks di sini, satu baris per entri..."
								rows={14}
								onscroll={syncScroll}
								className="w-full h-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono whitespace-pre overflow-auto"
							/>
						</div>
					</div>

					<!-- Output Editor -->
					<div class="flex flex-col relative h-full min-h-[300px] lg:min-h-0 bg-base-200/5">
						<div class="flex items-center justify-between border-b border-base-content/5 bg-base-200/30 h-14 px-4 shrink-0 z-10">
							<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output</span>
							<div class="flex items-center gap-2">
								<SaveFiles content={output} defaultName="extracted.txt" />
								<ActionButton
									showSelectAll={false}
									showClear={false}
									showCopy={true}
									oncopy={handleCopy}
								/>
							</div>
						</div>
						<div class="flex-1 relative flex flex-col min-h-0">
							{#if !output}
								<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
									<Scissors size={40} strokeWidth={1} class="mb-3 opacity-50" />
									<p class="text-sm font-medium">Hasil potongan akan muncul di sini</p>
								</div>
							{/if}
							<TextArea
								bind:this={outputTextarea}
								value={output}
								rows={14}
								readonly={true}
								placeholder=""
								className="w-full flex-1 h-full resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono {output ? 'text-base-content/80' : ''} overflow-auto"
							/>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
