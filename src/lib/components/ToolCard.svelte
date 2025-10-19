<script lang="ts">
	let { title, desc, href } = $props<{
		title: string;
		desc: string;
		href: string;
	}>();

	let isHovered = $state(false);
</script>

<a
	{href}
	class="card-hover group relative overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-lg transition-all duration-300 hover:shadow-2xl"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<div
		class="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
	></div>

	<div class="relative z-10 card-body">
		<div class="flex items-start justify-between gap-2">
			<h2 class="card-title text-lg transition-colors duration-300 group-hover:text-primary">
				{title}
			</h2>
			<div
				class="transform text-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
			>
				{#if isHovered}
					✨
				{:else}
					🔧
				{/if}
			</div>
		</div>
		<p class="text-sm text-base-content/70">{desc}</p>

		<div class="mt-2 card-actions justify-end">
			<span
				class="inline-flex items-center text-sm font-semibold text-primary transition-all duration-300 group-hover:gap-2"
			>
				Coba Sekarang
				<span
					class="inline-block transform transition-transform duration-300 group-hover:translate-x-1"
					>→</span
				>
			</span>
		</div>
	</div>

	<div
		class="absolute right-0 bottom-0 left-0 h-1 origin-left scale-x-0 transform bg-gradient-to-r from-primary via-secondary to-accent transition-transform duration-300 group-hover:scale-x-100"
	></div>
</a>

<style>
	.card-hover {
		transform: translateY(0);
	}

	.card-hover:hover {
		transform: translateY(-4px);
	}
</style>
