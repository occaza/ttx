<script lang="ts">
	import { Shield, Mail, Calendar, ArrowLeft, ExternalLink } from '@lucide/svelte';

	let { isDark = true, onBack }: { isDark?: boolean; onBack?: () => void } = $props();
</script>

<div class="space-y-5 w-full">
	<!-- HEADER -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b {isDark ? 'border-[#152037]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 shrink-0">
				<Shield class="h-5 w-5" />
			</div>
			<div>
				<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
					Kebijakan Privasi (Privacy Policy)
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
			<p class="text-sm sm:text-base leading-relaxed">
				Selamat datang di <strong>TEXY Workspace</strong> (<code>texy.vercel.app</code>). Kami sangat menghargai dan melindungi privasi Anda. Kebijakan Privasi ini menjelaskan informasi apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak-hak Anda terkait data tersebut.
			</p>

			<hr class="{isDark ? 'border-[#1a253c]' : 'border-slate-200'}" />

			<h3 class="text-base">1. Pengolahan Data di Sisi Klien (Local-First)</h3>
			<p>
				Mayoritas utilitas teks di TEXY (seperti Remove Duplicate Lines, Regex Tester, Case Converter, Word Counter, QR Generator, dan Obfuscator) beroperasi secara <strong>100% lokal di browser Anda</strong>. Teks atau dokumen yang Anda masukkan tidak dikirimkan maupun disimpan di server kami.
			</p>

			<h3 class="text-base">2. Informasi yang Kami Kumpulkan (Fitur Akun)</h3>
			<p>Ketika Anda memilih untuk mendaftar atau masuk menggunakan akun Facebook atau Google (misalnya untuk fitur sinkronisasi Notepad Pro / Cloud), kami menerima data profil dasar:</p>
			<ul>
				<li>Nama depan dan nama belakang</li>
				<li>Alamat email</li>
				<li>ID pengguna dari penyedia OAuth (Facebook/Google)</li>
			</ul>
			<p>
				Kami <strong>tidak pernah</strong> memiliki akses ke kata sandi Facebook atau Google Anda. Proses autentikasi dilakukan langsung oleh penyedia layanan terkait melalui OAuth 2.0 yang aman.
			</p>

			<h3 class="text-base">3. Penggunaan Informasi</h3>
			<ul>
				<li>Membuat dan mengelola profil akun TEXY Anda.</li>
				<li>Menyimpan dokumen catatan cloud (Notepad Pro) yang Anda simpan secara eksplisit.</li>
				<li>Menjaga preferensi tema dan pengaturan akun Anda.</li>
			</ul>
			<p>Kami <strong>tidak menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak ketiga mana pun.</p>

			<h3 class="text-base">4. Penyimpanan dan Keamanan Data</h3>
			<p>
				Data akun Anda disimpan secara aman menggunakan infrastruktur cloud <strong>Supabase</strong> dengan standar keamanan industri dan enkripsi data saat transit (SSL/TLS).
			</p>

			<h3 class="text-base">5. Hak Pengguna &amp; Penghapusan Data</h3>
			<p>Anda memiliki hak penuh untuk mengakses, memperbarui, atau menghapus seluruh data Anda dari sistem kami kapan saja. Untuk petunjuk penghapusan akun dan data, Anda dapat membuka halaman <a href="/data-deletion">Penghapusan Data</a>.</p>

			<h3 class="text-base">6. Kontak</h3>
			<p>
				Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui email:
				<a href="mailto:yusupmabd@gmail.com" class="font-medium underline">yusupmabd@gmail.com</a>.
			</p>
		</div>
	</div>
</div>

