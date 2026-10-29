<script lang="ts">
	import { AlertCircle, Calendar, ArrowLeft } from '@lucide/svelte';

	let { isDark = true, onBack }: { isDark?: boolean; onBack?: () => void } = $props();
</script>

<div class="space-y-5 w-full">
	<!-- HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b {isDark ? 'border-[#152037]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 shrink-0">
				<AlertCircle class="h-5 w-5" />
			</div>
			<div>
				<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
					Penafian Tanggung Jawab (Disclaimer)
				</h1>
				<div class="flex items-center gap-2 text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					<span class="flex items-center gap-1"><Calendar size={12} /> Terakhir diperbarui: Juli 2025</span>
					<span>•</span>
					<span>TEXY Workspace</span>
				</div>
			</div>
		</div>

		{#if onBack}
			<button
				type="button"
				onclick={onBack}
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all {isDark
					? 'border-[#1e2e50] bg-[#101a2f] text-slate-300 hover:text-white'
					: 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs'}"
			>
				<ArrowLeft size={13} />
				<span>Kembali</span>
			</button>
		{/if}
	</div>

	<!-- CONTENT CARD -->
	<div class="rounded-2xl border p-5 sm:p-7 shadow-xs transition-colors {isDark ? 'border-[#152037] bg-[#0c1427]' : 'border-slate-200 bg-white'} space-y-6">
		<div class="prose max-w-none text-xs sm:text-sm leading-relaxed {isDark ? 'prose-invert text-slate-300 prose-headings:text-white prose-headings:font-bold prose-a:text-blue-400' : 'text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-blue-600'}">
			<h3 class="text-base">1. Penggunaan Alat "Sebagaimana Adanya" (As-Is)</h3>
			<p>
				Seluruh alat, utilitas, dan layanan yang disediakan di <strong>TEXY Workspace</strong> ditujukan untuk kemudahan produktivitas dan disediakan dengan basis <em>"sebagaimana adanya" (as-is)</em> dan <em>"sebagaimana tersedia" (as-available)</em> tanpa jaminan kelengkapan, keakuratan, atau ketiadaan gangguan.
			</p>

			<hr class="{isDark ? 'border-[#1a253c]' : 'border-slate-200'}" />

			<h3 class="text-base">2. Batasan Tanggung Jawab atas Data</h3>
			<p>
				Pengguna bertanggung jawab penuh atas data atau teks yang dimasukkan ke dalam setiap utilitas. Kami menyarankan untuk <strong>selalu menyimpan cadangan (backup) dokumen asli</strong> sebelum menjalankan operasi manipulasi teks seperti pemecahan file, pengurutan, regex replace, atau enkripsi/obfuscasi kode.
			</p>

			<h3 class="text-base">3. Tautan Pihak Ketiga</h3>
			<p>
				Situs web ini mungkin menampilkan tautan ke platform eksternal. Kami tidak memiliki kendali dan tidak bertanggung jawab atas isi, kebijakan privasi, atau ketersediaan situs web pihak ketiga tersebut.
			</p>

			<h3 class="text-base">4. Pertanyaan &amp; Kontak</h3>
			<p>
				Jika ada pertanyaan atau saran perbaikan mengenai layanan ini, silakan hubungi kami via email di:
				<a href="mailto:yusupmabd@gmail.com" class="font-medium underline">yusupmabd@gmail.com</a>.
			</p>
		</div>
	</div>
</div>

