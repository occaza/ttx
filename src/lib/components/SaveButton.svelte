<!-- SaveFiles.svelte -->
<script lang="ts">
	interface Props {
		content?: string;
		defaultName?: string;
	}

	let { content = '', defaultName = 'output.txt' }: Props = $props();
	let fileName = $state(defaultName);

	function handleSave() {
		const blob = new Blob([content], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName.trim() || defaultName;
		a.click();
	}
</script>

<div class="flex items-center gap-2">
	<button class="btn btn-soft btn-md btn-success" onclick={handleSave}>Save as</button>
	<input
		type="text"
		bind:value={fileName}
		class="input-bordered input input-md w-60 rounded-sm"
		placeholder="Nama file..."
	/>
</div>
