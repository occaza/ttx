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

<div class="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
	<div class="w-full max-w-2xl space-y-6">
		
		<div class="text-center flex flex-col items-center">
			{#if data.unlocked}
				<Unlock size={32} class="opacity-30 mb-2" />
				<h1 class="text-2xl font-bold tracking-tight opacity-50">Diagnostic View</h1>
				<p class="text-sm opacity-40 mt-1">System unlocked</p>
			{:else}
				<Lock size={32} class="opacity-30 mb-2" />
				<h1 class="text-2xl font-bold tracking-tight opacity-50">Restricted Area</h1>
				<p class="text-sm opacity-40 mt-1">Enter access key to continue</p>
			{/if}
		</div>

		{#if !data.unlocked}
			<!-- UNLOCK FORM -->
			<form method="POST" action="?/unlock" use:enhance={handleUnlock} class="card bg-base-200/50 shadow-xl border border-base-content/10 backdrop-blur-sm mx-auto max-w-sm">
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
		{:else}
			<!-- DECRYPTOR FORM -->
			<form method="POST" action="?/decrypt" use:enhance={handleDecrypt} class="card bg-base-200/50 shadow-xl border border-base-content/10 backdrop-blur-sm">
				<div class="card-body">
					{#if form?.decryptError}
						<div class="alert alert-error text-sm">
							<span>{form.decryptError}</span>
						</div>
					{/if}

					<div class="form-control">
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

					<div class="form-control mt-4">
						<label class="label" for="encryptedHex">
							<span class="label-text opacity-70">Payload Hex</span>
						</label>
						<textarea 
							id="encryptedHex"
							name="encryptedHex" 
							rows="5" 
							required
							class="textarea textarea-bordered w-full font-mono text-sm bg-base-100/50 resize-y"
							placeholder="Paste the encrypted hex payload here..."
						></textarea>
					</div>

					<div class="card-actions justify-end mt-6">
						<button type="submit" class="btn btn-neutral" disabled={processing}>
							{#if processing}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Process Payload
						</button>
					</div>
				</div>
			</form>

			{#if form?.success && form?.result}
				<div class="card bg-base-200/50 shadow-xl border border-success/30 backdrop-blur-sm mt-6">
					<div class="card-body">
						<h2 class="card-title text-success text-sm mb-2">Decrypted Output</h2>
						<pre class="bg-base-100 p-4 rounded-xl overflow-x-auto text-sm font-mono text-base-content whitespace-pre-wrap">{form.result}</pre>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
