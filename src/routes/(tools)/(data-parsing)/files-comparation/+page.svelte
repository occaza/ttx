<script lang="ts">
	import { FileUploadInput, ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, ArrowRightLeft } from '@lucide/svelte';

	let fileA = $state<File | null>(null);
	let fileB = $state<File | null>(null);
	let nameA = $state('');
	let nameB = $state('');

	let linesA: string[] = [];
	let linesB: string[] = [];

	let outA: string[] = $state([]);
	let outB: string[] = $state([]);

	let textA = $state('');
	let textB = $state('');

	let caseSensitive = $state(false);
	let ignoreEmpty = $state(false);
	let onlyDiff = $state(false);

	let fileUploadA: FileUploadInput;
	let fileUploadB: FileUploadInput;
	let textAreaA: TextArea;

	function key(s: string) {
		return caseSensitive ? s : s.toLowerCase();
	}

	async function handleA(content: string) {
		fileA = new File([content], nameA);
		nameA = nameA || 'File A';
		textA = content;
		linesA = textA.split(/\r?\n/);
		if (ignoreEmpty) linesA = linesA.filter((l) => l.trim() !== '');
	}

	async function handleB(content: string) {
		fileB = new File([content], nameB);
		nameB = nameB || 'File B';
		textB = content;
		linesB = textB.split(/\r?\n/);
		if (ignoreEmpty) linesB = linesB.filter((l) => l.trim() !== '');
	}

	function handleError(error: Error) {
		console.error(error);
	}

	async function compare() {
		if (!fileA || !fileB) return;
		const textAContent = await fileA.text();
		const textBContent = await fileB.text();

		const dupA: Record<number, number> = {};
		const dupB: Record<number, number> = {};

		linesA = textAContent.split(/\r?\n/);
		linesB = textBContent.split(/\r?\n/);

		if (ignoreEmpty) {
			linesA = linesA.filter((l) => l.trim() !== '');
			linesB = linesB.filter((l) => l.trim() !== '');
		}

		const mapB = new Map(linesB.map((l, i) => [key(l), i]));
		const mapA = new Map(linesA.map((l, i) => [key(l), i]));

		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				dupA[i] = j + 1;
			}
		});

		linesB.forEach((l, i) => {
			const k = key(l);
			const j = mapA.get(k);
			if (j !== undefined) {
				dupB[i] = j + 1;
			}
		});

		outA = [];
		outB = [];

		linesA.forEach((l, i) => {
			const k = key(l);
			const j = mapB.get(k);
			if (j !== undefined) {
				if (!onlyDiff) {
					outA.push(dupA[i] ? `${l}  (at ${nameB} ${dupA[i]})` : l);
					outB.push(l);
				}
			} else {
				outA.push(`${l}  (no in ${nameB})`);
				outB.push('');
			}
		});

		linesB.forEach((l, i) => {
			const k = key(l);
			if (!mapA.has(k)) {
				outA.push('');
				outB.push(`${l}  (no in ${nameA})`);
			}
		});
	}

	function selectAll() {
		textAreaA.select();
	}

	function clear() {
		outA = [];
		outB = [];
		textA = '';
		textB = '';
		nameA = '';
		nameB = '';
		fileA = null;
		fileB = null;
		if (fileUploadA) fileUploadA.reset();
		if (fileUploadB) fileUploadB.reset();
	}

	function copy() {
		navigator.clipboard.writeText(outA.join('\n'));
	}
</script>

<svelte:head>
	<title>Compare Files - TEXY Workspace</title>
	<meta name="description" content="Bandingkan dua file teks dan temukan perbedaannya. Deteksi duplikat dan baris yang tidak cocok dengan mudah." />
	<meta name="keywords" content="compare files, file comparison, text diff, bandingkan file, cek duplikat, file tool" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/files-comparation" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Compare Two Files - Text Tools" />
	<meta property="og:description" content="Bandingkan dua file teks dan temukan perbedaannya dengan mudah" />
	<meta property="og:url" content="{$page.url.origin}/text-tools/files-comparation" />
	<meta property="og:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Compare Two Files - Text Tools" />
	<meta name="twitter:description" content="Bandingkan dua file teks dan temukan perbedaannya" />
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
					<ArrowRightLeft size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Compare Files</h1>
					<p class="mt-1 text-sm text-base-content/50">Bandingkan dua file teks berdampingan untuk menemukan baris yang berbeda atau duplikat.</p>
				</div>
			</div>
		</div>

		<!-- Unified Dual Pane Editor -->
		<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
			
			<!-- Main Toolbar -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-base-content/10 bg-base-200/30 p-3 sm:px-4 sm:h-14 gap-3 rounded-t-2xl">
				<div class="flex flex-wrap items-center gap-4">
					<label class="flex cursor-pointer items-center gap-2 group">
						<input type="checkbox" bind:checked={caseSensitive} class="checkbox checkbox-xs rounded-sm border-base-content/20 checked:border-primary" />
						<span class="text-[11px] font-bold uppercase tracking-widest text-base-content/50 group-hover:text-base-content transition-colors">Case Sensitive</span>
					</label>
					<label class="flex cursor-pointer items-center gap-2 group">
						<input type="checkbox" bind:checked={ignoreEmpty} class="checkbox checkbox-xs rounded-sm border-base-content/20 checked:border-primary" />
						<span class="text-[11px] font-bold uppercase tracking-widest text-base-content/50 group-hover:text-base-content transition-colors">Ignore Empty</span>
					</label>
					<label class="flex cursor-pointer items-center gap-2 group">
						<input type="checkbox" bind:checked={onlyDiff} class="checkbox checkbox-xs rounded-sm border-base-content/20 checked:border-primary" />
						<span class="text-[11px] font-bold uppercase tracking-widest text-base-content/50 group-hover:text-base-content transition-colors">Only Diffs</span>
					</label>
				</div>
				<div class="flex items-center gap-2 w-full sm:w-auto">
					<button class="btn btn-sm btn-primary rounded-lg font-bold shadow-sm flex-1 sm:flex-none gap-1.5" onclick={compare} disabled={!fileA || !fileB}>
						<ArrowRightLeft size={14} /> Compare
					</button>
					<ActionButton
						showSelectAll={false}
						showClear={true}
						showCopy={true}
						onclear={clear}
						oncopy={copy}
					/>
				</div>
			</div>

			<!-- Dual Pane View -->
			<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-content/10 bg-base-100/50 rounded-b-2xl">
				
				<!-- Left Pane (File A) -->
				<div class="flex flex-col relative group">
					<div class="flex h-14 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/10">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest max-w-[120px] truncate" title={nameA || 'File A'}>
							{nameA || 'File A'}
						</span>
						<div class="w-48 sm:w-56">
							<FileUploadInput bind:this={fileUploadA} onload={handleA} onerror={handleError} size="xs" />
						</div>
					</div>
					<TextArea
						bind:this={textAreaA}
						value={outA.length ? outA.join('\n') : textA}
						placeholder="Upload File A..."
						rows={18}
						readonly={true}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px] {outA.length ? 'text-base-content/80' : 'text-base-content/40'}"
					/>
				</div>

				<!-- Right Pane (File B) -->
				<div class="flex flex-col relative group rounded-br-2xl">
					<div class="flex h-14 items-center justify-between px-4 border-b border-base-content/5 bg-base-200/20">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest max-w-[120px] truncate" title={nameB || 'File B'}>
							{nameB || 'File B'}
						</span>
						<div class="w-48 sm:w-56">
							<FileUploadInput bind:this={fileUploadB} onload={handleB} onerror={handleError} size="xs" />
						</div>
					</div>
					<TextArea
						value={outB.length ? outB.join('\n') : textB}
						placeholder="Upload File B..."
						rows={18}
						readonly={true}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono min-h-[400px] {outB.length ? 'text-base-content/80' : 'text-base-content/40'}"
					/>
				</div>

			</div>
		</div>

		<!-- Save Result Option -->
		{#if outA.length > 0}
			<div class="mt-6 flex justify-end animate-in fade-in slide-in-from-top-2">
				<div class="bg-base-100 p-2 rounded-xl border border-base-content/10 shadow-sm">
					<SaveFiles content={outA.join('\n')} defaultName="compare-result.txt" />
				</div>
			</div>
		{/if}

	</div>
</div>
