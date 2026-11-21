<script lang="ts">
	import { Heart } from '@lucide/svelte';
</script>

<div class="border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] transition-colors duration-200">
	<footer class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<!-- Col 1: Brand & Desc (span 2 on md) -->
			<aside class="md:col-span-2 space-y-3">
				<a href="/" class="inline-flex items-center gap-1 text-xl font-bold tracking-tight text-[var(--ttx-text-main)] hover:opacity-90 transition-opacity">
					<span>TEXY</span>
					<span class="inline-block h-2 w-2 rounded-full bg-[var(--ttx-accent)]" aria-hidden="true"></span>
				</a>
				<p class="max-w-sm text-xs leading-relaxed text-[var(--ttx-text-muted)]">
					Utilitas teks ringan yang berjalan langsung di browser.<br />
					100% gratis, tanpa instalasi, tanpa menyimpan data di server.
				</p>
			</aside>

			<!-- Col 2: Tools Populer -->
			<nav class="space-y-2.5" aria-label="Tools Populer">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Tools Populer</h3>
				<ul class="space-y-1.5 text-xs">
					<li>
						<a href="/remove-duplicate-lines" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Hapus Baris Duplikat
						</a>
					</li>
					<li>
						<a href="/sort-lines" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Urutkan Baris
						</a>
					</li>
					<li>
						<a href="/notepad" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Notepad Klasik
						</a>
					</li>
					<li>
						<a href="/notepad2" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Notepad Workspace
						</a>
					</li>
					<li>
						<a href="/emoji-picker" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Emoji Browser
						</a>
					</li>
				</ul>
			</nav>

			<!-- Col 3: Legal & Privasi -->
			<nav class="space-y-2.5" aria-label="Legal dan Privasi">
				<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Legal & Privasi</h3>
				<ul class="space-y-1.5 text-xs">
					<li>
						<a href="/privacy-policy" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Privacy Policy
						</a>
					</li>
					<li>
						<a href="/disclaimer" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Disclaimer
						</a>
					</li>
					<li>
						<a href="/data-deletion" class="text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] transition-colors">
							Penghapusan Data
						</a>
					</li>
				</ul>
			</nav>
		</div>
	</footer>
</div>

<div class="border-t border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-root)] text-[var(--ttx-text-dim)] transition-colors duration-200">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-center text-xs space-y-1">
		<p>&copy; {new Date().getFullYear()} TEXY. Semua proses berjalan secara lokal di browser Anda.</p>
		<p class="flex items-center justify-center gap-1 text-[11px]">
			made with <Heart size={11} class="fill-rose-500 text-rose-500" /> by texy
		</p>
	</div>
</div>
