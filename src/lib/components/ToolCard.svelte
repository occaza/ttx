<script lang="ts">
	export let title: string;
	export let desc: string;
	export let href: string;
</script>

<div>
	<a
		{href}
		class="group relative block h-36 w-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/25 via-white/15 to-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-500 hover:scale-[1.05] hover:border-white/40 hover:shadow-2xl"
	>
		<!-- Animated gradient overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
		></div>

		<!-- Glow effect -->
		<div
			class="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30"
		></div>

		<!-- Sparkle effects -->
		<span
			class="absolute top-4 right-4 h-2 w-2 rounded-full bg-gradient-to-tr from-primary to-accent opacity-0 transition-all duration-300 group-hover:animate-ping group-hover:opacity-100"
		></span>
		<span
			class="absolute top-4 right-4 h-2 w-2 rounded-full bg-gradient-to-tr from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		></span>

		<!-- Animated corner accent -->
		<div
			class="absolute top-0 right-0 h-16 w-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
		>
			<div
				class="absolute top-0 right-0 h-full w-full rounded-bl-3xl bg-gradient-to-bl from-accent/40 to-transparent"
			></div>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex h-full flex-col justify-between">
			<div>
				<h3
					class="mb-2 text-lg font-bold text-base-content transition-colors duration-300 group-hover:text-primary"
				>
					{title}
				</h3>
				<p
					class="line-clamp-2 text-sm text-base-content/70 transition-colors duration-300 group-hover:text-base-content/90"
				>
					{desc}
				</p>
			</div>

			<!-- Arrow icon -->
			<div class="flex justify-end">
				<svg
					class="h-6 w-6 text-base-content/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 8l4 4m0 0l-4 4m4-4H3"
					/>
				</svg>
			</div>
		</div>
	</a>
</div>
