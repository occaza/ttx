<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import { Lock, Unlock, Clock, FileText } from '@lucide/svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	
	let processing = $state(false);

	const handleUnlock: SubmitFunction = () => {
		processing = true;
		return async ({ update }) => {
			await update();
			processing = false;
		};
	};
</script>

<svelte:head>
	<title>System Diagnostic</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-base-100 px-4 py-6 md:px-8 md:py-8">
	
	<div class="max-w-4xl mx-auto space-y-8">
		
		<!-- Header -->
		<div class="flex items-center gap-4 border-b border-base-content/10 pb-6">
			{#if data.unlocked}
				<div class="p-3 bg-success/10 text-success rounded-xl">
					<Unlock size={28} />
				</div>
				<div>
					<h1 class="text-2xl font-bold tracking-tight opacity-70">Deleted Lines Pool</h1>
					<p class="text-sm opacity-50">Global inbox of all cut/deleted text lines.</p>
				</div>
			{:else}
				<div class="p-3 bg-error/10 text-error rounded-xl">
					<Lock size={28} />
				</div>
				<div>
					<h1 class="text-2xl font-bold tracking-tight opacity-70">Restricted Area</h1>
					<p class="text-sm opacity-50">Enter access key to continue.</p>
				</div>
			{/if}
		</div>

		{#if !data.unlocked}
			<!-- UNLOCK FORM -->
			<div class="flex justify-center pt-8">
				<form method="POST" action="?/unlock" use:enhance={handleUnlock} class="card bg-base-200/50 shadow-xl border border-base-content/10 backdrop-blur-sm w-full max-w-sm">
					<div class="card-body">
						{#if form?.unlockError}
							<div class="alert alert-error text-sm py-2">
								<span>{form.unlockError}</span>
							</div>
						{/if}
						<div class="form-control">
							<label class="label" for="password">
								<span class="label-text opacity-70">Access Key</span>
							</label>
							<input 
								id="password"
								type="password" 
								name="password" 
								required 
								class="input input-bordered w-full font-mono bg-base-100/50 text-center tracking-widest" 
							/>
						</div>
						<div class="mt-4">
							<button type="submit" class="btn btn-neutral w-full" disabled={processing}>
								{#if processing}
									<span class="loading loading-spinner loading-sm"></span>
								{/if}
								Unlock
							</button>
						</div>
					</div>
				</form>
			</div>
		{:else}
			<!-- HISTORY POOL -->
			<div class="space-y-4">
				{#if data.history.length === 0}
					<div class="card bg-base-200/50 border border-base-content/10">
						<div class="card-body flex flex-col items-center justify-center py-12 text-center opacity-50">
							<FileText size={48} class="mb-4 opacity-30" />
							<h3 class="text-lg font-semibold">Pool is empty</h3>
							<p class="text-sm">No deleted lines have been captured yet.</p>
						</div>
					</div>
				{:else}
					{#each data.history as item}
						<div class="card bg-base-200/50 border border-base-content/10 overflow-hidden shadow-sm hover:border-base-content/20 transition-colors">
							<div class="bg-base-300/50 px-4 py-3 border-b border-base-content/10 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="font-mono text-sm font-semibold text-primary">{item.slug}</span>
								</div>
								<div class="flex items-center gap-1.5 text-xs opacity-60">
									<Clock size={14} />
									<span>{new Date(item.created_at).toLocaleString()}</span>
								</div>
							</div>
							<div class="p-4 overflow-x-auto">
								<pre class="font-mono text-sm text-error whitespace-pre-wrap">{item.text}</pre>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
