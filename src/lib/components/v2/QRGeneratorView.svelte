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
		Layers,
		Image as ImageIcon,
		Upload,
		Trash2,
		Square,
		Circle,
		LayoutTemplate
	} from '@lucide/svelte';
	import {
		DEFAULT_CONFIG,
		DEFAULT_FRAME_CONFIG,
		DEFAULT_LOGO_CONFIG,
		COLOR_PRESETS,
		FRAME_PRESETS,
		FRAME_COLOR_PRESETS,
		ERROR_CORRECTION_INFO,
		type QRConfig,
		type PngSize,
		type ErrorCorrectionLevel,
		type FrameStyle,
		checkContrast,
		validateInput,
		extractDomain,
		generateFilename,
		generateQRSvg,
		exportPngBlob,
		exportSvgBlob,
		downloadBlob
	} from '$lib/utils/qr';

	let { isDark = true }: { isDark?: boolean; onBack?: () => void } = $props();

	type TabKey = 'frame' | 'logo' | 'color' | 'options';
	let activeTab = $state<TabKey>('frame');

	let config: QRConfig = $state({
		...DEFAULT_CONFIG,
		frame: { ...DEFAULT_FRAME_CONFIG },
		logo: { ...DEFAULT_LOGO_CONFIG }
	});

	let qrSvg = $state('');
	let validationMessage = $state('');
	let isInputValid = $state(false);
	let isExporting = $state(false);
	let exportError = $state('');
	let logoUploadError = $state('');
	let showPassword = $state(false);
	let previewBgMode = $state<'light' | 'dark' | 'checker'>('dark');
	let copiedImage = $state(false);
	let copiedSvg = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let logoFileInput = $state<HTMLInputElement | null>(null);

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
		debounceTimer = setTimeout(updateQR, 100);
	}

	function handleConfigChange() {
		exportError = '';
		if (isInputValid && hasContent(config)) updateQR();
	}

	function applyFrameColorPreset(frameColor: string, textColor: string) {
		config.frame.frameColor = frameColor;
		config.frame.textColor = textColor;
		handleConfigChange();
	}

	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		logoUploadError = '';
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			logoUploadError = 'Berkas harus berupa gambar (PNG, JPG, SVG, WebP).';
			return;
		}

		if (file.size > 3 * 1024 * 1024) {
			logoUploadError = 'Ukuran berkas maksimal 3 MB.';
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			if (result) {
				config.logo.dataUrl = result;
				config.logo.enabled = true;
				if (config.errorCorrection === 'L' || config.errorCorrection === 'M') {
					config.errorCorrection = 'H';
				}
				handleConfigChange();
			}
		};
		reader.onerror = () => {
			logoUploadError = 'Gagal membaca berkas gambar.';
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		config.logo.dataUrl = '';
		config.logo.enabled = false;
		logoUploadError = '';
		if (logoFileInput) {
			logoFileInput.value = '';
		}
		handleConfigChange();
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
				throw new Error('Salin gambar tidak didukung browser ini.');
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
			frame: { ...DEFAULT_FRAME_CONFIG },
			logo: { ...DEFAULT_LOGO_CONFIG },
			wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false }
		};
		config.inputValue = 'https://texy.vercel.app';
		exportError = '';
		logoUploadError = '';
		showPassword = false;
		if (logoFileInput) logoFileInput.value = '';
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

<div class="space-y-4 w-full flex flex-col flex-1 animate-fade-in">
	<!-- HEADER SECTION -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--ttx-border-base)]">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] shadow-xs shrink-0">
				<QrCode class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight text-[var(--ttx-text-main)]">
						QR Code Generator
					</h1>
					<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-border-subtle)]">
						Kustom Bingkai & Logo
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Hasilkan QR Code siap cetak dengan bingkai teks dan logo tengah secara lokal.
				</p>
			</div>
		</div>

		<button
			type="button"
			class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all shadow-xs"
			onclick={handleReset}
			title="Kembalikan semua pengaturan ke awal"
		>
			<RotateCcw size={13} />
			<span>Reset</span>
		</button>
	</div>

	<!-- TWO-COLUMN WORKSPACE -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
		
		<!-- LEFT: UNIFIED CONTROLS CARD (7 COLS) -->
		<div class="lg:col-span-7 flex flex-col rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs overflow-hidden">
			
			<!-- SECTION 1: KONTEN INPUT -->
			<div class="p-4 sm:p-5 space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)] flex items-center gap-1.5">
						<Sparkles size={14} class="text-[var(--ttx-accent-text)]" />
						Isi Konten
					</span>

					{#if config.contentType === 'text'}
						<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">
							{config.inputValue.length} / 4296
						</span>
					{/if}
				</div>

				<!-- Tabs switcher: URL | Teks | Wi-Fi -->
				<div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-base)]">
					{#each [
						{ id: 'url', label: 'Tautan URL', icon: Globe },
						{ id: 'text', label: 'Teks Bebas', icon: TypeIcon },
						{ id: 'wifi', label: 'Akses Wi-Fi', icon: WifiIcon }
					] as tab}
						{@const isActive = config.contentType === tab.id}
						{@const TabIcon = tab.icon}
						<button
							type="button"
							class="h-8 sm:h-9 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all {isActive
								? 'bg-[var(--ttx-accent)] text-white shadow-xs font-bold'
								: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
							onclick={() => {
								config.contentType = tab.id as any;
								handleInputChange();
							}}
						>
							<TabIcon size={14} class="shrink-0" />
							<span class="truncate">{tab.label}</span>
						</button>
					{/each}
				</div>

				<!-- Dynamic Content Inputs -->
				{#if config.contentType === 'url'}
					<div class="space-y-1.5">
						<div class="relative">
							<Globe size={15} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] pointer-events-none" />
							<input
								id="qr-url-input"
								type="url"
								class="w-full h-10 pl-10 pr-3 rounded-xl text-xs sm:text-sm font-mono transition-all outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
								placeholder="https://contohdomain.com"
								bind:value={config.inputValue}
								oninput={handleInputChange}
							/>
						</div>
						{#if domain}
							<div class="flex items-center gap-1.5 text-xs text-[var(--ttx-accent-text)] pl-1">
								<span class="font-medium text-[11px]">Domain:</span>
								<code class="font-mono bg-[var(--ttx-accent-light)] px-1.5 py-0.5 rounded text-[11px]">{domain}</code>
							</div>
						{/if}
					</div>
				{:else if config.contentType === 'text'}
					<div>
						<textarea
							id="qr-text-input"
							class="w-full p-3 rounded-xl text-xs sm:text-sm font-mono transition-all outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
							placeholder="Ketik pesan atau teks yang ingin disimpan ke dalam kode QR..."
							bind:value={config.inputValue}
							oninput={handleInputChange}
							rows="3"
						></textarea>
					</div>
				{:else if config.contentType === 'wifi'}
					<div class="space-y-2.5">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							<div class="space-y-1">
								<label for="qr-wifi-ssid" class="text-xs font-medium text-[var(--ttx-text-muted)]">
									Nama SSID Wi-Fi
								</label>
								<div class="relative">
									<WifiIcon size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)] pointer-events-none" />
									<input
										id="qr-wifi-ssid"
										type="text"
										class="w-full h-9 pl-9 pr-3 rounded-xl text-xs font-mono transition-all outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
										placeholder="Nama Wi-Fi"
										bind:value={config.wifi.ssid}
										oninput={handleInputChange}
									/>
								</div>
							</div>

							<div class="space-y-1">
								<label for="qr-wifi-enc" class="text-xs font-medium text-[var(--ttx-text-muted)]">
									Keamanan
								</label>
								<select
									id="qr-wifi-enc"
									class="w-full h-9 px-3 rounded-xl text-xs transition-all outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] focus:border-[var(--ttx-accent)]"
									bind:value={config.wifi.encryption}
									onchange={handleInputChange}
								>
									<option value="WPA">WPA / WPA2 / WPA3</option>
									<option value="WEP">WEP</option>
									<option value="nopass">Tanpa Kata Sandi</option>
								</select>
							</div>
						</div>

						{#if config.wifi.encryption !== 'nopass'}
							<div class="space-y-1">
								<label for="qr-wifi-pass" class="text-xs font-medium text-[var(--ttx-text-muted)]">
									Kata Sandi
								</label>
								<div class="relative">
									<input
										id="qr-wifi-pass"
										type={showPassword ? 'text' : 'password'}
										class="w-full h-9 pl-3 pr-10 rounded-xl text-xs font-mono transition-all outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:border-[var(--ttx-accent)]"
										placeholder="Minimal 8 karakter"
										bind:value={config.wifi.password}
										oninput={handleInputChange}
									/>
									<button
										type="button"
										class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]"
										onclick={() => (showPassword = !showPassword)}
									>
										{#if showPassword}<EyeOff size={14} />{:else}<Eye size={14} />{/if}
									</button>
								</div>
							</div>
						{/if}

						<label class="inline-flex items-center gap-2 cursor-pointer pt-0.5">
							<input
								type="checkbox"
								class="w-3.5 h-3.5 rounded accent-[var(--ttx-accent)]"
								bind:checked={config.wifi.hidden}
								onchange={handleInputChange}
							/>
							<span class="text-xs text-[var(--ttx-text-muted)]">
								Jaringan Tersembunyi (Hidden SSID)
							</span>
						</label>
					</div>
				{/if}

				<!-- Validation Error Alert -->
				{#if validationMessage}
					<div class="flex items-start gap-2 px-3 py-2 rounded-xl text-xs font-medium {isInputValid
						? 'bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-border-subtle)]'
						: 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}">
						<AlertTriangle size={14} class="shrink-0 mt-0.5" />
						<span>{validationMessage}</span>
					</div>
				{/if}
			</div>

			<!-- SECTION 2: KUSTOMISASI DESAIN (TAB SYSTEM) -->
			<div class="border-t border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card-subtle)]">
				
				<!-- Tabs Nav -->
				<div class="flex items-center gap-1 px-4 pt-2.5 border-b border-[var(--ttx-border-base)] overflow-x-auto">
					{#each [
						{ id: 'frame', label: 'Bingkai', icon: LayoutTemplate, hasBadge: config.frame.enabled },
						{ id: 'logo', label: 'Logo Tengah', icon: ImageIcon, hasBadge: config.logo.enabled && !!config.logo.dataUrl },
						{ id: 'color', label: 'Warna', icon: Palette, hasBadge: false },
						{ id: 'options', label: 'Pengaturan', icon: Sliders, hasBadge: false }
					] as tab}
						{@const isSelected = activeTab === tab.id}
						{@const TabIcon = tab.icon}
						<button
							type="button"
							class="flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all relative border-b-2 {isSelected
								? 'bg-[var(--ttx-bg-card)] text-[var(--ttx-accent-text)] border-[var(--ttx-accent)] shadow-xs'
								: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] border-transparent hover:bg-[var(--ttx-bg-hover)]'}"
							onclick={() => (activeTab = tab.id as TabKey)}
						>
							<TabIcon size={14} class="shrink-0" />
							<span>{tab.label}</span>
							{#if tab.hasBadge}
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							{/if}
						</button>
					{/each}
				</div>

				<!-- Tab Body -->
				<div class="p-4 sm:p-5 bg-[var(--ttx-bg-card)] min-h-[220px]">
					
					<!-- TAB 1: BINGKAI -->
					{#if activeTab === 'frame'}
						<div class="space-y-4">
							<div class="flex items-center justify-between pb-2.5 border-b border-[var(--ttx-border-subtle)]">
								<div>
									<h2 class="text-xs font-bold text-[var(--ttx-text-main)]">Gunakan Bingkai Teks</h2>
									<p class="text-[11px] text-[var(--ttx-text-muted)]">Tambahkan kartu bingkai profesional dengan teks ajakan</p>
								</div>
								<label class="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										class="sr-only peer"
										bind:checked={config.frame.enabled}
										onchange={() => {
											if (config.frame.enabled && !config.frame.text) {
												config.frame.text = 'SCAN ME';
											}
											handleConfigChange();
										}}
									/>
									<div class="w-9 h-5 bg-[var(--ttx-border-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ttx-accent)]"></div>
								</label>
							</div>

							{#if config.frame.enabled}
								<!-- Text Input -->
								<div class="space-y-1.5">
									<div class="flex items-center justify-between">
										<label for="qr-frame-text" class="text-xs font-medium text-[var(--ttx-text-muted)]">
											Teks Bingkai
										</label>
										<span class="text-[11px] font-mono text-[var(--ttx-text-dim)]">
											{config.frame.text.length} / 32
										</span>
									</div>
									<input
										id="qr-frame-text"
										type="text"
										class="w-full h-10 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all outline-none border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] focus:border-[var(--ttx-accent)]"
										placeholder="Contoh: SCAN ME, MENU RESTO"
										bind:value={config.frame.text}
										oninput={handleConfigChange}
										maxlength="32"
									/>
								</div>

								<!-- Frame Style Selector with Mini Visual Icons -->
								<div class="space-y-1.5">
									<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Pilihan Gaya Bingkai</span>
									<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
										{#each FRAME_PRESETS as preset}
											{@const isActive = config.frame.style === preset.id}
											<button
												type="button"
												class="flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1.5 {isActive
													? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-bold shadow-xs'
													: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)]'}"
												onclick={() => {
													config.frame.style = preset.id as FrameStyle;
													handleConfigChange();
												}}
											>
												<!-- Mini Visual Representation of each Frame Style -->
												<div class="w-8 h-9 rounded border border-current flex flex-col overflow-hidden relative opacity-85">
													{#if preset.id === 'top-header'}
														<div class="h-2.5 bg-current w-full"></div>
														<div class="flex-1 flex items-center justify-center p-0.5"><div class="w-4 h-4 border border-dashed border-current opacity-60"></div></div>
													{:else if preset.id === 'callout'}
														<div class="flex-1 flex items-center justify-center p-0.5"><div class="w-4 h-4 border border-dashed border-current opacity-60"></div></div>
														<div class="h-2.5 bg-current w-[80%] mx-auto rounded-sm"></div>
													{:else if preset.id === 'polaroid'}
														<div class="flex-1 flex items-center justify-center p-0.5"><div class="w-4 h-4 border border-dashed border-current opacity-60"></div></div>
														<div class="h-3 w-full border-t border-current flex items-center justify-center"><div class="w-3 h-0.5 bg-current opacity-50"></div></div>
													{:else}
														<!-- bottom-banner -->
														<div class="flex-1 flex items-center justify-center p-0.5"><div class="w-4 h-4 border border-dashed border-current opacity-60"></div></div>
														<div class="h-2.5 bg-current w-full"></div>
													{/if}
												</div>
												<span class="text-[11px] leading-tight truncate">{preset.name}</span>
											</button>
										{/each}
									</div>
								</div>

								<!-- Frame Color Presets & Custom Pickers -->
								<div class="space-y-2 pt-1">
									<div class="flex items-center justify-between">
										<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Tema Warna Bingkai</span>
									</div>
									<!-- Color Swatches -->
									<div class="flex items-center gap-2 flex-wrap">
										{#each FRAME_COLOR_PRESETS as fPreset}
											{@const isSelected = config.frame.frameColor.toLowerCase() === fPreset.frame.toLowerCase()}
											<button
												type="button"
												class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all {isSelected
													? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold'
													: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)]'}"
												onclick={() => applyFrameColorPreset(fPreset.frame, fPreset.text)}
											>
												<span class="w-3 h-3 rounded-full border border-black/20 shrink-0" style="background:{fPreset.frame}"></span>
												<span>{fPreset.name}</span>
											</button>
										{/each}
									</div>

									<!-- Custom Colors Inputs -->
									<div class="grid grid-cols-2 gap-3 pt-1">
										<div class="space-y-1">
											<span class="text-[11px] text-[var(--ttx-text-dim)]">Warna Bingkai Kustom</span>
											<div class="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
												<input
													type="color"
													class="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
													bind:value={config.frame.frameColor}
													onchange={handleConfigChange}
												/>
												<input
													type="text"
													class="bg-transparent font-mono text-xs font-semibold uppercase w-full outline-none text-[var(--ttx-text-main)]"
													bind:value={config.frame.frameColor}
													oninput={handleConfigChange}
													maxlength="7"
												/>
											</div>
										</div>

										<div class="space-y-1">
											<span class="text-[11px] text-[var(--ttx-text-dim)]">Warna Teks</span>
											<div class="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
												<input
													type="color"
													class="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
													bind:value={config.frame.textColor}
													onchange={handleConfigChange}
												/>
												<input
													type="text"
													class="bg-transparent font-mono text-xs font-semibold uppercase w-full outline-none text-[var(--ttx-text-main)]"
													bind:value={config.frame.textColor}
													oninput={handleConfigChange}
													maxlength="7"
												/>
											</div>
										</div>
									</div>
								</div>
							{:else}
								<div class="py-6 text-center text-xs text-[var(--ttx-text-dim)]">
									Nyalakan toggle di atas untuk menambahkan teks dan bingkai kartu di sekeliling QR Code.
								</div>
							{/if}
						</div>

					<!-- TAB 2: LOGO TENGAH -->
					{:else if activeTab === 'logo'}
						<div class="space-y-4">
							<div class="flex items-center justify-between pb-2.5 border-b border-[var(--ttx-border-subtle)]">
								<div>
									<h2 class="text-xs font-bold text-[var(--ttx-text-main)]">Logo di Titik Tengah</h2>
									<p class="text-[11px] text-[var(--ttx-text-muted)]">Sisipkan logo merek atau ikon di pusat QR</p>
								</div>
								<label class="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										class="sr-only peer"
										bind:checked={config.logo.enabled}
										onchange={() => {
											if (config.logo.enabled && config.logo.dataUrl) {
												if (config.errorCorrection === 'L' || config.errorCorrection === 'M') {
													config.errorCorrection = 'H';
												}
											}
											handleConfigChange();
										}}
									/>
									<div class="w-9 h-5 bg-[var(--ttx-border-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ttx-accent)]"></div>
								</label>
							</div>

							{#if config.logo.enabled}
								<input
									type="file"
									accept="image/*"
									class="hidden"
									bind:this={logoFileInput}
									onchange={handleLogoUpload}
								/>

								{#if config.logo.dataUrl}
									<!-- Thumbnail & Ganti/Hapus -->
									<div class="flex items-center justify-between p-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
										<div class="flex items-center gap-3">
											<div class="w-10 h-10 rounded-lg overflow-hidden border border-black/15 bg-white p-1 flex items-center justify-center shrink-0">
												<img src={config.logo.dataUrl} alt="Logo" class="max-w-full max-h-full object-contain" />
											</div>
											<div>
												<p class="text-xs font-bold text-[var(--ttx-text-main)]">Logo Terpasang</p>
												<p class="text-[11px] text-emerald-500 font-medium">Toleransi scan otomatis High (H)</p>
											</div>
										</div>
										<div class="flex items-center gap-1.5">
											<button
												type="button"
												class="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--ttx-border-subtle)] hover:bg-[var(--ttx-bg-hover)] text-[var(--ttx-text-main)]"
												onclick={() => logoFileInput?.click()}
											>
												Ganti
											</button>
											<button
												type="button"
												class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
												onclick={removeLogo}
												title="Hapus Logo"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>

									<!-- Shape & Logo Background -->
									<div class="grid grid-cols-2 gap-3 pt-1">
										<div class="space-y-1">
											<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Bentuk Latar Logo</span>
											<div class="grid grid-cols-2 gap-1.5">
												<button
													type="button"
													class="h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all {config.logo.shape === 'circle'
														? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-bold'
														: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)]'}"
													onclick={() => {
														config.logo.shape = 'circle';
														handleConfigChange();
													}}
												>
													<Circle size={12} />
													<span>Bulat</span>
												</button>
												<button
													type="button"
													class="h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all {config.logo.shape === 'square'
														? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-bold'
														: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)]'}"
													onclick={() => {
														config.logo.shape = 'square';
														handleConfigChange();
													}}
												>
													<Square size={12} />
													<span>Kotak</span>
												</button>
											</div>
										</div>

										<div class="space-y-1">
											<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Warna Latar Logo</span>
											<div class="flex items-center gap-2 p-1 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
												<input
													type="color"
													class="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
													bind:value={config.logo.bgColor}
													onchange={handleConfigChange}
												/>
												<input
													type="text"
													class="bg-transparent font-mono text-xs font-semibold uppercase w-full outline-none text-[var(--ttx-text-main)]"
													bind:value={config.logo.bgColor}
													oninput={handleConfigChange}
													maxlength="7"
												/>
											</div>
										</div>
									</div>

									<!-- Logo Size Slider -->
									<div class="space-y-1 pt-1">
										<div class="flex items-center justify-between text-xs font-medium text-[var(--ttx-text-muted)]">
											<span>Ukuran Logo</span>
											<span class="font-mono text-[var(--ttx-accent-text)] font-bold">{config.logo.sizePercent}% dari QR</span>
										</div>
										<input
											type="range"
											min="14"
											max="26"
											step="1"
											class="w-full h-2 accent-[var(--ttx-accent)] cursor-pointer rounded-lg bg-[var(--ttx-border-base)]"
											bind:value={config.logo.sizePercent}
											oninput={handleConfigChange}
										/>
									</div>
								{:else}
									<!-- Dropzone upload -->
									<button
										type="button"
										class="w-full border-2 border-dashed border-[var(--ttx-border-subtle)] hover:border-[var(--ttx-accent)] rounded-2xl py-6 px-4 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[var(--ttx-bg-input)]"
										onclick={() => logoFileInput?.click()}
									>
										<div class="w-9 h-9 rounded-xl bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] flex items-center justify-center">
											<Upload size={18} />
										</div>
										<div>
											<p class="text-xs font-bold text-[var(--ttx-text-main)]">Pilih Berkas Logo</p>
											<p class="text-[11px] text-[var(--ttx-text-muted)]">Mendukung format PNG, JPG, SVG, WebP</p>
										</div>
									</button>
								{/if}

								{#if logoUploadError}
									<p class="text-xs text-rose-500 font-medium">{logoUploadError}</p>
								{/if}
							{:else}
								<div class="py-6 text-center text-xs text-[var(--ttx-text-dim)]">
									Nyalakan toggle di atas untuk menambahkan ikon atau logo di titik tengah QR Code.
								</div>
							{/if}
						</div>

					<!-- TAB 3: WARNA -->
					{:else if activeTab === 'color'}
						<div class="space-y-4">
							<div class="flex items-center justify-between pb-2.5 border-b border-[var(--ttx-border-subtle)]">
								<h2 class="text-xs font-bold text-[var(--ttx-text-main)]">Warna Pola & Latar QR</h2>
								<label class="flex items-center gap-2 text-xs cursor-pointer font-medium text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]">
									<input
										type="checkbox"
										class="w-4 h-4 rounded accent-[var(--ttx-accent)]"
										bind:checked={config.isTransparent}
										onchange={handleConfigChange}
									/>
									Latar Transparan
								</label>
							</div>

							<!-- Presets -->
							<div class="space-y-1.5">
								<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Pilihan Tema Cepat</span>
								<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{#each COLOR_PRESETS as preset}
										{@const isActive = config.foregroundColor === preset.fg && config.backgroundColor === preset.bg && !config.isTransparent}
										<button
											type="button"
											class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all text-left {isActive
												? 'border-[var(--ttx-accent)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] font-semibold shadow-xs'
												: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)]'}"
											onclick={() => applyPreset(preset.fg, preset.bg)}
										>
											<span class="w-3.5 h-3.5 rounded-full border border-black/20 overflow-hidden relative shrink-0">
												<span class="absolute inset-0" style="background:{preset.bg}"></span>
												<span class="absolute inset-[2px] rounded-full" style="background:{preset.fg}"></span>
											</span>
											<span class="truncate">{preset.name}</span>
										</button>
									{/each}
								</div>
							</div>

							<!-- Custom Colors -->
							<div class="grid grid-cols-2 gap-3 pt-1">
								<div class="space-y-1">
									<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Warna Pola QR</span>
									<div class="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
										<input
											type="color"
											class="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0 p-0 shrink-0"
											bind:value={config.foregroundColor}
											onchange={handleConfigChange}
										/>
										<input
											type="text"
											class="bg-transparent font-mono text-xs font-semibold uppercase w-full outline-none text-[var(--ttx-text-main)]"
											bind:value={config.foregroundColor}
											oninput={handleConfigChange}
											maxlength="7"
										/>
									</div>
								</div>

								<div class="space-y-1 {config.isTransparent ? 'opacity-35 pointer-events-none' : ''}">
									<span class="text-xs font-medium text-[var(--ttx-text-muted)]">Warna Latar QR</span>
									<div class="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)]">
										<input
											type="color"
											class="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0 p-0 shrink-0"
											bind:value={config.backgroundColor}
											onchange={handleConfigChange}
											disabled={config.isTransparent}
										/>
										<input
											type="text"
											class="bg-transparent font-mono text-xs font-semibold uppercase w-full outline-none text-[var(--ttx-text-main)]"
											bind:value={config.backgroundColor}
											oninput={handleConfigChange}
											maxlength="7"
											disabled={config.isTransparent}
										/>
									</div>
								</div>
							</div>

							{#if !config.isTransparent}
								<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs {contrastResult.isRisky
									? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
									: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}">
									{#if contrastResult.isRisky}
										<AlertTriangle size={13} class="shrink-0" />
									{:else}
										<ShieldCheck size={13} class="shrink-0" />
									{/if}
									<span>{contrastResult.message}</span>
								</div>
							{/if}
						</div>

					<!-- TAB 4: OPTIONS -->
					{:else if activeTab === 'options'}
						<div class="space-y-4">
							<div class="space-y-1.5">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-[var(--ttx-text-main)]">Tingkat Pemulihan (ECC)</span>
									<span class="text-[11px] text-[var(--ttx-accent-text)] font-semibold">
										{ERROR_CORRECTION_INFO[config.errorCorrection]}
									</span>
								</div>
								<div class="grid grid-cols-4 gap-1.5">
									{#each (['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]) as lvl}
										<button
											type="button"
											class="h-8 rounded-xl text-xs font-bold transition-all {config.errorCorrection === lvl
												? 'bg-[var(--ttx-accent)] text-white shadow-xs'
												: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] border border-[var(--ttx-border-subtle)] hover:text-[var(--ttx-text-main)]'}"
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

							<div class="space-y-1.5 pt-1">
								<div class="flex items-center justify-between text-xs font-medium text-[var(--ttx-text-muted)]">
									<span>Margin / Quiet Zone</span>
									<span class="font-mono text-[var(--ttx-accent-text)] font-bold">{config.margin} blok</span>
								</div>
								<input
									type="range"
									min="0"
									max="8"
									step="1"
									class="w-full h-2 accent-[var(--ttx-accent)] cursor-pointer rounded-lg bg-[var(--ttx-border-base)]"
									bind:value={config.margin}
									oninput={handleConfigChange}
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- RIGHT: LIVE PREVIEW & EXPORT ACTIONS (5 COLS) -->
		<div class="lg:col-span-5 flex flex-col rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 sm:p-5 shadow-xs gap-3.5 lg:sticky lg:top-4">
			
			<!-- Preview Header & Background Switcher -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5">
					<Layers size={14} class="text-[var(--ttx-accent-text)]" />
					<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
						Pratinjau QR
					</span>
				</div>

				<div class="flex rounded-lg overflow-hidden border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-0.5">
					{#each [
						{ id: 'light', icon: Sun, title: 'Latar Terang' },
						{ id: 'checker', icon: Grid3X3, title: 'Latar Transparan' },
						{ id: 'dark', icon: Moon, title: 'Latar Gelap' }
					] as bg}
						{@const BgIcon = bg.icon}
						<button
							type="button"
							class="p-1.5 rounded-md transition-all {previewBgMode === bg.id
								? 'bg-[var(--ttx-accent)] text-white shadow-xs'
								: 'text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)]'}"
							onclick={() => (previewBgMode = bg.id as any)}
							title={bg.title}
						>
							<BgIcon size={13} />
						</button>
					{/each}
				</div>
			</div>

			<!-- QR Display Box -->
			<div class="w-full min-h-[280px] sm:min-h-[310px] rounded-2xl border flex items-center justify-center p-4 overflow-hidden shadow-inner border-[var(--ttx-border-subtle)] {previewBgMode === 'dark' ? 'bg-[#050a14]' : previewBgMode === 'checker' ? 'bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[size:14px_14px]' : 'bg-white'}">
				{#if qrSvg && isInputValid}
					<div class="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-[290px] [&>svg]:w-auto [&>svg]:h-auto [&>svg]:block transition-transform duration-200 hover:scale-[1.02]">
						{@html qrSvg}
					</div>
				{:else}
					<div class="flex flex-col items-center gap-2 text-center px-4">
						<QrCode size={48} strokeWidth={1} class="text-[var(--ttx-text-dim)] opacity-40" />
						<p class="text-xs font-medium text-[var(--ttx-text-dim)]">
							Masukkan konten untuk menghasilkan QR Code
						</p>
					</div>
				{/if}
			</div>

			<!-- Resolution Selector -->
			<div class="space-y-1">
				<div class="flex items-center justify-between text-xs font-medium text-[var(--ttx-text-muted)]">
					<span>Resolusi Ekspor PNG</span>
					<span class="font-mono text-[var(--ttx-accent-text)] font-bold">{config.pngSize} × {config.pngSize} px</span>
				</div>
				<div class="grid grid-cols-3 gap-2">
					{#each ([512, 1024, 2048] as PngSize[]) as size}
						<button
							type="button"
							class="h-8 rounded-lg text-xs font-semibold font-mono transition-all {config.pngSize === size
								? 'bg-[var(--ttx-accent)] text-white shadow-xs font-bold'
								: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] border border-[var(--ttx-border-subtle)]'}"
							onclick={() => { config.pngSize = size; }}
						>
							{size} px
						</button>
					{/each}
				</div>
			</div>

			<!-- Actions -->
			<div class="space-y-2 pt-0.5">
				<!-- Primary Button: Unduh PNG -->
				<button
					type="button"
					class="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 {canExport
						? 'bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] text-white shadow-md shadow-blue-500/20 active:scale-98'
						: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-dim)] border border-[var(--ttx-border-subtle)] cursor-not-allowed'}"
					onclick={handleExportPng}
					disabled={!canExport}
				>
					<Download size={16} />
					<span>Unduh Gambar PNG</span>
				</button>

				<!-- Secondary Action Row: Salin & SVG -->
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						class="h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150 {canExport
							? copiedImage
								? 'bg-emerald-600 text-white border-emerald-600'
								: 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] active:scale-98 shadow-xs'
							: 'border-[var(--ttx-border-subtle)] text-[var(--ttx-text-dim)] cursor-not-allowed'}"
						onclick={handleCopyImage}
						disabled={!canExport}
					>
						{#if copiedImage}
							<Check size={14} />
							<span>Tersalin!</span>
						{:else}
							<Copy size={14} />
							<span>Salin Gambar</span>
						{/if}
					</button>

					<button
						type="button"
						class="h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150 {canExport
							? 'border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] active:scale-98 shadow-xs'
							: 'border-[var(--ttx-border-subtle)] text-[var(--ttx-text-dim)] cursor-not-allowed'}"
						onclick={handleExportSvg}
						disabled={!canExport}
					>
						<Download size={14} />
						<span>Unduh SVG</span>
					</button>
				</div>

				<!-- Raw SVG link -->
				{#if qrSvg && canExport}
					<button
						type="button"
						class="w-full py-0.5 text-[11px] font-medium transition-colors text-center {copiedSvg ? 'text-emerald-500' : 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
						onclick={handleCopySvg}
					>
						{copiedSvg ? '✓ Kode SVG disalin' : 'Salin Kode SVG (<svg>)'}
					</button>
				{/if}
			</div>

			{#if exportError}
				<div class="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center">
					{exportError}
				</div>
			{/if}
		</div>

	</div>
</div>
