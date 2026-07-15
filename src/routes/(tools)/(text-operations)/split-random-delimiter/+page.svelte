<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Scissors, ChevronDown } from '@lucide/svelte';

	let input = $state('');
	let output = $state('');
	let copied = $state(false);
	let delimiter = $state('');
	let customDelimiter = $state('');
	let delimiterOption = $state('');
	let segmen = $state<string[]>([]);
	let pickSet = $state(new Set<number>());
	let segCount = $state(0);
	let inputTextarea: TextArea;
	let outputTextarea: TextArea;
	let fileUpload: FileUploadInput;

	const maxLabelLength = 10;

	$effect(() => {
		if (input) preview();
	});

	$effect(() => {
		delimiter = delimiterOption === 'custom' ? customDelimiter || '|' : delimiterOption;
		if (delimiter) {
			preview();
			extract();
		} else {
			segCount = 0;
			segmen = [];
			output = '';
		}
	});

	function preview() {
		if (!delimiter) {
			segCount = 0;
			segmen = [];
			return;
		}

		const rows = input.split(/\r?\n/).filter((l) => l.includes(delimiter));
		if (!rows.length) {
			segmen = [];
			segCount = 0;
			pickSet.clear();
			output = '';
			return;
		}

		segCount = Math.max(...rows.map((r) => r.split(delimiter).length));
		pickSet.clear();
		for (let i = 0; i < segCount; i++) pickSet.add(i);
		pickSet = pickSet;

		segmen = rows[0].split(delimiter).map((s) => {
			const trimmed = s.trim();
			return trimmed.length > maxLabelLength
				? trimmed.substring(0, maxLabelLength) + '...'
				: trimmed;
		});
	}

	function extract() {
		if (!delimiter) {
			output = '';
			return;
		}

		const rows = input.split(/\r?\n/).filter((l) => l.includes(delimiter));
		const picks = Array.from(pickSet).sort((a, b) => a - b);
		output = rows
			.map((r) =>
				r
					.split(delimiter)
					.filter((_, i) => picks.includes(i))
					.join(delimiter)
			)
			.join('\n');
	}

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function selectAll() {
		outputTextarea.select();
	}

	function clear() {
		input = '';
		output = '';
		copied = false;
		delimiter = '';
		customDelimiter = '';
		delimiterOption = '';
		pickSet = new Set<number>();
		segCount = 0;
		segmen = [];
		if (fileUpload) fileUpload.reset();
	}

	function copy() {
		navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function handleCheckboxChange(index: number, checked: boolean) {
		if (checked) {
			pickSet.add(index);
		} else {
			pickSet.delete(index);
		}
		pickSet = pickSet;
		extract();
	}
</script>

<svelte:head>
	<title>Split Random Delimiter - TEXY Workspace</title>
	<meta name="description" content="Pisahkan teks berdasarkan delimiter pilihan Anda. Pilih segmen yang ingin diambil dari setiap baris dengan mudah." />
	<meta name="keywords" content="split text, delimiter, text splitter, pisah teks, extract data, csv tool" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/split-random-delimiter" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Split Random Delimiter - Text Tools" />
	<meta property="og:description" content="Pisahkan teks berdasarkan delimiter pilihan Anda. Pilih segmen yang ingin diambil dari setiap baris." />
	<meta property="og:url" content="{$page.url.origin}/text-tools/split-random-delimiter" />
	<meta property="og:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Split Random Delimiter - Text Tools" />
	<meta name="twitter:description" content="Pisahkan teks berdasarkan delimiter pilihan Anda" />
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
					<Scissors size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Split by Delimiter</h1>
					<p class="mt-1 text-sm text-base-content/50">Pisahkan teks berdasarkan delimiter, lalu pilih segmen yang diinginkan.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Sidebar Settings + Split Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">
			
			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-6 shadow-xl backdrop-blur-md">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Configuration</h3>
				
				<div class="space-y-5">
					<!-- File Upload -->
					<label class="form-control w-full">
						<div class="label px-0 pt-0 pb-1.5">
							<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Load from File</span>
						</div>
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</label>

					<!-- Delimiter Selection -->
					<label class="form-control w-full">
						<div class="label px-0 pt-0 pb-1.5">
							<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Delimiter</span>
						</div>
						<div class="relative">
							<select
								bind:value={delimiterOption}
								class="select select-sm h-10 w-full rounded-xl bg-base-200/30 border border-base-content/10 pr-8 text-sm focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
							>
								<option value="" disabled selected>Choose Delimiter</option>
								<option value="|">Pipe (|)</option>
								<option value="&#9;">Tab</option>
								<option value=" ">Space</option>
								<option value=",">Comma (,)</option>
								<option value=";">Semicolon (;)</option>
								<option value=":">Colon (:)</option>
								<option value="custom">Custom...</option>
							</select>
							<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/40">
								<ChevronDown size={14} />
							</div>
						</div>
					</label>

					{#if delimiterOption === 'custom'}
						<label class="form-control w-full">
							<div class="label px-0 pt-0 pb-1.5">
								<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Custom Character</span>
							</div>
							<input
								type="text"
								bind:value={customDelimiter}
								maxlength="5"
								placeholder="e.g. ~ atau ::"
								class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
							/>
						</label>
					{/if}

					<!-- Segment Picker -->
					{#if segCount > 0}
						<div class="space-y-2">
							<div class="label px-0 pt-0 pb-1.5">
								<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Segments to Keep</span>
								<span class="label-text-alt text-[10px] text-base-content/30">{segCount} total</span>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each Array(segCount) as _, i (i)}
									<label
										class="flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all
											{pickSet.has(i)
												? 'bg-primary/10 border-primary/30 text-primary'
												: 'bg-base-200/40 border-base-content/10 text-base-content/50 hover:border-base-content/20'}"
										title={segmen[i] || `seg ${i + 1}`}
									>
										<input
											type="checkbox"
											class="hidden"
											checked={pickSet.has(i)}
											onchange={(e) => handleCheckboxChange(i, e.currentTarget.checked)}
										/>
										{segmen[i] || `Seg ${i + 1}`}
									</label>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="mt-auto pt-6 border-t border-base-content/10">
					<button
						class="btn btn-primary w-full rounded-xl shadow-lg hover:scale-[1.02] transition-all font-bold gap-2 h-12"
						onclick={extract}
						disabled={!delimiter || !input}
					>
						<Scissors size={18} />
						Extract Segments
					</button>
				</div>
			</div>

			<!-- Right: Split Editor -->
			<div class="w-full flex-1 flex flex-col gap-6">

				<!-- Input Editor -->
				<div class="flex flex-col flex-1 rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
					<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Input</span>
					</div>
					<TextArea
						bind:this={inputTextarea}
						bind:value={input}
						placeholder="Paste teks berdelimiter di sini...&#10;&#10;Contoh: nama|email|kota"
						rows={10}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[200px] rounded-b-2xl"
					/>
				</div>

				<!-- Output Editor -->
				<div class="flex flex-col flex-1 rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
					<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output</span>
						<div class="flex items-center gap-2">
							<SaveFiles content={output} defaultName="output.txt" />
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
					<div class="relative flex-1 flex flex-col">
						{#if !output}
							<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
								<Scissors size={40} strokeWidth={1} class="mb-3 opacity-50" />
								<p class="text-sm font-medium">Hasil ekstraksi akan muncul di sini</p>
							</div>
						{/if}
						<TextArea
							bind:this={outputTextarea}
							bind:value={output}
							placeholder=""
							rows={10}
							readonly={true}
							className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[200px] rounded-b-2xl {output ? 'text-base-content/80' : ''}"
						/>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>


