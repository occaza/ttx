<script lang="ts">
	import { Wrench } from '@lucide/svelte';

	let { title, desc, href, icon: Icon = Wrench } = $props<{
		title: string;
		desc: string;
		href: string;
		icon?: any;
	}>();
</script>

<a
	{href}
	class="group block rounded-xl border border-base-content/10 bg-base-100 p-4 transition-colors hover:border-base-content/30 hover:bg-base-200/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
>
	<div class="flex items-start gap-4">
		<div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-content/5 text-base-content/70 transition-colors group-hover:bg-base-content/10 group-hover:text-base-content">
			<Icon size={16} />
		</div>
		<div class="min-w-0">
			<h3 class="truncate text-sm font-semibold text-base-content transition-colors group-hover:text-primary">
				{title}
			</h3>
			<p class="mt-1 line-clamp-2 text-xs leading-relaxed text-base-content/60">
				{desc}
			</p>
		</div>
	</div>
</a>
