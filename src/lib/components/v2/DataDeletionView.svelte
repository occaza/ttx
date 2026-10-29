<script lang="ts">
	import { Trash2, Mail, Calendar, ArrowLeft, ShieldAlert } from '@lucide/svelte';

	let { isDark = true, onBack }: { isDark?: boolean; onBack?: () => void } = $props();
</script>

<div class="space-y-5 w-full">
	<!-- HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b {isDark ? 'border-[#152037]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md shadow-rose-500/20 shrink-0">
				<Trash2 class="h-5 w-5" />
			</div>
			<div>
				<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
					Instruksi Penghapusan Data (Data Deletion)
				</h1>
				<div class="flex items-center gap-2 text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					<span class="flex items-center gap-1"><Calendar size={12} /> Terakhir diperbarui: Juli 2025</span>
					<span>•</span>
					<span>GDPR &amp; Platform Compliance</span>
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
		<div class="prose max-w-none text-xs sm:text-sm leading-relaxed {isDark ? 'prose-invert text-slate-300 prose-headings:text-white prose-headings:font-bold prose-a:text-rose-400' : 'text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-rose-600'}">
			<p class="text-sm sm:text-base leading-relaxed">
				Sesuai dengan Aturan Perlindungan Data (GDPR) dan ketentuan platform pihak ketiga (seperti Facebook dan Google), kami menyediakan mekanisme bagi pengguna untuk meminta penghapusan akun serta seluruh data terkait dari server kami.
			</p>

			<hr class="{isDark ? 'border-[#1a253c]' : 'border-slate-200'}" />

			<h3 class="text-base">Prosedur Pengajuan Penghapusan Akun &amp; Data</h3>
			<p>
				Penghapusan data dilakukan melalui verifikasi untuk memastikan keamanan pemilik akun yang sah. Ikuti langkah-langkah mudah berikut:
			</p>

			<ol>
				<li>
					Kirimkan email ke alamat resmi kami: <strong><a href="mailto:yusupmabd@gmail.com">yusupmabd@gmail.com</a></strong>.
				</li>
				<li>
					Gunakan subjek email: <strong>"Permintaan Penghapusan Akun TEXY"</strong>.
				</li>
				<li>
					Sertakan alamat email yang terdaftar pada akun TEXY Anda (alamat email yang Anda gunakan saat login Google atau Facebook).
				</li>
			</ol>

			<h3 class="text-base">Apa yang Dihapus?</h3>
			<ul>
				<li>Profil akun pengguna (nama, email, avatar, dan identitas auth).</li>
				<li>Semua dokumen catatan cloud di fitur Notepad Pro yang terikat ke akun Anda.</li>
				<li>Data sesi autentikasi dan preferensi di database.</li>
			</ul>
			<p class="text-rose-400 font-medium">
				Catatan: Tindakan penghapusan ini bersifat permanen dan tidak dapat dipulihkan.
			</p>

			<h3 class="text-base">Menghapus Izin Aplikasi via Facebook</h3>
			<p>
				Jika Anda masuk menggunakan Facebook dan ingin mencabut akses TEXY dari akun Facebook Anda:
			</p>
			<ol>
				<li>Buka Facebook, masuk ke <strong>Pengaturan &amp; Privasi &gt; Pengaturan</strong>.</li>
				<li>Pilih menu <strong>Aplikasi dan Situs Web</strong> di bilah navigasi.</li>
				<li>Cari aplikasi <strong>TEXY</strong>, lalu klik <strong>Hapus</strong>.</li>
			</ol>
		</div>
	</div>
</div>

