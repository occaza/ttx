<script lang="ts">
	export let title: string;
	export let desc: string;
	export let href: string;
</script>

<div>
	<a {href} class="block h-24 w-full rounded border-2 glass bg-white/30 p-3 shadow-md">
		<h3 class="truncate font-bold">{title}</h3>
		<p class="line-clamp-2 text-sm">{desc}</p>
	</a>
</div>
