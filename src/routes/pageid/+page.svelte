<script lang="ts">
	import { page } from '$app/stores'; // store reaktif dari SvelteKit

	$: id = $page.url.searchParams.get('id') ?? 'tanpa-id';
	$: title = `${id}`;
</script>

<svelte:head>
	<!-- Override bagian <title> & Open-Graph saja -->
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="twitter:title" content={title} />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<h1 class="mb-4 text-center text-3xl font-bold">{id}</h1>
	<p class="text-base-content/80">
		Coba ubah URL menjadi <code class="badge">/pageid?id=42</code> lalu refresh, maka judul tab akan
		berubah mengikuti.
	</p>
</div>
