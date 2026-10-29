<script lang="ts">
	import { Copy, Check, Trash2, Type, CaseLower, CaseUpper, Hash, Minus } from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	let input = $state('');
	let output = $state('');
	let activeCase = $state('none');
	let copied = $state(false);

	$effect(() => {
		if (input === '') {
			output = '';
			activeCase = 'none';
			return;
		}
		applyCase(activeCase, input);
	});

	function applyCase(type: string, text: string) {
		activeCase = type;

		if (type === 'none') {
			output = text;
			return;
		}

		let result = '';

		switch (type) {
			case 'uppercase':
				result = text.toUpperCase();
				break;
			case 'lowercase':
				result = text.toLowerCase();
				break;
			case 'titlecase':
				result = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
				break;
			case 'sentencecase':
				result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
				break;
			case 'camelcase':
				result = text
					.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
						index === 0 ? word.toLowerCase() : word.toUpperCase()
					)
					.replace(/\s+/g, '');
				break;
			case 'pascalcase':
				result = text
					.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
					.replace(/\s+/g, '');
				break;
			case 'snakecase':
				result = text
					.replace(/\W+/g, ' ')
					.split(/ |\B(?=[A-Z])/)
					.map((word) => word.toLowerCase())
					.join('_');
				break;
			case 'kebabcase':
				result = text
					.replace(/\W+/g, ' ')
					.split(/ |\B(?=[A-Z])/)
					.map((word) => word.toLowerCase())
					.join('-');
				break;
			case 'alternatingcase':
				result = text
					.toLowerCase()
					.split('')
					.map((c, i) => (i % 2 !== 0 ? c.toUpperCase() : c))
					.join('');
				break;
			default:
				result = text;
		}

		output = result;
	}

	function clear() {
		input = '';
		output = '';
		activeCase = 'none';
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	const standardCases = [
		{ key: 'sentencecase', label: 'Sentence case' },
		{ key: 'titlecase', label: 'Title Case' },
		{ key: 'lowercase', label: 'lower case' },
		{ key: 'uppercase', label: 'UPPER CASE' },
		{ key: 'alternatingcase', label: 'aLtErNaTiNg', span: true }
	];

	const programmingCases = [
		{ key: 'camelcase', label: 'camelCase' },
		{ key: 'pascalcase', label: 'PascalCase' },
		{ key: 'snakecase', label: 'snake_case' },
		{ key: 'kebabcase', label: 'kebab-case' }
	];
</script>

<div class="flex flex-col gap-5 h-full">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
				? 'bg-[#111a2f] border-[#1e2e50] text-blue-400'
				: 'bg-blue-50 border-blue-200 text-blue-600'}"
		>
			<Type size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
				Case Converter
			</h1>
			<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
				Ubah kapitalisasi teks ke berbagai format
			</p>
		</div>
	</div>

	<!-- Main layout: case buttons + editors -->
	<div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
		<!-- Case selector panel -->
		<div
			class="w-full lg:w-52 shrink-0 flex flex-col gap-4 rounded-xl border p-4 {isDark
				? 'bg-[#0d1525] border-[#1a253c]'
				: 'bg-white border-slate-200'}"
		>
			<!-- Standard -->
			<div>
				<p class="text-[10px] font-bold uppercase tracking-wider mb-2 {isDark ? 'text-slate-500' : 'text-slate-400'}">
					Standard
				</p>
				<div class="grid grid-cols-2 gap-1.5">
					{#each standardCases as c}
						<button
							type="button"
							onclick={() => applyCase(c.key, input)}
							class="h-9 flex items-center justify-center rounded-lg border text-xs font-medium transition-all {c.span ? 'col-span-2' : ''} {activeCase === c.key
								? isDark
									? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
									: 'bg-blue-50 border-blue-300 text-blue-600'
								: isDark
									? 'bg-[#111a2f] border-[#1e2e50] text-slate-400 hover:text-slate-200 hover:border-slate-600'
									: 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
						>
							{c.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="h-px {isDark ? 'bg-[#1a253c]' : 'bg-slate-200'}"></div>

			<!-- Programming -->
			<div>
				<p class="text-[10px] font-bold uppercase tracking-wider mb-2 {isDark ? 'text-slate-500' : 'text-slate-400'}">
					Programming
				</p>
				<div class="grid grid-cols-2 gap-1.5">
					{#each programmingCases as c}
						<button
							type="button"
							onclick={() => applyCase(c.key, input)}
							class="h-9 flex items-center justify-center rounded-lg border text-xs font-medium transition-all {activeCase === c.key
								? isDark
									? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
									: 'bg-blue-50 border-blue-300 text-blue-600'
								: isDark
									? 'bg-[#111a2f] border-[#1e2e50] text-slate-400 hover:text-slate-200 hover:border-slate-600'
									: 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'}"
						>
							{c.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Editor panel: input | output -->
		<div
			class="flex-1 min-w-0 flex flex-col sm:flex-row rounded-xl border overflow-hidden {isDark
				? 'border-[#1a253c]'
				: 'border-slate-200'}"
		>
			<!-- Input -->
			<div class="flex-1 flex flex-col min-h-[220px] sm:min-h-0 {isDark ? 'border-r border-[#1a253c]' : 'border-r border-slate-200'}">
				<div
					class="flex items-center justify-between px-4 h-11 border-b shrink-0 {isDark
						? 'bg-[#0d1525] border-[#1a253c]'
						: 'bg-slate-50 border-slate-200'}"
				>
					<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-500' : 'text-slate-400'}">
						Input
					</span>
					{#if input}
						<button
							type="button"
							onclick={clear}
							class="flex items-center gap-1 text-[10px] font-medium rounded-md px-2 py-1 transition-colors {isDark
								? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
								: 'text-slate-400 hover:text-red-500 hover:bg-red-50'}"
						>
							<Trash2 size={11} /> Clear
						</button>
					{/if}
				</div>
				<textarea
					bind:value={input}
					placeholder="Ketik atau paste teks di sini..."
					class="flex-1 resize-none p-4 text-sm font-mono outline-none w-full {isDark
						? 'bg-[#08101e] text-slate-200 placeholder-slate-600'
						: 'bg-white text-slate-800 placeholder-slate-400'}"
				></textarea>
			</div>

			<!-- Output -->
			<div class="flex-1 flex flex-col min-h-[180px] sm:min-h-0">
				<div
					class="flex items-center justify-between px-4 h-11 border-b shrink-0 {isDark
						? 'bg-[#0d1525] border-[#1a253c]'
						: 'bg-slate-50 border-slate-200'}"
				>
					<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-500' : 'text-slate-400'}">
						Output
					</span>
					{#if output}
						<button
							type="button"
							onclick={copyOutput}
							class="flex items-center gap-1 text-[10px] font-medium rounded-md px-2 py-1 transition-colors {copied
								? isDark
									? 'text-green-400 bg-green-500/10'
									: 'text-green-600 bg-green-50'
								: isDark
									? 'text-slate-400 hover:text-blue-300 hover:bg-blue-500/10'
									: 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}"
						>
							{#if copied}
								<Check size={11} /> Copied!
							{:else}
								<Copy size={11} /> Copy
							{/if}
						</button>
					{/if}
				</div>
				<div class="flex-1 relative">
					{#if !output && !input}
						<div
							class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none {isDark
								? 'text-slate-700'
								: 'text-slate-300'}"
						>
							<Type size={32} strokeWidth={1} class="mb-2" />
							<p class="text-xs">Hasil konversi muncul di sini</p>
						</div>
					{/if}
					<textarea
						value={output}
						readonly
						class="absolute inset-0 w-full h-full resize-none p-4 text-sm font-mono outline-none {isDark
							? 'bg-[#08101e] text-slate-300'
							: 'bg-slate-50 text-slate-700'}"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div>
