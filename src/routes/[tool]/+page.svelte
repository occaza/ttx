<script lang="ts">
	import { page } from '$app/stores';
	import DashboardShell from '$lib/components/v2/DashboardShell.svelte';
</script>

<DashboardShell initialTool={$page.params.tool} />

