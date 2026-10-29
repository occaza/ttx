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

<div class="flex flex-col gap-5 w-full">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-pink-400'
				: 'border-pink-200 bg-pink-50 text-pink-600'}"
		>
			<Instagram size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Caption Formatter (Instagram)
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Pertahankan spasi dan baris kosong di caption Instagram agar lebih rapi dan terbaca
			</p>
		</div>
	</div>

	<!-- Main Layout -->
	<div class="flex flex-col gap-4 lg:flex-row">
		<!-- Left Sidebar: Panduan & Info -->
		<div
			class="flex w-full flex-col gap-4 rounded-xl border p-4 lg:w-72 lg:shrink-0 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<div class="flex items-center gap-2">
				<Info size={14} class="text-blue-400" />
				<p
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-400'
						: 'text-slate-500'}"
				>
					Cara Kerja
				</p>
			</div>

			<ol class="space-y-2.5 text-xs {isDark ? 'text-slate-300' : 'text-slate-600'}">
				<li class="flex items-start gap-2">
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold {isDark
							? 'bg-blue-600/30 text-blue-300'
							: 'bg-blue-100 text-blue-700'}">1</span
					>
					<span>Ketik atau tempel teks caption Anda di editor.</span>
				</li>
				<li class="flex items-start gap-2">
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold {isDark
							? 'bg-blue-600/30 text-blue-300'
							: 'bg-blue-100 text-blue-700'}">2</span
					>
					<span>Klik <strong>Format IG</strong> untuk menyisipkan karakter tak terlihat.</span>
				</li>
				<li class="flex items-start gap-2">
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold {isDark
							? 'bg-blue-600/30 text-blue-300'
							: 'bg-blue-100 text-blue-700'}">3</span
					>
					<span>Klik <strong>Copy ke IG</strong> dan tempel langsung di Instagram.</span>
				</li>
			</ol>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Comparison Example -->
			<div class="space-y-2">
				<div
					class="rounded-lg p-2.5 text-xs {isDark
						? 'bg-[#11192b] border border-[#1b263e]'
						: 'bg-slate-50 border border-slate-200'}"
				>
					<span class="text-[10px] font-bold uppercase tracking-wider text-rose-400"
						>Sebelum (Tanpa Format)</span
					>
					<p class="mt-1 font-mono text-[11px] {isDark ? 'text-slate-400' : 'text-slate-500'}">
						Baris kosong rawan hilang saat diposting ke IG.
					</p>
				</div>
				<div
					class="rounded-lg p-2.5 text-xs {isDark
						? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-300'
						: 'bg-emerald-50 border border-emerald-200 text-emerald-800'}"
				>
					<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400"
						>Sesudah Format</span
					>
					<p class="mt-1 font-mono text-[11px]">
						Baris kosong tetap terjaga sempurna di Instagram.
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Main Editor -->
		<div
			class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<!-- Editor Toolbar -->
			<div
				class="flex flex-wrap items-center justify-between gap-2 border-b p-3 {isDark
					? 'border-[#1a253c] bg-[#10192d]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={toggleFormat}
						disabled={!text.trim()}
						class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 {isFormatted
							? isDark
								? 'border-emerald-500/50 bg-emerald-600/20 text-emerald-300'
								: 'border-emerald-300 bg-emerald-50 text-emerald-700'
							: isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-200 hover:border-slate-600'
								: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'}"
					>
						<Wand2 size={13} />
						<span>{isFormatted ? 'Reset Format' : 'Format IG'}</span>
					</button>

					<button
						type="button"
						onclick={copyToClipboard}
						disabled={!text.trim()}
						class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all disabled:opacity-40 {copied
							? isDark
								? 'bg-emerald-500/20 text-emerald-300'
								: 'bg-emerald-100 text-emerald-700'
							: isDark
								? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
								: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
					>
						{#if copied}
							<Check size={13} /> Tersalin!
						{:else}
							<Copy size={13} /> Copy ke IG
						{/if}
					</button>
				</div>

				<div class="flex items-center gap-2">
					<span
						class="text-[11px] font-mono {isDark ? 'text-slate-400' : 'text-slate-500'}"
					>
						{text.length} karakter
					</span>

					{#if isFormatted}
						<span
							class="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10"
						>
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
			<div class="flex-1 min-h-[360px]">
				<textarea
					bind:value={text}
					placeholder="Paste caption Instagram kamu di sini...&#10;&#10;Baris kosong akan otomatis diformat!"
					rows={16}
					class="w-full h-full min-h-[340px] resize-none p-4 text-xs sm:text-sm font-sans leading-relaxed outline-none {isDark
						? 'bg-[#08101e] text-slate-100 placeholder-slate-600'
						: 'bg-white text-slate-900 placeholder-slate-400'}"
				></textarea>
			</div>
		</div>
	</div>
</div>

