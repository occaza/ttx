<script>
	import ToolCard from '$lib/components/ToolCard.svelte';
</script>

<div class="grid grid-cols-2 gap-1 sm:grid-cols-2 lg:grid-cols-3">
	<ToolCard
		title="Remove Duplicate Lines"
		desc="Hapus baris duplikat dari teks Anda"
		href="/remove-duplicate-lines"
	/>
	<ToolCard
		title="Add Prefix/Suffix into Line"
		desc="Tambahkan prefix atau suffix di baris text"
		href="/add-prefixsuffix-into-line"
	/>
</div>
