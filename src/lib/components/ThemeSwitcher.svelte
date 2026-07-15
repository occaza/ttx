<script lang="ts">
	import { Sun, Moon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let isDark = $state(false);

	onMount(() => {
		// Detect current theme on mount
		const currentTheme = document.documentElement.getAttribute('data-theme');
		if (currentTheme === 'dark') {
			isDark = true;
		} else if (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			isDark = true;
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		const newTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	}
</script>

<button
	class="flex items-center justify-center w-9 h-9 rounded-full text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
	onclick={toggleTheme}
	aria-label="Toggle Dark Mode"
>
	{#if isDark}
		<Sun size={18} />
	{:else}
		<Moon size={18} />
	{/if}
</button>
