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
				class="btn btn-square rounded-sm btn-md"
				onclick={() => onselectall?.()}
				{disabled}
			>
				<TextSelect size={16} />
			</button>
		</div>
	{/if}

	{#if showCopy}
		<div class="tooltip" data-tip="Copy">
			<button
				type="button"
				class="btn btn-square rounded-sm btn-md"
				onclick={() => oncopy?.()}
				{disabled}
			>
				<Copy size={16} />
			</button>
		</div>
	{/if}
	{#if showClear}
		<div class="tooltip" data-tip="Clear">
			<button
				type="button"
				class="btn btn-square rounded-sm btn-md"
				onclick={() => onclear?.()}
				{disabled}
			>
				<Eraser size={16} />
			</button>
		</div>
	{/if}
</div>
