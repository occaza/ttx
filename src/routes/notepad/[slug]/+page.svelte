<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { FilePlus2, WholeWord } from '@lucide/svelte';

	export let data: PageData;
	let text = data.text;
	let ta: HTMLTextAreaElement;
	let saved = false;
	let refreshing = false;
	let linkInput: HTMLInputElement;
	let outputEl: HTMLTextAreaElement;

	$: text = data.text;
	$: isEmpty = !text.trim();

	function selectAll(e: MouseEvent) {
		e.preventDefault(); // Prevent form submit
		outputEl?.select();
	}

	function formatDate(dateString: string | null) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleString('en-EN', {
			dateStyle: 'long',
			timeStyle: 'short',
			timeZone: 'Asia/Jakarta'
		});
	}

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

<div class="mx-auto max-w-5xl space-y-3 bg-base-200 p-6 shadow-lg lg:rounded-2xl">
	<h2 class="text-lg font-bold">Shared Notepad</h2>
	<p class="text-sm text-gray-500">
		Slug: <code>{data.slug}</code> — semua orang dengan link ini bisa lihat & edit.
	</p>

	<form method="POST" action="?/save" use:enhance={afterSave}>
		<div class="my-2 flex place-items-center gap-2">
			<button class="btn btn-sm btn-primary" disabled={isEmpty}>Save</button>
			<button type="button" class="btn btn-sm" on:click={refresh} disabled={refreshing}>
				{refreshing ? 'Refreshing...' : 'Refresh'}
			</button>
			<div class="tooltip" data-tip="Select all">
				<button type="button" class="btn btn-square btn-sm btn-secondary" on:click={selectAll}
					><WholeWord size={16} /></button
				>
			</div>
			{#if saved}<span class="ml-2 text-xs text-green-600">saved!</span>{/if}
			<a type="button" class="btn btn-sm" href="/notepad"><FilePlus2 size={16} /> New Notes</a>
		</div>
		<textarea
			id="note"
			name="text"
			bind:value={text}
			bind:this={ta}
			bind:this={outputEl}
			rows="20"
			class=" textarea w-full resize-none font-mono text-base md:text-sm"
		></textarea>
	</form>
	{#if data.updatedAt}
		<p class="text-xs text-gray-400">Last edited: {formatDate(data.updatedAt)}</p>
	{/if}
	<div class="text-md flex gap-2">
		<label class="input w-full">
			<span class="label">https://</span>
			<input
				type="text"
				readonly
				bind:this={linkInput}
				value="{$page.url.host}/notepad/{data.slug}"
				class="input-md"
			/>
		</label>
		<button
			type="button"
			class="btn btn-md"
			on:click={() => {
				linkInput.select();
				navigator.clipboard.writeText(`${$page.url.origin}/notepad/${data.slug}`);
			}}
		>
			Copy
		</button>
	</div>
</div>
