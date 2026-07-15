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

<div class="flex items-center gap-1.5">
	<button class="btn btn-xs rounded-lg border border-base-content/10 bg-base-100 hover:bg-base-200 font-semibold shadow-sm transition-transform" onclick={handleSave}>Save as</button>
	<input
		type="text"
		bind:value={fileName}
		class="input input-xs w-24 sm:w-32 rounded-lg bg-base-100/50 border border-base-content/10 focus:bg-base-100 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all shadow-sm text-[11px]"
		placeholder="Nama file..."
	/>
</div>
