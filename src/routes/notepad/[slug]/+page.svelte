<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let text = data.text;
	let ta: HTMLTextAreaElement;
	let saved = false;
	let refreshing = false;
	let turnstileWidget: HTMLElement | null = null;

	$: text = data.text;

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		// Simpan reference ke widget container
		turnstileWidget = document.querySelector('.cf-turnstile');
	});

	function formatDate(dateString: string | null) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Asia/Jakarta'
		});
	}

	const afterSave: SubmitFunction = () => {
		return async ({ result, update }) => {
			await update({ reset: false });

			if (result.type === 'success') {
				saved = true;
				setTimeout(() => (saved = false), 1000);
				ta.focus();

				// Reset Turnstile widget untuk generate token baru
				setTimeout(() => {
					if (turnstileWidget && 'turnstile' in window) {
						(window as any).turnstile.reset(turnstileWidget);
					}
				}, 100);
			} else {
				// Kalau gagal juga reset biar bisa coba lagi
				setTimeout(() => {
					if (turnstileWidget && 'turnstile' in window) {
						(window as any).turnstile.reset(turnstileWidget);
					}
				}, 100);
			}
		};
	};

	async function refresh() {
		refreshing = true;
		await invalidateAll();
		refreshing = false;
	}
</script>

<svelte:head>
	<title>Notepad - {data.slug}</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-3 p-4">
	<h2 class="text-lg font-bold">Shared Notepad</h2>
	<p class="text-sm text-gray-500">
		Slug: <code>{data.slug}</code> — semua orang dengan link ini bisa lihat & edit.
	</p>
	{#if data.updatedAt}
		<p class="text-xs text-gray-400">Last edited: {formatDate(data.updatedAt)}</p>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">
			<span>{form.error}</span>
		</div>
	{/if}

	<form method="POST" action="?/save" use:enhance={afterSave}>
		<div class="mt-2 flex gap-2">
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
			class="textarea-bordered textarea w-full"
		></textarea>

		<!-- Turnstile Widget -->
		<div class="mt-3">
			<div class="cf-turnstile" data-sitekey={data.turnstileSiteKey} data-theme="light"></div>
		</div>
	</form>

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
</div>
