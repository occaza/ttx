<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	
	let decrypting = $state(false);

	const handleSubmit: SubmitFunction = () => {
		decrypting = true;
		return async ({ update }) => {
			await update();
			decrypting = false;
		};
	};
</script>

<svelte:head>
	<title>System Diagnostic</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-base-100 flex items-center justify-center p-4">
	<div class="w-full max-w-3xl space-y-6">
		<div class="text-center">
			<h1 class="text-2xl font-bold tracking-tight opacity-50">Diagnostic View</h1>
		</div>

		<form method="POST" use:enhance={handleSubmit} class="card bg-base-200/50 shadow-xl border border-base-content/10 backdrop-blur-sm">
			<div class="card-body">
				
				{#if form?.error}
					<div class="alert alert-error text-sm">
						<span>{form.error}</span>
					</div>
				{/if}

				<div class="form-control">
					<label class="label">
						<span class="label-text opacity-70">Access Key</span>
					</label>
					<input 
						type="password" 
						name="password" 
						required 
						class="input input-bordered w-full font-mono bg-base-100/50" 
					/>
				</div>

				<div class="form-control mt-4">
					<label class="label">
						<span class="label-text opacity-70">Payload Hex</span>
					</label>
					<textarea 
						name="encryptedHex" 
						rows="4" 
						required
						class="textarea textarea-bordered w-full font-mono text-sm bg-base-100/50 resize-y"
					></textarea>
				</div>

				<div class="card-actions justify-end mt-6">
					<button type="submit" class="btn btn-neutral" disabled={decrypting}>
						{#if decrypting}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Process Payload
					</button>
				</div>
			</div>
		</form>

		{#if form?.success && form?.result}
			<div class="card bg-base-200/50 shadow-xl border border-success/30 backdrop-blur-sm">
				<div class="card-body">
					<h2 class="card-title text-success text-sm mb-2">Decrypted Output</h2>
					<pre class="bg-base-100 p-4 rounded-xl overflow-x-auto text-sm font-mono text-base-content whitespace-pre-wrap">{form.result}</pre>
				</div>
			</div>
		{/if}

	</div>
</div>
