<script lang="ts">
	import { page } from '$app/stores';
	let open = false;
	let dropOpen: string | null = null;
	const menuGroups = [
		{
			title: 'Text Tools',
			prefix: '/text-tools',
			items: [
				{ title: 'Remove Duplicate Lines', href: '/text-tools/remove-duplicate-lines' },
				{ title: 'Add Prefix/Suffix', href: '/text-tools/add-prefixsuffix-into-line' },
				{ title: 'Split Text File', href: '/text-tools/split-files' },
				{ title: 'Random Number Generator', href: '/text-tools/random-number-generator' },
				{ title: 'Count Lines & Duplicates', href: '/text-tools/lines-counter' },
				{ title: 'Compare Two Files', href: '/text-tools/files-comparation' },
				{ title: 'Caption Formatter', href: '/text-tools/captions-formatter' },
				{ title: 'Split by Delimiter', href: '/text-tools/split-random-delimiter' }
			]
		},
		{
			title: 'Utility Tools',
			prefix: '/utility',
			items: [
				{ title: 'Notepad', href: '/notepad' },
				{ title: 'Emoji Picker', href: '/emoji-picker' }
			]
		}
	];

	// Close mobile menu when clicking outside
	function closeMenus() {
		open = false;
		dropOpen = null;
	}

	// Close dropdown when clicking outside - fix type error
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (dropOpen && !target.closest('.dropdown')) {
			dropOpen = null;
		}
		if (open && !target.closest('.navbar')) {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />
<nav
	class="fixed right-0 left-0 z-40 mx-auto navbar rounded border-b border-base-300 bg-base-100/80 shadow-sm backdrop-blur-sm md:max-w-8/12"
>
	<div class="navbar-start">
		<a
			href="/"
			class="btn text-xl font-bold normal-case btn-ghost transition-colors hover:bg-primary/10"
		>
			TEXY.
		</a>
	</div>

	<div class="navbar-end">
		<!-- mobile hamburger -->
		<button
			aria-label="menu"
			class="btn btn-square btn-ghost transition-colors hover:bg-primary/10 lg:hidden"
			on:click|stopPropagation={() => (open = !open)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="inline-block h-6 w-6 stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
				/>
			</svg>
		</button>

		<!-- desktop menu -->
		<div class="hidden items-center space-x-2 min-[1603px]:flex">
			<a class="btn btn-ghost transition-colors hover:bg-primary/10" href="/">
				<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				Home
			</a>

			{#each menuGroups as group}
				<div class="dropdown dropdown-end">
					<button
						class="btn btn-ghost transition-colors hover:bg-primary/10 {dropOpen === group.title
							? 'bg-primary/5'
							: ''}"
						on:click|stopPropagation={() =>
							(dropOpen = dropOpen === group.title ? null : group.title)}
					>
						{group.title}
						<svg
							class="ml-1 h-4 w-4 fill-current transition-transform {dropOpen === group.title
								? 'rotate-180'
								: ''}"
							viewBox="0 0 20 20"
						>
							<path
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
							/>
						</svg>
					</button>

					{#if dropOpen === group.title}
						<div
							class="dropdown-content animate-in slide-in-from-top-2 fade-in-0 menu z-50 mt-2 w-64 rounded-xl border border-base-200 bg-base-100 p-3 shadow-xl"
						>
							{#each group.items as item}
								<a
									class="flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-primary/10 {$page
										.url.pathname === item.href
										? 'bg-primary text-primary-content shadow-sm'
										: ''}"
									href={item.href}
									on:click={closeMenus}
								>
									<svg
										class="mr-3 h-4 w-4 opacity-70"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4"
										/>
									</svg>
									{item.title}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- mobile panel -->
	{#if open}
		<div
			class="animate-in slide-in-from-top-2 fade-in-0 absolute top-full right-0 left-0 z-50 border-b border-base-200 bg-base-100/95 shadow-lg backdrop-blur-md duration-200 lg:hidden"
		>
			<div class="mx-auto max-w-sm space-y-4 p-4">
				<div class="px-3 py-2 text-xs font-semibold tracking-wider text-base-content/60 uppercase">
					Navigation
				</div>
				<a
					class="flex items-center rounded-lg px-3 py-3 transition-all duration-200 hover:bg-primary/10"
					href="/"
					on:click={closeMenus}
				>
					<svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					Home
				</a>

				{#each menuGroups as group}
					<div class="mt-2">
						<div
							class="px-3 py-2 text-xs font-semibold tracking-wider text-base-content/60 uppercase"
						>
							{group.title}
						</div>
						{#each group.items as item}
							<a
								class="flex items-center rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10 {$page
									.url.pathname === item.href
									? 'bg-primary text-primary-content'
									: ''}"
								href={item.href}
								on:click={closeMenus}
							>
								<svg
									class="mr-3 h-5 w-5 opacity-70"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4"
									/>
								</svg>
								{item.title}
							</a>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</nav>
