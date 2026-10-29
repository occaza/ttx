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

<div class="flex flex-col gap-5 w-full">
	<input
		type="file"
		accept=".vcf,.vcard,.csv,.txt,text/plain"
		bind:this={fileInputEl}
		onchange={handleFileUpload}
		class="hidden"
	/>

	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-blue-400'
					: 'border-blue-200 bg-blue-50 text-blue-600'}"
			>
				<Contact size={18} />
			</div>
			<div>
				<h1 class="text-base font-bold {isDark ? 'text-white' : 'text-slate-900'}">
					CSV & vCard Contact Parser
				</h1>
				<p class="text-xs {isDark ? 'text-slate-500' : 'text-slate-500'}">
					Ekstrak nama dan nomor telepon dari file vCard (.vcf) atau teks kontak secara instan
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={loadSample}
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white hover:border-blue-500/50'
					: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300'}"
			>
				<Sparkles size={13} />
				Contoh vCard
			</button>
			<button
				type="button"
				onclick={() => fileInputEl?.click()}
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white hover:border-blue-500/50'
					: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300'}"
			>
				<Upload size={13} />
				Unggah File
			</button>
			<button
				type="button"
				onclick={clearAll}
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
					: 'border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200'}"
			>
				<Trash2 size={13} />
				Reset
			</button>
		</div>
	</div>

	<!-- Options & Stats Toolbar -->
	<div
		class="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 {isDark
			? 'border-[#1a253c] bg-[#0d1525]'
			: 'border-slate-200 bg-white'}"
	>
		<div class="flex items-center gap-3">
			<label
				for="delimiter-select"
				class="text-xs font-medium {isDark ? 'text-slate-400' : 'text-slate-600'}"
			>
				Pemisah Output:
			</label>
			<select
				id="delimiter-select"
				bind:value={delimiter}
				onchange={parseVCard}
				class="h-8 rounded-lg border px-2.5 text-xs outline-none transition-colors {isDark
					? 'border-[#1e2e50] bg-[#111a2f] text-slate-200'
					: 'border-slate-200 bg-slate-50 text-slate-800'}"
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
				class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-500"
			>
				<Contact size={14} />
				Ekstrak Kontak
			</button>
			{#if output}
				<button
					type="button"
					onclick={copyOutput}
					class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
						: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
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
					class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors {isDark
						? 'border-[#1e2e50] bg-[#111a2f] text-slate-300 hover:text-white'
						: 'border-slate-200 bg-white text-slate-700 hover:text-blue-600'}"
				>
					<Download size={14} />
					<span>Download .txt</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Statistics Badges -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
		<div
			class="flex items-center gap-3 rounded-xl border p-3.5 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
				<Users size={18} />
			</div>
			<div>
				<span class="text-[10px] font-bold uppercase tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Total Kontak
				</span>
				<p class="text-lg font-bold {isDark ? 'text-white' : 'text-slate-900'}">{totalContacts}</p>
			</div>
		</div>

		<div
			class="flex items-center gap-3 rounded-xl border p-3.5 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
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

		<div
			class="flex items-center gap-3 rounded-xl border p-3.5 {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
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

	<!-- Dual Pane Editor -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<!-- Left Pane: Input -->
		<div
			class="flex flex-col rounded-xl border overflow-hidden {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<div
				class="flex items-center justify-between border-b px-4 py-3 {isDark
					? 'border-[#1a253c] bg-[#11192c]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-200' : 'text-slate-800'}">
					Input Data (vCard / CSV / Teks)
				</span>
				<span class="text-[11px] font-mono {isDark ? 'text-slate-500' : 'text-slate-400'}">
					{input ? input.split(/\r?\n/).length : 0} baris
				</span>
			</div>
			<div class="p-3">
				<textarea
					bind:value={input}
					oninput={parseVCard}
					placeholder="Tempel file .vcf vCard atau teks kontak di sini..."
					rows={16}
					class="w-full resize-none rounded-lg p-3 font-mono text-xs outline-none transition-all {isDark
						? 'border border-[#1a253c] bg-[#080d1a] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
				></textarea>
			</div>
		</div>

		<!-- Right Pane: Output -->
		<div
			class="flex flex-col rounded-xl border overflow-hidden {isDark
				? 'border-[#1a253c] bg-[#0d1525]'
				: 'border-slate-200 bg-white'}"
		>
			<div
				class="flex items-center justify-between border-b px-4 py-3 {isDark
					? 'border-[#1a253c] bg-[#11192c]'
					: 'border-slate-200 bg-slate-50'}"
			>
				<span class="text-xs font-bold uppercase tracking-wider {isDark ? 'text-slate-200' : 'text-slate-800'}">
					Hasil Ekstraksi Kontak
				</span>
				<span class="text-[11px] font-mono {isDark ? 'text-slate-500' : 'text-slate-400'}">
					{output ? output.split(/\r?\n/).length : 0} baris
				</span>
			</div>
			<div class="p-3">
				<textarea
					value={output}
					readonly
					placeholder="Hasil ekstraksi kontak akan muncul di sini..."
					rows={16}
					class="w-full resize-none rounded-lg p-3 font-mono text-xs outline-none transition-all {isDark
						? 'border border-[#1a253c] bg-[#080d1a] text-slate-100 placeholder-slate-500 focus:border-blue-500'
						: 'border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'}"
				></textarea>
			</div>
		</div>
	</div>
</div>

