<script lang="ts">
	import {
		Contact,
		Users,
		Phone,
		PhoneOff,
		Copy,
		Check,
		Trash2,
		Upload,
		Download,
		Sparkles
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	const SAMPLE_VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Budi Santoso
TEL;TYPE=CELL:+6281234567890
EMAIL:budi@example.com
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Siti Rahmawati
TEL;TYPE=WORK:+6281987654321
EMAIL:siti@company.org
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Ahmad Hidayat
EMAIL:ahmad@example.net
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Dewi Lestari
TEL;TYPE=HOME:021-5551234
END:VCARD`;

	let input = $state(SAMPLE_VCARD);
	let output = $state('');
	let delimiter = $state(' | ');
	let totalContacts = $state(0);
	let withPhone = $state(0);
	let withoutPhone = $state(0);
	let hasParsed = $state(false);
	let copied = $state(false);
	let fileInputEl: HTMLInputElement | null = $state(null);

	function parseVCard() {
		if (!input.trim()) {
			output = '';
			totalContacts = 0;
			withPhone = 0;
			withoutPhone = 0;
			hasParsed = false;
			return;
		}

		// Check if input is standard vCard or CSV text
		if (input.includes('BEGIN:VCARD')) {
			const vcards = input.split('BEGIN:VCARD');
			const results: string[] = [];

			totalContacts = 0;
			withPhone = 0;
			withoutPhone = 0;

			vcards.forEach((vcard) => {
				if (!vcard.trim()) return;
				totalContacts++;

				let name = '';
				let phone = '';

				const lines = vcard.split(/\r?\n/);
				lines.forEach((line) => {
					line = line.trim();
					if (line.startsWith('FN:')) {
						name = line.substring(3).trim();
						name = name.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
					} else if (line.startsWith('N:') && !name) {
						// Fallback to N field
						const parts = line.substring(2).split(';').filter(Boolean);
						name = parts.reverse().join(' ').trim();
					}

					if (line.toUpperCase().includes('TEL') && line.includes(':')) {
						const colonIndex = line.indexOf(':');
						if (colonIndex !== -1) {
							const phoneNumber = line.substring(colonIndex + 1).trim();
							if (!phone && phoneNumber) {
								phone = phoneNumber;
							}
						}
					}
				});

				if (name) {
					if (phone) {
						results.push(`${name}${delimiter}${phone}`);
						withPhone++;
					} else {
						results.push(`${name}${delimiter}No phone`);
						withoutPhone++;
					}
				}
			});

			output = results.join('\n');
		} else {
			// Generic CSV / plain delimiter parser
			const lines = input.split(/\r?\n/).filter((l) => l.trim() !== '');
			const results: string[] = [];
			totalContacts = lines.length;
			withPhone = 0;
			withoutPhone = 0;

			lines.forEach((line) => {
				const parts = line.split(/[,;\t|]/).map((p) => p.trim());
				if (parts.length >= 2) {
					results.push(`${parts[0]}${delimiter}${parts[1]}`);
					withPhone++;
				} else if (parts.length === 1) {
					results.push(`${parts[0]}${delimiter}No phone`);
					withoutPhone++;
				}
			});
			output = results.join('\n');
		}

		hasParsed = true;
	}

	function loadSample() {
		input = SAMPLE_VCARD;
		parseVCard();
	}

	function clearAll() {
		input = '';
		output = '';
		totalContacts = 0;
		withPhone = 0;
		withoutPhone = 0;
		hasParsed = false;
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			input = (ev.target?.result as string) || '';
			parseVCard();
		};
		reader.readAsText(file);
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadOutput() {
		if (!output) return;
		const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'parsed-contacts.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	// Auto parse when input changes if already parsed
	$effect(() => {
		if (input && !hasParsed) {
			parseVCard();
		}
	});
</script>

<div class="flex flex-col gap-5 w-full flex-1">
	<input
		type="file"
		accept=".vcf,.vcard,.csv,.txt,text/plain"
		bind:this={fileInputEl}
		onchange={handleFileUpload}
		class="hidden"
	/>

	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3 shrink-0">
		<div class="flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]">
				<Contact size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold text-[var(--ttx-text-main)]">CSV & vCard Contact Parser</h1>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Ekstrak nama dan nomor telepon dari file vCard (.vcf) atau teks kontak secara instan
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={loadSample}
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)] transition-all"
			>
				<Sparkles size={13} />
				Contoh vCard
			</button>
			<button
				type="button"
				onclick={() => fileInputEl?.click()}
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)] transition-all"
			>
				<Upload size={13} />
				Unggah File
			</button>
			<button
				type="button"
				onclick={clearAll}
				class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--ttx-text-dim)] hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
			>
				<Trash2 size={13} />
				Reset
			</button>
		</div>
	</div>

	<!-- Unified card: stats + toolbar + editor -->
	<div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs">
		<!-- Stats strip -->
		<div class="grid grid-cols-3 divide-x divide-[var(--ttx-border-base)] border-b border-[var(--ttx-border-base)]">
			<div class="flex items-center gap-3 px-4 py-3">
				<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
					<Users size={18} />
				</div>
				<div>
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Total Kontak
					</span>
					<p class="text-lg font-bold text-[var(--ttx-text-main)]">{totalContacts}</p>
				</div>
			</div>

			<div class="flex items-center gap-3 px-4 py-3">
				<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
					<Phone size={18} />
				</div>
				<div>
					<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
						Ada Nomor Telepon
					</span>
					<p class="text-lg font-bold text-emerald-400">{withPhone}</p>
				</div>
			</div>

			<div class="flex items-center gap-3 px-4 py-3">
				<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
					<PhoneOff size={18} />
				</div>
				<div>
					<span class="text-[10px] font-bold uppercase tracking-wider text-rose-400">
						Tanpa Nomor Telepon
					</span>
					<p class="text-lg font-bold text-rose-400">{withoutPhone}</p>
				</div>
			</div>
		</div>

		<!-- Toolbar strip -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)] px-4 py-2.5 shrink-0">
			<div class="flex items-center gap-3">
				<label
					for="delimiter-select"
					class="text-xs font-medium text-[var(--ttx-text-muted)]"
				>
					Pemisah Output:
				</label>
				<select
					id="delimiter-select"
					bind:value={delimiter}
					onchange={parseVCard}
					class="h-8 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 text-xs text-[var(--ttx-text-main)] outline-none transition-colors"
				>
					<option value=" | ">Nama | Telepon</option>
					<option value=",">Nama, Telepon (CSV)</option>
					<option value=" - ">Nama - Telepon</option>
					<option value="	">Nama [Tab] Telepon</option>
				</select>
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={parseVCard}
					class="flex items-center gap-1.5 rounded-lg bg-[var(--ttx-accent)] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[var(--ttx-accent-hover)]"
				>
					<Contact size={14} />
					Ekstrak Kontak
				</button>
				{#if output}
					<button
						type="button"
						onclick={copyOutput}
						class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)] transition-all"
					>
						{#if copied}
							<Check size={14} class="text-emerald-400" />
							<span class="text-emerald-400">Tersalin</span>
						{:else}
							<Copy size={14} />
							<span>Salin</span>
						{/if}
					</button>
					<button
						type="button"
						onclick={downloadOutput}
						class="flex items-center gap-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3 py-2 text-xs font-medium text-[var(--ttx-text-muted)] hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)] transition-all"
					>
						<Download size={14} />
						<span>Download .txt</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Editor panel: input | output -->
		<div class="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden">
			<!-- Left Pane: Input -->
			<div class="flex-1 flex flex-col min-h-[220px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-[var(--ttx-border-base)]">
				<div class="flex items-center justify-between px-4 h-9 border-b shrink-0 bg-[var(--ttx-bg-card-subtle)] border-[var(--ttx-border-base)]">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Input Data (vCard / CSV / Teks)
					</span>
					<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">
						{input ? input.split(/\r?\n/).length : 0} baris
					</span>
				</div>
				<textarea
					bind:value={input}
					oninput={parseVCard}
					placeholder="Tempel file .vcf vCard atau teks kontak di sini..."
					class="flex-1 resize-none p-4 text-xs sm:text-sm font-mono outline-none w-full bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)]"
				></textarea>
			</div>

			<!-- Right Pane: Output -->
			<div class="flex-1 flex flex-col min-h-[220px] lg:min-h-0">
				<div class="flex items-center justify-between px-4 h-9 border-b shrink-0 bg-[var(--ttx-bg-card-subtle)] border-[var(--ttx-border-base)]">
					<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">
						Hasil Ekstraksi Kontak
					</span>
					<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">
						{output ? output.split(/\r?\n/).length : 0} baris
					</span>
				</div>
				<textarea
					value={output}
					readonly
					placeholder="Hasil ekstraksi kontak akan muncul di sini..."
					class="flex-1 resize-none p-4 text-xs sm:text-sm font-mono outline-none w-full bg-[var(--ttx-bg-card-subtle)] text-[var(--ttx-text-muted)]"
				></textarea>
			</div>
		</div>
	</div>
</div>
