<script lang="ts">
	export let title: string;
	export let desc: string;
	export let href: string;
</script>

<div>
	<a {href} class="block h-24 w-full rounded border p-3 hover:bg-gray-50 hover:text-gray-600">
		<h3 class="truncate font-bold">{title}</h3>
		<p class="line-clamp-2 text-sm text-gray-600">{desc}</p>
	</a>
</div>
