<script lang="ts">
	import { onMount } from 'svelte';
	import { Copy, Download, Lock } from '@lucide/svelte';
	import { browser } from '$app/environment';

	/* ---------- state ---------- */
	let inputCode = '';
	let outputCode = '';
	let level: 'low' | 'medium' | 'high' = 'medium';
	let compact = true;
	let controlFlow = false;
	let deadCode = false;
	let selfDefending = false;
	let stringArray = true;
	let target: 'browser' | 'browser-no-eval' | 'node' = 'browser';
	let enableEncryption = false;
	let encryptKey = '';
	let encryptSalt = '';
	let copied = false;
	let obfuscating = false;
	let isReady = false;

	/* ---------- load obfuscator ---------- */
	onMount(() => {
		if (!browser) return;

		const checkReady = setInterval(() => {
			if (
				typeof (window as any).JavaScriptObfuscator !== 'undefined' &&
				typeof (window as any).CryptoJS !== 'undefined'
			) {
				isReady = true;
				clearInterval(checkReady);
			}
		}, 100);

		setTimeout(() => {
			if (!isReady) {
				clearInterval(checkReady);
				alert('Gagal memuat library');
			}
		}, 5000);

		return () => clearInterval(checkReady);
	});

	/* ---------- helpers ---------- */
	function generateRandom(len: number) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
		return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(
			''
		);
	}

	function copy(txt: string) {
		navigator.clipboard.writeText(txt);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}

	function download() {
		const blob = new Blob([outputCode], { type: 'text/javascript' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'obfuscated.js';
		a.click();
		URL.revokeObjectURL(url);
	}

	function fileInput(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (!f) return;
		const r = new FileReader();
		r.onload = () => (inputCode = r.result as string);
		r.readAsText(f);
	}

	/* ---------- obfuscate ---------- */
	async function obfuscate() {
		if (!inputCode.trim()) {
			alert('Input kosong');
			return;
		}

		if (!isReady) {
			alert('Library sedang dimuat, tunggu sebentar');
			return;
		}

		obfuscating = true;
		await new Promise((r) => setTimeout(r, 50));

		try {
			const JavaScriptObfuscator = (window as any).JavaScriptObfuscator;

			const options = {
				compact,
				controlFlowFlattening: controlFlow,
				deadCodeInjection: deadCode,
				selfDefending,
				stringArray,
				target,
				controlFlowFlatteningThreshold: level === 'high' ? 0.75 : level === 'medium' ? 0.5 : 0,
				deadCodeInjectionThreshold: level === 'high' ? 0.5 : level === 'medium' ? 0.3 : 0,
				stringArrayThreshold: level === 'high' ? 1 : level === 'medium' ? 0.75 : 0.5,
				stringArrayEncoding: level === 'high' ? ['base64'] : []
			};

			let result = JavaScriptObfuscator.obfuscate(inputCode, options).getObfuscatedCode();

			/* ---------- optional password layer ---------- */
			if (enableEncryption && encryptKey && encryptSalt) {
				const CryptoJS = (window as any).CryptoJS;
				if (!CryptoJS) {
					alert('CryptoJS belum dimuat');
					obfuscating = false;
					return;
				}

				const encrypted = CryptoJS.AES.encrypt(result, encryptKey + encryptSalt).toString();
				result = `(function(){
  const encrypted = "${encrypted}";
  const key = "${encryptKey}", salt = "${encryptSalt}";
  const decrypt = c => CryptoJS.AES.decrypt(c, key + salt).toString(CryptoJS.enc.Utf8);
  eval(decrypt(encrypted));
})();`;
			}

			outputCode = result;
		} catch (err) {
			alert('Error: ' + (err as Error).message);
		}

		obfuscating = false;
	}
</script>

<svelte:head>
	<title>JS Obfuscator & Encrypt</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-4 p-4">
	<h1 class="text-3xl font-bold">JS Obfuscator & Private-Key Encrypt</h1>

	<!-- INPUT / OUTPUT -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Input JavaScript</h2>
				<textarea
					bind:value={inputCode}
					rows="14"
					class="textarea-bordered textarea w-full font-mono text-sm"
					placeholder="Paste your code here..."
				></textarea>
				<input
					type="file"
					accept=".js"
					on:change={fileInput}
					class="file-input-bordered file-input mt-2 w-full"
				/>
			</div>
		</div>

		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Output (Protected)</h2>
				<textarea
					bind:value={outputCode}
					rows="14"
					class="textarea-bordered textarea w-full font-mono text-sm"
					readonly
				></textarea>
				<div class="mt-2 flex gap-2">
					<button
						class="btn flex-1 btn-primary"
						on:click={() => copy(outputCode)}
						disabled={!outputCode}
					>
						<Copy size={16} />
						{copied ? 'Copied!' : 'Copy'}
					</button>
					<button class="btn flex-1 btn-secondary" on:click={download} disabled={!outputCode}>
						<Download size={16} /> Download
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- SETTINGS -->
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<h2 class="card-title">Settings</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Obfuscation Level -->
				<div>
					<h3 class="mb-2 font-bold">Obfuscation Level</h3>
					<label class="label cursor-pointer"
						><input type="radio" bind:group={level} value="low" class="radio radio-primary" />
						<span class="label-text ml-2">Low</span></label
					>
					<label class="label cursor-pointer"
						><input type="radio" bind:group={level} value="medium" class="radio radio-primary" />
						<span class="label-text ml-2">Medium</span></label
					>
					<label class="label cursor-pointer"
						><input type="radio" bind:group={level} value="high" class="radio radio-primary" />
						<span class="label-text ml-2">High</span></label
					>
				</div>

				<!-- Options -->
				<div>
					<h3 class="mb-2 font-bold">Options</h3>
					<label class="label cursor-pointer"
						><input type="checkbox" bind:checked={compact} class="checkbox checkbox-primary" />
						<span class="label-text ml-2">Compact</span></label
					>
					<label class="label cursor-pointer"
						><input type="checkbox" bind:checked={controlFlow} class="checkbox checkbox-primary" />
						<span class="label-text ml-2">Control-flow flattening</span></label
					>
					<label class="label cursor-pointer"
						><input type="checkbox" bind:checked={deadCode} class="checkbox checkbox-primary" />
						<span class="label-text ml-2">Dead-code injection</span></label
					>
					<label class="label cursor-pointer"
						><input
							type="checkbox"
							bind:checked={selfDefending}
							class="checkbox checkbox-primary"
						/> <span class="label-text ml-2">Self defending</span></label
					>
					<label class="label cursor-pointer"
						><input type="checkbox" bind:checked={stringArray} class="checkbox checkbox-primary" />
						<span class="label-text ml-2">String array encoding</span></label
					>
				</div>

				<!-- Target & Password Layer -->
				<div>
					<h3 class="mb-2 font-bold">Extra</h3>
					<label for="target-select" class="label"><span class="label-text">Target</span></label>
					<select id="target-select" bind:value={target} class="select-bordered select w-full">
						<option value="browser">Browser</option>
						<option value="browser-no-eval">Browser (no eval)</option>
						<option value="node">Node.js</option>
					</select>

					<label class="label mt-4 cursor-pointer"
						><input
							type="checkbox"
							bind:checked={enableEncryption}
							class="checkbox checkbox-primary"
						/> <span class="label-text ml-2">Add password wrapper</span></label
					>
					{#if enableEncryption}
						<label class="label" for="encrypt-key"><span class="label-text">Key</span></label>
						<input
							id="encrypt-key"
							type="text"
							bind:value={encryptKey}
							placeholder="min 8 chars"
							class="input-bordered input w-full"
						/>
						<label class="label" for="encrypt-salt"><span class="label-text">Salt</span></label>
						<input
							id="encrypt-salt"
							type="text"
							bind:value={encryptSalt}
							placeholder="min 8 chars"
							class="input-bordered input w-full"
						/>
						<button
							class="btn mt-2 btn-outline btn-sm"
							on:click={() => {
								encryptKey = generateRandom(32);
								encryptSalt = generateRandom(16);
							}}>Generate</button
						>
					{/if}
				</div>
			</div>

			<div class="mt-4 card-actions justify-end">
				<button
					class="btn btn-lg btn-primary"
					on:click={obfuscate}
					disabled={obfuscating || !isReady}
				>
					{#if obfuscating}
						<span class="loading loading-spinner"></span> Processing...
					{:else if !isReady}
						<span class="loading loading-spinner"></span> Loading...
					{:else}
						<Lock size={20} /> Obfuscate
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Warning -->
	<div class="alert alert-warning">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/></svg
		>
		<div>
			<h3 class="font-bold">Important</h3>
			<ul class="list-inside list-disc text-sm">
				<li>Keep a backup of the original code. Obfuscation is one-way.</li>
				<li>Heavy settings may break code. Always test the output.</li>
				<li>Password wrapper delays reverse engineering, not real security.</li>
			</ul>
		</div>
	</div>
</div>
