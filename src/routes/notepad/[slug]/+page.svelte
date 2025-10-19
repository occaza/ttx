<script lang="ts">
	import ActionButton from '$lib/components/ActionButton.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { FilePlus2 } from '@lucide/svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let text = $state(data.text);
	let saved = $state(false);
	let refreshing = $state(false);
	let linkInput: HTMLInputElement;
	let ta: TextArea;

	let isEmpty = $derived(!text.trim());

	function selectAll() {
		ta.select();
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

	function copyLink() {
		linkInput.select();
		navigator.clipboard.writeText(`${$page.url.origin}/notepad/${data.slug}`);
	}
</script>

<svelte:head>
	<title>Notepad - {data.slug}</title>
	<meta
		name="description"
		content="Catatan online yang bisa dibuka dan diedit bersama. Bagikan link dan kolaborasi real-time dengan siapa saja."
	/>
	<meta
		name="keywords"
		content="notepad online, shared notepad, collaborative notes, catatan bersama, text editor online"
	/>
	<meta name="robots" content="noindex, nofollow" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Online Notepad - {data.slug}" />
	<meta property="og:description" content="Catatan online yang bisa dibuka dan diedit bersama" />
	<meta property="og:url" content={$page.url.href} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Online Notepad - {data.slug}" />
	<meta name="twitter:description" content="Catatan online yang bisa dibuka dan diedit bersama" />
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col space-y-3 bg-base-100 p-6 shadow-lg lg:rounded-lg">
	<div class=" pb-5">
		<span class="text-sm text-gray-500">
			<h2 class=" text-lg font-bold">Online Notepad</h2>
			Slug:
			<code class="badge badge-soft badge-primary"> {data.slug}</code> semua orang dengan link ini bisa
			lihat & edit.
		</span>
	</div>

	<form method="POST" action="?/save" use:enhance={afterSave}>
		<div class="mb-3 flex gap-2">
			<button type="submit" class="btn rounded-sm btn-md btn-primary" disabled={isEmpty}>
				Save
			</button>
			<button type="button" class="btn rounded-sm btn-md" onclick={refresh} disabled={refreshing}>
				{refreshing ? 'Refreshing...' : 'Refresh'}
			</button>
			<ActionButton
				showSelectAll={true}
				showClear={false}
				showCopy={false}
				onselectall={selectAll}
			/>
			{#if saved}
				<span class="self-center text-xs text-green-600">saved!</span>
			{/if}
			<a type="button" class="btn ml-auto rounded-sm btn-md" href="/notepad">
				<FilePlus2 size={16} /> New Notes
			</a>
		</div>

		<TextArea
			bind:this={ta}
			bind:value={text}
			name="text"
			placeholder="Tulis catatan kamu di sini..."
			rows={15}
		/>
	</form>

	{#if data.updatedAt}
		<p class="text-xs text-gray-400">Last edited: {formatDate(data.updatedAt)}</p>
	{/if}

	<div class="flex items-center gap-2">
		<input
			type="text"
			readonly
			bind:this={linkInput}
			value="https://{$page.url.host}/notepad/{data.slug}"
			class="input-bordered input input-md flex-1 rounded-sm"
		/>
		<button type="button" class="btn rounded-sm btn-md" onclick={copyLink}> Copy </button>
	</div>
</div>
