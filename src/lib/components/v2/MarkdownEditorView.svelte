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

<div class="flex flex-col gap-4 flex-1">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
			>
				<FileText size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">
					Markdown Editor
				</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
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
					class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] transition-all hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]"
				>
					<Download size={13} />
					<span class="hidden sm:inline">Export .md</span>
				</button>
				<button
					type="button"
					onclick={copyMarkdown}
					class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all {copied
						? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
						: 'bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95'}"
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
		class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs"
	>
		<!-- Formatting Toolbar -->
		<div
			class="flex flex-wrap items-center gap-1 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-2"
		>
			<button
				type="button"
				onclick={handleBold}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Tebal (Bold)"
			>
				<Bold size={15} />
			</button>
			<button
				type="button"
				onclick={handleItalic}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Miring (Italic)"
			>
				<Italic size={15} />
			</button>
			<button
				type="button"
				onclick={handleHeading}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Heading"
			>
				<Heading size={15} />
			</button>
			<button
				type="button"
				onclick={handleStrikethrough}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Coret (Strikethrough)"
			>
				<Strikethrough size={15} />
			</button>

			<div class="mx-1 h-4 w-px bg-[var(--ttx-border-base)]"></div>

			<button
				type="button"
				onclick={handleQuote}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Kutipan (Quote)"
			>
				<Quote size={15} />
			</button>
			<button
				type="button"
				onclick={handleUl}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Daftar Poin (List)"
			>
				<List size={15} />
			</button>
			<button
				type="button"
				onclick={handleOl}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Daftar Nomor"
			>
				<ListOrdered size={15} />
			</button>

			<div class="mx-1 h-4 w-px bg-[var(--ttx-border-base)]"></div>

			<button
				type="button"
				onclick={handleCode}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Kode Sebaris (Inline Code)"
			>
				<span class="font-mono text-xs font-bold">&lt;&gt;</span>
			</button>
			<button
				type="button"
				onclick={handleCodeBlock}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Blok Kode (Code Block)"
			>
				<Code size={15} />
			</button>
			<button
				type="button"
				onclick={handleLink}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Tautan (Link)"
			>
				<Link size={15} />
			</button>
			<button
				type="button"
				onclick={handleImage}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Gambar (Image)"
			>
				<ImageIcon size={15} />
			</button>
			<button
				type="button"
				onclick={handleTable}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Tabel (Table)"
			>
				<Table size={15} />
			</button>
			<button
				type="button"
				onclick={handleHr}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] hover:text-[var(--ttx-text-main)] transition-colors"
				title="Garis Pemisah (Horizontal Rule)"
			>
				<Minus size={15} />
			</button>

			{#if input}
				<button
					type="button"
					onclick={clearAll}
					class="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--ttx-text-dim)] transition-colors hover:text-rose-500 hover:bg-rose-500/10"
					title="Kosongkan Teks"
				>
					<Trash2 size={12} /> Clear
				</button>
			{/if}
		</div>

		<!-- Mobile Tabs Bar -->
		<div
			class="flex border-b border-[var(--ttx-border-base)] text-xs font-semibold sm:hidden bg-[var(--ttx-bg-card-subtle)]"
		>
			<button
				type="button"
				onclick={() => (activeTab = 'editor')}
				class="flex-1 py-2 text-center transition-colors {activeTab === 'editor'
					? 'border-b-2 border-[var(--ttx-accent)] text-[var(--ttx-accent-text)] bg-[var(--ttx-accent-light)]'
					: 'text-[var(--ttx-text-muted)]'}"
			>
				Editor
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'preview')}
				class="flex-1 py-2 text-center transition-colors {activeTab === 'preview'
					? 'border-b-2 border-[var(--ttx-accent)] text-[var(--ttx-accent-text)] bg-[var(--ttx-accent-light)]'
					: 'text-[var(--ttx-text-muted)]'}"
			>
				Preview
			</button>
		</div>

		<!-- Split View: Editor & Live Preview -->
		<div class="grid min-h-[460px] flex-1 grid-cols-1 sm:grid-cols-2">
			<!-- Editor Pane -->
			<div
				class="flex flex-col sm:border-r border-[var(--ttx-border-base)] {activeTab === 'editor' ? 'flex' : 'hidden sm:flex'}"
			>
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					onscroll={syncScrollFromEditor}
					placeholder="Ketik Markdown di sini..."
					rows={20}
					class="w-full flex-1 resize-none p-4 font-mono text-xs leading-relaxed outline-none sm:text-sm bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				></textarea>
			</div>

			<!-- Preview Pane -->
			<div
				class="flex flex-col overflow-hidden bg-[var(--ttx-bg-card-subtle)] {activeTab === 'preview'
					? 'flex'
					: 'hidden sm:flex'}"
			>
				<div
					bind:this={previewEl}
					onscroll={syncScrollFromPreview}
					class="flex-1 overflow-y-auto p-5 sm:p-6"
				>
					{#if !input || !compiledHtml}
						<div
							class="pointer-events-none flex h-full flex-col items-center justify-center p-6 text-center text-[var(--ttx-text-dim)]"
						>
							<BookOpen size={36} strokeWidth={1} class="mb-2 opacity-40" />
							<p class="text-xs">Preview dokumen Markdown akan muncul di sini</p>
						</div>
					{:else}
						<div
							class="prose max-w-none text-xs leading-relaxed sm:text-sm text-[var(--ttx-text-main)] prose-headings:text-[var(--ttx-text-main)] prose-a:text-[var(--ttx-accent-text)] prose-code:text-[var(--ttx-accent-text)] prose-pre:bg-[var(--ttx-bg-input)] prose-pre:border prose-pre:border-[var(--ttx-border-subtle)]"
						>
							{@html compiledHtml}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

