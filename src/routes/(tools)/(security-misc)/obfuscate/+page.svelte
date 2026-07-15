<script lang="ts">
	import { onMount } from 'svelte';
	import { Copy, Download, Lock, ArrowLeft, RefreshCw, Check, TriangleAlert } from '@lucide/svelte';
	import { browser } from '$app/environment';

	/* ---------- state ---------- */
	let inputCode = $state('');
	let outputCode = $state('');
	let level = $state<'low' | 'medium' | 'high'>('medium');
	let compact = $state(true);
	let controlFlow = $state(false);
	let deadCode = $state(false);
	let selfDefending = $state(false);
	let stringArray = $state(true);
	let target = $state<'browser' | 'browser-no-eval' | 'node'>('browser');
	let enableEncryption = $state(false);
	let encryptKey = $state('');
	let encryptSalt = $state('');
	let copied = $state(false);
	let obfuscating = $state(false);
	let isReady = $state(false);

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
			if (!isReady) clearInterval(checkReady);
		}, 5000);

		return () => clearInterval(checkReady);
	});

	/* ---------- helpers ---------- */
	function generateRandom(len: number) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
		return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
	}

	function copyOutput() {
		navigator.clipboard.writeText(outputCode);
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

	function clearAll() {
		inputCode = '';
		outputCode = '';
	}

	/* ---------- obfuscate ---------- */
	async function obfuscate() {
		if (!inputCode.trim()) return;
		if (!isReady) return;

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

			if (enableEncryption && encryptKey && encryptSalt) {
				const CryptoJS = (window as any).CryptoJS;
				if (CryptoJS) {
					const encrypted = CryptoJS.AES.encrypt(result, encryptKey + encryptSalt).toString();
					result = `(function(){\n  const encrypted = "${encrypted}";\n  const key = "${encryptKey}", salt = "${encryptSalt}";\n  const decrypt = c => CryptoJS.AES.decrypt(c, key + salt).toString(CryptoJS.enc.Utf8);\n  eval(decrypt(encrypted));\n})();`;
				}
			}

			outputCode = result;
		} catch (err) {
			console.error(err);
		}

		obfuscating = false;
	}
</script>

<svelte:head>
	<title>JS Obfuscator - TEXY Workspace</title>
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans overflow-hidden">
	<!-- Grid Background Pattern -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">

		<!-- Header -->
		<div class="mb-8">
			<a href="/" class="mb-5 inline-flex items-center text-sm font-medium text-base-content/40 hover:text-base-content transition-colors">
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-base-content/70 shadow-sm backdrop-blur-md">
					<Lock size={26} strokeWidth={1.5} />
				</div>
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-base-content">JS Obfuscator</h1>
					<p class="mt-1 text-sm text-base-content/50">Lindungi kode JavaScript dari rekayasa balik dengan obfuscation dan enkripsi.</p>
				</div>
			</div>
		</div>

		<!-- Layout: Sidebar + Split Editor -->
		<div class="flex flex-col lg:flex-row gap-6 items-start">

			<!-- Left Sidebar: Settings -->
			<div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5 rounded-2xl border border-base-content/10 bg-base-100/80 p-6 shadow-xl backdrop-blur-md">
				<h3 class="font-bold text-xs text-base-content/40 uppercase tracking-widest">Settings</h3>

				<!-- Obfuscation Level -->
				<div class="space-y-2">
					<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Obfuscation Level</span>
					<div class="grid grid-cols-3 gap-1.5">
						{#each ['low', 'medium', 'high'] as lvl}
							<button
								type="button"
								onclick={() => (level = lvl as any)}
								class="h-9 rounded-lg border text-xs font-bold transition-all
									{level === lvl
										? 'bg-primary/10 border-primary/30 text-primary'
										: 'bg-base-200/40 border-base-content/10 text-base-content/50 hover:border-base-content/20'}"
							>
								{lvl.charAt(0).toUpperCase() + lvl.slice(1)}
							</button>
						{/each}
					</div>
				</div>

				<!-- Target -->
				<div class="space-y-2">
					<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Target</span>
					<div class="grid grid-cols-1 gap-1.5">
						{#each [['browser', 'Browser'], ['browser-no-eval', 'Browser (no eval)'], ['node', 'Node.js']] as [val, label]}
							<button
								type="button"
								onclick={() => (target = val as any)}
								class="h-9 px-3 rounded-lg border text-xs font-semibold text-left transition-all
									{target === val
										? 'bg-primary/10 border-primary/30 text-primary'
										: 'bg-base-200/40 border-base-content/10 text-base-content/50 hover:border-base-content/20'}"
							>
								{label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Options -->
				<div class="space-y-3">
					<span class="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">Options</span>
					{#each [
						[compact, (v: boolean) => (compact = v), 'Compact Output'],
						[controlFlow, (v: boolean) => (controlFlow = v), 'Control-flow Flattening'],
						[deadCode, (v: boolean) => (deadCode = v), 'Dead-code Injection'],
						[selfDefending, (v: boolean) => (selfDefending = v), 'Self Defending'],
						[stringArray, (v: boolean) => (stringArray = v), 'String Array Encoding'],
					] as [checked, setter, label]}
						<label class="flex cursor-pointer items-center gap-3 group">
							<input
								type="checkbox"
								checked={checked as boolean}
								onchange={(e) => (setter as Function)(e.currentTarget.checked)}
								class="checkbox checkbox-sm rounded-md border-base-content/20 checked:border-primary transition-colors"
							/>
							<span class="text-sm text-base-content/60 select-none group-hover:text-base-content transition-colors">{label as string}</span>
						</label>
					{/each}
				</div>

				<!-- Encryption -->
				<div class="space-y-3 pt-3 border-t border-base-content/10">
					<label class="flex cursor-pointer items-center gap-3 group">
						<input
							type="checkbox"
							bind:checked={enableEncryption}
							class="checkbox checkbox-sm rounded-md border-base-content/20 checked:border-primary transition-colors"
						/>
						<div>
							<span class="text-sm font-semibold text-base-content/60 select-none group-hover:text-base-content transition-colors">Password Wrapper</span>
							<p class="text-[10px] text-base-content/40">Tambah lapisan enkripsi AES</p>
						</div>
					</label>
					{#if enableEncryption}
						<div class="space-y-2">
							<input
								type="text"
								bind:value={encryptKey}
								placeholder="Encryption Key (min 8 chars)"
								class="input input-sm h-9 w-full px-3 rounded-xl bg-base-200/30 border border-base-content/10 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
							/>
							<input
								type="text"
								bind:value={encryptSalt}
								placeholder="Salt (min 8 chars)"
								class="input input-sm h-9 w-full px-3 rounded-xl bg-base-200/30 border border-base-content/10 focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
							/>
							<button
								type="button"
								onclick={() => { encryptKey = generateRandom(32); encryptSalt = generateRandom(16); }}
								class="btn btn-xs rounded-lg border border-base-content/10 bg-base-200/40 hover:bg-base-200 gap-1.5 w-full"
							>
								<RefreshCw size={12} /> Generate Random
							</button>
						</div>
					{/if}
				</div>

				<!-- Action -->
				<div class="pt-4 border-t border-base-content/10">
					<button
						class="btn btn-primary w-full rounded-xl shadow-lg font-bold gap-2 h-12"
						onclick={obfuscate}
						disabled={obfuscating || !isReady || !inputCode}
					>
						{#if obfuscating}
							<span class="loading loading-spinner loading-sm"></span> Processing...
						{:else if !isReady}
							<span class="loading loading-spinner loading-sm"></span> Loading library...
						{:else}
							<Lock size={18} /> Obfuscate
						{/if}
					</button>
				</div>
			</div>

			<!-- Right: Split Editor -->
			<div class="w-full flex-1 flex flex-col gap-5">

				<!-- Warning -->
				<div class="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3">
					<TriangleAlert size={18} class="text-warning flex-shrink-0 mt-0.5" />
					<div class="text-sm text-base-content/70 space-y-0.5">
						<p class="font-semibold text-base-content/80">Penting</p>
						<ul class="list-disc list-inside space-y-0.5 text-xs">
							<li>Selalu simpan backup kode asli. Obfuscation bersifat satu arah.</li>
							<li>Setting berat bisa merusak kode. Selalu tes output-nya.</li>
							<li>Password wrapper hanya memperlambat, bukan keamanan nyata.</li>
						</ul>
					</div>
				</div>

				<!-- Input -->
				<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
					<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Input JavaScript</span>
						<div class="flex items-center gap-2">
							<label class="btn btn-xs rounded-lg border border-base-content/10 bg-base-100 hover:bg-base-200 cursor-pointer gap-1.5 font-semibold">
								<input type="file" accept=".js" onchange={fileInput} class="hidden" />
								Upload .js
							</label>
							{#if inputCode}
								<button
									onclick={clearAll}
									class="btn btn-xs rounded-lg border border-base-content/10 bg-base-100 hover:bg-base-200 gap-1.5 font-semibold text-base-content/50"
								>Clear</button>
							{/if}
						</div>
					</div>
					<textarea
						bind:value={inputCode}
						rows={16}
						placeholder="Paste JavaScript code here or upload a .js file..."
						class="w-full flex-1 resize-none border-none bg-transparent p-5 text-sm outline-none focus:ring-0 font-mono min-h-[400px] rounded-b-2xl text-base-content/80 placeholder:text-base-content/25"
					></textarea>
				</div>

				<!-- Output -->
				<div class="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 shadow-xl backdrop-blur-md">
					<div class="flex items-center justify-between border-b border-base-content/10 bg-base-200/30 h-14 px-4 rounded-t-2xl">
						<span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Output (Protected)</span>
						<div class="flex items-center gap-2">
							<button
								onclick={download}
								disabled={!outputCode}
								class="btn btn-xs rounded-lg border border-base-content/10 bg-base-100 hover:bg-base-200 gap-1.5 font-semibold disabled:opacity-30"
							>
								<Download size={13} /> Download
							</button>
							<button
								onclick={copyOutput}
								disabled={!outputCode}
								class="btn btn-xs rounded-lg font-bold gap-1.5 disabled:opacity-30
									{copied ? 'bg-success text-success-content border-success' : 'border border-base-content/10 bg-base-100 hover:bg-base-200'}"
							>
								{#if copied}
									<Check size={13} /> Copied!
								{:else}
									<Copy size={13} /> Copy
								{/if}
							</button>
						</div>
					</div>
					<div class="relative flex-1 flex flex-col">
						{#if !outputCode}
							<div class="absolute inset-0 flex flex-col items-center justify-center text-base-content/20 pointer-events-none">
								<Lock size={40} strokeWidth={1} class="mb-3 opacity-50" />
								<p class="text-sm font-medium">Kode terproteksi akan muncul di sini</p>
							</div>
						{/if}
						<textarea
							bind:value={outputCode}
							rows={16}
							readonly
							placeholder=""
							class="w-full flex-1 resize-none border-none bg-transparent p-5 text-sm outline-none focus:ring-0 font-mono min-h-[400px] rounded-b-2xl {outputCode ? 'text-base-content/80' : ''}"
						></textarea>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>

