<script lang="ts">
	import { TextSelect, Eraser, Copy } from '@lucide/svelte';

	interface Props {
		showSelectAll?: boolean;
		showClear?: boolean;
		showCopy?: boolean;
		disabled?: boolean;
		onselectall?: () => void;
		onclear?: () => void;
		oncopy?: () => void;
	}

	let {
		showSelectAll = true,
		showClear = true,
		showCopy = false,
		disabled = false,
		onselectall,
		onclear,
		oncopy
	}: Props = $props();
</script>

<div class="flex items-center gap-2">
	{#if showSelectAll}
		<div class="tooltip" data-tip="Select all">
			<button
				type="button"
				class="btn btn-square rounded-xl btn-sm md:btn-md bg-base-100/50 hover:bg-base-200 border border-base-content/10 shadow-sm transition-all hover:-translate-y-0.5 text-base-content/70 hover:text-primary"
				onclick={() => onselectall?.()}
				{disabled}
			>
				<TextSelect size={18} />
			</button>
		</div>
	{/if}

	{#if showCopy}
		<div class="tooltip" data-tip="Copy">
			<button
				type="button"
				class="btn btn-square rounded-xl btn-sm md:btn-md bg-base-100/50 hover:bg-base-200 border border-base-content/10 shadow-sm transition-all hover:-translate-y-0.5 text-base-content/70 hover:text-primary"
				onclick={() => oncopy?.()}
				{disabled}
			>
				<Copy size={18} />
			</button>
		</div>
	{/if}
	{#if showClear}
		<div class="tooltip" data-tip="Clear">
			<button
				type="button"
				class="btn btn-square rounded-xl btn-sm md:btn-md bg-base-100/50 hover:bg-base-200 border border-base-content/10 shadow-sm transition-all hover:-translate-y-0.5 text-base-content/70 hover:text-error"
				onclick={() => onclear?.()}
				{disabled}
			>
				<Eraser size={18} />
			</button>
		</div>
	{/if}
</div>
