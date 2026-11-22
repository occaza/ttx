<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import {
		Activity,
		FileText,
		Search,
		UploadCloud,
		AlertTriangle,
		AlertCircle,
		CheckCircle2,
		Copy,
		Check,
		Wrench,
		Smartphone,
		RefreshCw,
		FileSearch,
		ShieldAlert,
		HelpCircle,
		Sparkles,
		ChevronRight,
		Cpu,
		Clock,
		Plus,
		Trash2,
		X,
		MessageSquarePlus,
		ExternalLink,
		ShieldCheck,
		Inbox,
		CheckCheck,
		Ban,
		Edit3
	} from '@lucide/svelte';
	import {
		PANIC_DATABASE,
		IPHONE_MODELS,
		parsePanicLog,
		type PanicSensorDef,
		type ParsedPanicResult
	} from '$lib/data/panicDictionary';

	let { isDark = true }: { isDark?: boolean } = $props();

	let disclaimerExpanded = $state(false);

	const isOwner = $derived(
		$page.data.profile?.role === 'owner' ||
		$page.data.user?.app_metadata?.role === 'owner' ||
		$page.data.user?.user_metadata?.role === 'owner'
	);

	// Modes: 'log' (Upload/Paste) | 'lookup' (Manual code search) | 'admin' (Owner review)
	let activeTab = $state<'log' | 'lookup' | 'admin'>('log');

	// Tab 1: Log analysis state
	let logInput = $state('');
	let parsedResult = $state<ParsedPanicResult | null>(null);
	let isAnalyzing = $state(false);
	let copiedReport = $state(false);

	// Tab 2: Manual lookup state
	let searchCode = $state('');
	let selectedModelFilter = $state('all');
	let selectedManualSensor = $state<PanicSensorDef | null>(PANIC_DATABASE[0]);

	// Approved solutions from Supabase database
	interface SolutionRecord {
		id: string;
		sensor_code: string;
		component: string;
		solution_text: string;
		author_name: string;
		created_at: string;
		status?: string;
		notes?: string;
	}

	let dbSolutions = $state<Record<string, SolutionRecord[]>>({});
	let isFetchingSolutions = $state(false);

	async function fetchSolutionsForSensor(code: string) {
		const cleanCode = code.toLowerCase();
		if (dbSolutions[cleanCode]) return;
		isFetchingSolutions = true;
		try {
			const res = await fetch(`/api/panic-solutions?sensor=${encodeURIComponent(cleanCode)}`);
			if (res.ok) {
				const json = await res.json();
				dbSolutions = {
					...dbSolutions,
					[cleanCode]: json.solutions || []
				};
			}
		} catch (err) {
			console.error('Failed to fetch solutions', err);
		} finally {
			isFetchingSolutions = false;
		}
	}

	// Owner Admin state
	let adminSolutions = $state<SolutionRecord[]>([]);
	let adminFilter = $state<'all' | 'pending' | 'approved' | 'rejected'>('pending');
	let isLoadingAdmin = $state(false);
	let pendingCount = $derived(adminSolutions.filter((s) => s.status === 'pending').length);

	async function loadAdminSolutions() {
		if (!isOwner) return;
		isLoadingAdmin = true;
		try {
			const res = await fetch('/api/panic-solutions?admin=true');
			if (res.ok) {
				const json = await res.json();
				adminSolutions = json.solutions || [];
			}
		} catch (err) {
			console.error('Failed to load admin drafts', err);
		} finally {
			isLoadingAdmin = false;
		}
	}

	async function updateSolutionStatus(id: string, status: 'approved' | 'rejected', solutionText?: string) {
		try {
			const res = await fetch('/api/panic-solutions', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, status, solution_text: solutionText })
			});
			if (res.ok) {
				// Refresh locally
				adminSolutions = adminSolutions.map((s) =>
					s.id === id ? { ...s, status, solution_text: solutionText || s.solution_text } : s
				);
				// Invalidate public cache
				dbSolutions = {};
			}
		} catch (err) {
			console.error('Failed to update status', err);
		}
	}

	async function deleteSolution(id: string) {
		if (!confirm('Hapus solusi ini secara permanen dari database?')) return;
		try {
			const res = await fetch('/api/panic-solutions', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			if (res.ok) {
				adminSolutions = adminSolutions.filter((s) => s.id !== id);
				dbSolutions = {};
			}
		} catch (err) {
			console.error('Failed to delete solution', err);
		}
	}

	// Add custom solution modal state
	let showAddModal = $state(false);
	let targetCode = $state('');
	let targetName = $state('');
	let newSolutionInput = $state('');
	let authorNameInput = $state('');
	let isSubmittingSolution = $state(false);
	let submissionNotice = $state('');

	function openAddSolutionModal(code: string, componentName: string) {
		targetCode = code.toLowerCase();
		targetName = componentName;
		newSolutionInput = '';
		authorNameInput = $page.data.profile?.first_name || '';
		submissionNotice = '';
		showAddModal = true;
	}

	async function submitDraftSolution() {
		if (!newSolutionInput.trim() || !targetCode) return;
		isSubmittingSolution = true;
		submissionNotice = '';

		try {
			const res = await fetch('/api/panic-solutions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sensor_code: targetCode,
					component: targetName,
					solution_text: newSolutionInput.trim(),
					author_name: authorNameInput.trim() || 'Anonim (Teknisi)'
				})
			});

			const data = await res.json();
			if (res.ok) {
				submissionNotice = isOwner
					? 'Solusi berhasil dikirim ke antrean draft. Anda bisa langsung menyetujuinya di tab Review Draft.'
					: 'Solusi berhasil dikirim ke antrean draft. Akan divalidasi oleh owner sebelum tayang.';
				newSolutionInput = '';
				if (isOwner) loadAdminSolutions();
				setTimeout(() => {
					showAddModal = false;
					submissionNotice = '';
				}, 2000);
			} else {
				submissionNotice = data.error || 'Gagal mengirim solusi.';
			}
		} catch (err: any) {
			submissionNotice = err?.message || 'Terjadi kesalahan jaringan.';
		} finally {
			isSubmittingSolution = false;
		}
	}

	// Samples
	const SAMPLES = [
		{
			title: 'iPhone 11: Mic 1 (Port Cas)',
			badge: 'Restart 3 Menit',
			text: `{"bug_type":"210","timestamp":"2026-11-15 14:22:10.00 +0700","os_version":"iPhone OS 17.5.1 (21F90)","incident_id":"A1B2C3D4-E5F6-7890-ABCD-EF1234567890"}
Incident Identifier: A1B2C3D4-E5F6-7890-ABCD-EF1234567890
CrashReporter Key:   9876543210abcdef9876543210abcdef98765432
Hardware Model:      iPhone12,1
Date:                2026-11-15 14:22:10 +0700
OS Version:          iPhone OS 17.5.1 (Build 21F90)

panic(cpu 0 caller 0xfffffff01a2b3c4d): "thermalmonitord: userspace watchdog timeout: no successful checkins in 180 seconds"
Debugger message: panic
Memory ID: 0x6
OS release type: User
OS version: 21F90
Kernel version: Darwin Kernel Version 23.5.0
Missing sensor(s): mic1, prs0
Root mount URL: file:///
`
		},
		{
			title: 'iPhone 12: Mic 2 (Sensor Atas)',
			badge: 'Proximity Earpiece',
			text: `Incident Identifier: B2C3D4E5-F6A7-8901-BCDE-F12345678901
Hardware Model:      iPhone13,2
Date:                2026-10-28 09:15:32 +0700
OS Version:          iPhone OS 17.4 (Build 21E219)

panic(cpu 2 caller 0xfffffff011223344): "thermalmonitord: userspace watchdog timeout: no successful checkins in 180 seconds"
Missing sensor(s): mic2, prx
Debugger message: panic
`
		},
		{
			title: 'iPhone 13: Baterai Gas Gauge',
			badge: 'BMS / tg0b',
			text: `Incident Identifier: C3D4E5F6-A7B8-9012-CDEF-123456789012
Hardware Model:      iPhone14,5
Date:                2026-11-02 20:04:11 +0700
OS Version:          iPhone OS 17.6 (Build 21G79)

panic(cpu 1 caller 0xfffffff022334455): "AppleSMC: tg0b sensor communication failure via SWI. Battery gas gauge unresponsive."
Debugger message: panic
`
		},
		{
			title: 'iPhone 14 Pro: NAND Storage',
			badge: 'Memori Internal',
			text: `Incident Identifier: D4E5F6A7-B8C9-0123-DEFA-234567890123
Hardware Model:      iPhone15,2
Date:                2026-11-10 11:30:00 +0700
OS Version:          iPhone OS 17.5.1 (Build 21F90)

panic(cpu 4 caller 0xfffffff033445566): "ans2: NVMe I/O error during block transfer. Storage NAND controller failure."
Debugger message: panic
`
		}
	];

	function loadSample(sampleText: string) {
		logInput = sampleText;
		analyzeLog();
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			if (content) {
				logInput = content;
				analyzeLog();
			}
		};
		reader.readAsText(file);
	}

	function analyzeLog() {
		if (!logInput.trim()) {
			parsedResult = null;
			return;
		}
		isAnalyzing = true;
		setTimeout(() => {
			parsedResult = parsePanicLog(logInput);
			if (parsedResult?.primarySuspect) {
				fetchSolutionsForSensor(parsedResult.primarySuspect.code);
			}
			isAnalyzing = false;
		}, 150);
	}

	function resetLog() {
		logInput = '';
		parsedResult = null;
	}

	// Filtered database for manual lookup
	const filteredSensors = $derived(
		PANIC_DATABASE.filter((item) => {
			const query = searchCode.trim().toLowerCase();
			const matchQuery =
				!query ||
				item.code.toLowerCase().includes(query) ||
				item.name.toLowerCase().includes(query) ||
				item.component.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query);

			if (!matchQuery) return false;

			if (selectedModelFilter === 'all') return true;
			if (!item.modelsNote) return true;
			return item.modelsNote.toLowerCase().includes(selectedModelFilter.toLowerCase());
		})
	);

	function selectSensor(sensor: PanicSensorDef) {
		selectedManualSensor = sensor;
		fetchSolutionsForSensor(sensor.code);
	}

	// Trigger initial sensor solutions fetch
	$effect(() => {
		if (selectedManualSensor && !dbSolutions[selectedManualSensor.code.toLowerCase()]) {
			fetchSolutionsForSensor(selectedManualSensor.code);
		}
	});

	// Trigger admin load when tab changes to admin
	$effect(() => {
		if (activeTab === 'admin' && isOwner && adminSolutions.length === 0) {
			loadAdminSolutions();
		}
	});

	async function copyServiceReport(result: ParsedPanicResult) {
		if (!result || !result.primarySuspect) return;
		const codeKey = result.primarySuspect.code.toLowerCase();
		const verifiedExtra = dbSolutions[codeKey] || [];

		const lines = [
			`*LAPORAN ANALISA PANIC FULL IPHONE*`,
			`------------------------------------`,
			`• Perangkat: ${result.deviceModelName} (${result.deviceModelCode || 'N/A'})`,
			`• Versi iOS: ${result.osVersion}`,
			`• Waktu Kejadian: ${result.date}`,
			`• Status: ${result.isWatchdogTimeout ? 'Watchdog Timeout (Restart 3 Menit)' : 'Kernel Hardware Panic'}`,
			``,
			`*KOMPONEN TERSANGKA UTAMA:*`,
			`➤ ${result.primarySuspect.component}`,
			`• Sensor / Kode: ${result.primarySuspect.code.toUpperCase()} (${result.primarySuspect.name})`,
			`• Lokasi: ${result.primarySuspect.location}`,
			``,
			`*GEJALA KERUSAKAN:*`,
			...result.primarySuspect.symptoms.map((s) => `  - ${s}`),
			``,
			`*REKOMENDASI TEKNISI:*`,
			...result.primarySuspect.troubleshooting.map((t, idx) => `  ${idx + 1}. ${t}`)
		];

		if (verifiedExtra.length > 0) {
			lines.push(``, `*SOLUSI TAMBAHAN TERVERIFIKASI (KOMUNITAS):*`);
			verifiedExtra.forEach((sol) => {
				lines.push(`  + ${sol.solution_text} (Oleh: ${sol.author_name})`);
			});
		}

		lines.push(
			`------------------------------------`,
			`Disclaimer: Hasil analisa merupakan referensi pembanding awal. Kondisi nyata dapat bervariasi tergantung riwayat fisik perangkat.`,
			`Dianalisa via TEXY Panic Analyzer (Client-Side Fast)`
		);

		await navigator.clipboard.writeText(lines.join('\n'));
		copiedReport = true;
		setTimeout(() => (copiedReport = false), 2000);
	}

	async function copyManualReport(sensor: PanicSensorDef) {
		const codeKey = sensor.code.toLowerCase();
		const verifiedExtra = dbSolutions[codeKey] || [];

		const lines = [
			`*DIAGNOSA KODE PANIC: ${sensor.code.toUpperCase()}*`,
			`------------------------------------`,
			`• Komponen: ${sensor.component}`,
			`• Nama Sensor: ${sensor.name}`,
			`• Lokasi: ${sensor.location}`,
			``,
			`*GEJALA:*`,
			...sensor.symptoms.map((s) => `  - ${s}`),
			``,
			`*SOLUSI & LANGKAH SERVIS:*`,
			...sensor.troubleshooting.map((t, idx) => `  ${idx + 1}. ${t}`)
		];

		if (verifiedExtra.length > 0) {
			lines.push(``, `*SOLUSI TAMBAHAN TERVERIFIKASI:*`);
			verifiedExtra.forEach((sol) => {
				lines.push(`  + ${sol.solution_text} (Oleh: ${sol.author_name})`);
			});
		}

		lines.push(
			`------------------------------------`,
			`Disclaimer: Hasil analisa merupakan panduan referensi awal. Kerusakan nyata dapat berbeda di lapangan.`,
			`Dianalisa via TEXY Panic Analyzer`
		);

		await navigator.clipboard.writeText(lines.join('\n'));
		copiedReport = true;
		setTimeout(() => (copiedReport = false), 2000);
	}
</script>

<div class="flex flex-col gap-5 w-full flex-1 max-w-6xl mx-auto pb-12 animate-fade-in">
	<!-- HEADER BAR -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--ttx-border-base)]">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] shadow-xs"
			>
				<Activity class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-bold tracking-tight text-[var(--ttx-text-main)]">
						Panic Full Analyzer (iOS)
					</h1>
					<span
						class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-accent)]/20"
					>
						Hardware Diagnostics
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)]">
					Diagnosa penyebab iPhone restart mandiri (3 menit) dari log panic-full atau lookup kode sensor hardware.
				</p>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex items-center gap-2">
			{#if activeTab === 'log' && (logInput || parsedResult)}
				<button
					type="button"
					onclick={resetLog}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-xs font-medium text-[var(--ttx-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
				>
					<RefreshCw size={13} />
					<span>Reset Analisa</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- DISCLAIMER BANNER (IMPORTANT NOTICE) -->
	<div
		class="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/10 text-xs text-[var(--ttx-text-muted)] shadow-xs"
	>
		<AlertCircle size={17} class="text-amber-400 shrink-0 mt-0.5" />
		<div class="min-w-0">
			<div
				class="leading-relaxed transition-all duration-300 ease-in-out {disclaimerExpanded ? '' : 'line-clamp-2'}"
			>
				<strong class="text-[var(--ttx-text-main)] font-semibold">Pemberitahuan & Disclaimer:</strong>
				Hasil analisa dan solusi yang disarankan di sini merupakan panduan referensi teknis untuk mempermudah identifikasi kerusakan awal dan kemungkinan dapat berbeda dengan kejadian nyata di lapangan. Kerusakan sebenarnya dapat dipengaruhi oleh riwayat jatuh, cairan, jalur interposer putus, atau kerusakan komponen pasif di motherboard. Gunakan sebagai acuan pendukung, bukan vonis mutlak.
			</div>
			<button
				type="button"
				onclick={() => (disclaimerExpanded = !disclaimerExpanded)}
				class="mt-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors focus:outline-none focus-visible:underline"
			>
				{disclaimerExpanded ? 'Sembunyikan' : 'Baca selengkapnya'}
			</button>
		</div>
	</div>

	<!-- MODE TABS NAVIGATION -->
	<div class="flex rounded-xl p-1 border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs w-full max-w-full overflow-x-auto custom-scrollbar">
		<button
			type="button"
			onclick={() => (activeTab = 'log')}
			class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all {activeTab ===
			'log'
				? 'bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] shadow-xs'
				: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
		>
			<UploadCloud size={14} />
			<span>Analisis Log</span>
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'lookup')}
			class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all {activeTab ===
			'lookup'
				? 'bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] shadow-xs'
				: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
		>
			<Search size={14} />
			<span>Cari Kode Manual</span>
		</button>
		{#if isOwner}
			<button
				type="button"
				onclick={() => (activeTab = 'admin')}
				class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all {activeTab ===
				'admin'
					? 'bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] shadow-xs'
					: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
			>
				<Inbox size={14} />
				<span>Validasi Draft</span>
				{#if pendingCount > 0}
					<span class="ml-0.5 px-1.5 py-px rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
						{pendingCount}
					</span>
				{/if}
			</button>
		{/if}
	</div>

	<!-- TAB 1: LOG PARSER (FILE UPLOAD OR PASTE) -->
	{#if activeTab === 'log'}
		<div class="flex flex-col gap-5">
			<!-- Input Card -->
			<div
				class="flex flex-col rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 sm:p-5 shadow-xs gap-3.5"
			>
				<div class="flex flex-wrap items-center justify-between gap-2">
					<label
						for="panic-text-input"
						class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)] flex items-center gap-2"
					>
						<FileText size={15} class="text-[var(--ttx-accent-text)]" />
						Paste Isi Log panic-full atau Upload File .ips
					</label>

					<!-- File upload input button -->
					<div class="relative">
						<input
							type="file"
							accept=".ips,.txt,.log,.json"
							id="panic-file-upload"
							onchange={handleFileUpload}
							class="absolute inset-0 opacity-0 cursor-pointer w-full"
						/>
						<label
							for="panic-file-upload"
							class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] text-xs font-medium text-[var(--ttx-text-main)] cursor-pointer transition-colors"
						>
							<UploadCloud size={14} class="text-[var(--ttx-accent-text)]" />
							<span>Upload File .ips / .txt</span>
						</label>
					</div>
				</div>

				<!-- Textarea Input -->
				<textarea
					id="panic-text-input"
					bind:value={logInput}
					placeholder="Tempelkan isi file log panic-full.ips di sini (atau dari Settings > Privacy & Security > Analytics Data)..."
					rows={7}
					class="w-full resize-y rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3.5 font-mono text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30 custom-scrollbar leading-relaxed"
				></textarea>

				<!-- Samples Bar & Execute Button -->
				<div class="flex flex-wrap items-center justify-between gap-3 pt-1">
					<div class="flex flex-wrap items-center gap-1.5">
						<span class="text-[11px] font-medium text-[var(--ttx-text-dim)] mr-1">Muat Contoh:</span>
						{#each SAMPLES as s}
							<button
								type="button"
								onclick={() => loadSample(s.text)}
								class="px-2.5 py-1 rounded-md text-[11px] font-medium border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-accent-text)] hover:border-[var(--ttx-accent)]/30 hover:bg-[var(--ttx-accent-light)] transition-all"
							>
								{s.title}
							</button>
						{/each}
					</div>

					<button
						type="button"
						onclick={analyzeLog}
						disabled={!logInput.trim() || isAnalyzing}
						class="h-9.5 px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-[var(--ttx-accent-contrast)] bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] active:scale-95 shadow-xs transition-all disabled:opacity-50"
					>
						<Sparkles size={15} />
						<span>{isAnalyzing ? 'Menganalisis...' : 'Analisa Panic Log'}</span>
					</button>
				</div>
			</div>

			<!-- RESULT VIEW IF PARSED -->
			{#if parsedResult}
				<div class="flex flex-col gap-4 animate-fade-in">
					<!-- Device Info Card -->
					<div
						class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs"
					>
						<div>
							<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Perangkat</span>
							<p class="text-sm font-bold text-[var(--ttx-text-main)] truncate mt-0.5">
								{parsedResult.deviceModelName}
							</p>
							<p class="text-[11px] font-mono text-[var(--ttx-text-muted)]">
								{parsedResult.deviceModelCode || 'N/A'}
							</p>
						</div>
						<div>
							<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Versi iOS</span>
							<p class="text-sm font-bold text-[var(--ttx-text-main)] truncate mt-0.5">
								{parsedResult.osVersion}
							</p>
							{#if parsedResult.osBuild}
								<p class="text-[11px] font-mono text-[var(--ttx-text-muted)]">Build {parsedResult.osBuild}</p>
							{/if}
						</div>
						<div>
							<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Waktu Kejadian</span>
							<p class="text-xs font-semibold text-[var(--ttx-text-main)] truncate mt-1">
								{parsedResult.date}
							</p>
						</div>
						<div>
							<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--ttx-text-dim)]">Tipe Error</span>
							<div class="mt-0.5">
								{#if parsedResult.isWatchdogTimeout}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
										<Clock size={11} /> Watchdog 180s
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
										<AlertTriangle size={11} /> Kernel Panic
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Primary Suspect Banner -->
					{#if parsedResult.primarySuspect}
						<div
							class="rounded-2xl border border-[var(--ttx-accent)]/30 bg-[var(--ttx-accent-light)] p-5 shadow-sm flex flex-col gap-3"
						>
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<span class="p-1.5 rounded-lg bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)]">
										<Wrench size={16} />
									</span>
									<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-accent-text)]">
										Komponen Tersangka Utama
									</span>
								</div>
								<span
									class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
								>
									Indikasi Tinggi
								</span>
							</div>

							<div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--ttx-accent)]/20 pb-3">
								<div>
									<h2 class="text-lg sm:text-xl font-black tracking-tight text-[var(--ttx-text-main)]">
										{parsedResult.primarySuspect.component}
									</h2>
									<p class="text-xs font-semibold text-[var(--ttx-accent-text)] mt-0.5">
										Kode Sensor: {parsedResult.primarySuspect.code.toUpperCase()} — {parsedResult.primarySuspect.name}
									</p>
								</div>
								<span class="text-xs text-[var(--ttx-text-muted)] font-medium">
									Lokasi: {parsedResult.primarySuspect.location}
								</span>
							</div>

							<p class="text-xs leading-relaxed text-[var(--ttx-text-main)]">
								{parsedResult.primarySuspect.description}
							</p>

							<!-- Symptoms Checklist -->
							<div class="pt-2">
								<p class="text-xs font-bold text-[var(--ttx-text-main)] mb-1.5 flex items-center gap-1.5">
									<AlertTriangle size={13} class="text-amber-400" />
									Gejala Khas yang Sering Timbul:
								</p>
								<ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
									{#each parsedResult.primarySuspect.symptoms as sym}
										<li class="text-xs text-[var(--ttx-text-muted)] flex items-start gap-1.5">
											<span class="text-[var(--ttx-accent-text)] mt-0.5">•</span>
											<span>{sym}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>

						<!-- Step by Step Troubleshooting Guide & Solutions -->
						<div
							class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-xs flex flex-col gap-3"
						>
							<div class="flex flex-wrap items-center justify-between gap-2">
								<h3 class="text-sm font-bold text-[var(--ttx-text-main)] flex items-center gap-2">
									<Wrench size={16} class="text-[var(--ttx-accent-text)]" />
									Langkah Uji Coba & Perbaikan Teknisi:
								</h3>

								<div class="flex items-center gap-2">
									<!-- Button to Add Custom Solution -->
									<button
										type="button"
										onclick={() => openAddSolutionModal(parsedResult!.primarySuspect!.code, parsedResult!.primarySuspect!.component)}
										class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ttx-accent)]/30 bg-[var(--ttx-accent-light)] hover:bg-[var(--ttx-accent)] hover:text-[var(--ttx-accent-contrast)] text-xs font-semibold text-[var(--ttx-accent-text)] transition-all active:scale-95"
									>
										<MessageSquarePlus size={14} />
										<span>+ Ajukan Solusi Baru</span>
									</button>

									<!-- Copy Report -->
									<button
										type="button"
										onclick={() => copyServiceReport(parsedResult!)}
										class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card-subtle)] hover:bg-[var(--ttx-bg-hover)] text-xs font-semibold text-[var(--ttx-text-main)] transition-colors"
									>
										{#if copiedReport}
											<Check size={14} class="text-emerald-400" />
											<span class="text-emerald-400">Laporan Tersalin!</span>
										{:else}
											<Copy size={14} />
											<span>Salin Laporan Servis</span>
										{/if}
									</button>
								</div>
							</div>

							<!-- Standard Official Steps -->
							<ol class="space-y-2 mt-1">
								{#each parsedResult.primarySuspect.troubleshooting as step, idx}
									<li class="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--ttx-bg-card-subtle)] border border-[var(--ttx-border-subtle)]">
										<span
											class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] text-[10px] font-bold"
										>
											{idx + 1}
										</span>
										<p class="text-xs leading-relaxed text-[var(--ttx-text-main)]">
											{step}
										</p>
									</li>
								{/each}
							</ol>

							<!-- Community Solutions Approved from Database -->
							{#if dbSolutions[parsedResult.primarySuspect.code.toLowerCase()]?.length > 0}
								<div class="mt-3 pt-3 border-t border-[var(--ttx-border-subtle)] flex flex-col gap-2">
									<div class="flex items-center justify-between">
										<span class="text-xs font-bold text-[var(--ttx-accent-text)] flex items-center gap-1.5">
											<ShieldCheck size={14} class="text-emerald-400" />
											Solusi Tambahan Terverifikasi (Database Komunitas):
										</span>
										<span class="text-[11px] text-[var(--ttx-text-dim)]">Tervalidasi oleh tim</span>
									</div>

									{#each dbSolutions[parsedResult.primarySuspect.code.toLowerCase()] as sol}
										<div class="flex flex-col gap-1 p-2.5 rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)]">
											<div class="flex items-start gap-2">
												<span class="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
												<p class="text-xs leading-relaxed text-[var(--ttx-text-main)] font-medium">
													{sol.solution_text}
												</p>
											</div>
											<div class="flex items-center justify-between pl-4 text-[10px] text-[var(--ttx-text-dim)]">
												<span>Kontributor: <strong class="text-[var(--ttx-text-muted)]">{sol.author_name}</strong></span>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<!-- Generic Panic Warning -->
						<div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm text-center">
							<AlertTriangle size={32} class="mx-auto text-amber-400 mb-2" />
							<h3 class="text-sm font-bold text-amber-300">
								Panic String Tidak Mencantumkan Sensor Tertentu
							</h3>
							<p class="text-xs text-[var(--ttx-text-muted)] max-w-lg mx-auto mt-1 leading-relaxed">
								Log tidak mencantumkan kode sensor spesifik (seperti mic1/prs0/tg0b). Hal ini bisa disebabkan crash software kernel, memori sistem penuh, atau kerusakan IC AP/RAM. Silakan periksa cuplikan panic string di bawah atau gunakan tab Pencarian Manual Kode.
							</p>
						</div>
					{/if}

					<!-- Panic String Evidence Box -->
					<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs">
						<div class="flex flex-wrap items-center justify-between gap-2 mb-2">
							<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-dim)] shrink-0">
								Cuplikan Baris Panic (Evidence)
							</span>
							{#if parsedResult.missingSensors.length > 0}
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="text-[11px] text-[var(--ttx-text-muted)] font-medium">Missing:</span>
									{#each parsedResult.missingSensors as ms}
										<span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
											{ms}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<pre
							class="w-full p-3 rounded-xl bg-[var(--ttx-bg-input)] font-mono text-[11px] leading-relaxed text-[var(--ttx-text-main)] border border-[var(--ttx-border-subtle)] overflow-auto custom-scrollbar whitespace-pre-wrap max-h-48 break-words break-all">{parsedResult.panicString || parsedResult.debuggerMessage}</pre>
					</div>
				</div>
			{/if}
		</div>
	{:else if activeTab === 'lookup'}
		<!-- TAB 2: MANUAL SENSOR / CODE LOOKUP -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
			<!-- Left: Search & Sensor List (5 Cols) -->
			<div class="lg:col-span-5 flex flex-col gap-3">
				<div class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 shadow-xs flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-main)]">
							Cari Kode / Sensor Panic
						</span>
						<span class="text-[10px] font-mono text-[var(--ttx-text-dim)]">
							{filteredSensors.length} item
						</span>
					</div>

					<!-- Search input -->
					<div class="relative">
						<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ttx-text-dim)]" />
						<input
							type="text"
							bind:value={searchCode}
							placeholder="Ketik kode (misal: mic1, prs0, tg0b, wdt, i2c0, 0x80000)..."
							class="w-full h-9 pl-9 pr-3 rounded-xl text-xs bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] transition-all"
						/>
					</div>

					<!-- Quick Click Chips -->
					<div>
						<span class="text-[10px] font-bold text-[var(--ttx-text-dim)] uppercase">Kode Populer:</span>
						<div class="flex flex-wrap gap-1 mt-1.5">
							{#each ['mic1', 'prs0', 'mic2', 'mic3', 'tg0b', '0x800', '0x10000', '0x40000', '0x100000', 'smc', 'DCP PANIC', 'AppleSocHot'] as tag}
								<button
									type="button"
									onclick={() => {
										searchCode = tag;
										const found = PANIC_DATABASE.find((i) => i.code.toLowerCase() === tag.toLowerCase());
										if (found) selectSensor(found);
									}}
									class="px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all {searchCode === tag
										? 'bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)]'
										: 'bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)]'}"
								>
									{tag}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Sensor List Catalog -->
				<div
					class="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto custom-scrollbar rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-2 shadow-xs"
				>
					{#if filteredSensors.length === 0}
						<div class="p-6 text-center text-xs text-[var(--ttx-text-dim)]">
							Tidak ditemukan kode sensor yang sesuai dengan "{searchCode}".
						</div>
					{:else}
						{#each filteredSensors as sensor}
							<button
								type="button"
								onclick={() => selectSensor(sensor)}
								class="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border {selectedManualSensor?.code ===
								sensor.code
									? 'bg-[var(--ttx-bg-active)] border-[var(--ttx-accent)]/40 shadow-xs'
									: 'bg-[var(--ttx-bg-card-subtle)] border-transparent hover:border-[var(--ttx-border-subtle)] hover:bg-[var(--ttx-bg-hover)]'}"
							>
								<div class="min-w-0 pr-2">
									<div class="flex items-center gap-1.5">
										<span class="font-mono text-xs font-bold text-[var(--ttx-accent-text)]">
											{sensor.code.toUpperCase()}
										</span>
										{#if sensor.severity === 'critical'}
											<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
										{/if}
									</div>
									<p class="text-xs font-semibold text-[var(--ttx-text-main)] truncate mt-0.5">
										{sensor.component}
									</p>
									<p class="text-[11px] text-[var(--ttx-text-dim)] truncate">
										{sensor.name}
									</p>
								</div>
								<ChevronRight size={14} class="text-[var(--ttx-text-dim)] shrink-0" />
							</button>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Right: Sensor Detail Sheet (7 Cols) -->
			<div class="lg:col-span-7">
				{#if selectedManualSensor}
					<div
						class="flex flex-col gap-4 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-xs"
					>
						<!-- Sensor Title Banner -->
						<div class="border-b border-[var(--ttx-border-base)] pb-4 flex flex-col gap-1.5">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<span
									class="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] border border-[var(--ttx-accent)]/20"
								>
									KODE: {selectedManualSensor.code.toUpperCase()}
								</span>

								<div class="flex items-center gap-2">
									<!-- Button to Add Custom Solution -->
									<button
										type="button"
										onclick={() => openAddSolutionModal(selectedManualSensor!.code, selectedManualSensor!.component)}
										class="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--ttx-accent)]/30 bg-[var(--ttx-accent-light)] hover:bg-[var(--ttx-accent)] hover:text-[var(--ttx-accent-contrast)] text-xs font-semibold text-[var(--ttx-accent-text)] transition-all active:scale-95"
									>
										<MessageSquarePlus size={13} />
										<span>+ Ajukan Solusi</span>
									</button>

									<!-- Copy Button -->
									<button
										type="button"
										onclick={() => copyManualReport(selectedManualSensor!)}
										class="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] text-xs font-semibold text-[var(--ttx-text-main)] transition-colors"
									>
										{#if copiedReport}
											<Check size={13} class="text-emerald-400" />
											<span class="text-emerald-400">Tersalin!</span>
										{:else}
											<Copy size={13} />
											<span>Salin Diagnosa</span>
										{/if}
									</button>
								</div>
							</div>

							<h2 class="text-lg font-black text-[var(--ttx-text-main)] mt-1">
								{selectedManualSensor.component}
							</h2>
							<p class="text-xs text-[var(--ttx-text-muted)]">
								{selectedManualSensor.name} — <span class="font-medium text-[var(--ttx-text-dim)]">Lokasi: {selectedManualSensor.location}</span>
							</p>
						</div>

						<!-- Description -->
						<div>
							<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-dim)] mb-1">
								Deskripsi & Penyebab Crash
							</h3>
							<p class="text-xs leading-relaxed text-[var(--ttx-text-main)]">
								{selectedManualSensor.description}
							</p>
						</div>

						<!-- Symptoms -->
						<div class="p-3.5 rounded-xl bg-[var(--ttx-bg-card-subtle)] border border-[var(--ttx-border-subtle)]">
							<h3 class="text-xs font-bold text-[var(--ttx-text-main)] mb-2 flex items-center gap-1.5">
								<AlertTriangle size={13} class="text-amber-400" />
								Gejala Kerusakan yang Terlihat:
							</h3>
							<ul class="space-y-1">
								{#each selectedManualSensor.symptoms as sym}
									<li class="text-xs text-[var(--ttx-text-muted)] flex items-start gap-2">
										<span class="text-[var(--ttx-accent-text)] mt-0.5">•</span>
										<span>{sym}</span>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Troubleshooting Steps -->
						<div>
							<h3 class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-dim)] mb-2 flex items-center gap-1.5">
								<Wrench size={14} class="text-[var(--ttx-accent-text)]" />
								Langkah Pemeriksaan & Perbaikan Teknisi:
							</h3>
							<div class="space-y-2">
								{#each selectedManualSensor.troubleshooting as step, idx}
									<div class="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--ttx-bg-card-subtle)] border border-[var(--ttx-border-subtle)]">
										<span
											class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] text-[10px] font-bold"
										>
											{idx + 1}
										</span>
										<p class="text-xs leading-relaxed text-[var(--ttx-text-main)]">
											{step}
										</p>
									</div>
								{/each}
							</div>
						</div>

						<!-- Approved Community Solutions for Manual Sensor -->
						{#if dbSolutions[selectedManualSensor.code.toLowerCase()]?.length > 0}
							<div class="mt-2 pt-3 border-t border-[var(--ttx-border-subtle)] flex flex-col gap-2">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-[var(--ttx-accent-text)] flex items-center gap-1.5">
										<ShieldCheck size={14} class="text-emerald-400" />
										Solusi Tambahan Terverifikasi (Database Komunitas):
									</span>
									<span class="text-[11px] text-[var(--ttx-text-dim)]">Tervalidasi oleh tim</span>
								</div>

								{#each dbSolutions[selectedManualSensor.code.toLowerCase()] as sol}
									<div class="flex flex-col gap-1 p-2.5 rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)]">
										<div class="flex items-start gap-2">
											<span class="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
											<p class="text-xs leading-relaxed text-[var(--ttx-text-main)] font-medium">
												{sol.solution_text}
											</p>
										</div>
										<div class="flex items-center justify-between pl-4 text-[10px] text-[var(--ttx-text-dim)]">
											<span>Kontributor: <strong class="text-[var(--ttx-text-muted)]">{sol.author_name}</strong></span>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						{#if selectedManualSensor.modelsNote}
							<div class="p-3 rounded-xl bg-[var(--ttx-accent-light)] border border-[var(--ttx-accent)]/20 text-xs text-[var(--ttx-accent-text)]">
								<strong>Catatan Model:</strong> {selectedManualSensor.modelsNote}
							</div>
						{/if}
					</div>
				{:else}
					<div class="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)]">
						<Cpu size={36} class="text-[var(--ttx-text-dim)] mb-2 opacity-50" />
						<p class="text-xs text-[var(--ttx-text-muted)]">
							Pilih salah satu kode sensor di sebelah kiri untuk melihat rincian diagnosa dan panduan teknisnya.
						</p>
					</div>
				{/if}
			</div>
		</div>
	{:else if activeTab === 'admin' && isOwner}
		<!-- TAB 3: OWNER DRAFT VALIDATION PANEL -->
		<div class="flex flex-col gap-4 animate-fade-in">
			<!-- Admin Header -->
			<div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)]">
				<div class="flex items-center gap-2.5">
					<span class="p-2 rounded-xl bg-amber-500/15 text-amber-400">
						<ShieldCheck size={18} />
					</span>
					<div>
						<h2 class="text-sm font-bold text-[var(--ttx-text-main)]">
							Panel Validasi Solusi Komunitas (Owner)
						</h2>
						<p class="text-xs text-[var(--ttx-text-muted)]">
							Tinjau solusi yang diajukan oleh pengguna/teknisi. Solusi yang disetujui (Approve) akan langsung tampil di list publik.
						</p>
					</div>
				</div>

				<!-- Filter buttons -->
				<div class="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)]">
					{#each ['pending', 'approved', 'rejected', 'all'] as f}
						<button
							type="button"
							onclick={() => (adminFilter = f as any)}
							class="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all {adminFilter === f
								? 'bg-[var(--ttx-accent)] text-[var(--ttx-accent-contrast)] shadow-xs'
								: 'text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)]'}"
						>
							{f}
						</button>
					{/each}
				</div>
			</div>

			<!-- Loading / Solutions List -->
			{#if isLoadingAdmin}
				<div class="p-12 text-center text-xs text-[var(--ttx-text-dim)] flex items-center justify-center gap-2">
					<RefreshCw size={16} class="animate-spin text-[var(--ttx-accent)]" />
					<span>Memuat antrean solusi draft...</span>
				</div>
			{:else}
				{@const displayedList = adminSolutions.filter((s) => (adminFilter === 'all' ? true : s.status === adminFilter))}
				{#if displayedList.length === 0}
					<div class="p-12 text-center rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)]">
						<Inbox size={36} class="mx-auto text-[var(--ttx-text-dim)] mb-2 opacity-40" />
						<p class="text-sm font-semibold text-[var(--ttx-text-main)]">Tidak ada solusi berstatus "{adminFilter}"</p>
						<p class="text-xs text-[var(--ttx-text-muted)] mt-1">
							Semua draft telah ditinjau atau belum ada kiriman baru.
						</p>
					</div>
				{:else}
					<div class="flex flex-col gap-3">
						{#each displayedList as item (item.id)}
							<div
								class="p-4 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs flex flex-col gap-3"
							>
								<!-- Top Info -->
								<div class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ttx-border-subtle)] pb-2.5">
									<div class="flex items-center gap-2">
										<span
											class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)]"
										>
											{item.sensor_code.toUpperCase()}
										</span>
										<strong class="text-xs text-[var(--ttx-text-main)]">{item.component}</strong>
										<span class="text-[11px] text-[var(--ttx-text-dim)]">• Pengirim: {item.author_name}</span>
									</div>

									<div class="flex items-center gap-2">
										{#if item.status === 'pending'}
											<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
												Menunggu Validasi
											</span>
										{:else if item.status === 'approved'}
											<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
												Disetujui (Live)
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
												Ditolak
											</span>
										{/if}
										<span class="text-[10px] text-[var(--ttx-text-dim)] font-mono">
											{new Date(item.created_at).toLocaleDateString('id-ID')}
										</span>
									</div>
								</div>

								<!-- Solution Content -->
								<p class="text-xs leading-relaxed text-[var(--ttx-text-main)] bg-[var(--ttx-bg-input)] p-3 rounded-xl border border-[var(--ttx-border-subtle)] font-medium">
									{item.solution_text}
								</p>

								<!-- Action Buttons -->
								<div class="flex items-center justify-end gap-2 pt-1">
									<button
										type="button"
										onclick={() => deleteSolution(item.id)}
										class="px-2.5 py-1.5 rounded-lg border border-transparent text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mr-auto"
									>
										Hapus
									</button>

									{#if item.status !== 'rejected'}
										<button
											type="button"
											onclick={() => updateSolutionStatus(item.id, 'rejected')}
											class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] hover:bg-[var(--ttx-bg-hover)] text-xs font-semibold text-[var(--ttx-text-muted)] transition-colors"
										>
											<Ban size={13} />
											<span>Tolak</span>
										</button>
									{/if}

									{#if item.status !== 'approved'}
										<button
											type="button"
											onclick={() => updateSolutionStatus(item.id, 'approved')}
											class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-[var(--ttx-accent-contrast)] bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] transition-all shadow-xs active:scale-95"
										>
											<CheckCheck size={14} />
											<span>Setujui (Approve) & Tampilkan ke Publik</span>
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<!-- MODAL: SUBMIT DRAFT SOLUTION TO DATABASE -->
{#if showAddModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
		<div
			class="relative w-full max-w-lg rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
		>
			<!-- Modal Header -->
			<div class="flex items-start justify-between gap-3 border-b border-[var(--ttx-border-base)] pb-3">
				<div>
					<h3 class="text-base font-bold text-[var(--ttx-text-main)] flex items-center gap-2">
						<MessageSquarePlus size={18} class="text-[var(--ttx-accent-text)]" />
						Ajukan Solusi Tambahan (Draft)
					</h3>
					<p class="text-xs text-[var(--ttx-text-muted)] mt-0.5">
						Untuk kode: <strong class="text-[var(--ttx-accent-text)] font-mono">{targetCode.toUpperCase()}</strong> ({targetName})
					</p>
				</div>
				<button
					type="button"
					onclick={() => (showAddModal = false)}
					class="p-1 rounded-lg text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Notice text -->
			<p class="text-xs text-[var(--ttx-text-muted)] leading-relaxed">
				Punya pengalaman perbaikan berbeda di lapangan yang belum tercantum di daftar rekomendasi di atas? Solusi yang Anda ajukan akan masuk ke antrean draft dan divalidasi oleh owner sebelum dipublikasikan ke list teknisi.
			</p>

			<!-- Author Name Input -->
			<div class="flex flex-col gap-1">
				<label for="author-name-input" class="text-xs font-semibold text-[var(--ttx-text-main)]">
					Nama / Alias Teknisi (Opsional):
				</label>
				<input
					id="author-name-input"
					type="text"
					bind:value={authorNameInput}
					placeholder="Contoh: Budi (FixPhone) atau kosongkan untuk anonim"
					class="w-full h-9 px-3 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none focus:border-[var(--ttx-accent)]"
				/>
			</div>

			<!-- Input textarea -->
			<div class="flex flex-col gap-1.5">
				<label for="custom-solution-text" class="text-xs font-semibold text-[var(--ttx-text-main)]">
					Catatan Solusi / Temuan Teknisi:
				</label>
				<textarea
					id="custom-solution-text"
					bind:value={newSolutionInput}
					placeholder="Contoh: Pada iPhone 11 saya, ternyata resistor R0802 jalur I2C korosi. Setelah diganti, restart 3 menit sembuh tanpa ganti fleksibel port charger..."
					rows={4}
					class="w-full resize-y rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] p-3 font-sans text-xs text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] outline-none transition-all focus:border-[var(--ttx-border-focus)] focus:ring-1 focus:ring-[var(--ttx-accent)]/30 custom-scrollbar leading-relaxed"
				></textarea>
			</div>

			<!-- Feedback Notice -->
			{#if submissionNotice}
				<div class="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
					<Check size={15} />
					<span>{submissionNotice}</span>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex items-center justify-end gap-2 pt-2 border-t border-[var(--ttx-border-base)]">
				<button
					type="button"
					onclick={() => (showAddModal = false)}
					class="px-3.5 py-1.5 rounded-xl border border-[var(--ttx-border-subtle)] text-xs font-medium text-[var(--ttx-text-muted)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={submitDraftSolution}
					disabled={!newSolutionInput.trim() || isSubmittingSolution}
					class="px-4 py-1.5 rounded-xl text-xs font-semibold text-[var(--ttx-accent-contrast)] bg-[var(--ttx-accent)] hover:bg-[var(--ttx-accent-hover)] transition-all shadow-xs disabled:opacity-40"
				>
					{isSubmittingSolution ? 'Mengirim...' : 'Kirim Usulan Solusi'}
				</button>
			</div>
		</div>
	</div>
{/if}
