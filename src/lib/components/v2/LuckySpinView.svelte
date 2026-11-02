<script lang="ts">
	import { onMount } from 'svelte';
	import {
		FerrisWheel,
		RotateCw,
		Shuffle,
		Trash2,
		Volume2,
		VolumeX,
		Trophy,
		Sparkles,
		Check,
		Copy,
		History,
		Plus,
		ListPlus,
		X
	} from '@lucide/svelte';

	let { isDark = true }: { isDark?: boolean } = $props();

	// Presets
	const PRESETS = [
		{
			name: 'Makan Apa?',
			items: ['Nasi Goreng', 'Mie Ayam', 'Bakso', 'Sate Ayam', 'Soto Betawi', 'Gado-Gado', 'Ayam Geprek']
		},
		{
			name: 'Ya / Tidak',
			items: ['Ya, Gas!', 'Tidak', 'Mungkin Nanti', 'Coba Lagi']
		},
		{
			name: 'Angka 1-6',
			items: ['1', '2', '3', '4', '5', '6']
		},
		{
			name: 'Hadiah / Giveaway',
			items: ['Hadiah Utama', 'Kaos Eksklusif', 'Voucher Belanja', 'Mug Keren', 'Coba Lagi', 'Stiker Pack']
		},
		{
			name: 'Hari Kerja',
			items: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
		}
	];

	// State
	let rawInput = $state(
		'Nasi Goreng\nMie Ayam\nBakso\nSate Ayam\nSoto Betawi\nGado-Gado\nAyam Geprek'
	);
	let spinDuration = $state(5); // detik
	let removeOnWin = $state(false);
	let soundEnabled = $state(true);
	let isSpinning = $state(false);
	let winner = $state<string | null>(null);
	let showWinnerModal = $state(false);
	let history = $state<Array<{ text: string; time: string }>>([]);
	let copiedHistory = $state(false);

	let canvasEl: HTMLCanvasElement | null = $state(null);
	let confettiCanvasEl: HTMLCanvasElement | null = $state(null);

	// Physics / Animation
	let currentRotation = 0; // dalam radian
	let animationFrameId: number | null = null;
	let lastTickSegment = -1;

	// Palette warna yang kontras dan aesthetic
	const COLOR_PALETTE = [
		'#3b82f6', // blue
		'#10b981', // emerald
		'#f59e0b', // amber
		'#ec4899', // pink
		'#8b5cf6', // purple
		'#06b6d4', // cyan
		'#f97316', // orange
		'#6366f1', // indigo
		'#14b8a6', // teal
		'#ef4444', // red
		'#84cc16', // lime
		'#a855f7'  // violet
	];

	// Parse items
	let items = $derived(
		rawInput
			.split(/\r?\n/)
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
	);

	// Web Audio API Synthesizer
	let audioCtx: AudioContext | null = null;

	function getAudioContext(): AudioContext | null {
		if (typeof window === 'undefined') return null;
		if (!audioCtx) {
			const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (AudioContextClass) {
				audioCtx = new AudioContextClass();
			}
		}
		if (audioCtx && audioCtx.state === 'suspended') {
			audioCtx.resume();
		}
		return audioCtx;
	}

	function playTickSound() {
		if (!soundEnabled) return;
		try {
			const ctx = getAudioContext();
			if (!ctx) return;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(520, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

			gain.gain.setValueAtTime(0.12, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start();
			osc.stop(ctx.currentTime + 0.045);
		} catch {
			// ignore audio errors
		}
	}

	function playWinFanfare() {
		if (!soundEnabled) return;
		try {
			const ctx = getAudioContext();
			if (!ctx) return;
			const notes = [440, 554.37, 659.25, 880];
			notes.forEach((freq, idx) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				const startTime = ctx.currentTime + idx * 0.09;

				osc.type = 'sine';
				osc.frequency.setValueAtTime(freq, startTime);

				gain.gain.setValueAtTime(0.2, startTime);
				gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

				osc.connect(gain);
				gain.connect(ctx.destination);

				osc.start(startTime);
				osc.stop(startTime + 0.36);
			});
		} catch {
			// ignore audio errors
		}
	}

	// Confetti Animation
	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
		rotation: number;
		vRot: number;
		life: number;
		maxLife: number;
	}

	let particles: Particle[] = [];
	let confettiAnimId: number | null = null;

	function triggerConfetti() {
		if (!confettiCanvasEl) return;
		const width = confettiCanvasEl.width;
		const height = confettiCanvasEl.height;

		particles = [];
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#fbbf24'];

		for (let i = 0; i < 90; i++) {
			particles.push({
				x: width / 2,
				y: height / 2 - 40,
				vx: (Math.random() - 0.5) * 14,
				vy: (Math.random() - 0.7) * 16,
				size: Math.random() * 8 + 4,
				color: colors[Math.floor(Math.random() * colors.length)],
				rotation: Math.random() * 360,
				vRot: (Math.random() - 0.5) * 10,
				life: 0,
				maxLife: Math.random() * 60 + 80
			});
		}

		if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
		renderConfetti();
	}

	function renderConfetti() {
		if (!confettiCanvasEl) return;
		const ctx = confettiCanvasEl.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);

		particles.forEach((p) => {
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.35; // gravity
			p.rotation += p.vRot;
			p.life++;

			const alpha = Math.max(0, 1 - p.life / p.maxLife);
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.translate(p.x, p.y);
			ctx.rotate((p.rotation * Math.PI) / 180);
			ctx.fillStyle = p.color;
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
			ctx.restore();
		});

		particles = particles.filter((p) => p.life < p.maxLife);

		if (particles.length > 0) {
			confettiAnimId = requestAnimationFrame(renderConfetti);
		} else {
			ctx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);
		}
	}

	// Canvas Wheel Rendering
	function drawWheel(rotation: number) {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const width = canvasEl.width;
		const height = canvasEl.height;
		const center = width / 2;
		const radius = center - 16;

		ctx.clearRect(0, 0, width, height);

		const count = items.length;
		if (count === 0) {
			// Placeholder bila kosong
			ctx.save();
			ctx.beginPath();
			ctx.arc(center, center, radius, 0, Math.PI * 2);
			ctx.fillStyle = isDark ? '#1a243b' : '#e2e8f0';
			ctx.fill();
			ctx.lineWidth = 4;
			ctx.strokeStyle = isDark ? '#2e3f68' : '#cbd5e1';
			ctx.stroke();

			ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
			ctx.font = '600 14px system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('Tambahkan minimal 2 opsi', center, center);
			ctx.restore();
			return;
		}

		const arc = (Math.PI * 2) / count;

		// Gambar segmen
		ctx.save();
		ctx.translate(center, center);
		ctx.rotate(rotation);

		for (let i = 0; i < count; i++) {
			const angleStart = i * arc;
			const angleEnd = angleStart + arc;

			// Sektor
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.arc(0, 0, radius, angleStart, angleEnd);
			ctx.closePath();

			ctx.fillStyle = COLOR_PALETTE[i % COLOR_PALETTE.length];
			ctx.fill();

			// Garis tepi sektor
			ctx.lineWidth = 2;
			ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
			ctx.stroke();

			// Teks di dalam sektor
			ctx.save();
			ctx.rotate(angleStart + arc / 2);
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#ffffff';

			// Ukuran font adaptif berdasarkan jumlah item
			const fontSize = Math.max(11, Math.min(16, Math.floor(320 / count)));
			ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
			ctx.shadowColor = 'rgba(0,0,0,0.45)';
			ctx.shadowBlur = 4;

			// Truncate text jika kepanjangan
			let text = items[i];
			const maxTextWidth = radius - 60;
			if (ctx.measureText(text).width > maxTextWidth) {
				while (ctx.measureText(text + '…').width > maxTextWidth && text.length > 2) {
					text = text.slice(0, -1);
				}
				text += '…';
			}

			ctx.fillText(text, radius - 20, 0);
			ctx.restore();
		}

		// Outer Ring
		ctx.restore();

		// Shadow & outer border
		ctx.save();
		ctx.beginPath();
		ctx.arc(center, center, radius, 0, Math.PI * 2);
		ctx.lineWidth = 6;
		ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
		ctx.stroke();
		ctx.restore();

		// Center Hub (Tombol tengah)
		ctx.save();
		ctx.beginPath();
		ctx.arc(center, center, 32, 0, Math.PI * 2);
		ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
		ctx.fill();
		ctx.lineWidth = 4;
		ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
		ctx.stroke();

		// Mini dot tengah
		ctx.beginPath();
		ctx.arc(center, center, 8, 0, Math.PI * 2);
		ctx.fillStyle = isDark ? '#60a5fa' : '#3b82f6';
		ctx.fill();
		ctx.restore();

		// Pointer segitiga di atas (menunjuk ke bawah)
		ctx.save();
		const pointerLength = 26;
		const pointerWidth = 18;
		const topY = 4;

		ctx.beginPath();
		ctx.moveTo(center - pointerWidth / 2, topY);
		ctx.lineTo(center + pointerWidth / 2, topY);
		ctx.lineTo(center, topY + pointerLength);
		ctx.closePath();

		ctx.fillStyle = '#ef4444';
		ctx.shadowColor = 'rgba(0,0,0,0.35)';
		ctx.shadowBlur = 6;
		ctx.shadowOffsetY = 3;
		ctx.fill();

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#ffffff';
		ctx.stroke();
		ctx.restore();
	}

	// Spin Animation
	function spin() {
		if (isSpinning || items.length < 2) return;
		getAudioContext();

		isSpinning = true;
		winner = null;
		showWinnerModal = false;

		const count = items.length;
		const arc = (Math.PI * 2) / count;

		// Pilih pemenang secara random
		const targetIndex = Math.floor(Math.random() * count);

		// Pointer menunjuk ke atas (angle = -Math.PI / 2 atau 3 * Math.PI / 2)
		const pointerAngle = (3 * Math.PI) / 2;

		// Hitung rotasi akhir:
		// Sektor ke-i berada di [i * arc, (i + 1) * arc].
		// Agar pointer menunjuk ke tengah sektor targetIndex:
		// (targetIndex + 0.5) * arc + finalAngle === pointerAngle (mod 2pi)
		// Variasi acak sedikit di dalam sektor (+/- 35% lebar arc)
		const randomOffset = (Math.random() - 0.5) * (arc * 0.7);
		const targetCenterAngle = targetIndex * arc + arc / 2 + randomOffset;

		// Tambahkan beberapa putaran penuh (5 hingga 8 putaran)
		const extraRounds = Math.floor(Math.random() * 3) + 6;
		const totalAngleDiff =
			extraRounds * (Math.PI * 2) +
			((pointerAngle - targetCenterAngle - (currentRotation % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2));

		const startAngle = currentRotation;
		const finalAngle = startAngle + totalAngleDiff;

		const durationMs = spinDuration * 1000;
		const startTime = performance.now();

		function animate(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(1, elapsed / durationMs);

			// Easing function: cubic ease-out yang natural
			const easeOut = 1 - Math.pow(1 - progress, 3.5);
			const currentAngle = startAngle + (finalAngle - startAngle) * easeOut;

			currentRotation = currentAngle;
			drawWheel(currentAngle);

			// Sound ticking
			const normalized = (pointerAngle - (currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
			const currentSegment = Math.floor(normalized / arc);
			if (currentSegment !== lastTickSegment) {
				lastTickSegment = currentSegment;
				playTickSound();
			}

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(animate);
			} else {
				// Selesai putaran
				isSpinning = false;
				currentRotation = finalAngle % (Math.PI * 2);
				drawWheel(currentRotation);

				const winItem = items[targetIndex];
				winner = winItem;
				showWinnerModal = true;

				// Tambahkan ke history
				const nowTime = new Date().toLocaleTimeString('id-ID', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				});
				history = [{ text: winItem, time: nowTime }, ...history];

				playWinFanfare();
				triggerConfetti();

				// Jika opsi removeOnWin aktif
				if (removeOnWin) {
					removeItem(winItem);
				}
			}
		}

		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		animationFrameId = requestAnimationFrame(animate);
	}

	function shuffleItems() {
		if (isSpinning) return;
		const arr = [...items];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		rawInput = arr.join('\n');
		drawWheel(currentRotation);
	}

	function removeItem(target: string) {
		const filtered = items.filter((x) => x !== target);
		rawInput = filtered.join('\n');
		drawWheel(currentRotation);
	}

	function applyPreset(presetItems: string[]) {
		if (isSpinning) return;
		rawInput = presetItems.join('\n');
		drawWheel(currentRotation);
	}

	function clearHistory() {
		history = [];
	}

	async function copyHistory() {
		if (history.length === 0) return;
		const text = history.map((h, i) => `${i + 1}. ${h.text} (${h.time})`).join('\n');
		await navigator.clipboard.writeText(text);
		copiedHistory = true;
		setTimeout(() => (copiedHistory = false), 1800);
	}

	$effect(() => {
		// Gambar ulang ketika items atau isDark berubah
		if (items) {
			drawWheel(currentRotation);
		}
	});

	onMount(() => {
		drawWheel(currentRotation);

		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
		};
	});
</script>

<div class="flex flex-col gap-6 w-full flex-1 pb-10">
	<!-- HEADER -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-accent-light)] text-[var(--ttx-accent-text)] shadow-xs shrink-0"
			>
				<FerrisWheel size={20} />
			</div>
			<div>
				<div class="flex items-center gap-2 flex-wrap">
					<h1 class="text-base sm:text-lg font-bold text-[var(--ttx-text-main)]">Lucky Spin Wheel</h1>
					<span
						class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-muted)]"
					>
						<Sparkles size={11} class="text-amber-400" />
						Roda Putar Keberuntungan
					</span>
				</div>
				<p class="text-xs text-[var(--ttx-text-muted)] mt-0.5">
					Acak pilihan, tentukan pemenang giveaway, arisan, atau undian acak dengan roda interaktif.
				</p>
			</div>
		</div>

		<!-- Action bar atas -->
		<div class="flex items-center gap-2 self-start sm:self-auto">
			<button
				type="button"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-card)] text-xs font-semibold text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-all"
				onclick={() => (soundEnabled = !soundEnabled)}
				title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
			>
				{#if soundEnabled}
					<Volume2 size={14} class="text-emerald-400" />
					<span>Suara On</span>
				{:else}
					<VolumeX size={14} class="text-rose-400" />
					<span>Suara Off</span>
				{/if}
			</button>
		</div>
	</div>

	<!-- MAIN WORKSPACE -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- KIRI / TENGAH: WHEEL CANVAS (7 COLS) -->
		<div
			class="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] shadow-xs relative overflow-hidden"
		>
			<!-- Confetti canvas overlay -->
			<canvas
				bind:this={confettiCanvasEl}
				width={420}
				height={420}
				class="absolute inset-0 pointer-events-none z-20 w-full h-full max-w-[420px] max-h-[420px] mx-auto"
			></canvas>

			<!-- Canvas Wheel Container -->
			<div class="relative flex items-center justify-center my-2">
				<canvas
					bind:this={canvasEl}
					width={400}
					height={400}
					class="w-[290px] h-[290px] sm:w-[360px] sm:h-[360px] md:w-[390px] md:h-[390px] select-none cursor-pointer transition-transform active:scale-[0.99]"
					onclick={spin}
					title="Klik roda atau tombol untuk memutar"
				></canvas>
			</div>

			<!-- Tombol Spin Utama -->
			<div class="w-full max-w-sm mt-4 flex flex-col gap-2.5">
				<button
					type="button"
					onclick={spin}
					disabled={isSpinning || items.length < 2}
					class="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
					{isSpinning
						? 'bg-slate-600'
						: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 hover:shadow-blue-500/40'}"
				>
					<RotateCw size={17} class={isSpinning ? 'animate-spin' : ''} />
					<span>{isSpinning ? 'Sedang Memutar...' : 'PUTAR RODA SEKARANG'}</span>
				</button>

				{#if items.length < 2}
					<p class="text-[11px] text-center text-rose-400 font-medium">
						Masukkan minimal 2 opsi pada daftar di samping untuk mulai memutar.
					</p>
				{/if}
			</div>

			<!-- Winner Card Banner (Jika ada) -->
			{#if winner && !showWinnerModal}
				<div
					class="w-full max-w-md mt-5 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 animate-in fade-in"
				>
					<div class="flex items-center gap-2.5 min-w-0">
						<Trophy size={18} class="text-amber-400 shrink-0" />
						<div class="min-w-0">
							<p class="text-[11px] font-bold uppercase tracking-wider text-amber-300">Hasil Terakhir</p>
							<p class="text-sm font-extrabold text-[var(--ttx-text-main)] truncate">{winner}</p>
						</div>
					</div>
					<button
						type="button"
						class="text-xs px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors shrink-0"
						onclick={() => (showWinnerModal = true)}
					>
						Lihat Detail
					</button>
				</div>
			{/if}
		</div>

		<!-- KANAN: KONTROL, DAFTAR OPSI, & RIWAYAT (5 COLS) -->
		<div class="lg:col-span-5 flex flex-col gap-5">
			<!-- CARD PRESET CEPAT -->
			<div
				class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-4 sm:p-5 shadow-xs transition-colors"
			>
				<p class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)] mb-3 flex items-center gap-1.5">
					<ListPlus size={14} class="text-[var(--ttx-accent-text)]" />
					<span>Pilihan Preset Siap Pakai</span>
				</p>
				<div class="flex flex-wrap gap-1.5">
					{#each PRESETS as preset}
						<button
							type="button"
							disabled={isSpinning}
							onclick={() => applyPreset(preset.items)}
							class="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] hover:border-[var(--ttx-accent)]/40 transition-all disabled:opacity-50"
						>
							{preset.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- CARD DAFTAR OPSI -->
			<div
				class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-xs transition-colors flex flex-col gap-4"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<p class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
							Daftar Opsi
						</p>
						<span
							class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-accent-text)]"
						>
							{items.length} Opsi
						</span>
					</div>

					<div class="flex items-center gap-1.5">
						<button
							type="button"
							onclick={shuffleItems}
							disabled={isSpinning || items.length < 2}
							class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] disabled:opacity-40 transition-all"
							title="Acak urutan opsi"
						>
							<Shuffle size={12} />
							<span>Acak</span>
						</button>
						<button
							type="button"
							onclick={() => (rawInput = '')}
							disabled={isSpinning || items.length === 0}
							class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 transition-all"
							title="Kosongkan daftar"
						>
							<Trash2 size={12} />
							<span>Hapus</span>
						</button>
					</div>
				</div>

				<!-- Textarea Input -->
				<div class="flex flex-col gap-1.5">
					<textarea
						bind:value={rawInput}
						disabled={isSpinning}
						placeholder="Ketik opsi di sini (1 baris = 1 opsi)..."
						rows={7}
						class="w-full p-3 text-xs sm:text-sm font-sans rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-[var(--ttx-text-main)] placeholder-[var(--ttx-text-dim)] focus:outline-none focus:border-[var(--ttx-accent)] resize-y leading-relaxed transition-all"
					></textarea>
					<p class="text-[11px] text-[var(--ttx-text-dim)]">
						Satu baris untuk setiap opsi pada roda putar.
					</p>
				</div>

				<!-- Opsi Pengaturan Putaran -->
				<div class="pt-3 border-t border-[var(--ttx-border-base)] flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<label for="spin-duration" class="text-xs font-medium text-[var(--ttx-text-muted)]">
							Durasi Putaran: <span class="font-bold text-[var(--ttx-text-main)] font-mono">{spinDuration}s</span>
						</label>
						<input
							type="range"
							id="spin-duration"
							min="2"
							max="10"
							step="1"
							bind:value={spinDuration}
							disabled={isSpinning}
							class="w-28 sm:w-32 accent-blue-600 cursor-pointer"
						/>
					</div>

					<label class="flex items-center gap-2 cursor-pointer text-xs text-[var(--ttx-text-main)] select-none">
						<input
							type="checkbox"
							bind:checked={removeOnWin}
							disabled={isSpinning}
							class="checkbox checkbox-xs rounded accent-blue-600"
						/>
						<span>Hapus opsi pemenang otomatis setelah terpilih</span>
					</label>
				</div>
			</div>

			<!-- CARD RIWAYAT PEMENANG -->
			<div
				class="rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-5 shadow-xs transition-colors flex flex-col gap-3"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<History size={14} class="text-[var(--ttx-accent-text)]" />
						<p class="text-xs font-bold uppercase tracking-wider text-[var(--ttx-text-muted)]">
							Riwayat Putaran
						</p>
						{#if history.length > 0}
							<span class="text-[11px] font-mono font-semibold text-[var(--ttx-text-dim)]">
								({history.length})
							</span>
						{/if}
					</div>

					{#if history.length > 0}
						<div class="flex items-center gap-1.5">
							<button
								type="button"
								onclick={copyHistory}
								class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-[var(--ttx-text-muted)] hover:text-[var(--ttx-text-main)] transition-all"
								title="Salin semua riwayat"
							>
								{#if copiedHistory}
									<Check size={11} class="text-emerald-400" />
									<span class="text-emerald-400 font-semibold">Tersalin</span>
								{:else}
									<Copy size={11} />
									<span>Salin</span>
								{/if}
							</button>
							<button
								type="button"
								onclick={clearHistory}
								class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-rose-400 hover:bg-rose-500/10 transition-all"
								title="Hapus riwayat"
							>
								<Trash2 size={11} />
							</button>
						</div>
					{/if}
				</div>

				{#if history.length === 0}
					<p class="text-xs text-[var(--ttx-text-dim)] py-2 text-center">
						Belum ada hasil putaran. Putar roda untuk melihat pemenang di sini.
					</p>
				{:else}
					<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
						{#each history as item, index}
							<div
								class="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--ttx-bg-input)] border border-[var(--ttx-border-subtle)] text-xs"
							>
								<div class="flex items-center gap-2 min-w-0">
									<span class="font-mono text-[11px] text-[var(--ttx-text-dim)] w-4 shrink-0">
										#{history.length - index}
									</span>
									<span class="font-bold text-[var(--ttx-text-main)] truncate">{item.text}</span>
								</div>
								<span class="text-[10px] font-mono text-[var(--ttx-text-dim)] shrink-0 ml-2">
									{item.time}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- MODAL PEMENANG (POPUP) -->
{#if showWinnerModal && winner}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="relative w-full max-w-sm rounded-2xl border border-[var(--ttx-border-base)] bg-[var(--ttx-bg-card)] p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200"
		>
			<button
				type="button"
				class="absolute right-3.5 top-3.5 p-1 rounded-lg text-[var(--ttx-text-dim)] hover:text-[var(--ttx-text-main)] hover:bg-[var(--ttx-bg-hover)] transition-colors"
				onclick={() => (showWinnerModal = false)}
			>
				<X size={16} />
			</button>

			<!-- Icon Trophy -->
			<div
				class="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md animate-bounce"
			>
				<Trophy size={32} />
			</div>

			<div>
				<p class="text-xs font-bold uppercase tracking-wider text-amber-400">Selamat! Terpilih:</p>
				<h3 class="text-2xl font-black text-[var(--ttx-text-main)] mt-1 break-words">
					{winner}
				</h3>
			</div>

			<div class="flex items-center gap-2 w-full mt-2">
				<button
					type="button"
					onclick={() => {
						if (winner) removeItem(winner);
						showWinnerModal = false;
					}}
					class="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-[var(--ttx-border-subtle)] bg-[var(--ttx-bg-input)] text-rose-400 hover:bg-rose-500/10 transition-colors"
				>
					Hapus dari Opsi
				</button>
				<button
					type="button"
					onclick={() => (showWinnerModal = false)}
					class="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

