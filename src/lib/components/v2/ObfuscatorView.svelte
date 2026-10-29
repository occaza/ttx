<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import {
		Lock,
		Copy,
		Check,
		Download,
		RefreshCw,
		Upload,
		Trash2,
		AlertTriangle,
		Play
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let inputCode = $state(`// Contoh kode JavaScript
function hitungTotal(harga, kuantiti) {
    const pajak = 0.11;
    const subtotal = harga * kuantiti;
    const total = subtotal + (subtotal * pajak);
    console.log("Total pembayaran: Rp " + total.toLocaleString());
    return total;
}

hitungTotal(150000, 3);`);

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
	let fileInputEl: HTMLInputElement | null = $state(null);

	function loadScript(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`script[src="${src}"]`)) {
				resolve();
				return;
			}
			const script = document.createElement('script');
			script.src = src;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
			document.head.appendChild(script);
		});
	}

	onMount(() => {
		if (!browser) return;

		let mounted = true;

		Promise.all([
			loadScript('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js'),
			loadScript('https://cdn.jsdelivr.net/npm/javascript-obfuscator/dist/index.browser.js')
		])
			.then(() => {
				if (mounted) {
					isReady = true;
				}
			})
			.catch((err) => {
				console.error('Failed to load obfuscator libraries:', err);
			});

		return () => {
			mounted = false;
		};
	});

	function generateRandom(len: number) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
		return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
	}

	async function copyOutput() {
		if (!outputCode) return;
		await navigator.clipboard.writeText(outputCode);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function download() {
		if (!outputCode) return;
		const blob = new Blob([outputCode], { type: 'text/javascript' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'obfuscated.js';
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			inputCode = (reader.result as string) || '';
		};
		reader.readAsText(file);
	}

	function clearAll() {
		inputCode = '';
		outputCode = '';
		if (fileInputEl) fileInputEl.value = '';
	}

	async function obfuscate() {
		if (!inputCode.trim()) return;
		if (!isReady) return;

		obfuscating = true;
		await new Promise((r) => setTimeout(r, 60));

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
			console.error('Obfuscation error:', err);
		}

		obfuscating = false;
	}
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
				: 'border-blue-200 bg-blue-50 text-blue-600'}"
		>
			<Lock size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				JavaScript Obfuscator
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Lindungi kode JavaScript dari rekayasa balik dengan obfuscation & enkripsi
			</p>
		</div>
	</div>

	<!-- Main Layout -->
	<div class="flex flex-col gap-4 lg:flex-row">
		<!-- Left Settings Panel -->
		<div
			class="flex w-full flex-col gap-4 rounded-xl border p-4 lg:w-64 lg:shrink-0 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<!-- Obfuscation Level -->
			<div>
				<p
					class="mb-2 text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Tingkat Obfuscation
				</p>
				<div class="grid grid-cols-3 gap-1.5">
					{#each ['low', 'medium', 'high'] as lvl}
						<button
							type="button"
							onclick={() => (level = lvl as any)}
							class="h-8 rounded-lg border text-xs font-semibold capitalize transition-all {level ===
							lvl
								? isDark
									? 'border-blue-500/40 bg-blue-600/20 text-blue-300'
									: 'border-blue-300 bg-blue-50 text-blue-600'
								: isDark
									? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
									: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
						>
							{lvl}
						</button>
					{/each}
				</div>
			</div>

			<!-- Target Environment -->
			<div>
				<p
					class="mb-2 text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Target
				</p>
				<div class="space-y-1">
					{#each [['browser', 'Browser'], ['browser-no-eval', 'Browser (No Eval)'], ['node', 'Node.js']] as [val, label]}
						<button
							type="button"
							onclick={() => (target = val as any)}
							class="flex h-8 w-full items-center px-3 rounded-lg border text-xs font-medium transition-all {target ===
							val
								? isDark
									? 'border-blue-500/40 bg-blue-600/20 text-blue-300'
									: 'border-blue-300 bg-blue-50 text-blue-600'
								: isDark
									? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:border-slate-600 hover:text-slate-200'
									: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
						>
							{label}
						</button>
					{/each}
				</div>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Options Toggles -->
			<div class="space-y-2">
				<p
					class="text-[10px] font-bold uppercase tracking-wider {isDark
						? 'text-slate-500'
						: 'text-slate-400'}"
				>
					Opsi Lanjutan
				</p>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={compact}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>Compact (Satu Baris)</span
					>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={controlFlow}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>Control-flow Flattening</span
					>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={deadCode}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>Dead-code Injection</span
					>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={selfDefending}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}">Self Defending</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={stringArray}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs {isDark ? 'text-slate-300' : 'text-slate-700'}"
						>String Array Encoding</span
					>
				</label>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Encryption Wrapper -->
			<div class="space-y-2">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={enableEncryption}
						class="h-3.5 w-3.5 rounded accent-blue-600"
					/>
					<span class="text-xs font-semibold {isDark ? 'text-slate-200' : 'text-slate-800'}"
						>AES Encryption</span
					>
				</label>
				{#if enableEncryption}
					<div class="space-y-1.5 pt-1">
						<input
							type="text"
							bind:value={encryptKey}
							placeholder="Encryption Key"
							class="h-8 w-full rounded-md px-2.5 font-mono text-[11px] outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-600'
								: 'border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400'}"
						/>
						<input
							type="text"
							bind:value={encryptSalt}
							placeholder="Salt Key"
							class="h-8 w-full rounded-md px-2.5 font-mono text-[11px] outline-none {isDark
								? 'border border-[#1e2e50] bg-[#111a2f] text-slate-200 placeholder-slate-600'
								: 'border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400'}"
						/>
						<button
							type="button"
							onclick={() => {
								encryptKey = generateRandom(24);
								encryptSalt = generateRandom(12);
							}}
							class="flex h-7 w-full items-center justify-center gap-1 rounded-md border text-[11px] font-medium transition-all {isDark
								? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
								: 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'}"
						>
							<RefreshCw size={11} /> Generate Kunci Acak
						</button>
					</div>
				{/if}
			</div>

			<!-- Execute Button -->
			<button
				type="button"
				onclick={obfuscate}
				disabled={obfuscating || !isReady || !inputCode.trim()}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 {isDark
					? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}"
			>
				{#if obfuscating}
					<RefreshCw size={13} class="animate-spin" /> Memproses...
				{:else if !isReady}
					Memuat Library...
				{:else}
					<Lock size={13} /> Obfuscate Code
				{/if}
			</button>
		</div>

		<!-- Right: Editors Area -->
		<div class="flex min-w-0 flex-1 flex-col gap-3">
			<!-- Notice Banner -->
			<div
				class="flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-xs {isDark
					? 'border-amber-900/40 bg-amber-950/20 text-amber-300'
					: 'border-amber-200 bg-amber-50 text-amber-800'}"
			>
				<AlertTriangle size={14} class="shrink-0 text-amber-400" />
				<span>Simpan selalu cadangan kode asli sebelum melakukan obfuscasi.</span>
			</div>

			<!-- Split Editor -->
			<div
				class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border sm:flex-row {isDark
					? 'border-[#1a253c]'
					: 'border-slate-200'}"
			>
				<!-- Input -->
				<div
					class="flex flex-1 flex-col min-h-[260px] sm:min-h-0 {isDark
						? 'border-r border-[#1a253c]'
						: 'border-r border-slate-200'}"
				>
					<div
						class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
							? 'border-[#1a253c] bg-[#0d1525]'
							: 'border-slate-200 bg-slate-50'}"
					>
						<span
							class="text-[10px] font-bold uppercase tracking-wider {isDark
								? 'text-slate-500'
								: 'text-slate-400'}"
						>
							Input JavaScript
						</span>
						<div class="flex items-center gap-2">
							<input
								bind:this={fileInputEl}
								type="file"
								accept=".js"
								class="hidden"
								onchange={handleFileUpload}
							/>
							<button
								type="button"
								onclick={() => fileInputEl?.click()}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
									? 'text-slate-400 hover:bg-[#16223b] hover:text-slate-200'
									: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
							>
								<Upload size={11} /> Upload .js
							</button>
							{#if inputCode}
								<button
									type="button"
									onclick={clearAll}
									class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
										? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
										: 'text-slate-400 hover:bg-red-50 hover:text-red-500'}"
								>
									<Trash2 size={11} /> Clear
								</button>
							{/if}
						</div>
					</div>
					<textarea
						bind:value={inputCode}
						placeholder="Ketik atau paste kode JavaScript di sini..."
						class="w-full flex-1 resize-none p-4 font-mono text-xs outline-none leading-relaxed {isDark
							? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
							: 'bg-white text-slate-800 placeholder-slate-400'}"
					></textarea>
				</div>

				<!-- Output -->
				<div class="flex flex-1 flex-col min-h-[220px] sm:min-h-0">
					<div
						class="flex h-11 shrink-0 items-center justify-between border-b px-4 {isDark
							? 'border-[#1a253c] bg-[#0d1525]'
							: 'border-slate-200 bg-slate-50'}"
					>
						<span
							class="text-[10px] font-bold uppercase tracking-wider {isDark
								? 'text-slate-500'
								: 'text-slate-400'}"
						>
							Hasil Terproteksi
						</span>
						<div class="flex items-center gap-2">
							{#if outputCode}
								<button
									type="button"
									onclick={download}
									class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {isDark
										? 'text-slate-400 hover:bg-[#16223b] hover:text-slate-200'
										: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
								>
									<Download size={11} /> Download
								</button>
								<button
									type="button"
									onclick={copyOutput}
									class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {copied
										? isDark
											? 'bg-green-500/10 text-green-400'
											: 'bg-green-50 text-green-600'
										: isDark
											? 'text-slate-400 hover:bg-blue-500/10 hover:text-blue-300'
											: 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}"
								>
									{#if copied}
										<Check size={11} /> Copied!
									{:else}
										<Copy size={11} /> Copy
									{/if}
								</button>
							{/if}
						</div>
					</div>
					<div class="relative flex-1">
						{#if !outputCode}
							<div
								class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center {isDark
									? 'text-slate-700'
									: 'text-slate-300'}"
							>
								<Lock size={32} strokeWidth={1} class="mb-2" />
								<p class="text-xs">Kode hasil obfuscate akan muncul di sini</p>
							</div>
						{/if}
						<textarea
							value={outputCode}
							readonly
							class="absolute inset-0 h-full w-full resize-none p-4 font-mono text-xs outline-none leading-relaxed {isDark
								? 'bg-[#08101e] text-slate-300'
								: 'bg-slate-50 text-slate-700'}"
						></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

