<script lang="ts">
	import { Heart } from '@lucide/svelte';
</script>

<div class="bg-base-100 border-t border-base-content/10">
	<footer class="footer sm:footer-horizontal max-w-7xl mx-auto text-base-content p-10 md:px-8">
		<aside>
			<a href="/" class="text-2xl font-bold tracking-tight text-base-content hover:text-primary transition-colors">
				TEXY<span class="text-primary">.</span>
			</a>
			<p class="max-w-xs text-sm text-base-content/60 mt-2">
				Utilitas teks ringan yang berjalan langsung di browser.<br />
				100% gratis, tanpa instalasi, tanpa menyimpan data di server.
			</p>
		</aside>
		<nav>
			<h6 class="footer-title">Tools Populer</h6>
			<a href="/text-tools/remove-duplicate-lines" class="link link-hover text-base-content/70">Hapus Baris Duplikat</a>
			<a href="/text-tools/sort-lines" class="link link-hover text-base-content/70">Urutkan Baris</a>
			<a href="/notepad" class="link link-hover text-base-content/70">Notepad</a>
			<a href="/emoji-picker" class="link link-hover text-base-content/70">Emoji Browser</a>
		</nav>
		<nav>
			<h6 class="footer-title">Legal & Privasi</h6>
			<a href="/privacy-policy" class="link link-hover text-base-content/70">Privacy Policy</a>
			<a href="/disclaimer" class="link link-hover text-base-content/70">Disclaimer</a>
			<a href="/data-deletion" class="link link-hover text-base-content/70">Penghapusan Data</a>
		</nav>
	</footer>
</div>

<div class="bg-base-200/50 border-t border-base-content/10">
	<footer class="footer sm:footer-horizontal footer-center max-w-7xl mx-auto text-base-content/60 p-6 md:px-8">
		<aside>
			<p>&copy; {new Date().getFullYear()} TEXY. Semua proses berjalan secara lokal di browser Anda.</p>
			<p class="text-xs mt-1 flex items-center justify-center gap-1">made with <Heart size={12} class="fill-error text-error" /> by texy</p>
		</aside>
	</footer>
</div>
