<script lang="ts">
	import { onMount } from 'svelte';
	import {
		QrCode,
		Globe,
		Type as TypeIcon,
		Wifi as WifiIcon,
		Palette,
		RotateCcw,
		Download,
		Copy,
		Check,
		Eye,
		EyeOff,
		AlertTriangle,
		Sun,
		Moon,
		Grid3X3,
		ShieldCheck,
		Sliders,
		Sparkles,
		Layers
	} from '@lucide/svelte';
	import {
		DEFAULT_CONFIG,
		COLOR_PRESETS,
		ERROR_CORRECTION_INFO,
		type QRConfig,
		type PngSize,
		type ErrorCorrectionLevel,
		checkContrast,
		validateInput,
		extractDomain,
		generateFilename,
		generateQRSvg,
		exportPngBlob,
		exportSvgBlob,
		downloadBlob
	} from '$lib/utils/qr';

	let { isDark = true, onBack }: { isDark?: boolean; onBack?: () => void } = $props();

	let config: QRConfig = $state({ ...DEFAULT_CONFIG });
	let qrSvg = $state('');
	let validationMessage = $state('');
	let isInputValid = $state(false);
	let isExporting = $state(false);
	let exportError = $state('');
	let showPassword = $state(false);
	let previewBgMode = $state<'light' | 'dark' | 'checker'>('dark');
	let copiedImage = $state(false);
	let copiedSvg = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const contrastResult = $derived(checkContrast(config.foregroundColor, config.backgroundColor));
	const domain = $derived(
		config.contentType === 'url' && config.inputValue ? extractDomain(config.inputValue) : ''
	);
	const canExport = $derived(isInputValid && hasContent(config) && !isExporting);

	function hasContent(cfg: QRConfig): boolean {
		if (cfg.contentType === 'wifi') return !!cfg.wifi.ssid.trim();
		return !!cfg.inputValue.trim();
	}

	async function updateQR() {
		const result = validateInput(config.contentType, config.inputValue, config.wifi);
		isInputValid = result.valid;
		validationMessage = result.message;
		if (result.valid && hasContent(config)) {
			try {
				qrSvg = await generateQRSvg(config);
			} catch (err) {
				qrSvg = '';
				validationMessage = err instanceof Error ? err.message : 'Gagal membuat QR.';
			}
		} else {
			qrSvg = '';
		}
	}

	function handleInputChange() {
		exportError = '';
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updateQR, 120);
	}

	function handleConfigChange() {
		exportError = '';
		if (isInputValid && hasContent(config)) updateQR();
	}

	async function handleExportPng() {
		if (!canExport) return;
		isExporting = true;
		exportError = '';
		try {
			const blob = await exportPngBlob(config);
			downloadBlob(blob, generateFilename(config.contentType === 'wifi' ? 'wifi.png' : 'png'));
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Ekspor PNG gagal.';
		} finally {
			isExporting = false;
		}
	}

	async function handleCopyImage() {
		if (!canExport) return;
		isExporting = true;
		exportError = '';
		try {
			const blob = await exportPngBlob(config);
			if (navigator.clipboard && window.ClipboardItem) {
				await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
				copiedImage = true;
				setTimeout(() => (copiedImage = false), 2000);
			} else {
				throw new Error('Clipboard image tidak didukung browser ini.');
			}
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Gagal menyalin gambar.';
		} finally {
			isExporting = false;
		}
	}

	async function handleCopySvg() {
		if (!canExport || !qrSvg) return;
		try {
			await navigator.clipboard.writeText(qrSvg);
			copiedSvg = true;
			setTimeout(() => (copiedSvg = false), 2000);
		} catch (err) {
			exportError = 'Gagal menyalin SVG ke clipboard.';
		}
	}

	async function handleExportSvg() {
		if (!canExport) return;
		isExporting = true;
		exportError = '';
		try {
			const blob = await exportSvgBlob(config);
			downloadBlob(blob, generateFilename(config.contentType === 'wifi' ? 'wifi.svg' : 'svg'));
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Ekspor SVG gagal.';
		} finally {
			isExporting = false;
		}
	}

	function handleReset() {
		config = {
			...DEFAULT_CONFIG,
			wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false }
		};
		config.inputValue = 'https://texy.vercel.app';
		exportError = '';
		showPassword = false;
		updateQR();
	}

	function applyPreset(fg: string, bg: string) {
		config.foregroundColor = fg;
		config.backgroundColor = bg;
		config.isTransparent = false;
		handleConfigChange();
	}

	onMount(() => {
		if (!config.inputValue) {
			config.inputValue = 'https://texy.vercel.app';
		}
		previewBgMode = isDark ? 'dark' : 'light';
		updateQR();
	});
</script>

<div class="space-y-4 w-full">
	<!-- HEADER SECTION -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b {isDark ? 'border-[#152037]' : 'border-slate-200'}">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-blue-500/20 shrink-0">
				<QrCode class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight {isDark ? 'text-white' : 'text-slate-900'}">
						QR Code Generator
					</h1>
					<span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full {isDark ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
						<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
						Real-Time
					</span>
				</div>
				<p class="text-xs {isDark ? 'text-slate-400' : 'text-slate-500'}">
					Hasilkan QR Code untuk tautan web, pesan teks, atau jaringan Wi-Fi secara instan dan 100% lokal.
				</p>
			</div>
		</div>

		<button
			type="button"
			class="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all {isDark
				? 'border-[#1e2e50] bg-[#101a2f] text-slate-300 hover:text-white hover:border-slate-600 hover:bg-[#16233f]'
				: 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs'}"
			onclick={handleReset}
			title="Kembalikan konfigurasi default"
		>
			<RotateCcw size={13} />
			<span>Reset Konfigurasi</span>
		</button>
	</div>

	<!-- MAIN WORKSPACE -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
		<!-- LEFT COLUMN: CONTROLS & SETTINGS (7 COLS) -->
		<div class="lg:col-span-7 flex flex-col gap-4">

			<!-- 1. CONTENT TYPE SELECTOR & INPUT -->
			<div class="rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors {isDark ? 'border-[#152037] bg-[#0c1427]' : 'border-slate-200 bg-white'}">
				<div class="flex items-center justify-between mb-3">
					<span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 {isDark ? 'text-slate-300' : 'text-slate-700'}">
						<Sparkles size={14} class="text-blue-500" />
						1. Tipe Konten QR
					</span>
					{#if config.contentType === 'text'}
						<span class="text-[11px] font-mono {config.inputValue.length > 4000 ? 'text-rose-400' : isDark ? 'text-slate-500' : 'text-slate-400'}">
							{config.inputValue.length}/4296 Karakter
						</span>
					{/if}
				</div>

				<!-- Type tabs switcher -->
				<div class="grid grid-cols-3 gap-2 p-1 rounded-xl mb-4 {isDark ? 'bg-[#070d1a] border border-[#152037]' : 'bg-slate-100 border border-slate-200'}">
					{#each [
						{ id: 'url', label: 'Tautan URL', icon: Globe },
						{ id: 'text', label: 'Teks Bebas', icon: TypeIcon },
						{ id: 'wifi', label: 'Akses Wi-Fi', icon: WifiIcon }
					] as tab}
						{@const isActive = config.contentType === tab.id}
						{@const TabIcon = tab.icon}
						<button
							type="button"
							class="h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 {isActive
								? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold'
								: isDark
									? 'text-slate-400 hover:text-slate-200 hover:bg-[#111c34]'
									: 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}"
							onclick={() => {
								config.contentType = tab.id as any;
								handleInputChange();
							}}
						>
							<TabIcon size={14} />
							<span>{tab.label}</span>
						</button>
					{/each}
				</div>

				<!-- Dynamic Content Input -->
				{#if config.contentType === 'url'}
					<div class="space-y-1.5">
						<label for="qr-url-input" class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
							Alamat Website (URL)
						</label>
						<div class="relative">
							<Globe size={15} class="absolute left-3 top-1/2 -translate-y-1/2 {isDark ? 'text-slate-500' : 'text-slate-400'} pointer-events-none" />
							<input
								id="qr-url-input"
								type="url"
								class="w-full h-11 pl-9 pr-3 rounded-xl text-xs sm:text-sm font-mono transition-all focus:outline-none focus:ring-2 {isDark
									? 'bg-[#111a2f] border border-[#1e2e50] text-slate-100 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500'
									: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white'}"
								placeholder="https://contohdomain.com"
								bind:value={config.inputValue}
								oninput={handleInputChange}
							/>
						</div>
						{#if domain}
							<div class="flex items-center gap-1.5 text-xs {isDark ? 'text-cyan-400' : 'text-blue-600'} pt-0.5">
								<span class="font-medium">Domain terdeteksi:</span>
								<code class="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px]">{domain}</code>
							</div>
						{/if}
					</div>
				{:else if config.contentType === 'text'}
					<div class="space-y-1.5">
						<label for="qr-text-input" class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
							Isi Teks atau Catatan
						</label>
						<textarea
							id="qr-text-input"
							class="w-full p-3 rounded-xl text-xs sm:text-sm font-mono transition-all focus:outline-none focus:ring-2 {isDark
								? 'bg-[#111a2f] border border-[#1e2e50] text-slate-100 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500'
								: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white'}"
							placeholder="Ketik teks pesan, nomor telepon, atau data apa pun yang ingin dikonversi..."
							bind:value={config.inputValue}
							oninput={handleInputChange}
							rows="3"
						></textarea>
					</div>
				{:else if config.contentType === 'wifi'}
					<div class="space-y-3">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<!-- SSID -->
							<div class="space-y-1.5">
								<label for="qr-wifi-ssid" class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
									Nama Jaringan (SSID)
								</label>
								<div class="relative">
									<WifiIcon size={14} class="absolute left-3 top-1/2 -translate-y-1/2 {isDark ? 'text-slate-500' : 'text-slate-400'} pointer-events-none" />
									<input
										id="qr-wifi-ssid"
										type="text"
										class="w-full h-10 pl-9 pr-3 rounded-xl text-xs sm:text-sm font-mono transition-all focus:outline-none focus:ring-2 {isDark
											? 'bg-[#111a2f] border border-[#1e2e50] text-slate-100 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500'
											: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white'}"
										placeholder="Nama Wi-Fi Anda"
										bind:value={config.wifi.ssid}
										oninput={handleInputChange}
									/>
								</div>
							</div>

							<!-- Encryption Type -->
							<div class="space-y-1.5">
								<label for="qr-wifi-enc" class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
									Jenis Keamanan
								</label>
								<select
									id="qr-wifi-enc"
									class="w-full h-10 px-3 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 {isDark
										? 'bg-[#111a2f] border border-[#1e2e50] text-slate-200 focus:ring-blue-500/30 focus:border-blue-500'
										: 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white'}"
									bind:value={config.wifi.encryption}
									onchange={handleInputChange}
								>
									<option value="WPA">WPA / WPA2 / WPA3 (Umum)</option>
									<option value="WEP">WEP (Klasik)</option>
									<option value="nopass">Tanpa Kata Sandi (Open)</option>
								</select>
							</div>
						</div>

						{#if config.wifi.encryption !== 'nopass'}
							<div class="space-y-1.5">
								<label for="qr-wifi-pass" class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
									Kata Sandi Wi-Fi
								</label>
								<div class="relative">
									<input
										id="qr-wifi-pass"
										type={showPassword ? 'text' : 'password'}
										class="w-full h-10 pl-3 pr-10 rounded-xl text-xs sm:text-sm font-mono transition-all focus:outline-none focus:ring-2 {isDark
											? 'bg-[#111a2f] border border-[#1e2e50] text-slate-100 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500'
											: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white'}"
										placeholder="Minimal 8 karakter untuk WPA"
										bind:value={config.wifi.password}
										oninput={handleInputChange}
									/>
									<button
										type="button"
										class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors {isDark
											? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
											: 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}"
										onclick={() => (showPassword = !showPassword)}
										title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
									>
										{#if showPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
									</button>
								</div>
							</div>
						{/if}

						<label class="inline-flex items-center gap-2 cursor-pointer pt-1">
							<input
								type="checkbox"
								class="w-4 h-4 rounded accent-blue-600"
								bind:checked={config.wifi.hidden}
								onchange={handleInputChange}
							/>
							<span class="text-xs {isDark ? 'text-slate-400' : 'text-slate-600'}">
								Jaringan Tersembunyi (Hidden SSID)
							</span>
						</label>
					</div>
				{/if}

				<!-- Validation message alert -->
				{#if validationMessage}
					<div class="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium {isInputValid
						? isDark ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-800/40' : 'bg-blue-50 text-blue-700 border border-blue-200'
						: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
						<AlertTriangle size={13} class="shrink-0" />
						<span>{validationMessage}</span>
					</div>
				{/if}
			</div>

			<!-- 2. WARNA & PRESET GAYA -->
			<div class="rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors {isDark ? 'border-[#152037] bg-[#0c1427]' : 'border-slate-200 bg-white'} space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 {isDark ? 'text-slate-300' : 'text-slate-700'}">
						<Palette size={14} class="text-blue-500" />
						2. Warna & Palet
					</span>
					<label class="flex items-center gap-2 text-xs cursor-pointer font-medium {isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}">
						<input
							type="checkbox"
							class="w-4 h-4 rounded accent-blue-600"
							bind:checked={config.isTransparent}
							onchange={handleConfigChange}
						/>
						Latar Transparan
					</label>
				</div>

				<!-- Preset Color Swatches -->
				<div>
					<p class="text-[11px] font-medium mb-2 {isDark ? 'text-slate-400' : 'text-slate-500'}">Pilihan Tema Cepat</p>
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{#each COLOR_PRESETS as preset}
							{@const isActive = config.foregroundColor === preset.fg && config.backgroundColor === preset.bg && !config.isTransparent}
							<button
								type="button"
								class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left {isActive
									? isDark
										? 'border-blue-500 bg-blue-600/15 text-white font-semibold ring-1 ring-blue-500/40 shadow-xs'
										: 'border-blue-600 bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-600/30 shadow-xs'
									: isDark
										? 'border-[#1e2e50] bg-[#101a2f] text-slate-300 hover:bg-[#152342] hover:border-slate-600'
										: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'}"
								onclick={() => applyPreset(preset.fg, preset.bg)}
							>
								<span class="w-4 h-4 rounded-full border border-black/20 overflow-hidden relative shrink-0 shadow-inner">
									<span class="absolute inset-0" style="background:{preset.bg}"></span>
									<span class="absolute inset-[3px] rounded-full" style="background:{preset.fg}"></span>
								</span>
								<span class="truncate">{preset.name}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Custom Pickers -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
					<!-- QR Foreground Color -->
					<div class="flex items-center gap-3 p-2.5 rounded-xl border {isDark ? 'border-[#1e2e50] bg-[#101a2f]' : 'border-slate-200 bg-slate-50'}">
						<input
							type="color"
							class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0 shrink-0"
							bind:value={config.foregroundColor}
							onchange={handleConfigChange}
						/>
						<div class="min-w-0 flex-1">
							<p class="text-[10px] uppercase font-bold tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Warna QR</p>
							<input
								type="text"
								class="bg-transparent font-mono text-xs sm:text-sm font-semibold uppercase w-full outline-none {isDark ? 'text-slate-100' : 'text-slate-800'}"
								bind:value={config.foregroundColor}
								oninput={handleConfigChange}
								maxlength="7"
							/>
						</div>
					</div>

					<!-- QR Background Color -->
					<div class="flex items-center gap-3 p-2.5 rounded-xl border transition-opacity {isDark ? 'border-[#1e2e50] bg-[#101a2f]' : 'border-slate-200 bg-slate-50'} {config.isTransparent ? 'opacity-35 pointer-events-none' : ''}">
						<input
							type="color"
							class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0 shrink-0"
							bind:value={config.backgroundColor}
							onchange={handleConfigChange}
							disabled={config.isTransparent}
						/>
						<div class="min-w-0 flex-1">
							<p class="text-[10px] uppercase font-bold tracking-wider {isDark ? 'text-slate-400' : 'text-slate-500'}">Warna Latar</p>
							<input
								type="text"
								class="bg-transparent font-mono text-xs sm:text-sm font-semibold uppercase w-full outline-none {isDark ? 'text-slate-100' : 'text-slate-800'}"
								bind:value={config.backgroundColor}
								oninput={handleConfigChange}
								maxlength="7"
								disabled={config.isTransparent}
							/>
						</div>
					</div>
				</div>

				<!-- Contrast warning/success indicator -->
				{#if !config.isTransparent}
					<div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs {contrastResult.isRisky
						? isDark ? 'bg-amber-500/10 border border-amber-500/25 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'
						: isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}">
						{#if contrastResult.isRisky}
							<AlertTriangle size={14} class="shrink-0 text-amber-400" />
						{:else}
							<ShieldCheck size={14} class="shrink-0 text-emerald-400" />
						{/if}
						<span class="truncate">{contrastResult.message} (Rasio: {contrastResult.ratio.toFixed(1)}:1)</span>
					</div>
				{/if}
			</div>

			<!-- 3. DETAIL TEKNIS (MARGIN & ECC) -->
			<div class="rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors {isDark ? 'border-[#152037] bg-[#0c1427]' : 'border-slate-200 bg-white'} space-y-4">
				<span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 {isDark ? 'text-slate-300' : 'text-slate-700'}">
					<Sliders size={14} class="text-blue-500" />
					3. Parameter Output
				</span>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<!-- Error Correction Level -->
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
								Tingkat Pemulihan (ECC)
							</span>
							<span class="text-[11px] font-semibold text-blue-500">
								{ERROR_CORRECTION_INFO[config.errorCorrection]}
							</span>
						</div>
						<div class="grid grid-cols-4 gap-1.5">
							{#each (['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]) as lvl}
								<button
									type="button"
									class="h-8 rounded-lg text-xs font-bold transition-all {config.errorCorrection === lvl
										? 'bg-blue-600 text-white shadow-xs'
										: isDark ? 'bg-[#101a2f] text-slate-400 hover:text-white border border-[#1e2e50]' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'}"
									onclick={() => {
										config.errorCorrection = lvl;
										handleConfigChange();
									}}
								>
									{lvl}
								</button>
							{/each}
						</div>
					</div>

					<!-- Quiet Zone / Margin -->
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label for="qr-margin-range" class="text-xs font-medium {isDark ? 'text-slate-300' : 'text-slate-700'}">
								Margin / Quiet Zone
							</label>
							<span class="text-xs font-mono font-bold {isDark ? 'text-cyan-400' : 'text-blue-600'}">
								{config.margin} blok
							</span>
						</div>
						<div class="pt-2">
							<input
								id="qr-margin-range"
								type="range"
								min="0"
								max="8"
								step="1"
								class="w-full h-2 accent-blue-600 cursor-pointer rounded-lg bg-slate-300 dark:bg-slate-800"
								bind:value={config.margin}
								oninput={handleConfigChange}
							/>
						</div>
					</div>
				</div>
			</div>

		</div>

		<!-- RIGHT COLUMN: LIVE PREVIEW & EXPORT ACTIONS (5 COLS) -->
		<div class="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-4">

			<!-- PREVIEW CONTAINER -->
			<div class="rounded-2xl border p-4 sm:p-5 shadow-md transition-colors {isDark ? 'border-[#152037] bg-[#0c1427]' : 'border-slate-200 bg-white'} space-y-4">
				<!-- Preview Header -->
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 {isDark ? 'text-slate-300' : 'text-slate-700'}">
						<Layers size={14} class="text-blue-500" />
						Live Preview
					</span>

					<!-- Background Switcher for Preview -->
					<div class="flex rounded-lg overflow-hidden border {isDark ? 'border-[#1e2e50] bg-[#091020]' : 'border-slate-200 bg-slate-100'} p-0.5">
						{#each [
							{ id: 'light', icon: Sun, title: 'Latar Terang' },
							{ id: 'checker', icon: Grid3X3, title: 'Latar Kotak Transparan' },
							{ id: 'dark', icon: Moon, title: 'Latar Gelap' }
						] as bg}
							{@const BgIcon = bg.icon}
							<button
								type="button"
								class="p-1.5 rounded-md transition-all {previewBgMode === bg.id
									? 'bg-blue-600 text-white shadow-xs'
									: isDark ? 'text-slate-500 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}"
								onclick={() => (previewBgMode = bg.id as any)}
								title={bg.title}
							>
								<BgIcon size={13} />
							</button>
						{/each}
					</div>
				</div>

				<!-- QR Canvas Box -->
				<div class="w-full aspect-square max-w-[340px] mx-auto rounded-2xl border flex items-center justify-center p-6 overflow-hidden transition-all duration-200 shadow-inner {isDark ? 'border-[#1e2e50]' : 'border-slate-200'} {previewBgMode === 'dark' ? 'bg-[#050a14]' : previewBgMode === 'checker' ? 'bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[size:14px_14px]' : 'bg-white'}">
					{#if qrSvg && isInputValid}
						<div class="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block transition-transform duration-200 hover:scale-[1.02]">
							{@html qrSvg}
						</div>
					{:else}
						<div class="flex flex-col items-center gap-2.5 text-center px-4">
							<QrCode size={56} strokeWidth={1} class={isDark ? 'text-slate-700' : 'text-slate-300'} />
							<p class="text-xs font-medium {isDark ? 'text-slate-500' : 'text-slate-400'}">
								Masukkan tautan atau teks untuk memuat QR Code
							</p>
						</div>
					{/if}
				</div>

				<!-- Resolution Selector for PNG -->
				<div class="space-y-1.5 pt-1">
					<div class="flex items-center justify-between text-xs font-medium {isDark ? 'text-slate-400' : 'text-slate-600'}">
						<span>Resolusi Gambar PNG</span>
						<span class="font-mono text-blue-500 font-bold">{config.pngSize} × {config.pngSize} px</span>
					</div>
					<div class="grid grid-cols-3 gap-2">
						{#each ([512, 1024, 2048] as PngSize[]) as size}
							<button
								type="button"
								class="h-8 rounded-lg text-xs font-semibold font-mono transition-all {config.pngSize === size
									? 'bg-blue-600 text-white shadow-xs font-bold'
									: isDark ? 'bg-[#101a2f] text-slate-400 hover:text-white border border-[#1e2e50]' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'}"
								onclick={() => { config.pngSize = size; }}
							>
								{size === 512 ? '512 px (Standar)' : size === 1024 ? '1024 px (HD)' : '2048 px (Ultra HD)'}
							</button>
						{/each}
					</div>
				</div>

				<!-- Action Buttons: Download & Copy -->
				<div class="space-y-2 pt-2">
					<!-- Primary: Copy Image to Clipboard -->
					<button
						type="button"
						class="w-full h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 {canExport
							? copiedImage
								? 'bg-emerald-600 text-white shadow-md'
								: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 active:scale-98'
							: isDark ? 'bg-[#101a2f] text-slate-600 border border-[#1e2e50] cursor-not-allowed' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}"
						onclick={handleCopyImage}
						disabled={!canExport}
					>
						{#if copiedImage}
							<Check size={16} />
							<span>Gambar QR Tersalin ke Clipboard!</span>
						{:else}
							<Copy size={16} />
							<span>Salin Gambar QR (Copy Image)</span>
						{/if}
					</button>

					<!-- Secondary: Download PNG & Download SVG -->
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							class="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all duration-150 {canExport
								? isDark
									? 'border-[#1e2e50] bg-[#111d36] text-slate-200 hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-500/10 active:scale-98'
									: 'border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 shadow-xs active:scale-98'
								: isDark ? 'border-[#1e2e50] text-slate-700 cursor-not-allowed' : 'border-slate-200 text-slate-400 cursor-not-allowed'}"
							onclick={handleExportPng}
							disabled={!canExport}
						>
							<Download size={14} />
							<span>Unduh PNG</span>
						</button>

						<button
							type="button"
							class="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all duration-150 {canExport
								? isDark
									? 'border-[#1e2e50] bg-[#111d36] text-slate-200 hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-500/10 active:scale-98'
									: 'border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 shadow-xs active:scale-98'
								: isDark ? 'border-[#1e2e50] text-slate-700 cursor-not-allowed' : 'border-slate-200 text-slate-400 cursor-not-allowed'}"
							onclick={handleExportSvg}
							disabled={!canExport}
						>
							<Download size={14} />
							<span>Unduh SVG</span>
						</button>
					</div>

					<!-- Copy SVG text button -->
					{#if qrSvg && canExport}
						<button
							type="button"
							class="w-full py-1 text-[11px] font-medium transition-colors text-center {copiedSvg ? 'text-emerald-400' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}"
							onclick={handleCopySvg}
						>
							{copiedSvg ? '✓ Kode SVG berhasil disalin!' : 'Salin Kode Mentah SVG (<svg>)'}
						</button>
					{/if}
				</div>

				{#if exportError}
					<div class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
						{exportError}
					</div>
				{/if}
			</div>

			<!-- PRIVACY BADGE -->
			<div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border {isDark ? 'border-[#152037] bg-[#0c1427] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}">
				<ShieldCheck size={16} class="text-emerald-500 shrink-0" />
				<p class="text-[11px] leading-relaxed">
					<strong>Privasi Terjamin:</strong> Seluruh proses enkoding QR dihitung langsung di perangkat Anda tanpa pernah dikirim ke server luar.
				</p>
			</div>

		</div>
	</div>
</div>
