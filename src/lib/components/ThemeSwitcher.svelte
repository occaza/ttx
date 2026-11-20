<script lang="ts">
	import { Sun, Moon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type ColorTheme =
		| 'slate'
		| 'teal'
		| 'burgundy'
		| 'purple'
		| 'cherry'
		| 'pine'
		| 'navy'
		| 'olive'
		| 'peach'
		| 'neon'
		| 'crimson'
		| 'cyber-purple'
		| 'bordo'
		| 'taupe';

	const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string; swatchDark: string }[] = [
		{ id: 'slate',        label: 'Slate',            swatch: '#3b82f6', swatchDark: '#60a5fa' },
		{ id: 'teal',         label: 'Teal',             swatch: '#0d5c63', swatchDark: '#44a1a0' },
		{ id: 'burgundy',     label: 'Burgundy',         swatch: '#6d001a', swatchDark: '#a03050' },
		{ id: 'purple',       label: 'Purple',           swatch: '#6a2fb8', swatchDark: '#8855c8' },
		{ id: 'cherry',       label: 'Cherry',           swatch: '#b4102d', swatchDark: '#c04058' },
		{ id: 'pine',         label: 'Autumn Pine',      swatch: '#c45638', swatchDark: '#e07255' },
		{ id: 'navy',         label: 'Canyon Navy',      swatch: '#cf5b36', swatchDark: '#e87b55' },
		{ id: 'olive',        label: 'Moss Olive',       swatch: '#6b2830', swatchDark: '#a4b55c' },
		{ id: 'peach',        label: 'Steel Peach',      swatch: '#ed7750', swatchDark: '#f58762' },
		{ id: 'neon',         label: 'Neo Lime',         swatch: '#6f8f10', swatchDark: '#cbee34' },
		{ id: 'crimson',      label: 'Crimson Obsidian', swatch: '#710014', swatchDark: '#e03046' },
		{ id: 'cyber-purple', label: 'Neon Purple',      swatch: '#8a2be2', swatchDark: '#a855f7' },
		{ id: 'bordo',        label: 'Bordo Green',      swatch: '#0f3d3a', swatchDark: '#2db9a5' },
		{ id: 'taupe',        label: 'Sandy Taupe',      swatch: '#837d5e', swatchDark: '#d7c391' }
	];

	let isDark = $state(false);
	let colorTheme = $state<ColorTheme>('teal');
	let showThemeDropdown = $state(false);

	function applyFullTheme() {
		if (!browser) return;
		const nextTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', nextTheme);
		document.documentElement.setAttribute('data-color-theme', colorTheme);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			isDark = savedTheme === 'dark';
		} else {
			const currentTheme = document.documentElement.getAttribute('data-theme');
			if (currentTheme) {
				isDark = currentTheme === 'dark';
			} else {
				isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			}
		}

		const savedColor = localStorage.getItem('color-theme') as ColorTheme | null;
		if (savedColor && COLOR_THEMES.some((t) => t.id === savedColor)) {
			colorTheme = savedColor;
		} else {
			colorTheme = 'teal';
		}

		applyFullTheme();
	});

	function toggleTheme() {
		isDark = !isDark;
		const nextTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', nextTheme);
		localStorage.setItem('theme', nextTheme);
	}

	function applyColorTheme(theme: ColorTheme) {
		colorTheme = theme;
		showThemeDropdown = false;
		document.documentElement.setAttribute('data-color-theme', theme);
		localStorage.setItem('color-theme', theme);
	}
</script>

<div class="flex items-center gap-1.5">
	<!-- Dark / Light Mode Switcher -->
	<button
		type="button"
		class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-amber-400 transition-all hover:bg-[var(--ttx-bg-hover)] active:scale-95 sm:h-9 sm:w-9 sm:rounded-xl"
		onclick={toggleTheme}
		title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		aria-label="Toggle theme"
	>
		{#if isDark}
			<Sun size={15} />
		{:else}
			<Moon size={15} class="text-[var(--ttx-text-main)]" />
		{/if}
	</button>

	<!-- Color Theme Selector -->
	<div class="relative">
		<button
			type="button"
			class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] transition-all hover:bg-[var(--ttx-bg-hover)] active:scale-95 sm:h-9 sm:w-9 sm:rounded-xl"
			onclick={() => (showThemeDropdown = !showThemeDropdown)}
			title="Color theme"
			aria-label="Select color theme"
			aria-expanded={showThemeDropdown}
		>
			<span
				class="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs transition-colors sm:h-4 sm:w-4"
				style:background-color={isDark
					? COLOR_THEMES.find((t) => t.id === colorTheme)?.swatchDark
					: COLOR_THEMES.find((t) => t.id === colorTheme)?.swatch}
			></span>
		</button>

		{#if showThemeDropdown}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="fixed inset-0 z-40"
				onclick={() => (showThemeDropdown = false)}
				onkeydown={() => {}}
			></div>
			<div
				class="absolute right-0 top-full mt-2 z-50 w-[19.5rem] sm:w-[22rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-2 shadow-2xl animate-fade-in"
			>
				<div class="px-2.5 py-1.5 mb-1.5 flex items-center justify-between border-b border-[var(--ttx-border-subtle)]">
					<span class="text-[11px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Tema Warna</span>
					<span class="text-[10px] font-mono text-[var(--ttx-text-dim)]">{COLOR_THEMES.length} Pilihan</span>
				</div>
				<div class="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto custom-scrollbar p-0.5">
					{#each COLOR_THEMES as t (t.id)}
						<button
							type="button"
							class="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-all hover:bg-[var(--ttx-bg-hover)] text-left {colorTheme ===
							t.id
								? 'bg-[var(--ttx-bg-active)] text-[var(--ttx-text-main)] font-semibold shadow-xs ring-1 ring-[var(--ttx-accent)]/30'
								: 'text-[var(--ttx-text-muted)]'}"
							onclick={() => applyColorTheme(t.id)}
						>
							<span
								class="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15 shadow-xs transition-transform {colorTheme === t.id ? 'scale-110 ring-2 ring-[var(--ttx-accent)]/40' : ''}"
								style:background-color={isDark ? t.swatchDark : t.swatch}
							></span>
							<span class="truncate whitespace-nowrap">{t.label}</span>
							{#if colorTheme === t.id}
								<span class="ml-auto text-[var(--ttx-accent)] text-[11px] font-bold shrink-0">✓</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
