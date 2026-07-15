<script lang="ts">
	import { ArrowRight, Wrench } from '@lucide/svelte';

	let { title, desc, href, icon: Icon = Wrench } = $props<{
		title: string;
		desc: string;
		href: string;
		icon?: any;
	}>();
</script>

<a
	{href}
	class="group relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 p-4 transition-all hover:border-primary/40 hover:bg-base-200/40 hover:shadow-xl hover:shadow-primary/5"
>
	<!-- Subtle top gradient line -->
	<div class="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

	<div class="flex items-start justify-between gap-3">
		<div class="flex items-center gap-2.5 min-w-0">
			<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-200/80 text-base-content/60 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
				<Icon size={14} />
			</div>
			<h3 class="truncate text-[13px] font-bold text-base-content transition-colors group-hover:text-primary">
				{title}
			</h3>
		</div>
		<div class="pt-1.5 shrink-0 text-base-content/20 opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary mt-0.5">
			<ArrowRight size={14} />
		</div>
	</div>

	<p class="mt-2 pl-[38px] text-[11px] leading-relaxed text-base-content/50 line-clamp-2">
		{desc}
	</p>
</a>
