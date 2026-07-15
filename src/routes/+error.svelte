<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft, AlertCircle, Home } from '@lucide/svelte';
</script>

<svelte:head>
	<title>{$page.status} — TEXY</title>
</svelte:head>

<div class="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
	<!-- Subtle grid background -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative z-10 max-w-lg">
		<!-- Status code -->
		<p class="text-8xl font-black tracking-tighter text-base-content/10 select-none md:text-[10rem]">
			{$page.status}
		</p>

		<!-- Icon + Message -->
		<div class="mt-6 flex flex-col items-center gap-4">
			<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-error/20 bg-error/10 text-error">
				<AlertCircle size={28} />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-base-content md:text-3xl">
				{#if $page.status === 404}
					Halaman Tidak Ditemukan
				{:else}
					Terjadi Kesalahan
				{/if}
			</h1>
			<p class="max-w-sm text-base text-base-content/50">
				{#if $page.error?.message}
					{$page.error.message}
				{:else if $page.status === 404}
					Halaman yang kamu cari tidak ada atau sudah dipindahkan.
				{:else}
					Ada yang salah di server. Coba refresh halaman atau kembali ke beranda.
				{/if}
			</p>
		</div>

		<!-- Actions -->
		<div class="mt-10 flex flex-wrap items-center justify-center gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-content transition-all hover:opacity-90 hover:scale-105 active:scale-100"
			>
				<Home size={18} />
				Kembali ke Beranda
			</a>
			<button
				onclick={() => history.back()}
				class="inline-flex items-center gap-2 rounded-xl border border-base-content/10 bg-base-200/50 px-6 py-3 text-sm font-semibold text-base-content/70 transition-all hover:bg-base-200 hover:text-base-content"
			>
				<ArrowLeft size={18} />
				Halaman Sebelumnya
			</button>
		</div>
	</div>
</div>
