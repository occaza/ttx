<script lang="ts">
	import { ActionButton, TextArea, FileUploadInput, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Type, CaseUpper, CaseLower, Hash, Minus } from '@lucide/svelte';

	let input = $state('');
	let output = $state('');
	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea | undefined;
	let outputTextarea: TextArea | undefined;

	let activeCase = $state('none');

	$effect(() => {
		if (input === '') {
			output = '';
			activeCase = 'none';
			return;
		}
		applyCase(activeCase, input);
	});

	function applyCase(type: string, text: string) {
		activeCase = type;
		
		if (type === 'none') {
			output = text;
			return;
		}

		let result = '';
		
		switch (type) {
			case 'uppercase':
				result = text.toUpperCase();
				break;
			case 'lowercase':
				result = text.toLowerCase();
				break;
			case 'titlecase':
				// Capitalize first letter of every word
				result = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
				break;
			case 'sentencecase':
				// Capitalize first letter of the string and first letter after . ! ?
				result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
				break;
			case 'camelcase':
				// hello world -> helloWorld
				result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
					return index === 0 ? word.toLowerCase() : word.toUpperCase();
				}).replace(/\s+/g, '');
				break;
			case 'pascalcase':
				// hello world -> HelloWorld
				result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '');
				break;
			case 'snakecase':
				// hello world -> hello_world
				result = text.replace(/\W+/g, ' ')
				  .split(/ |\B(?=[A-Z])/)
				  .map(word => word.toLowerCase())
				  .join('_');
				break;
			case 'kebabcase':
				// hello world -> hello-world
				result = text.replace(/\W+/g, ' ')
				  .split(/ |\B(?=[A-Z])/)
				  .map(word => word.toLowerCase())
				  .join('-');
				break;
			case 'alternatingcase':
				// hElLo wOrLd
				result = text.toLowerCase().split('').map((c, i) => i % 2 !== 0 ? c.toUpperCase() : c).join('');
				break;
			default:
				result = text;
		}
		
		output = result;
	}

	function handleLoad(content: string) {
		input = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function selectAll() {
		inputTextarea?.select();
	}

	function clear() {
		input = '';
		output = '';
		activeCase = 'none';
		if (fileUpload) fileUpload.reset();
	}

	function copy() {
		if (output) {
			navigator.clipboard.writeText(output);
		}
	}
</script>

<svelte:head>
	<title>Case Converter - TEXY Workspace</title>
	<meta name="description" content="Ubah format huruf teks Anda menjadi UPPERCASE, lowercase, Title Case, camelCase, snake_case, dan format lainnya dengan mudah." />
	<meta name="keywords" content="case converter, uppercase, lowercase, title case, camelcase, text formatter" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/case-converter" />
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
					<Type size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Case Converter</h1>
					<p class="mt-1 text-sm text-base-content/50">Ubah format kapitalisasi teks secara massal dengan berbagai gaya.</p>
				</div>
			</div>
		</div>

		<!-- Main Layout -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">

			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-7 shadow-xl backdrop-blur-md">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Format Options</h3>

				<div class="space-y-6">
					<!-- File Upload -->
					<div class="w-full">
						<div class="mb-2">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Load from File</span>
						</div>
						<FileUploadInput bind:this={fileUpload} onload={handleLoad} onerror={handleError} size="xs" />
					</div>

					<div class="h-px w-full bg-base-content/10"></div>

					<!-- Normal Cases -->
					<div class="space-y-2">
						<div class="mb-3">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Standard Text</span>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								onclick={() => applyCase('sentencecase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'sentencecase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								Sentence case
							</button>
							<button
								type="button"
								onclick={() => applyCase('titlecase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'titlecase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								Title Case
							</button>
							<button
								type="button"
								onclick={() => applyCase('lowercase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'lowercase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								<CaseLower size={14} /> lower case
							</button>
							<button
								type="button"
								onclick={() => applyCase('uppercase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'uppercase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								<CaseUpper size={14} /> UPPER CASE
							</button>
							<button
								type="button"
								onclick={() => applyCase('alternatingcase', input)}
								class="col-span-2 h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'alternatingcase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								aLtErNaTiNg cAsE
							</button>
						</div>
					</div>

					<div class="h-px w-full bg-base-content/10"></div>

					<!-- Programming Cases -->
					<div class="space-y-2">
						<div class="mb-3">
							<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Programming</span>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								onclick={() => applyCase('camelcase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'camelcase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								camelCase
							</button>
							<button
								type="button"
								onclick={() => applyCase('pascalcase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'pascalcase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								PascalCase
							</button>
							<button
								type="button"
								onclick={() => applyCase('snakecase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'snakecase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								<Hash size={14} class="opacity-50" /> snake_case
							</button>
							<button
								type="button"
								onclick={() => applyCase('kebabcase', input)}
								class="h-10 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all {activeCase === 'kebabcase' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200/40 border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
							>
								<Minus size={14} class="opacity-50" /> kebab-case
							</button>
						</div>
					</div>
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
							placeholder="Tulis atau paste teks Anda di sini..."
							rows={14}
							className="w-full h-full absolute inset-0 pt-14 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono"
						/>
					</div>

					<!-- Output Editor -->
					<div class="flex flex-col relative h-full min-h-[300px] bg-base-200/5">
						<div class="flex items-center justify-between border-b border-base-content/5 bg-base-200/30 h-14 px-4 z-10">
							<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output</span>
							<div class="flex items-center gap-2">
								<SaveFiles content={output} defaultName="case-converter-output.txt" />
								<ActionButton
									showSelectAll={false}
									showClear={false}
									showCopy={true}
									oncopy={copy}
								/>
							</div>
						</div>
						<div class="flex-1 relative flex flex-col h-full">
							{#if !output && !input}
								<div class="absolute inset-0 pt-14 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
									<Type size={40} strokeWidth={1} class="mb-3 opacity-50" />
									<p class="text-sm font-medium">Hasil konversi akan muncul di sini</p>
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
