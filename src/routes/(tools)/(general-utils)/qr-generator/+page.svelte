<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		ArrowLeft,
		QrCode,
		Link as LinkIcon,
		Type as TypeIcon,
		Wifi as WifiIcon,
		Globe,
		Eye,
		EyeOff,
		Palette,
		AlertTriangle,
		RotateCcw,
		Download,
		Check,
		Sun,
		Moon,
		Grid3X3,
		Sliders
	} from '@lucide/svelte';
	import {
		DEFAULT_CONFIG,
		COLOR_PRESETS,
		ERROR_CORRECTION_INFO,
		type QRConfig,
		type PngSize,
		checkContrast,
		validateInput,
		extractDomain,
		generateFilename,
		generateQRSvg,
		exportPngBlob,
		exportSvgBlob,
		downloadBlob
	} from '$lib/utils/qr';

	let config: QRConfig = $state({ ...DEFAULT_CONFIG });
	let qrSvg = $state('');
	let validationMessage = $state('');
	let isInputValid = $state(false);
	let isExporting = $state(false);
	let exportError = $state('');
	let showResetConfirm = $state(false);
	let showPassword = $state(false);
	let previewBgMode = $state<'light' | 'dark' | 'checker'>('light');
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const contrastResult = $derived(checkContrast(config.foregroundColor, config.backgroundColor));
	const domain = $derived(
		config.contentType === 'url' && config.inputValue ? extractDomain(config.inputValue) : ''
	);

	function hasContent(cfg: QRConfig): boolean {
		if (cfg.contentType === 'wifi') {
			return !!cfg.wifi.ssid.trim();
		}
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
				validationMessage = err instanceof Error ? err.message : 'Gagal membuat kode QR.';
			}
		} else {
			qrSvg = '';
		}
	}

	function handleInputChange() {
		exportError = '';
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updateQR, 200);
	}

	function handleConfigChange() {
		exportError = '';
		if (isInputValid && hasContent(config)) {
			updateQR();
		}
	}

	async function handleExportPng() {
		if (!isInputValid || !hasContent(config) || isExporting) return;
		isExporting = true;
		exportError = '';
		try {
			const blob = await exportPngBlob(config);
			const ext = config.contentType === 'wifi' ? 'wifi.png' : 'png';
			downloadBlob(blob, generateFilename(ext));
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Ekspor PNG gagal.';
		} finally {
			isExporting = false;
		}
	}

	async function handleExportSvg() {
		if (!isInputValid || !hasContent(config) || isExporting) return;
		isExporting = true;
		exportError = '';
		try {
			const blob = await exportSvgBlob(config);
			const ext = config.contentType === 'wifi' ? 'wifi.svg' : 'svg';
			downloadBlob(blob, generateFilename(ext));
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Ekspor SVG gagal.';
		} finally {
			isExporting = false;
		}
	}

	function handleReset() {
		config = {
			...DEFAULT_CONFIG,
			wifi: {
				ssid: '',
				password: '',
				encryption: 'WPA',
				hidden: false
			}
		};
		qrSvg = '';
		validationMessage = '';
		isInputValid = false;
		exportError = '';
		showResetConfirm = false;
		showPassword = false;
	}

	function applyPreset(fg: string, bg: string) {
		config.foregroundColor = fg;
		config.backgroundColor = bg;
		config.isTransparent = false;
		handleConfigChange();
	}

	onMount(() => {
		config.inputValue = 'https://texy.vercel.app';
		updateQR();
	});
</script>

<svelte:head>
	<title>QR Code Generator - TEXY Workspace</title>
	<meta
		name="description"
		content="Buat dan kustomisasi kode QR gratis untuk URL link, teks, dan Wi-Fi. Dilengkapi kontrol warna, margin, dan ekspor kualitas tinggi PNG/SVG."
	/>
	<meta name="keywords" content="qr code generator, pembuat qr code, qr wifi, qr url, download qr png svg, texy workspace" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{$page.url.origin}/qr-generator" />
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] bg-base-100 text-base-content font-sans pb-16">
	<!-- Background Grid Effect -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
		<!-- Header & Navigation -->
		<div class="mb-6">
			<a
				href="/"
				class="mb-3 inline-flex items-center text-sm font-medium text-base-content/50 hover:text-base-content transition-colors"
			>
				<ArrowLeft size={16} class="mr-1.5" />
				Kembali ke Tools
			</a>
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/50 text-primary shadow-sm">
					<QrCode class="h-6 w-6 md:h-7 md:w-7" />
				</div>
				<div>
					<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">QR Code Generator</h1>
					<p class="mt-0.5 text-xs md:text-sm text-base-content/60">
						Buat kode QR kustom untuk URL, teks, dan Wi-Fi secara instan dan aman di browser.
					</p>
				</div>
			</div>
		</div>

		<!-- Main 2-Column Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- LEFT PANEL: Unified Editor Container -->
			<div class="lg:col-span-7 card bg-base-200/50 border border-base-content/10 shadow-sm p-5 md:p-6">
				<!-- Section 1: Konten -->
				<div>
					<div class="flex items-center justify-between mb-4">
						<span class="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
							<LinkIcon size={14} class="text-primary" />
							Konten QR
						</span>
					</div>

					<!-- Content Type Pills -->
					<div class="flex flex-wrap gap-2 mb-4">
						<button
							type="button"
							class="btn btn-sm rounded-full gap-2 transition-all {config.contentType === 'url' ? 'btn-primary' : 'btn-outline border-base-content/20 bg-base-100 hover:bg-base-200'}"
							onclick={() => {
								config.contentType = 'url';
								handleInputChange();
							}}
						>
							<Globe size={14} />
							<span>URL Link</span>
						</button>
						<button
							type="button"
							class="btn btn-sm rounded-full gap-2 transition-all {config.contentType === 'text' ? 'btn-primary' : 'btn-outline border-base-content/20 bg-base-100 hover:bg-base-200'}"
							onclick={() => {
								config.contentType = 'text';
								handleInputChange();
							}}
						>
							<TypeIcon size={14} />
							<span>Teks Bebas</span>
						</button>
						<button
							type="button"
							class="btn btn-sm rounded-full gap-2 transition-all {config.contentType === 'wifi' ? 'btn-primary' : 'btn-outline border-base-content/20 bg-base-100 hover:bg-base-200'}"
							onclick={() => {
								config.contentType = 'wifi';
								handleInputChange();
							}}
						>
							<WifiIcon size={14} />
							<span>Jaringan Wi-Fi</span>
						</button>
					</div>

					<!-- Content Inputs -->
					{#if config.contentType === 'url'}
						<div class="space-y-1.5">
							<label for="url-input" class="text-xs font-medium text-base-content/70">Tautan Web</label>
							<div class="relative">
								<input
									id="url-input"
									type="url"
									class="input input-bordered w-full bg-base-100 pl-10 text-sm focus:border-primary font-mono {config.inputValue.trim() !== '' && !isInputValid ? 'input-error' : ''}"
									placeholder="https://example.com"
									bind:value={config.inputValue}
									oninput={handleInputChange}
								/>
								<Globe size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
							</div>
						</div>
					{:else if config.contentType === 'text'}
						<div class="space-y-1.5">
							<label for="text-input" class="text-xs font-medium text-base-content/70">Isi Teks</label>
							<textarea
								id="text-input"
								class="textarea textarea-bordered w-full bg-base-100 text-sm focus:border-primary min-h-[90px] font-mono {config.inputValue.trim() !== '' && !isInputValid ? 'textarea-error' : ''}"
								placeholder="Tulis pesan atau teks yang ingin dimasukkan ke kode QR..."
								bind:value={config.inputValue}
								oninput={handleInputChange}
								rows="3"
							></textarea>
						</div>
					{:else if config.contentType === 'wifi'}
						<div class="space-y-3">
							<div class="space-y-1.5">
								<label for="wifi-ssid" class="text-xs font-medium text-base-content/70">
									Nama Jaringan (SSID) <span class="text-error">*</span>
								</label>
								<div class="relative">
									<input
										id="wifi-ssid"
										type="text"
										class="input input-bordered w-full bg-base-100 pl-10 text-sm focus:border-primary font-mono"
										placeholder="e.g. WiFi_Kantor_5G"
										bind:value={config.wifi.ssid}
										oninput={handleInputChange}
									/>
									<WifiIcon size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
								</div>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div class="space-y-1.5">
									<label for="wifi-security" class="text-xs font-medium text-base-content/70">Tipe Enkripsi</label>
									<select
										id="wifi-security"
										class="select select-bordered w-full bg-base-100 text-sm focus:border-primary"
										bind:value={config.wifi.encryption}
										onchange={handleInputChange}
									>
										<option value="WPA">WPA / WPA2 / WPA3</option>
										<option value="WEP">WEP (Legacy)</option>
										<option value="nopass">None (Jaringan Terbuka)</option>
									</select>
								</div>

								{#if config.wifi.encryption !== 'nopass'}
									<div class="space-y-1.5">
										<label for="wifi-password" class="text-xs font-medium text-base-content/70">
											Kata Sandi <span class="text-error">*</span>
										</label>
										<div class="relative">
											<input
												id="wifi-password"
												type={showPassword ? 'text' : 'password'}
												class="input input-bordered w-full bg-base-100 pr-10 text-sm focus:border-primary font-mono"
												placeholder="Password Wi-Fi"
												bind:value={config.wifi.password}
												oninput={handleInputChange}
											/>
											<button
												type="button"
												class="btn btn-ghost btn-xs btn-circle absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
												onclick={() => (showPassword = !showPassword)}
												title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
											>
												{#if showPassword}
													<EyeOff size={15} />
												{:else}
													<Eye size={15} />
												{/if}
											</button>
										</div>
									</div>
								{/if}
							</div>

							<label class="label cursor-pointer justify-start gap-2 pt-1">
								<input
									type="checkbox"
									class="checkbox checkbox-sm checkbox-primary rounded"
									bind:checked={config.wifi.hidden}
									onchange={handleInputChange}
								/>
								<span class="label-text text-xs text-base-content/70">Jaringan tersembunyi (Hidden SSID)</span>
							</label>
						</div>
					{/if}

					<!-- Validation message / Domain hint -->
					{#if validationMessage}
						<p class="text-xs mt-2 font-medium {isInputValid ? 'text-base-content/50' : 'text-error'}">
							{validationMessage}
						</p>
					{/if}

					{#if domain}
						<p class="text-xs text-base-content/60 mt-2 flex items-center gap-1.5">
							<Globe size={13} class="text-primary" />
							Domain target: <span class="font-mono text-primary font-semibold">{domain}</span>
						</p>
					{/if}
				</div>

				<!-- Divider -->
				<div class="border-t border-base-content/10 my-6"></div>

				<!-- Section 2: Warna & Gaya -->
				<div>
					<div class="flex items-center justify-between flex-wrap gap-2 mb-4">
						<span class="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
							<Palette size={14} class="text-primary" />
							Warna & Gaya
						</span>
						<label class="label cursor-pointer gap-2 py-0">
							<span class="label-text text-xs font-medium text-base-content/70">Latar Transparan</span>
							<input
								type="checkbox"
								class="toggle toggle-sm toggle-primary"
								bind:checked={config.isTransparent}
								onchange={handleConfigChange}
							/>
						</label>
					</div>

					<!-- Color Presets -->
					<div class="flex flex-wrap gap-2 mb-4">
						{#each COLOR_PRESETS as preset}
							<button
								type="button"
								class="btn btn-xs rounded-full gap-2 border bg-base-100 hover:bg-base-200 transition-all {config.foregroundColor === preset.fg && config.backgroundColor === preset.bg && !config.isTransparent ? 'border-primary ring-1 ring-primary' : 'border-base-content/20'}"
								onclick={() => applyPreset(preset.fg, preset.bg)}
								title="{preset.name} ({preset.fg} pada {preset.bg})"
							>
								<span class="w-3.5 h-3.5 rounded-full border border-base-content/20 flex overflow-hidden shrink-0 relative">
									<span class="absolute inset-0" style="background:{preset.bg}"></span>
									<span class="absolute inset-1 rounded-full" style="background:{preset.fg}"></span>
								</span>
								<span class="text-xs">{preset.name}</span>
							</button>
						{/each}
					</div>

					<!-- Custom Color Pickers -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<!-- Foreground -->
						<div class="space-y-1.5">
							<label for="fg-color" class="text-xs font-medium text-base-content/70">Warna Depan (QR)</label>
							<div class="flex items-center gap-2.5 p-2 bg-base-100 border border-base-content/20 rounded-xl focus-within:border-primary">
								<input
									id="fg-color"
									type="color"
									class="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent p-0"
									bind:value={config.foregroundColor}
									onchange={handleConfigChange}
								/>
								<input
									type="text"
									class="bg-transparent font-mono text-xs w-full uppercase outline-none"
									bind:value={config.foregroundColor}
									oninput={handleConfigChange}
									maxlength="7"
								/>
							</div>
						</div>

						<!-- Background -->
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label for="bg-color" class="text-xs font-medium text-base-content/70">Warna Latar</label>
								{#if config.isTransparent}
									<span class="badge badge-xs badge-ghost text-[10px]">Transparan</span>
								{/if}
							</div>
							<div class="flex items-center gap-2.5 p-2 bg-base-100 border border-base-content/20 rounded-xl focus-within:border-primary {config.isTransparent ? 'opacity-40 pointer-events-none' : ''}">
								<input
									id="bg-color"
									type="color"
									class="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent p-0"
									bind:value={config.backgroundColor}
									onchange={handleConfigChange}
									disabled={config.isTransparent}
								/>
								<input
									type="text"
									class="bg-transparent font-mono text-xs w-full uppercase outline-none"
									bind:value={config.backgroundColor}
									oninput={handleConfigChange}
									maxlength="7"
									disabled={config.isTransparent}
								/>
							</div>
						</div>
					</div>

					<!-- Contrast Warning -->
					{#if !config.isTransparent && contrastResult.isRisky}
						<div class="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs">
							<AlertTriangle size={16} class="shrink-0 mt-0.5" />
							<span>{contrastResult.message} (Rasio Kontras: {contrastResult.ratio.toFixed(1)}:1)</span>
						</div>
					{/if}
				</div>

				<!-- Divider -->
				<div class="border-t border-base-content/10 my-6"></div>

				<!-- Section 3: Pengaturan & Resolusi -->
				<div>
					<div class="flex items-center justify-between mb-4">
						<span class="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
							<Sliders size={14} class="text-primary" />
							Pengaturan Modul & Ekspor
						</span>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
						<!-- Quiet Zone (Margin) -->
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label for="margin-slider" class="text-xs font-medium text-base-content/70">Quiet Zone (Margin)</label>
								<span class="text-xs font-mono text-primary font-bold">{config.margin} blok</span>
							</div>
							<input
								id="margin-slider"
								type="range"
								min="0"
								max="10"
								step="1"
								class="range range-xs range-primary w-full"
								bind:value={config.margin}
								oninput={handleConfigChange}
							/>
							<p class="text-[11px] text-base-content/50">Jarak ruang kosong di sekeliling kode QR.</p>
						</div>

						<!-- Error Correction -->
						<div class="space-y-1.5">
							<label for="error-correction" class="text-xs font-medium text-base-content/70">Error Correction</label>
							<select
								id="error-correction"
								class="select select-sm select-bordered w-full bg-base-100 text-xs focus:border-primary"
								bind:value={config.errorCorrection}
								onchange={handleConfigChange}
							>
								{#each Object.entries(ERROR_CORRECTION_INFO) as [lvl, desc]}
									<option value={lvl}>{lvl} ({desc})</option>
								{/each}
							</select>
							<p class="text-[11px] text-base-content/50">Tingkat ketahanan jika kode tergores atau terhalang.</p>
						</div>
					</div>

					<!-- PNG Resolution -->
					<div class="pt-2 border-t border-base-content/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<span class="text-xs font-medium text-base-content/70">Resolusi Ekspor PNG</span>
						<div class="flex gap-2">
							{#each [512, 1024, 2048] as size}
								<button
									type="button"
									class="btn btn-xs rounded-lg font-mono transition-all {config.pngSize === size ? 'btn-primary' : 'btn-outline border-base-content/20 bg-base-100'}"
									onclick={() => {
										config.pngSize = size as PngSize;
									}}
								>
									{size}px
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- RIGHT PANEL: Live Preview & Export (Sticky) -->
			<div class="lg:col-span-5 sticky top-20 card bg-base-200/50 border border-base-content/10 shadow-sm p-4 sm:p-5 space-y-3.5">
				<!-- Header Preview -->
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
						<QrCode size={14} class="text-primary" />
						Pratinjau Langsung
					</span>
					<div class="flex items-center gap-2">
						<!-- Background preview mode buttons -->
						{#if qrSvg}
							<div class="join border border-base-content/10 rounded-lg overflow-hidden bg-base-100">
								<button
									type="button"
									class="join-item btn btn-xs btn-ghost px-2 {previewBgMode === 'light' ? 'btn-active text-primary' : 'text-base-content/50'}"
									onclick={() => (previewBgMode = 'light')}
									title="Mode latar terang"
								>
									<Sun size={13} />
								</button>
								<button
									type="button"
									class="join-item btn btn-xs btn-ghost px-2 {previewBgMode === 'checker' ? 'btn-active text-primary' : 'text-base-content/50'}"
									onclick={() => (previewBgMode = 'checker')}
									title="Mode papan catur (cek transparansi)"
								>
									<Grid3X3 size={13} />
								</button>
								<button
									type="button"
									class="join-item btn btn-xs btn-ghost px-2 {previewBgMode === 'dark' ? 'btn-active text-primary' : 'text-base-content/50'}"
									onclick={() => (previewBgMode = 'dark')}
									title="Mode latar gelap"
								>
									<Moon size={13} />
								</button>
							</div>
						{/if}

						<button
							type="button"
							class="btn btn-ghost btn-xs text-base-content/50 hover:text-error hover:bg-error/10 gap-1 rounded-lg"
							onclick={() => {
								if (config.inputValue.trim()) {
									showResetConfirm = true;
								} else {
									handleReset();
								}
							}}
							title="Reset semua pengaturan"
						>
							<RotateCcw size={13} />
							<span>Reset</span>
						</button>
					</div>
				</div>

				<!-- Preview Display Area -->
				<div
					class="w-full max-w-[290px] aspect-square mx-auto rounded-2xl border border-base-content/10 flex items-center justify-center p-3.5 sm:p-4 transition-colors overflow-hidden relative shadow-inner {previewBgMode === 'dark' ? 'bg-neutral-900' : previewBgMode === 'checker' ? 'bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[size:14px_14px]' : 'bg-base-100'}"
				>
					{#if qrSvg && isInputValid}
						<div class="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block transition-transform duration-200 hover:scale-[1.02]">
							{@html qrSvg}
						</div>
					{:else}
						<div class="text-center space-y-1.5 p-4 text-base-content/40 flex flex-col items-center">
							<QrCode size={44} strokeWidth={1.2} class="opacity-30" />
							<p class="text-xs">Masukkan konten untuk melihat pratinjau.</p>
						</div>
					{/if}
				</div>

				<!-- Meta Badges -->
				{#if qrSvg && isInputValid}
					<div class="flex flex-wrap items-center justify-center gap-1.5">
						<span class="badge badge-xs badge-neutral text-[10px] font-mono py-2">
							Tipe: {config.contentType.toUpperCase()}
						</span>
						<span class="badge badge-xs badge-neutral text-[10px] font-mono py-2">
							Margin: {config.margin}
						</span>
						<span class="badge badge-xs badge-neutral text-[10px] font-mono py-2">
							ECL: {config.errorCorrection}
						</span>
						{#if config.isTransparent}
							<span class="badge badge-xs badge-primary text-[10px] font-mono py-2">
								Transparan
							</span>
						{/if}
					</div>
				{/if}

				<!-- Export Buttons (2 Columns side-by-side) -->
				<div class="grid grid-cols-2 gap-2 pt-1">
					<button
						type="button"
						class="btn btn-primary btn-sm gap-1.5 shadow-sm"
						disabled={!isInputValid || !qrSvg || isExporting}
						onclick={handleExportPng}
					>
						{#if isExporting}
							<span class="loading loading-spinner loading-xs"></span>
						{:else}
							<Download size={14} />
							<span>Unduh PNG</span>
						{/if}
					</button>

					<button
						type="button"
						class="btn btn-outline btn-sm border-base-content/20 hover:bg-base-200 hover:border-base-content/30 gap-1.5"
						disabled={!isInputValid || !qrSvg || isExporting}
						onclick={handleExportSvg}
					>
						<Download size={14} />
						<span>Unduh SVG</span>
					</button>
				</div>

				{#if exportError}
					<div class="p-2.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
						<AlertTriangle size={14} />
						<span>{exportError}</span>
					</div>
				{/if}

				{#if config.isTransparent && qrSvg}
					<p class="text-[11px] text-warning/90 leading-tight bg-warning/5 p-2 rounded-lg border border-warning/10 text-center">
						Latar transparan memerlukan kontras yang baik pada media penempatan agar mudah dipindai.
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Reset Confirmation Modal -->
{#if showResetConfirm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<dialog class="modal modal-open modal-bottom sm:modal-middle" onclick={() => (showResetConfirm = false)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-box border border-base-content/10 bg-base-200" onclick={(e) => e.stopPropagation()}>
			<h3 class="font-bold text-base">Reset Semua Pengaturan?</h3>
			<p class="py-3 text-xs text-base-content/60 leading-relaxed">
				Tindakan ini akan mengosongkan input dan mengembalikan seluruh warna serta pengaturan resolusi ke kondisi awal.
			</p>
			<div class="modal-action">
				<button class="btn btn-sm btn-ghost" onclick={() => (showResetConfirm = false)}>Batal</button>
				<button class="btn btn-sm btn-error" onclick={handleReset}>Reset</button>
			</div>
		</div>
	</dialog>
{/if}
