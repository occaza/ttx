<script lang="ts">
	import { ActionButton, TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Dices } from '@lucide/svelte';

	let qty = $state(10);
	let min = $state(0);
	let max = $state(1000);
	let prefix = $state('');
	let suffix = $state('');
	let padOn = $state(false);
	let output = $state('');

	let outputTextarea: TextArea;

	function selectAll() {
		outputTextarea.select();
	}

	function clear() {
		output = '';
	}

	function copy() {
		navigator.clipboard.writeText(output);
	}

	function digits(n: number): number {
		return n.toString().length;
	}

	function generate() {
		const list: string[] = [];
		const padLen = padOn ? digits(max) : 0;
		for (let i = 0; i < qty; i++) {
			const raw = Math.floor(Math.random() * (max - min + 1)) + min;
			const padded = padLen > 0 ? raw.toString().padStart(padLen, '0') : raw.toString();
			list.push(prefix + padded + suffix);
		}
		output = list.join('\n');
	}
</script>

<svelte:head>
	<title>Random Number Generator - TEXY Workspace</title>
	<meta
		name="description"
		content="Generate angka acak dengan range dan jumlah yang bisa dikustomisasi. Tambahkan prefix, suffix, dan padding angka."
	/>
	<meta
		name="keywords"
		content="random number, number generator, random generator, angka acak, generate number, random tool"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/random-number-generator" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Random Number Generator - Text Tools" />
	<meta
		property="og:description"
		content="Generate angka acak dengan range dan jumlah yang bisa dikustomisasi"
	/>
	<meta property="og:url" content="https://yoursite.com/text-tools/random-number-generator" />
	<meta
		property="og:image"
		content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg"
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Random Number Generator - Text Tools" />
	<meta
		name="twitter:description"
		content="Generate angka acak dengan range dan jumlah yang bisa dikustomisasi"
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
					<Dices size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Random Number</h1>
					<p class="mt-1 text-sm text-base-content/50">Generate sekumpulan angka acak dengan rentang dan format kustom.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Sidebar Settings + Main Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">
			
			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-6 shadow-xl backdrop-blur-md">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Configuration</h3>
				
				<div class="space-y-6">
					
					<label class="form-control w-full">
						<div class="label px-1 pt-0 pb-1.5"><span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Quantity</span></div>
						<input type="number" bind:value={qty} min="1" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm shadow-sm" />
					</label>

					<!-- Range (Side-by-side) -->
					<div class="grid grid-cols-2 gap-4">
						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5"><span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Min</span></div>
							<input type="number" bind:value={min} class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm shadow-sm" />
						</label>

						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5"><span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Max</span></div>
							<input type="number" bind:value={max} class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm shadow-sm" />
						</label>
					</div>

					<!-- Affixes (Side-by-side) -->
					<div class="grid grid-cols-2 gap-4">
						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5">
								<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Prefix</span>
							</div>
							<input type="text" bind:value={prefix} placeholder="e.g. ID-" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" />
						</label>

						<label class="form-control w-full">
							<div class="label px-1 pt-0 pb-1.5">
								<span class="label-text text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Suffix</span>
							</div>
							<input type="text" bind:value={suffix} placeholder="Optional" class="input input-sm h-10 px-3 input-bordered border-base-content/10 rounded-xl bg-base-200/30 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" />
						</label>
					</div>
					
					<!-- Toggles -->
					<label class="flex cursor-pointer items-center gap-3 px-1 pt-2 group">
						<input type="checkbox" class="checkbox checkbox-sm rounded-md border-base-content/20 bg-base-200/30 checked:border-primary transition-colors" bind:checked={padOn} />
						<div class="flex flex-col">
							<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Pad Numbers</span>
							<span class="text-[10px] text-base-content/40">Adds leading zeros to match Max length</span>
						</div>
					</label>
				</div>

				<div class="mt-auto pt-6 border-t border-base-content/10">
					<button class="btn btn-primary w-full rounded-xl shadow-lg hover:scale-[1.02] transition-all font-bold gap-2 h-12" onclick={generate}>
						<Dices size={18} fill="currentColor" />
						Generate
					</button>
				</div>
			</div>

			<!-- Right Content: Output Editor -->
			<div class="w-full flex-1 flex flex-col gap-6">
				
				<!-- Unified Editor -->
				<div class="flex flex-col flex-1 rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
					<!-- Top Toolbar -->
					<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
						<div class="flex items-center gap-3">
							<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output</span>
						</div>
						<div class="flex items-center gap-2">
							<SaveFiles content={output} defaultName="random.txt" />
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
					<!-- Main Editor -->
					<div class="bg-base-100/50 flex-1 flex flex-col relative rounded-b-2xl">
						{#if !output}
							<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
								<Dices size={48} strokeWidth={1} class="mb-4 opacity-50" />
								<p class="text-sm font-medium">No numbers generated yet</p>
							</div>
						{/if}
						<TextArea
							bind:this={outputTextarea}
							bind:value={output}
							placeholder=""
							rows={18}
							readonly={true}
							className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-mono lg:min-h-[400px] {output ? 'text-base-content/80' : ''}"
						/>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
