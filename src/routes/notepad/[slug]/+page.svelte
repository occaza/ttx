<script lang="ts">
	import DashboardShell from '$lib/components/v2/DashboardShell.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<DashboardShell initialTool="shared-notepad" notepadData={data} />
