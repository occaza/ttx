<script lang="ts">
	import {
		Binary,
		Copy,
		Check,
		RotateCcw,
		Sparkles,
		FileCode,
		ArrowRightLeft,
		AlertCircle
	} from '@lucide/svelte';

	interface Props {
		isDark?: boolean;
	}

	let { isDark = true }: Props = $props();

	// Modes: 'number' (BigInt integer converter) | 'text' (ASCII/UTF-8 string converter)
	let mode = $state<'number' | 'text'>('number');

	// --- NUMBER MODE STATES ---
	let hexInput = $state('0xFF');
	let decInput = $state('255');
	let binInput = $state('0b11111111');
	let octInput = $state('0o377');
	let numberError = $state('');
	let showPrefix = $state(true);
	let groupDigits = $state(false);

	// --- TEXT MODE STATES ---
	let textString = $state('Hello World');
	let textHex = $state('48 65 6c 6c 6f 20 57 6f 72 6c 64');
	let textBin = $state('01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100');
	let textDec = $state('72 101 108 108 111 32 87 111 114 108 100');
	let textBase64 = $state('SGVsbG8gV29ybGQ=');
	let textError = $state('');

	// Copy feedback tracking
	let copiedField = $state<string | null>(null);

	function showCopied(fieldKey: string) {
		copiedField = fieldKey;
		setTimeout(() => {
			if (copiedField === fieldKey) copiedField = null;
		}, 1600);
	}

	async function copyToClipboard(value: string, fieldKey: string) {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			showCopied(fieldKey);
		} catch {
			// fallback
		}
	}

	// ----------------------------------------------------
	// NUMBER MODE CONVERSIONS (Using BigInt for precision)
	// ----------------------------------------------------
	function cleanNumberInput(raw: string): string {
		return raw.replace(/[\s_,]/g, '');
	}

	function formatHex(rawHex: string, isNeg: boolean): string {
		const sign = isNeg ? '-' : '';
		if (groupDigits) {
			const parts: string[] = [];
			for (let i = rawHex.length; i > 0; i -= 2) {
				parts.unshift(rawHex.slice(Math.max(0, i - 2), i));
			}
			return sign + (showPrefix ? '0x' : '') + parts.join(' ');
		}
		return sign + (showPrefix ? '0x' : '') + rawHex;
	}

	function formatBin(rawBin: string, isNeg: boolean): string {
		const sign = isNeg ? '-' : '';
		if (groupDigits) {
			const parts: string[] = [];
			for (let i = rawBin.length; i > 0; i -= 4) {
				parts.unshift(rawBin.slice(Math.max(0, i - 4), i));
			}
			return sign + (showPrefix ? '0b' : '') + parts.join(' ');
		}
		return sign + (showPrefix ? '0b' : '') + rawBin;
	}

	function formatOct(rawOct: string, isNeg: boolean): string {
		const sign = isNeg ? '-' : '';
		if (groupDigits) {
			const parts: string[] = [];
			for (let i = rawOct.length; i > 0; i -= 3) {
				parts.unshift(rawOct.slice(Math.max(0, i - 3), i));
			}
			return sign + (showPrefix ? '0o' : '') + parts.join(' ');
		}
		return sign + (showPrefix ? '0o' : '') + rawOct;
	}

	function updateFromBigInt(val: bigint, sourceField: string) {
		numberError = '';
		const isNeg = val < 0n;
		const absVal = isNeg ? -val : val;

		const rawHex = absVal.toString(16).toUpperCase();
		const rawDec = val.toString(10);
		const rawBin = absVal.toString(2);
		const rawOct = absVal.toString(8);

		if (sourceField !== 'hex') {
			hexInput = formatHex(rawHex, isNeg);
		}

		if (sourceField !== 'dec') {
			decInput = rawDec;
		}

		if (sourceField !== 'bin') {
			binInput = formatBin(rawBin, isNeg);
		}

		if (sourceField !== 'oct') {
			octInput = formatOct(rawOct, isNeg);
		}
	}

	function togglePrefix() {
		showPrefix = !showPrefix;
		if (decInput) handleDecChange(decInput);
	}

	function toggleGrouping() {
		groupDigits = !groupDigits;
		if (decInput) handleDecChange(decInput);
	}

	function handleHexChange(val: string) {
		hexInput = val;
		let clean = cleanNumberInput(val).toLowerCase();
		if (clean.startsWith('0x')) clean = clean.slice(2);
		if (!clean) {
			decInput = '';
			binInput = '';
			octInput = '';
			numberError = '';
			return;
		}
		if (!/^-?[0-9a-f]+$/i.test(clean)) {
			numberError = 'Hexadecimal hanya boleh berisi karakter 0-9 dan A-F';
			return;
		}
		try {
			const parsed = BigInt(clean.startsWith('-') ? '-0x' + clean.slice(1) : '0x' + clean);
			updateFromBigInt(parsed, 'hex');
		} catch {
			numberError = 'Format angka hexadecimal tidak valid';
		}
	}

	function handleDecChange(val: string) {
		decInput = val;
		const clean = cleanNumberInput(val);
		if (!clean) {
			hexInput = '';
			binInput = '';
			octInput = '';
			numberError = '';
			return;
		}
		if (!/^-?[0-9]+$/.test(clean)) {
			numberError = 'Desimal hanya boleh berisi angka 0-9';
			return;
		}
		try {
			const parsed = BigInt(clean);
			updateFromBigInt(parsed, 'dec');
		} catch {
			numberError = 'Format angka desimal tidak valid';
		}
	}

	function handleBinChange(val: string) {
		binInput = val;
		let clean = cleanNumberInput(val);
		if (clean.startsWith('0b') || clean.startsWith('0B')) clean = clean.slice(2);
		if (!clean) {
			hexInput = '';
			decInput = '';
			octInput = '';
			numberError = '';
			return;
		}
		if (!/^-?[01]+$/.test(clean)) {
			numberError = 'Biner hanya boleh berisi angka 0 dan 1';
			return;
		}
		try {
			const parsed = BigInt(clean.startsWith('-') ? '-0b' + clean.slice(1) : '0b' + clean);
			updateFromBigInt(parsed, 'bin');
		} catch {
			numberError = 'Format angka biner tidak valid';
		}
	}

	function handleOctChange(val: string) {
		octInput = val;
		let clean = cleanNumberInput(val);
		if (clean.startsWith('0o') || clean.startsWith('0O')) clean = clean.slice(2);
		if (!clean) {
			hexInput = '';
			decInput = '';
			binInput = '';
			numberError = '';
			return;
		}
		if (!/^-?[0-7]+$/.test(clean)) {
			numberError = 'Oktal hanya boleh berisi angka 0-7';
			return;
		}
		try {
			const parsed = BigInt(clean.startsWith('-') ? '-0o' + clean.slice(1) : '0o' + clean);
			updateFromBigInt(parsed, 'oct');
		} catch {
			numberError = 'Format angka oktal tidak valid';
		}
	}

	function resetNumber() {
		handleDecChange('0');
	}

	function setNumberPreset(val: string) {
		handleDecChange(val);
	}

	// ----------------------------------------------------
	// TEXT / STRING MODE CONVERSIONS
	// ----------------------------------------------------
	function updateFromTextString(str: string) {
		textString = str;
		textError = '';
		if (!str) {
			textHex = '';
			textBin = '';
			textDec = '';
			textBase64 = '';
			return;
		}
		try {
			const bytes = new TextEncoder().encode(str);
			const hexArr: string[] = [];
			const binArr: string[] = [];
			const decArr: string[] = [];

			for (const b of bytes) {
				hexArr.push(b.toString(16).padStart(2, '0'));
				binArr.push(b.toString(2).padStart(8, '0'));
				decArr.push(b.toString(10));
			}

			textHex = hexArr.join(' ');
			textBin = binArr.join(' ');
			textDec = decArr.join(' ');

			// Base64 encode safe for UTF-8
			let binStr = '';
			for (let i = 0; i < bytes.length; i++) {
				binStr += String.fromCharCode(bytes[i]);
			}
			textBase64 = btoa(binStr);
		} catch (e: any) {
			textError = 'Gagal mengonversi teks: ' + (e?.message || '');
		}
	}

	function updateFromTextHex(hexStr: string) {
		textHex = hexStr;
		textError = '';
		const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
		if (!clean) {
			textString = '';
			textBin = '';
			textDec = '';
			textBase64 = '';
			return;
		}
		if (clean.length % 2 !== 0) {
			textError = 'Panjang Hexadecimal harus genap (kelipatan 2 digit)';
			return;
		}
		try {
			const bytes = new Uint8Array(clean.length / 2);
			for (let i = 0; i < clean.length; i += 2) {
				bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
			}
			textString = new TextDecoder().decode(bytes);
			updateFromTextString(textString);
		} catch {
			textError = 'Karakter Hexadecimal tidak valid';
		}
	}

	function updateFromTextBin(binStr: string) {
		textBin = binStr;
		textError = '';
		const clean = binStr.replace(/[^01]/g, '');
		if (!clean) {
			textString = '';
			textHex = '';
			textDec = '';
			textBase64 = '';
			return;
		}
		if (clean.length % 8 !== 0) {
			textError = 'Panjang biner string teks harus kelipatan 8 bit (1 byte)';
			return;
		}
		try {
			const bytes = new Uint8Array(clean.length / 8);
			for (let i = 0; i < clean.length; i += 8) {
				bytes[i / 8] = parseInt(clean.substring(i, i + 8), 2);
			}
			textString = new TextDecoder().decode(bytes);
			updateFromTextString(textString);
		} catch {
			textError = 'Format byte biner tidak valid';
		}
	}

	function updateFromBase64(b64Str: string) {
		textBase64 = b64Str;
		textError = '';
		const clean = b64Str.trim();
		if (!clean) {
			textString = '';
			textHex = '';
			textBin = '';
			textDec = '';
			return;
		}
		try {
			const binStr = atob(clean);
			const bytes = new Uint8Array(binStr.length);
			for (let i = 0; i < binStr.length; i++) {
				bytes[i] = binStr.charCodeAt(i);
			}
			textString = new TextDecoder().decode(bytes);
			updateFromTextString(textString);
		} catch {
			textError = 'Format Base64 tidak valid';
		}
	}

	function resetText() {
		updateFromTextString('');
	}

	// Bit size stats derived for Number mode
	let bitLength = $derived.by(() => {
		try {
			const clean = cleanNumberInput(decInput);
			if (!clean || !/^-?[0-9]+$/.test(clean)) return 0;
			const v = BigInt(clean);
			const absV = v < 0n ? -v : v;
			return absV === 0n ? 1 : absV.toString(2).length;
		} catch {
			return 0;
		}
	});

	let hexWithPrefix = $derived.by(() => {
		const clean = cleanNumberInput(hexInput);
		if (!clean) return '';
		const noPfx = clean.replace(/^(0x|-0x)/i, '');
		const isNeg = clean.startsWith('-');
		return (isNeg ? '-' : '') + '0x' + noPfx.toUpperCase();
	});
</script>

<div class="flex h-full min-h-0 w-full flex-1 flex-col gap-4">
	<!-- HEADER BAR -->
	<div
		class="flex shrink-0 flex-col justify-between gap-3 border-b border-[var(--ttx-border-base)] pb-3 sm:flex-row sm:items-center"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] shadow-xs"
			>
				<Binary class="h-5 w-5" />
			</div>
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-base font-bold tracking-tight text-[var(--ttx-text-main)] sm:text-lg">
						Base Converter (Hex, Biner, Desimal)
					</h1>
					<span
						class="inline-flex items-center gap-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] px-2 py-0.5 text-xs font-semibold text-[var(--ttx-accent-text)]"
					>
						Two-Way Live Sync
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Konversi realtime antar Hexadecimal, Biner, Desimal, Oktal, ASCII, dan Base64.
				</p>
			</div>
		</div>

		<!-- Mode Switch Tabs -->
		<div
			class="flex items-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-1 text-xs"
		>
			<button
				type="button"
				class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all {mode ===
				'number'
					? 'bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] shadow-xs'
					: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
				onclick={() => (mode = 'number')}
			>
				<Binary size={13} />
				<span>Angka & Basis (BigInt)</span>
			</button>
			<button
				type="button"
				class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all {mode ===
				'text'
					? 'bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] shadow-xs'
					: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
				onclick={() => (mode = 'text')}
			>
				<FileCode size={13} />
				<span>Teks & Karakter (ASCII/UTF-8)</span>
			</button>
		</div>
	</div>

	{#if mode === 'number'}
		<!-- NUMBER CONVERTER INTERFACE -->
		<div class="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto pr-1">
			<!-- Options Strip & Quick Presets -->
			<div
				class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] px-4 py-3 shadow-xs"
			>
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-xs font-bold text-[var(--ttx-text-muted)] mr-1">Presets:</span>
					{#each ['0', '15', '255', '1024', '65535', '2097152', '3735928559'] as p}
						<button
							type="button"
							class="rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 py-0.5 font-mono text-xs text-[var(--ttx-text-muted)] transition-colors hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
							onclick={() => setNumberPreset(p)}
						>
							{p === '3735928559' ? '0xDEADBEEF' : p}
						</button>
					{/each}
				</div>

				<div class="flex flex-wrap items-center gap-2.5">
					<!-- Format Switches -->
					<button
						type="button"
						onclick={togglePrefix}
						class="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all {showPrefix
							? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]'
							: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
						title="Tambahkan awalan basis (0x untuk hex, 0b untuk biner, 0o untuk oktal)"
					>
						<span>Prefix 0x</span>
					</button>

					<button
						type="button"
						onclick={toggleGrouping}
						class="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all {groupDigits
							? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]'
							: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
						title="Pisahkan digit dengan spasi per kelompok byte/nibble"
					>
						<span>Spasi Pemisah</span>
					</button>

					<div class="hidden h-4 w-px bg-[var(--ttx-border-subtle)] sm:block"></div>

					<span class="font-mono text-xs text-[var(--ttx-text-dim)]">
						<strong>{bitLength} bit</strong> ({Math.ceil(bitLength / 8)} byte)
					</span>
					<button
						type="button"
						onclick={resetNumber}
						class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
					>
						<RotateCcw size={12} />
						<span>Reset</span>
					</button>
				</div>
			</div>

			{#if numberError}
				<div
					class="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-500"
				>
					<AlertCircle size={15} class="shrink-0" />
					<span>{numberError}</span>
				</div>
			{/if}

			<!-- INPUT GRIDS -->
			<div class="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
				<!-- DECIMAL -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs"
				>
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span
								class="rounded-md bg-[var(--ttx-accent-light)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ttx-accent-text)]"
							>
								DEC
							</span>
							<label
								for="dec-input"
								class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
							>
								Desimal (Basis 10)
							</label>
						</div>
						<button
							type="button"
							onclick={() => copyToClipboard(decInput, 'dec')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
						>
							{#if copiedField === 'dec'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<input
						id="dec-input"
						type="text"
						value={decInput}
						oninput={(e) => handleDecChange((e.target as HTMLInputElement).value)}
						placeholder="Masukkan nilai Desimal (mis: 255 atau 2097152)"
						class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					/>
					<div class="mt-1.5 flex items-center justify-between text-[11px] text-[var(--ttx-text-dim)]">
						<span>Karakter valid: 0-9</span>
						<span class="font-mono text-[var(--ttx-text-muted)]">Input angka umum</span>
					</div>
				</div>

				<!-- HEXADECIMAL -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs"
				>
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span
								class="rounded-md bg-[var(--ttx-accent-light)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ttx-accent-text)]"
							>
								HEX
							</span>
							<label
								for="hex-input"
								class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
							>
								Hexadecimal (Basis 16)
							</label>
						</div>
						<div class="flex items-center gap-1.5">
							<button
								type="button"
								onclick={() => copyToClipboard(hexWithPrefix, 'hex0x')}
								class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 py-1 text-xs font-semibold text-[var(--ttx-accent-text)] hover:bg-[var(--ttx-accent-light)] transition-colors"
								title="Salin dengan prefix 0x (misal: 0x200000)"
							>
								{#if copiedField === 'hex0x'}
									<Check size={12} class="text-emerald-500" />
									<span class="text-emerald-500">Tersalin!</span>
								{:else}
									<Copy size={12} />
									<span>Salin 0x...</span>
								{/if}
							</button>

							<button
								type="button"
								onclick={() => copyToClipboard(hexInput, 'hex')}
								class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-colors"
							>
								{#if copiedField === 'hex'}
									<Check size={12} class="text-emerald-500" />
									<span class="text-emerald-500">Tersalin!</span>
								{:else}
									<Copy size={12} />
									<span>Salin</span>
								{/if}
							</button>
						</div>
					</div>
					<input
						id="hex-input"
						type="text"
						value={hexInput}
						oninput={(e) => handleHexChange((e.target as HTMLInputElement).value)}
						placeholder="Masukkan nilai Hex (mis: 0x200000)"
						class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					/>
					<div class="mt-1.5 flex items-center justify-between text-[11px] text-[var(--ttx-text-dim)]">
						<span>Karakter valid: 0-9 dan A-F</span>
						{#if hexWithPrefix}
							<span class="font-mono text-[var(--ttx-text-muted)]">C/JS: {hexWithPrefix}</span>
						{/if}
					</div>
				</div>

				<!-- BINARY -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs lg:col-span-2"
				>
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span
								class="rounded-md bg-[var(--ttx-accent-light)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ttx-accent-text)]"
							>
								BIN
							</span>
							<label
								for="bin-input"
								class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
							>
								Biner (Basis 2)
							</label>
						</div>
						<button
							type="button"
							onclick={() => copyToClipboard(binInput, 'bin')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
						>
							{#if copiedField === 'bin'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<textarea
						id="bin-input"
						rows="2"
						value={binInput}
						oninput={(e) => handleBinChange((e.target as HTMLTextAreaElement).value)}
						placeholder="Masukkan nilai Biner (mis: 11111111)"
						class="w-full resize-y rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30 sm:text-sm"
					></textarea>
					<p class="mt-1 text-[11px] text-[var(--ttx-text-dim)]">Karakter valid: 0 dan 1</p>
				</div>

				<!-- OCTAL -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs lg:col-span-2"
				>
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span
								class="rounded-md bg-[var(--ttx-accent-light)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ttx-accent-text)]"
							>
								OCT
							</span>
							<label
								for="oct-input"
								class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
							>
								Oktal (Basis 8)
							</label>
						</div>
						<button
							type="button"
							onclick={() => copyToClipboard(octInput, 'oct')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
						>
							{#if copiedField === 'oct'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<input
						id="oct-input"
						type="text"
						value={octInput}
						oninput={(e) => handleOctChange((e.target as HTMLInputElement).value)}
						placeholder="Masukkan nilai Oktal (mis: 377)"
						class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					/>
					<p class="mt-1.5 text-[11px] text-[var(--ttx-text-dim)]">Karakter valid: 0-7</p>
				</div>
			</div>
		</div>
	{:else}
		<!-- TEXT / STRING CONVERTER INTERFACE -->
		<div class="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto pr-1">
			<!-- Header & Presets -->
			<div
				class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] px-4 py-3 shadow-xs"
			>
				<div class="flex flex-wrap items-center gap-3">
					<span class="text-xs font-bold text-[var(--ttx-text-muted)]">Contoh Teks:</span>
					{#each ['Hello World', 'Texy 2026', 'admin:password', '123456'] as t}
						<button
							type="button"
							class="rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2 py-0.5 text-xs text-[var(--ttx-text-muted)] transition-colors hover:border-[var(--ttx-border-focus)] hover:text-[var(--ttx-text-main)]"
							onclick={() => updateFromTextString(t)}
						>
							{t}
						</button>
					{/each}
				</div>

				<div class="flex items-center gap-3">
					<span class="font-mono text-xs text-[var(--ttx-text-dim)]">
						Panjang: {textString.length} char ({new TextEncoder().encode(textString).length} bytes)
					</span>
					<button
						type="button"
						onclick={resetText}
						class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
					>
						<RotateCcw size={12} />
						<span>Reset</span>
					</button>
				</div>
			</div>

			{#if textError}
				<div
					class="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-500"
				>
					<AlertCircle size={15} class="shrink-0" />
					<span>{textError}</span>
				</div>
			{/if}

			<div class="space-y-4">
				<!-- RAW STRING (UTF-8) -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs"
				>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="text-input"
							class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
						>
							Teks String Asli (UTF-8 / ASCII)
						</label>
						<button
							type="button"
							onclick={() => copyToClipboard(textString, 'textStr')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
						>
							{#if copiedField === 'textStr'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<textarea
						id="text-input"
						rows="2"
						value={textString}
						oninput={(e) => updateFromTextString((e.target as HTMLTextAreaElement).value)}
						placeholder="Ketik teks di sini untuk diubah ke Hex, Biner, dan Base64..."
						class="w-full resize-y rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3 text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30 sm:text-sm"
					></textarea>
				</div>

				<!-- HEX STRING BYTES -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs"
				>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="text-hex"
							class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
						>
							Hex Bytes Representation
						</label>
						<button
							type="button"
							onclick={() => copyToClipboard(textHex, 'textHex')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
						>
							{#if copiedField === 'textHex'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<textarea
						id="text-hex"
						rows="2"
						value={textHex}
						oninput={(e) => updateFromTextHex((e.target as HTMLTextAreaElement).value)}
						placeholder="Hex byte sequence (mis: 48 65 6c 6c 6f)..."
						class="w-full resize-y rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					></textarea>
				</div>

				<!-- BINARY BYTES -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs"
				>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="text-bin"
							class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
						>
							Binary Bytes (8-bit per karakter)
						</label>
						<button
							type="button"
							onclick={() => copyToClipboard(textBin, 'textBin')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
						>
							{#if copiedField === 'textBin'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<textarea
						id="text-bin"
						rows="3"
						value={textBin}
						oninput={(e) => updateFromTextBin((e.target as HTMLTextAreaElement).value)}
						placeholder="01001000 01100101..."
						class="w-full resize-y rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					></textarea>
				</div>

				<!-- BASE64 -->
				<div
					class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs"
				>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="text-b64"
							class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]"
						>
							Base64
						</label>
						<button
							type="button"
							onclick={() => copyToClipboard(textBase64, 'textB64')}
							class="flex items-center gap-1 rounded-md border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-2.5 py-1 text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]"
						>
							{#if copiedField === 'textB64'}
								<Check size={12} class="text-emerald-500" />
								<span class="text-emerald-500">Tersalin!</span>
							{:else}
								<Copy size={12} />
								<span>Salin</span>
							{/if}
						</button>
					</div>
					<input
						id="text-b64"
						type="text"
						value={textBase64}
						oninput={(e) => updateFromBase64((e.target as HTMLInputElement).value)}
						placeholder="Base64 encoded string..."
						class="h-11 w-full rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] px-3.5 font-mono text-sm text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30"
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
