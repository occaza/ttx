<script lang="ts">
	import { Instagram, Wand2, Copy, Check, Trash2, Sparkles, Info } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let text = $state(`Promo Spesial Weekend! 🎉

Dapatkan diskon 50% untuk semua item pilihan.

Jangan sampai kehabisan, promo berlaku sampai besok malam!

Klik link di bio untuk belanja sekarang.`);

	let isFormatted = $state(false);
	let copied = $state(false);

	const INVISIBLE_CHAR = '\u2800';

	function toggleFormat() {
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

	function clearAll() {
		text = '';
		isFormatted = false;
	}

	async function copyToClipboard() {
		if (!text) return;
		if (!isFormatted) {
			toggleFormat();
		}
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}
</script>

<div class="flex flex-col gap-5 w-full flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]">
			<Instagram size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">Caption Formatter (Instagram)</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">
				Pertahankan spasi dan baris kosong di caption Instagram agar lebih rapi dan terbaca
			</p>
		</div>
	</div>

	<!-- Main Layout -->
	<div class="flex flex-col gap-4 lg:flex-row flex-1">
		<!-- Left Sidebar: Panduan & Info -->
		<div class="flex w-full flex-col gap-4 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4 lg:w-72 lg:shrink-0">
			<div class="flex items-center gap-2">
				<Info size={14} class="text-blue-400" />
				<p class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
					Cara Kerja
				</p>
			</div>

			<ol class="space-y-2.5 text-xs text-[var(--ttx-text-muted)]">
				<li class="flex items-start gap-2">
					<span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300">1</span>
					<span>Ketik atau tempel teks caption Anda di editor.</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300">2</span>
					<span>Klik <strong>Format IG</strong> untuk menyisipkan karakter tak terlihat.</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300">3</span>
					<span>Klik <strong>Copy ke IG</strong> dan tempel langsung di Instagram.</span>
				</li>
			</ol>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Comparison Example -->
			<div class="space-y-2">
				<div class="rounded-lg p-2.5 text-xs border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)]">
					<span class="text-[10px] font-bold uppercase tracking-wider text-rose-400">Sebelum (Tanpa Format)</span>
					<p class="mt-1 font-mono text-[11px] text-[var(--ttx-text-muted)]">
						Baris kosong rawan hilang saat diposting ke IG.
					</p>
				</div>
				<div class="rounded-lg p-2.5 text-xs bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
					<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Sesudah Format</span>
					<p class="mt-1 font-mono text-[11px]">
						Baris kosong tetap terjaga sempurna di Instagram.
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Main Editor (unified card) -->
		<div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
			<!-- Editor Toolbar -->
			<div class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5">
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={toggleFormat}
						disabled={!text.trim()}
						class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 {isFormatted
							? 'border-emerald-500/50 bg-emerald-600/20 text-emerald-300'
							: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]'}"
					>
						<Wand2 size={13} />
						<span>{isFormatted ? 'Reset Format' : 'Format IG'}</span>
					</button>

					<button
						type="button"
						onclick={copyToClipboard}
						disabled={!text.trim()}
						class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all disabled:opacity-40 {copied
							? 'bg-emerald-500/20 text-emerald-300'
							: 'bg-[var(--ttx-accent)] text-white hover:bg-[var(--ttx-accent-hover)] active:scale-95'}"
					>
						{#if copied}
							<Check size={13} /> Tersalin!
						{:else}
							<Copy size={13} /> Copy ke IG
						{/if}
					</button>
				</div>

				<div class="flex items-center gap-2">
					<span class="text-[11px] font-mono text-[var(--ttx-text-muted)]">
						{text.length} karakter
					</span>

					{#if isFormatted}
						<span class="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
							<Sparkles size={10} /> Terformat
						</span>
					{/if}

					{#if text}
						<button
							type="button"
							onclick={clearAll}
							class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
						>
							<Trash2 size={11} /> Clear
						</button>
					{/if}
				</div>
			</div>

			<!-- Editor Textarea -->
			<textarea
				bind:value={text}
				placeholder="Paste caption Instagram kamu di sini...&#10;&#10;Baris kosong akan otomatis diformat!"
				class="w-full flex-1 min-h-[340px] resize-none bg-[var(--ttx-bg-card)] p-4 text-xs sm:text-sm font-sans leading-relaxed outline-none text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
			></textarea>
		</div>
	</div>
</div>
