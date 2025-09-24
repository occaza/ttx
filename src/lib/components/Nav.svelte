<script lang="ts">
	import { page } from '$app/stores';
	let open = false;
	let dropOpen = false;
	const menus = [
		{ title: 'Remove Duplicate Lines', href: '/text-tools/remove-duplicate-lines' },
		{ title: 'Add Prefix/Suffix', href: '/text-tools/add-prefixsuffix-into-line' },
		{ title: 'Split Text File', href: '/text-tools/split-files' }
	];

	// Close mobile menu when clicking outside
	function closeMenus() {
		open = false;
		dropOpen = false;
	}

	// Close dropdown when clicking outside - fix type error
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (dropOpen && !target.closest('.dropdown')) {
			dropOpen = false;
		}
		if (open && !target.closest('.navbar')) {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="navbar border-b bg-base-100">
	<div class="navbar-start">
		<a href="/" class="btn text-lg normal-case btn-ghost">Basic Text Tools</a>
	</div>

	<div class="navbar-end">
		<!-- mobile hamburger -->
		<button
			aria-label="menu"
			class="btn btn-square btn-ghost lg:hidden"
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
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<!-- desktop dropdown -->

		<div class="hidden lg:block">
			<a class="btn m-1 btn-ghost" href="/">Home</a>

			<div class="dropdown dropdown-end">
				<button class="btn m-1 btn-ghost" on:click|stopPropagation={() => (dropOpen = !dropOpen)}>
					Text Tools
					<svg class="ml-1 h-4 w-4 fill-current" viewBox="0 0 20 20">
						<path
							d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						/>
					</svg>
				</button>
				{#if dropOpen}
					<div class="dropdown-content menu z-50 w-52 rounded-box bg-base-100 p-2 shadow">
						{#each menus as m}
							<a
								class="block rounded px-4 py-2 hover:bg-base-200 {$page.url.pathname === m.href
									? 'bg-primary text-primary-content'
									: ''}"
								href={m.href}
								on:click={closeMenus}
							>
								{m.title}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- mobile panel -->
	{#if open}
		<div class="absolute top-16 right-0 z-50 w-52 rounded-box bg-base-100 p-2 shadow lg:hidden">
			<div class="px-4 py-2 hover:bg-base-200">
				<a href="/">Home</a>
			</div>
			{#each menus as m}
				<a
					class="block rounded px-4 py-2 hover:bg-base-200 {$page.url.pathname === m.href
						? 'bg-primary text-primary-content'
						: ''}"
					href={m.href}
					on:click={closeMenus}
				>
					{m.title}
				</a>
			{/each}
		</div>
	{/if}
</nav>
