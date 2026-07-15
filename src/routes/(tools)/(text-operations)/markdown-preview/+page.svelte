<script lang="ts">
	import { ActionButton, TextArea, FileUploadInput, SaveFiles } from '$lib';
	import { page } from '$app/stores';
	import { ArrowLeft, BookOpen, Code, FileText, ChevronDown } from '@lucide/svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let input = $state(`# Heading 1 — Judul Utama
## Heading 2 — Sub Judul
### Heading 3 — Sub Sub Judul
#### Heading 4 — Level 4

---

## Emphasis (Penekanan Teks)

Ini teks **bold** (tebal), ini *italic* (miring), dan ini ~~strikethrough~~ (dicoret).

Gabungan: **_Bold dan Italic sekaligus_**

---

## Lists (Daftar)

**Unordered (Tanpa Nomor):**
- Item pertama
- Item kedua
  - Sub item bersarang
  - Sub item lainnya
- Item ketiga

**Ordered (Bernomor):**
1. Langkah pertama
2. Langkah kedua
3. Langkah ketiga

**Checkbox / Task List:**
- [x] Tugas yang sudah selesai
- [ ] Tugas yang belum selesai
- [ ] Tugas lainnya

---

## Links & Images

[Kunjungi Google](https://www.google.com)

[Link dengan tooltip](https://www.google.com "Klik untuk membuka Google")

Autolink: <https://www.example.com>

Gambar dari URL:
![Logo SVG](https://www.svgrepo.com/show/366486/text-markdown.svg)

---

## Code (Kode)

Inline code: gunakan \`npm install\` untuk install package.

Code block dengan syntax highlight:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

\`\`\`bash
npm run dev
\`\`\`

---

## Blockquote

> "Markdown adalah cara yang elegan untuk menulis dokumen terformat."
> — John Gruber

Blockquote bertingkat:
> Level 1
> > Level 2 (nested)

---

## Tabel

| Nama       | Umur | Kota       |
|------------|------|------------|
| Budi       | 25   | Jakarta    |
| Sari       | 30   | Bandung    |
| Ahmad      | 22   | Surabaya   |

---

## Horizontal Rule

Garis pemisah bisa dibuat dengan tiga strip:

---

## Kombinasi

> **Catatan:** Markdown mendukung **penggabungan** berbagai elemen.
> 
> - Bisa pakai *italic* di dalam list
> - Atau \`inline code\` di dalam blockquote
`);
	let fileUpload: FileUploadInput;
	let inputTextarea: TextArea | undefined;

	let openSection = $state<string | null>(null);

	function toggleSection(name: string) {
		openSection = openSection === name ? null : name;
	}

	const syntaxGroups = [
		{
			name: 'Headings',
			items: ['# H1', '## H2', '### H3', '#### H4']
		},
		{
			name: 'Emphasis',
			items: ['**Bold**', '*Italic*', '~~Strikethrough~~', '**_Bold Italic_**']
		},
		{
			name: 'Lists',
			items: [
				'- Unordered item',
				'1. Ordered item',
				'  - Nested item',
				'- [ ] Checkbox',
				'- [x] Checked'
			]
		},
		{
			name: 'Links & Images',
			items: ['[Text](url)', '[Text](url "Tip")', '![Alt](image-url)', '<https://url>']
		},
		{
			name: 'Code',
			items: ['`Inline code`', '```js', 'Code block', '```']
		},
		{
			name: 'Other',
			items: ['> Blockquote', '--- (HR)', '| Col1 | Col2 |', '|------|------|', '| Val1 | Val2 |']
		}
	];

	const compiledHtml = $derived(input ? DOMPurify.sanitize(marked.parse(input) as string) : '');

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
		if (fileUpload) fileUpload.reset();
	}
</script>

<svelte:head>
	<title>Markdown Live Preview - TEXY Workspace</title>
	<meta
		name="description"
		content="Edit markdown secara langsung dengan fitur live preview. Tulis markdown dan lihat hasilnya secara real-time."
	/>
	<meta
		name="keywords"
		content="markdown editor, live preview markdown, online markdown, edit md file"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/markdown-preview" />
</svelte:head>

<div
	class="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-base-100 font-sans text-base-content"
>
	<!-- Grid Background Pattern -->
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
		<!-- Header -->
		<div class="mb-8">
			<a
				href="/"
				class="mb-5 inline-flex items-center text-sm font-medium text-base-content/40 transition-colors hover:text-base-content"
			>
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md"
				>
					<BookOpen size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Markdown Preview</h1>
					<p class="mt-1 text-sm text-base-content/50">
						Editor Markdown online dengan live preview langsung di sebelah kanan.
					</p>
				</div>
			</div>
		</div>

		<!-- Main Layout -->
		<div
			class="flex min-h-[600px] flex-col items-stretch gap-6 lg:h-[calc(100vh-16rem)] lg:flex-row"
		>
			<!-- Left Sidebar: Settings -->
			<div
				class="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-base-content/10 bg-base-100/80 p-6 shadow-xl backdrop-blur-md lg:w-72"
			>
				<h3
					class="mb-6 flex-shrink-0 text-xs font-bold tracking-widest text-base-content/40 uppercase"
				>
					Options
				</h3>

				<div class="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto">
					<!-- File Upload -->
					<div class="w-full">
						<div class="mb-2">
							<span class="text-[11px] font-bold tracking-widest text-base-content/40 uppercase"
								>Load Markdown (.md)</span
							>
						</div>
						<FileUploadInput
							bind:this={fileUpload}
							onload={handleLoad}
							onerror={handleError}
							size="xs"
						/>
					</div>

					<div class="h-px w-full bg-base-content/10"></div>

					<!-- Export Options -->
					<div class="w-full">
						<div class="mb-3">
							<span class="text-[11px] font-bold tracking-widest text-base-content/40 uppercase"
								>Export Result</span
							>
						</div>
						<div class="flex flex-col gap-3">
							<div>
								<p class="mb-1 text-[10px] font-medium text-base-content/30">Markdown File (.md)</p>
								<SaveFiles content={input} defaultName="document.md" />
							</div>
							<div>
								<p class="mb-1 text-[10px] font-medium text-base-content/30">
									Compiled HTML (.html)
								</p>
								<SaveFiles content={compiledHtml} defaultName="document.html" />
							</div>
						</div>
					</div>

					<!-- Syntax Guide accordion -->
					<div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
						<h4 class="mb-3 flex items-center gap-1.5 text-xs font-bold text-primary">
							<Code size={14} /> Syntax Guide
						</h4>
						<div class="flex flex-col divide-y divide-primary/10">
							{#each syntaxGroups as group}
								<div>
									<button
										type="button"
										class="flex w-full items-center justify-between py-2 text-[10px] font-bold tracking-widest text-base-content/50 uppercase transition-colors hover:text-primary"
										onclick={() => toggleSection(group.name)}
									>
										{group.name}
										<ChevronDown
											size={12}
											class="transition-transform duration-200 {openSection === group.name
												? 'rotate-180'
												: ''}"
										/>
									</button>
									{#if openSection === group.name}
										<ul class="space-y-1 pb-3 font-mono text-[10px] text-base-content/60">
											{#each group.items as item}
												<li class="pl-1">{item}</li>
											{/each}
										</ul>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Unified Split Editor -->
			<div
				class="flex h-full w-full flex-1 flex-col overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md"
			>
				<div
					class="grid h-full flex-1 grid-cols-1 divide-y divide-base-content/10 bg-base-100/50 lg:grid-cols-2 lg:divide-x lg:divide-y-0"
				>
					<!-- Input Editor -->
					<div class="relative flex h-full min-h-[300px] flex-col">
						<div
							class="flex h-14 items-center justify-between border-b border-base-content/5 bg-base-200/20 px-4"
						>
							<span
								class="flex items-center gap-1.5 text-xs font-bold tracking-widest text-base-content/40 uppercase"
								><FileText size={14} /> Editor</span
							>
							<ActionButton
								showSelectAll={true}
								showClear={true}
								showCopy={false}
								onselectall={selectAll}
								onclear={clear}
							/>
						</div>
						<div class="relative flex-1">
							<TextArea
								bind:this={inputTextarea}
								bind:value={input}
								placeholder="Tulis markdown di sini..."
								rows={20}
								className="w-full h-full absolute inset-0 resize-none border-none bg-transparent p-5 text-base md:text-[13px] leading-relaxed outline-none focus:ring-0 font-mono text-base-content/90"
							/>
						</div>
					</div>

					<!-- Output Preview -->
					<div class="relative flex h-full min-h-[300px] flex-col bg-base-100">
						<div
							class="z-10 flex h-14 items-center justify-between border-b border-base-content/5 bg-base-200/10 px-4"
						>
							<span
								class="flex items-center gap-1.5 text-xs font-bold tracking-widest text-base-content/40 uppercase"
								><BookOpen size={14} /> Preview</span
							>
						</div>
						<div class="custom-scrollbar relative flex-1 overflow-y-auto p-6 lg:p-8">
							{#if !input}
								<div
									class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-base-content/20"
								>
									<BookOpen size={40} strokeWidth={1} class="mb-3 opacity-50" />
									<p class="text-sm font-medium">Live preview akan muncul di sini</p>
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
</div>
