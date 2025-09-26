<script>
	import ToolCard from '$lib/components/ToolCard.svelte';
</script>

<div class="m-2 mx-auto grid w-fit grid-cols-1 gap-2 md:grid-cols-2">
	<ToolCard
		title="Remove Duplicate Lines"
		desc="Hapus baris duplikat dari teks Anda"
		href="/text-tools/remove-duplicate-lines"
	/>
	<ToolCard
		title="Add Prefix/Suffix into Line"
		desc="Tambahkan prefix atau suffix di baris text"
		href="/text-tools/add-prefixsuffix-into-line"
	/>
	<ToolCard
		title="Split File"
		desc="Pecah teks menjadi beberapa file"
		href="/text-tools/split-files"
	/>
	<ToolCard
		title="Random Number Generator"
		desc="Buat angka acak"
		href="/text-tools/random-number-generator"
	/>
</div>
