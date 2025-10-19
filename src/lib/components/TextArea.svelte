<script lang="ts">
	interface Props {
		value?: string;
		placeholder?: string;
		rows?: number;
		readonly?: boolean;
		name?: string;
		className?: string;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		rows = 10,
		readonly = false,
		name = '',
		className = '',
		oninput,
		onchange,
		onfocus,
		onblur
	}: Props = $props();

	let textareaEl: HTMLTextAreaElement;

	export function select() {
		textareaEl?.select();
	}

	export function focus() {
		textareaEl?.focus();
	}
</script>

<textarea
	bind:value
	bind:this={textareaEl}
	{placeholder}
	{rows}
	{readonly}
	{name}
	class="textarea w-full resize-none font-mono text-base md:text-sm {className}"
	{oninput}
	{onchange}
	{onfocus}
	{onblur}
></textarea>
