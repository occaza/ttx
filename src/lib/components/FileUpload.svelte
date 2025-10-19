<script lang="ts">
	interface Props {
		accept?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		className?: string;
		onload?: (content: string) => void;
		onerror?: (error: Error) => void;
	}

	let { accept = 'text/plain', size = 'sm', className = '', onload, onerror }: Props = $props();

	let fileInput: HTMLInputElement;

	async function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files?.length) return;

		try {
			const reader = new FileReader();
			reader.onload = () => {
				onload?.(reader.result as string);
			};
			reader.onerror = () => {
				onerror?.(new Error('Failed to read file'));
			};
			reader.readAsText(target.files[0]);
		} catch (err) {
			onerror?.(err as Error);
		}
	}

	export function reset() {
		if (fileInput) fileInput.value = '';
	}
</script>

<input
	type="file"
	{accept}
	bind:this={fileInput}
	onchange={handleChange}
	class="file-input w-full rounded-sm file-input-{size} {className}"
/>
