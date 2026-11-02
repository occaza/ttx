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

<div class="flex flex-col gap-5 flex-1">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]">
			<Type size={18} />
		</div>
		<div>
			<h1 class="text-base font-bold text-[var(--ttx-text-main)]">Case Converter</h1>
			<p class="text-xs text-[var(--ttx-text-muted)]">Ubah kapitalisasi teks ke berbagai format</p>
		</div>
	</div>

	<!-- Main layout: case buttons + editors -->
	<div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
		<!-- Case selector panel -->
		<div class="w-full lg:w-72 shrink-0 flex flex-col gap-4 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] p-4">
			<!-- Standard -->
			<div>
				<p class="text-[10px] font-bold uppercase tracking-wider mb-2 text-[var(--ttx-text-dim)]">Standard</p>
				<div class="grid grid-cols-2 gap-1.5">
					{#each standardCases as c}
						<button
							type="button"
							onclick={() => applyCase(c.key, input)}
							class="h-9 flex items-center justify-center rounded-lg border text-xs font-medium transition-all {c.span ? 'col-span-2' : ''} {activeCase === c.key
								? 'bg-[var(--ttx-accent-light)] border-[var(--ttx-border-focus)] text-[var(--ttx-accent-text)]'
								: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]'}"
						>
							{c.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="h-px bg-[var(--ttx-border-base)]"></div>

			<!-- Programming -->
			<div>
				<p class="text-[10px] font-bold uppercase tracking-wider mb-2 text-[var(--ttx-text-dim)]">Programming</p>
				<div class="grid grid-cols-2 gap-1.5">
					{#each programmingCases as c}
						<button
							type="button"
							onclick={() => applyCase(c.key, input)}
							class="h-9 flex items-center justify-center rounded-lg border text-xs font-medium transition-all {activeCase === c.key
								? 'bg-[var(--ttx-accent-light)] border-[var(--ttx-border-focus)] text-[var(--ttx-accent-text)]'
								: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]'}"
						>
							{c.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Editor panel: input | output -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs min-w-0">
			<div class="flex min-w-0 flex-1 flex-col sm:flex-row overflow-hidden">
				<!-- Input -->
				<div class="flex-1 flex flex-col min-h-[220px] sm:min-h-0 border-r border-[var(--ttx-border-base)]">
					<div class="flex items-center justify-between px-4 h-9 border-b shrink-0 bg-[var(--ttx-bg-card-subtle)] border-[var(--ttx-border-base)]">
						<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Input</span>
						{#if input}
							<button
								type="button"
								onclick={clear}
								class="flex items-center gap-1 text-[10px] font-medium rounded-md px-2 py-1 transition-colors text-[var(--ttx-text-dim)] hover:text-rose-500 hover:bg-rose-500/10"
							>
								<Trash2 size={11} /> Clear
							</button>
						{/if}
					</div>
					<textarea
						bind:value={input}
						placeholder="Ketik atau paste teks di sini..."
						class="flex-1 resize-none p-4 text-sm font-mono outline-none w-full bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
					></textarea>
				</div>

				<!-- Output -->
				<div class="flex-1 flex flex-col min-h-[180px] sm:min-h-0">
					<div class="flex items-center justify-between px-4 h-9 border-b shrink-0 bg-[var(--ttx-bg-card-subtle)] border-[var(--ttx-border-base)]">
						<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Output</span>
						{#if output}
							<button
								type="button"
								onclick={copyOutput}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors {copied ? 'bg-emerald-500/10 text-emerald-500' : 'text-[var(--ttx-text-dim)] hover:bg-[var(--ttx-accent-light)] hover:text-[var(--ttx-accent-text)]'}"
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
							<div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[var(--ttx-text-dim)]">
								<Type size={32} strokeWidth={1} class="mb-2" />
								<p class="text-xs">Hasil konversi muncul di sini</p>
							</div>
						{/if}
						<textarea
							value={output}
							readonly
							class="absolute inset-0 w-full h-full resize-none p-4 text-sm font-mono outline-none bg-[var(--ttx-bg-card-subtle)] text-[var(--ttx-text-muted)]"
						></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
