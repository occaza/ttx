<script lang="ts">
	import { ActionButton, TextArea } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, Instagram, Sparkles, Wand2, Info, Check, Copy as CopyIcon } from '@lucide/svelte';

	let text = $state('');
	let isFormatted = $state(false);
	let copied = $state(false);

	let textAreaRef: TextArea;

	const INVISIBLE_CHAR = '\u2800';

	function handleLoad(content: string) {
		text = content;
	}

	function handleError(error: Error) {
		console.error(error);
	}

	function toggle() {
		if (isFormatted) {
			text = text.replaceAll(INVISIBLE_CHAR, '');
			isFormatted = false;
		} else {
			text = text.replace(/\n\n+/g, (match) => {
				const lineCount = match.length;
				let result = '\n';
				for (let i = 1; i < lineCount; i++) {
					result += INVISIBLE_CHAR + '\n';
				}
				return result;
			});
			isFormatted = true;
		}
	}

	function selectAll() {
		textAreaRef.select();
	}

	function clear() {
		text = '';
		isFormatted = false;
		copied = false;
	}

	function copyToClipboard() {
		if (!isFormatted) {
			toggle();
		}
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Caption Formatter - TEXY Workspace</title>
	<meta name="description" content="Format caption Instagram Anda dengan baris kosong yang benar. Buat caption lebih menarik dan mudah dibaca di Instagram." />
	<meta name="keywords" content="instagram caption, format caption, instagram formatter, caption tool, beautify caption, instagram tips" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/captions-formatter" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Caption Formatter - Format Caption Instagram" />
	<meta property="og:description" content="Format caption Instagram dengan baris kosong yang benar. Buat caption lebih menarik." />
	<meta property="og:url" content="{$page.url.origin}/text-tools/captions-formatter" />
	<meta property="og:image" content="{$page.url.origin}/assets/img/christopher-gower-_aXa21cf7rY-unsplash.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Caption Formatter - Format Caption Instagram" />
	<meta name="twitter:description" content="Format caption Instagram dengan baris kosong yang benar" />
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
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 text-pink-600 shadow-sm backdrop-blur-md">
					<Instagram size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Caption Formatter</h1>
					<p class="mt-1 text-sm text-base-content/50">Pertahankan baris kosong di caption Instagram agar lebih rapi dan mudah dibaca.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Guide Sidebar + Main Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-stretch lg:min-h-[560px]">
			
			<!-- Left Sidebar: Guide & Examples -->
			<div class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-6 shadow-xl backdrop-blur-md overflow-y-auto">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest flex items-center gap-2">
					<Info size={14} /> Panduan Penggunaan
				</h3>
				
				<div class="space-y-4 text-sm text-base-content/70">
					<ol class="space-y-3 relative border-l border-base-content/10 ml-2.5">
						<li class="pl-6 relative">
							<div class="absolute w-5 h-5 bg-base-200 rounded-full flex items-center justify-center -left-2.5 top-0 text-[10px] font-bold border border-base-content/10">1</div>
							<p><strong>Paste caption</strong> rancangan kamu ke dalam editor.</p>
						</li>
						<li class="pl-6 relative">
							<div class="absolute w-5 h-5 bg-base-200 rounded-full flex items-center justify-center -left-2.5 top-0 text-[10px] font-bold border border-base-content/10">2</div>
							<p>Klik tombol <strong class="text-primary">Format</strong> untuk menyisipkan karakter transparan pada baris kosong.</p>
						</li>
						<li class="pl-6 relative">
							<div class="absolute w-5 h-5 bg-base-200 rounded-full flex items-center justify-center -left-2.5 top-0 text-[10px] font-bold border border-base-content/10">3</div>
							<p>Klik <strong class="text-primary">Copy</strong> dan paste langsung ke Instagram!</p>
						</li>
					</ol>
				</div>

				<div class="divider my-0"></div>

				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest flex items-center gap-2">
					<Sparkles size={14} /> Contoh Perbandingan
				</h3>

				<div class="space-y-4">
					<div class="bg-base-200/50 rounded-xl p-3 border border-base-content/5">
						<p class="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-2">❌ Instagram Default (Beresiko menyatu)</p>
						<div class="font-mono text-xs text-base-content/60 bg-base-100 p-2 rounded-lg border border-base-content/5">
							Promo hari ini!<br><br><br>Klik link di bio.
						</div>
					</div>
					
					<div class="bg-primary/5 rounded-xl p-3 border border-primary/10">
						<p class="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">✨ After Format (Pasti terpisah)</p>
						<div class="font-mono text-xs text-base-content/80 bg-base-100 p-2 rounded-lg border border-base-content/5 relative">
							Promo hari ini!<br>
							<span class="text-primary/40 text-[10px] absolute left-2 top-5">[Karakter Transparan]</span><br>
							<span class="text-primary/40 text-[10px] absolute left-2 top-9">[Karakter Transparan]</span><br>
							Klik link di bio.
						</div>
					</div>
				</div>
			</div>

			<!-- Right Content: Unified Editor -->
			<div class="w-full flex-1 flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
				
				<!-- Top Toolbar -->
				<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
					<div class="flex items-center gap-3">
						<button type="button" class="btn btn-sm rounded-lg font-bold shadow-sm gap-1.5 transition-all {isFormatted ? 'btn-ghost border border-base-content/20' : 'btn-primary'}" onclick={toggle} disabled={!text}>
							<Wand2 size={14} class={isFormatted ? 'text-base-content/60' : ''} /> {isFormatted ? 'Reset Format' : 'Format IG'}
						</button>
						<button type="button" class="btn btn-sm rounded-lg font-bold shadow-sm gap-1.5 {copied ? 'bg-success text-success-content border-success hover:bg-success' : 'bg-base-100 border-base-content/20 hover:bg-base-200'}" onclick={copyToClipboard} disabled={!text}>
							{#if copied}
								<Check size={14} /> Copied!
							{:else}
								<CopyIcon size={14} /> Copy to IG
							{/if}
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

				<!-- Main Editor -->
				<div class="bg-base-100/50 flex-1 flex flex-col relative">
					<TextArea
						bind:this={textAreaRef}
						bind:value={text}
						placeholder="Paste caption Instagram kamu di sini...&#10;&#10;Baris kosong akan otomatis diformat!"
						rows={18}
						className="w-full flex-1 resize-none border-none bg-transparent p-5 text-base md:text-sm outline-none focus:ring-0 font-sans leading-relaxed min-h-[400px]"
					/>
				</div>

				<!-- Bottom Status Bar -->
				<div class="flex items-center justify-between border-t border-base-content/10 bg-base-200/10 px-4 py-2 rounded-b-2xl">
					<div class="flex gap-3 items-center">
						<span class="text-xs font-medium text-base-content/50 border-r border-base-content/10 pr-3">
							<strong class="text-base-content">{text.length}</strong> characters
						</span>
						{#if isFormatted}
							<span class="badge badge-sm badge-success badge-soft gap-1 border-none bg-success/10 text-success font-bold text-[10px] uppercase tracking-wider">
								<Sparkles size={10} /> Formatted
							</span>
						{/if}
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
