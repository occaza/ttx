<script lang="ts">
	import { TextArea, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import {
		ArrowLeft,
		Bold,
		Italic,
		Heading,
		Strikethrough,
		Quote,
		List,
		ListOrdered,
		Link,
		Image as ImageIcon,
		Table,
		Minus,
		BookOpen,
		Code
	} from '@lucide/svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let input = $state(`# Welcome to Markdown Editor

This editor allows you to format text easily using the toolbar above.
Try clicking the **Bold** or *Italic* buttons!

## Features
- Live Preview
- Formatting Toolbar
- Export to Markdown or HTML

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

| Feature | Support |
|---------|---------|
| Tables  | Yes     |
| Lists   | Yes     |
| Images  | Yes     |
`);

	let inputTextarea: TextArea | undefined;
	let previewEl: HTMLDivElement | undefined;
	let activeTab = $state<'editor' | 'preview'>('editor');

	let isSyncingFromEditor = false;
	let isSyncingFromPreview = false;

	const compiledHtml = $derived.by(() => {
		if (!browser || !input) return '';
		return DOMPurify.sanitize(marked.parse(input) as string);
	});

	function syncScrollFromEditor() {
		const el = inputTextarea?.getElement();
		if (!el || !previewEl || isSyncingFromPreview) return;
		isSyncingFromEditor = true;
		const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
		previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight);
		requestAnimationFrame(() => { isSyncingFromEditor = false; });
	}

	function syncScrollFromPreview() {
		const el = inputTextarea?.getElement();
		if (!el || !previewEl || isSyncingFromEditor) return;
		isSyncingFromPreview = true;
		const ratio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
		el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
		requestAnimationFrame(() => { isSyncingFromPreview = false; });
	}

	function insertFormat(prefix: string, suffix: string = '') {
		const el = inputTextarea?.getElement();
		if (!el) return;

		const start = el.selectionStart;
		const end = el.selectionEnd;
		const text = input.substring(start, end);
		const before = input.substring(0, start);
		const after = input.substring(end);

		const defaultText = text || (suffix ? 'text' : '');
		input = before + prefix + defaultText + suffix + after;

		setTimeout(() => {
			el.focus();
			el.setSelectionRange(start + prefix.length, start + prefix.length + defaultText.length);
		}, 0);
	}

	function handleBold() { insertFormat('**', '**'); }
	function handleItalic() { insertFormat('_', '_'); }
	function handleHeading() { insertFormat('### ', ''); }
	function handleStrikethrough() { insertFormat('~~', '~~'); }
	function handleQuote() { insertFormat('> ', ''); }
	function handleUl() { insertFormat('- ', ''); }
	function handleOl() { insertFormat('1. ', ''); }
	function handleLink() { insertFormat('[', '](https://)'); }
	function handleImage() { insertFormat('![alt text](', 'image-url.jpg)'); }
	function handleCode() { insertFormat('`', '`'); }
	function handleCodeBlock() { insertFormat('\n```\n', '\n```\n'); }
	function handleTable() {
		insertFormat('\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n', '');
	}
	function handleHr() { insertFormat('\n---\n', ''); }
</script>

<svelte:head>
	<title>Markdown Editor - TEXY Workspace</title>
	<meta
		name="description"
		content="Markdown Editor lengkap dengan toolbar formatting dan live preview."
	/>
	<meta name="keywords" content="markdown editor, online markdown, wysisyg markdown" />
	<link rel="canonical" href="{$page.url.origin}/markdown-editor" />
</svelte:head>

<div class="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-base-200/30 font-sans text-base-content">
	<div class="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-4 md:px-8 md:py-6">
		<!-- Header -->
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a
					href="/"
					class="btn btn-square btn-ghost btn-sm text-base-content/50 hover:text-base-content"
					title="Kembali ke Beranda"
				>
					<ArrowLeft size={18} />
				</a>
				<h1 class="text-xl font-bold tracking-tight">Markdown Editor</h1>
			</div>
			<div class="flex items-center gap-2">
				<SaveFiles content={input} defaultName="document.md" />
			</div>
		</div>

		<!-- Editor Main Container -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-xl">
			<!-- Toolbar -->
			<div class="flex flex-wrap items-center gap-1 border-b border-base-content/10 bg-base-200/50 px-2 py-2">
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleBold} title="Bold">
					<Bold size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleItalic} title="Italic">
					<Italic size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleHeading} title="Heading">
					<Heading size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleStrikethrough} title="Strikethrough">
					<Strikethrough size={16} />
				</button>

				<div class="mx-1 h-5 w-px bg-base-content/10"></div>

				<button class="btn btn-square btn-ghost btn-sm" onclick={handleQuote} title="Blockquote">
					<Quote size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleUl} title="Bulleted List">
					<List size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleOl} title="Numbered List">
					<ListOrdered size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleCodeBlock} title="Code Block">
					<Code size={16} />
				</button>

				<div class="mx-1 h-5 w-px bg-base-content/10"></div>

				<button class="btn btn-square btn-ghost btn-sm" onclick={handleLink} title="Link">
					<Link size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleImage} title="Image">
					<ImageIcon size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleTable} title="Table">
					<Table size={16} />
				</button>
				<button class="btn btn-square btn-ghost btn-sm" onclick={handleHr} title="Horizontal Rule">
					<Minus size={16} />
				</button>
			</div>

			<!-- Mobile Tabs -->
			<div class="flex border-b border-base-content/10 lg:hidden">
				<button
					class="flex-1 py-2 text-sm font-medium transition-colors {activeTab === 'editor'
						? 'border-b-2 border-primary text-primary'
						: 'text-base-content/60 hover:text-base-content'}"
					onclick={() => (activeTab = 'editor')}
				>
					Editor
				</button>
				<button
					class="flex-1 py-2 text-sm font-medium transition-colors {activeTab === 'preview'
						? 'border-b-2 border-primary text-primary'
						: 'text-base-content/60 hover:text-base-content'}"
					onclick={() => (activeTab = 'preview')}
				>
					Preview
				</button>
			</div>

			<!-- Content Area -->
			<div class="grid flex-1 grid-cols-1 divide-y divide-base-content/10 overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-y-0">
				<!-- Editor Pane -->
				<div class="flex flex-col overflow-hidden {activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}">
					<TextArea
						bind:this={inputTextarea}
						bind:value={input}
						placeholder="Tulis markdown di sini..."
						rows={20}
						onscroll={syncScrollFromEditor}
						className="w-full flex-1 overflow-y-auto resize-none border-none bg-base-100/50 p-5 text-base md:text-[14px] leading-relaxed outline-none focus:ring-0 font-mono text-base-content/90"
					/>
				</div>

				<!-- Preview Pane -->
				<div class="flex flex-col overflow-hidden bg-base-100 {activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}">
					<div
						bind:this={previewEl}
						class="custom-scrollbar flex-1 overflow-y-auto p-6 lg:p-8"
						onscroll={syncScrollFromPreview}
					>
						{#if !input || !compiledHtml}
							<div class="pointer-events-none flex h-full flex-col items-center justify-center text-base-content/20">
								<BookOpen size={40} strokeWidth={1} class="mb-3 opacity-50" />
								<p class="text-sm font-medium">Preview akan muncul di sini</p>
							</div>
						{:else}
							<div class="prose-base-content prose prose-sm max-w-none md:prose-base">
								{@html compiledHtml}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
