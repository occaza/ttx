<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import { Lock, Unlock } from '@lucide/svelte';

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

	const handleDecrypt: SubmitFunction = () => {
		processing = true;
		return async ({ update }) => {
			await update({ reset: false });
			processing = false;
		};
	};
</script>

<svelte:head>
	<title>System Diagnostic</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-base-100 px-4 py-6 md:px-8 md:py-8">
	
	<div class="max-w-6xl mx-auto space-y-8">
		
		<!-- Header -->
		<div class="flex items-center gap-4 border-b border-base-content/10 pb-6">
			{#if data.unlocked}
				<div class="p-3 bg-success/10 text-success rounded-xl">
					<Unlock size={28} />
				</div>
				<div>
					<h1 class="text-2xl font-bold tracking-tight opacity-70">Diagnostic View</h1>
					<p class="text-sm opacity-50">System unlocked. Proceed with payload processing.</p>
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
			<!-- TWO-COLUMN LAYOUT -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
				
				<!-- DECRYPTOR FORM (LEFT SIDE) -->
				<form method="POST" action="?/decrypt" use:enhance={handleDecrypt} class="card bg-base-200/50 shadow-xl border border-base-content/10 backdrop-blur-sm h-full flex flex-col">
					<div class="card-body flex flex-col flex-1">
						{#if form?.decryptError}
							<div class="alert alert-error text-sm py-2">
								<span>{form.decryptError}</span>
							</div>
						{/if}

						<div class="form-control flex-none">
							<label class="label" for="decryptionKey">
								<span class="label-text opacity-70">Decryption Key</span>
							</label>
							<input 
								id="decryptionKey"
								type="text" 
								name="decryptionKey" 
								required 
								class="input input-bordered w-full font-mono bg-base-100/50" 
								placeholder="e.g. 89712dd2b6df55983dd5a087..."
							/>
						</div>

						<div class="form-control mt-4 flex-1 flex flex-col">
							<label class="label" for="encryptedHex">
								<span class="label-text opacity-70">Payload Hex</span>
							</label>
							<textarea 
								id="encryptedHex"
								name="encryptedHex" 
								required
								class="textarea textarea-bordered w-full font-mono text-sm bg-base-100/50 resize-none flex-1"
								placeholder="Paste the encrypted hex payload here..."
							></textarea>
						</div>

						<div class="card-actions justify-end mt-6 flex-none">
							<button type="submit" class="btn btn-neutral w-full sm:w-auto" disabled={processing}>
								{#if processing}
									<span class="loading loading-spinner loading-sm"></span>
								{/if}
								Process Payload
							</button>
						</div>
					</div>
				</form>

				<!-- RESULT VIEW (RIGHT SIDE) -->
				<div class="card bg-base-200/20 shadow-inner border border-base-content/5 h-full flex flex-col min-h-[500px]">
					<div class="card-body p-0 flex flex-col flex-1">
						<div class="bg-base-200/50 px-6 py-4 border-b border-base-content/5 flex items-center justify-between flex-none">
							<h2 class="font-semibold text-sm opacity-70">Decrypted Output</h2>
							{#if form?.success && form?.result}
								<span class="badge badge-success badge-sm">Success</span>
							{/if}
						</div>
						
						<div class="p-6 overflow-auto flex-1 relative">
							{#if form?.success && form?.result}
								<pre class="font-mono text-sm text-base-content whitespace-pre-wrap absolute inset-6 overflow-auto">{form.result}</pre>
							{:else}
								<div class="flex flex-col items-center justify-center h-full text-base-content/30 italic">
									<p>No data processed yet.</p>
									<p class="text-xs mt-2">Submit a payload to view results here.</p>
								</div>
							{/if}
						</div>
					</div>
				</div>

			</div>
		{/if}
	</div>
</div>
