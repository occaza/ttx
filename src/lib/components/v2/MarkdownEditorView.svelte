<script lang="ts">
	import { browser } from '$app/environment';
	import {
		FileText,
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
		Code,
		Copy,
		Check,
		Trash2,
		Download,
		BookOpen
	} from '@lucide/svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let { isDark = true }: { isDark?: boolean } = $props();

	const DEFAULT_MARKDOWN = `# Welcome to TEXY Markdown Editor

This editor allows you to format text easily using the toolbar above.
Try clicking the **Bold** or *Italic* buttons!

## Features
- **Live Preview** in real-time
- Comprehensive **Formatting Toolbar**
- Dark & Light mode optimized

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext documents.

| Tool | Category | Status |
| :--- | :--- | :--- |
| Case Converter | Text Operations | Embedded |
| Regex Tool | Text Operations | Embedded |
| Markdown Editor | Text Operations | Embedded |

\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name + "!");
}
greet("World");
\`\`\`
`;

	let input = $state(DEFAULT_MARKDOWN);
	let activeTab = $state<'editor' | 'preview'>('editor');
	let copied = $state(false);
	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let previewEl: HTMLDivElement | null = $state(null);

	let isSyncingFromEditor = false;
	let isSyncingFromPreview = false;

	const compiledHtml = $derived.by(() => {
		if (!browser || !input) return '';
		return DOMPurify.sanitize(marked.parse(input) as string);
	});

	function syncScrollFromEditor() {
		if (!textareaEl || !previewEl || isSyncingFromPreview) return;
		isSyncingFromEditor = true;
		const ratio = textareaEl.scrollTop / (textareaEl.scrollHeight - textareaEl.clientHeight || 1);
		previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight);
		requestAnimationFrame(() => {
			isSyncingFromEditor = false;
		});
	}

	function syncScrollFromPreview() {
		if (!textareaEl || !previewEl || isSyncingFromEditor) return;
		isSyncingFromPreview = true;
		const ratio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
		textareaEl.scrollTop = ratio * (textareaEl.scrollHeight - textareaEl.clientHeight);
		requestAnimationFrame(() => {
			isSyncingFromPreview = false;
		});
	}

	function insertFormat(prefix: string, suffix: string = '') {
		if (!textareaEl) return;

		const start = textareaEl.selectionStart;
		const end = textareaEl.selectionEnd;
		const text = input.substring(start, end);
		const before = input.substring(0, start);
		const after = input.substring(end);

		const defaultText = text || (suffix ? 'text' : '');
		input = before + prefix + defaultText + suffix + after;

		setTimeout(() => {
			textareaEl?.focus();
			textareaEl?.setSelectionRange(
				start + prefix.length,
				start + prefix.length + defaultText.length
			);
		}, 0);
	}

	function handleBold() {
		insertFormat('**', '**');
	}
	function handleItalic() {
		insertFormat('*', '*');
	}
	function handleHeading() {
		insertFormat('### ', '');
	}
	function handleStrikethrough() {
		insertFormat('~~', '~~');
	}
	function handleQuote() {
		insertFormat('> ', '');
	}
	function handleUl() {
		insertFormat('- ', '');
	}
	function handleOl() {
		insertFormat('1. ', '');
	}
	function handleCode() {
		insertFormat('`', '`');
	}
	function handleCodeBlock() {
		insertFormat('\n```\n', '\n```\n');
	}
	function handleLink() {
		insertFormat('[', '](https://)');
	}
	function handleImage() {
		insertFormat('![alt text](', 'https://example.com/image.jpg)');
	}
	function handleTable() {
		insertFormat('\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n', '');
	}
	function handleHr() {
		insertFormat('\n---\n', '');
	}

	async function copyMarkdown() {
		if (!input) return;
		await navigator.clipboard.writeText(input);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function downloadMarkdown() {
		if (!input) return;
		const blob = new Blob([input], { type: 'text/markdown;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'document.md';
		a.click();
		URL.revokeObjectURL(url);
	}

	function clearAll() {
		input = '';
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
					: 'border-blue-200 bg-blue-50 text-blue-600'}"
			>
				<FileText size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
					Markdown Editor
				</h1>
				<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
					Editor Markdown dengan toolbar pemformatan dan live preview
				</p>
			</div>
		</div>

		<!-- Top Quick Actions -->
		<div class="flex items-center gap-2">
			{#if input}
				<button
					type="button"
					onclick={downloadMarkdown}
					class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:border-slate-600 hover:text-white'
						: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
				>
					<Download size={13} />
					<span class="hidden sm:inline">Export .md</span>
				</button>
				<button
					type="button"
					onclick={copyMarkdown}
					class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all {copied
						? isDark
							? 'bg-green-500/20 text-green-300'
							: 'bg-green-100 text-green-700'
						: isDark
							? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
							: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
				>
					{#if copied}
						<Check size={13} /> Tersalin!
					{:else}
						<Copy size={13} /> Salin MD
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<!-- Main Card Container -->
	<div
		class="flex flex-1 flex-col overflow-hidden rounded-xl border {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<!-- Formatting Toolbar -->
		<div
			class="flex flex-wrap items-center gap-1 border-b p-2 {isDark
				? 'border-[#1a253c] bg-[#10192d]'
				: 'border-slate-200 bg-slate-50'}"
		>
			<button
				type="button"
				onclick={handleBold}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Tebal (Bold)"
			>
				<Bold size={15} />
			</button>
			<button
				type="button"
				onclick={handleItalic}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Miring (Italic)"
			>
				<Italic size={15} />
			</button>
			<button
				type="button"
				onclick={handleHeading}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Heading"
			>
				<Heading size={15} />
			</button>
			<button
				type="button"
				onclick={handleStrikethrough}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Coret (Strikethrough)"
			>
				<Strikethrough size={15} />
			</button>

			<div class="mx-1 h-4 w-px {isDark ? 'bg-slate-800' : 'bg-slate-300'}"></div>

			<button
				type="button"
				onclick={handleQuote}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Kutipan (Quote)"
			>
				<Quote size={15} />
			</button>
			<button
				type="button"
				onclick={handleUl}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Daftar Poin (List)"
			>
				<List size={15} />
			</button>
			<button
				type="button"
				onclick={handleOl}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Daftar Nomor"
			>
				<ListOrdered size={15} />
			</button>

			<div class="mx-1 h-4 w-px {isDark ? 'bg-slate-800' : 'bg-slate-300'}"></div>

			<button
				type="button"
				onclick={handleCode}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Kode Sebaris (Inline Code)"
			>
				<span class="font-mono text-xs font-bold">&lt;&gt;</span>
			</button>
			<button
				type="button"
				onclick={handleCodeBlock}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Blok Kode (Code Block)"
			>
				<Code size={15} />
			</button>
			<button
				type="button"
				onclick={handleLink}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Tautan (Link)"
			>
				<Link size={15} />
			</button>
			<button
				type="button"
				onclick={handleImage}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Gambar (Image)"
			>
				<ImageIcon size={15} />
			</button>
			<button
				type="button"
				onclick={handleTable}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Tabel (Table)"
			>
				<Table size={15} />
			</button>
			<button
				type="button"
				onclick={handleHr}
				class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isDark
					? 'text-slate-300 hover:bg-[#182542] hover:text-white'
					: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				title="Garis Pemisah (Horizontal Rule)"
			>
				<Minus size={15} />
			</button>

			{#if input}
				<button
					type="button"
					onclick={clearAll}
					class="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
					title="Kosongkan Teks"
				>
					<Trash2 size={12} /> Clear
				</button>
			{/if}
		</div>

		<!-- Mobile Tabs Bar -->
		<div
			class="flex border-b text-xs font-semibold sm:hidden {isDark
				? 'border-[#1a253c] bg-[#0c1424]'
				: 'border-slate-200 bg-slate-100'}"
		>
			<button
				type="button"
				onclick={() => (activeTab = 'editor')}
				class="flex-1 py-2 text-center transition-colors {activeTab === 'editor'
					? isDark
						? 'border-b-2 border-blue-500 text-blue-400 bg-blue-600/10'
						: 'border-b-2 border-blue-600 text-blue-600 bg-white'
					: isDark
						? 'text-slate-400'
						: 'text-slate-600'}"
			>
				Editor
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'preview')}
				class="flex-1 py-2 text-center transition-colors {activeTab === 'preview'
					? isDark
						? 'border-b-2 border-blue-500 text-blue-400 bg-blue-600/10'
						: 'border-b-2 border-blue-600 text-blue-600 bg-white'
					: isDark
						? 'text-slate-400'
						: 'text-slate-600'}"
			>
				Preview
			</button>
		</div>

		<!-- Split View: Editor & Live Preview -->
		<div class="grid min-h-[460px] flex-1 grid-cols-1 sm:grid-cols-2">
			<!-- Editor Pane -->
			<div
				class="flex flex-col sm:border-r {activeTab === 'editor' ? 'flex' : 'hidden sm:flex'} {isDark
					? 'border-[#1a253c]'
					: 'border-slate-200'}"
			>
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					onscroll={syncScrollFromEditor}
					placeholder="Ketik Markdown di sini..."
					rows={20}
					class="w-full flex-1 resize-none p-4 font-mono text-xs leading-relaxed outline-none sm:text-sm {isDark
						? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
						: 'bg-white text-slate-800 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- Preview Pane -->
			<div
				class="flex flex-col overflow-hidden {activeTab === 'preview'
					? 'flex'
					: 'hidden sm:flex'} {isDark ? 'bg-[#080f1d]' : 'bg-slate-50'}"
			>
				<div
					bind:this={previewEl}
					onscroll={syncScrollFromPreview}
					class="flex-1 overflow-y-auto p-5 sm:p-6"
				>
					{#if !input || !compiledHtml}
						<div
							class="pointer-events-none flex h-full flex-col items-center justify-center p-6 text-center {isDark
								? 'text-slate-700'
								: 'text-slate-300'}"
						>
							<BookOpen size={36} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Preview dokumen Markdown akan muncul di sini</p>
						</div>
					{:else}
						<div
							class="prose max-w-none text-xs leading-relaxed sm:text-sm {isDark
								? 'prose-invert text-slate-200 prose-headings:text-white prose-a:text-blue-400 prose-code:text-cyan-300 prose-pre:bg-[#111a2f] prose-pre:border prose-pre:border-[#1e2e50]'
								: 'text-slate-800 prose-headings:text-slate-900 prose-a:text-blue-600 prose-code:text-indigo-600 prose-pre:bg-slate-100'}"
						>
							{@html compiledHtml}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

