<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';

	export let data: PageData;
	let text = data.text;
	let ta: HTMLTextAreaElement;
	let saved = false;
	let refreshing = false;

	$: text = data.text;

	const afterSave: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
			saved = true;
			setTimeout(() => (saved = false), 1000);
			ta.focus();
		};
	};

	async function refresh() {
		refreshing = true;
		await invalidateAll();
		refreshing = false;
	}
</script>

<svelte:head><title>Notepad - {data.slug}</title></svelte:head>

<div class="mx-auto max-w-4xl space-y-3 p-4">
	<h2 class="text-lg font-bold">Online Notepad</h2>

	<form method="POST" action="?/save" use:enhance={afterSave}>
		<div class="mb-2 flex place-items-center gap-2">
			<button class="btn btn-sm btn-primary">Save</button>
			<button type="button" class="btn btn-sm" on:click={refresh} disabled={refreshing}>
				{refreshing ? 'Refreshing...' : 'Refresh'}
			</button>
			{#if saved}<span class="ml-2 text-xs text-green-600">saved!</span>{/if}
		</div>
		<textarea
			id="note"
			name="text"
			bind:value={text}
			bind:this={ta}
			rows="20"
			class="textarea-bordered textarea w-full resize-none"
		></textarea>
	</form>

	<div class="text-sm">
		<div class="flex gap-2 text-sm">
			<input
				type="text"
				readonly
				value="{$page.url.origin}/notepad/{data.slug}"
				class="input-bordered input input-sm flex-1"
			/>
			<button
				type="button"
				class="btn btn-sm"
				on:click={() => {
					navigator.clipboard.writeText(`${$page.url.origin}/notepad/${data.slug}`);
				}}
			>
				Copy
			</button>
		</div>
		<p class="text-sm text-gray-500">
			<code>{$page.url.origin}/notepad/{data.slug}</code> — semua orang dengan link ini bisa lihat &
			edit.
		</p>
	</div>
</div>
