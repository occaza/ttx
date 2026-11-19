import QRCode from 'qrcode';

export type ContentType = 'url' | 'text' | 'wifi';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type ExportFormat = 'png' | 'svg';
export type PngSize = 512 | 1024 | 2048;
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';
export type FrameStyle = 'none' | 'bottom-banner' | 'top-header' | 'polaroid' | 'callout' | 'badge';
export type LogoShape = 'circle' | 'square';

export interface WifiConfig {
	ssid: string;
	password: string;
	encryption: WifiEncryption;
	hidden: boolean;
}

export interface FrameConfig {
	enabled: boolean;
	style: FrameStyle;
	text: string;
	textColor: string;
	frameColor: string;
}

export interface LogoConfig {
	enabled: boolean;
	dataUrl: string;
	sizePercent: number; // 12% to 26% of QR width
	bgColor: string;
	shape: LogoShape;
}

export interface QRConfig {
	contentType: ContentType;
	inputValue: string;
	wifi: WifiConfig;
	foregroundColor: string;
	backgroundColor: string;
	isTransparent: boolean;
	margin: number;
	errorCorrection: ErrorCorrectionLevel;
	exportFormat: ExportFormat;
	pngSize: PngSize;
	frame: FrameConfig;
	logo: LogoConfig;
}

export interface ContrastResult {
	ratio: number;
	isRisky: boolean;
	message: string;
}

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
	enabled: false,
	style: 'bottom-banner',
	text: 'SCAN ME',
	textColor: '#ffffff',
	frameColor: '#0f172a'
};

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
	enabled: false,
	dataUrl: '',
	sizePercent: 20,
	bgColor: '#ffffff',
	shape: 'circle'
};

export const DEFAULT_CONFIG: QRConfig = {
	contentType: 'url',
	inputValue: '',
	wifi: {
		ssid: '',
		password: '',
		encryption: 'WPA',
		hidden: false
	},
	foregroundColor: '#000000',
	backgroundColor: '#ffffff',
	isTransparent: false,
	margin: 4,
	errorCorrection: 'M',
	exportFormat: 'png',
	pngSize: 1024,
	frame: { ...DEFAULT_FRAME_CONFIG },
	logo: { ...DEFAULT_LOGO_CONFIG }
};

export const FRAME_PRESETS = [
	{ id: 'bottom-banner', name: 'Banner Bawah', sampleText: 'SCAN ME' },
	{ id: 'top-header', name: 'Header Atas', sampleText: 'SCAN ME' },
	{ id: 'callout', name: 'Callout Tag', sampleText: 'PINDAI DI SINI' },
	{ id: 'polaroid', name: 'Kartu Polaroid', sampleText: 'KUNJUNGI WEBSITE' }
] as const;

export const FRAME_COLOR_PRESETS = [
	{ name: 'Hitam', frame: '#0f172a', text: '#ffffff' },
	{ name: 'Biru', frame: '#2563eb', text: '#ffffff' },
	{ name: 'Hijau', frame: '#059669', text: '#ffffff' },
	{ name: 'Merah', frame: '#e11d48', text: '#ffffff' },
	{ name: 'Putih', frame: '#ffffff', text: '#0f172a' }
];

export const COLOR_PRESETS = [
	{ name: 'Classic', fg: '#000000', bg: '#ffffff' },
	{ name: 'Dark Theme', fg: '#f8fafc', bg: '#0f172a' },
	{ name: 'Cyan Tech', fg: '#38bdf8', bg: '#0b132b' },
	{ name: 'Emerald', fg: '#10b981', bg: '#064e3b' },
	{ name: 'Violet Glow', fg: '#c084fc', bg: '#1e1b4b' },
	{ name: 'Amber Sunset', fg: '#fbbf24', bg: '#292524' }
];

export const ERROR_CORRECTION_INFO: Record<ErrorCorrectionLevel, string> = {
	L: 'Low (~7% pemulihan)',
	M: 'Medium (~15% pemulihan)',
	Q: 'Quartile (~25% pemulihan)',
	H: 'High (~30% pemulihan)'
};

function getLuminance(hex: string): number {
	const clean = hex.replace('#', '');
	const fullHex = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
	const r = parseInt(fullHex.slice(0, 2), 16) / 255;
	const g = parseInt(fullHex.slice(2, 4), 16) / 255;
	const b = parseInt(fullHex.slice(4, 6), 16) / 255;

	const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
	return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function checkContrast(fg: string, bg: string): ContrastResult {
	try {
		const lumFg = getLuminance(fg);
		const lumBg = getLuminance(bg);
		const lighter = Math.max(lumFg, lumBg);
		const darker = Math.min(lumFg, lumBg);
		const ratio = (lighter + 0.05) / (darker + 0.05);

		if (ratio < 2) {
			return {
				ratio,
				isRisky: true,
				message: 'Kontras sangat rendah. QR code kemungkinan besar sulit dipindai.'
			};
		}

		if (ratio < 3) {
			return {
				ratio,
				isRisky: true,
				message: 'Kontras rendah. Beberapa pemindai kamera mungkin kesulitan membacanya.'
			};
		}

		return {
			ratio,
			isRisky: false,
			message: 'Kontras sangat baik untuk pemindaian.'
		};
	} catch {
		return { ratio: 21, isRisky: false, message: '' };
	}
}

export function isValidUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

export function formatWifiPayload(wifi: WifiConfig): string {
	const escapeWifi = (val: string) => val.replace(/([\\;,:"])/g, '\\$1');
	const enc = wifi.encryption;
	const ssid = escapeWifi(wifi.ssid.trim());
	const pass = enc !== 'nopass' && wifi.password ? `;P:${escapeWifi(wifi.password)}` : '';
	const hidden = wifi.hidden ? ';H:true' : '';
	return `WIFI:T:${enc};S:${ssid}${pass}${hidden};;`;
}

export function validateInput(
	contentType: ContentType,
	value: string,
	wifi?: WifiConfig
): { valid: boolean; message: string } {
	if (contentType === 'wifi') {
		if (!wifi || !wifi.ssid.trim()) {
			return { valid: false, message: 'Nama jaringan (SSID) tidak boleh kosong.' };
		}
		if (wifi.encryption !== 'nopass' && !wifi.password) {
			return { valid: false, message: 'Kata sandi wajib diisi untuk jaringan terenkripsi.' };
		}
		if (wifi.encryption === 'WPA' && wifi.password.length < 8) {
			return { valid: false, message: 'Kata sandi WPA/WPA2/WPA3 minimal 8 karakter.' };
		}
		return { valid: true, message: '' };
	}

	if (!value.trim()) {
		return { valid: false, message: 'Input konten tidak boleh kosong.' };
	}

	if (value.length > 4296) {
		return { valid: false, message: 'Teks melebihi panjang maksimum (4296 karakter).' };
	}

	if (contentType === 'url') {
		if (!isValidUrl(value)) {
			return { valid: false, message: 'Masukkan URL yang valid (harus diawali http:// atau https://).' };
		}
	}

	return { valid: true, message: '' };
}

export function extractDomain(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return '';
	}
}

export function generateFilename(extension: string): string {
	const date = new Date().toISOString().split('T')[0];
	return `texy-qr-${date}.${extension}`;
}

export function getQRContent(config: QRConfig): string {
	if (config.contentType === 'wifi') {
		if (!config.wifi.ssid.trim()) return '';
		return formatWifiPayload(config.wifi);
	}
	return config.inputValue.trim();
}

export function getEffectiveECC(config: QRConfig): ErrorCorrectionLevel {
	if (config.logo.enabled && config.logo.dataUrl) {
		if (config.errorCorrection === 'L' || config.errorCorrection === 'M') {
			return 'H';
		}
	}
	return config.errorCorrection;
}

function escapeXml(unsafe: string): string {
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case '\'':
				return '&apos;';
			case '"':
				return '&quot;';
			default:
				return c;
		}
	});
}

/**
 * Menghasilkan SVG QR Code lengkap dengan dukungan Logo di tengah dan Frame dengan teks kustom.
 */
export async function generateQRSvg(config: QRConfig): Promise<string> {
	const content = getQRContent(config);
	if (!content) return '';

	const effectiveECC = getEffectiveECC(config);
	const rawSvg = await QRCode.toString(content, {
		type: 'svg',
		margin: config.margin,
		errorCorrectionLevel: effectiveECC,
		color: {
			dark: config.foregroundColor,
			light: config.isTransparent ? '#00000000' : config.backgroundColor
		}
	});

	// Ekstrak dimensi viewBox dari rawSvg (biasanya '0 0 29 29' dsb)
	const viewBoxMatch = rawSvg.match(/viewBox=["']\s*0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*["']/i);
	const qrDim = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 100;

	// Ambil elemen inner SVG (menghilangkan tag pembuka <svg> dan penutup </svg>)
	const innerSvg = rawSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

	const hasFrame = config.frame.enabled && config.frame.style !== 'none';
	const hasLogo = config.logo.enabled && !!config.logo.dataUrl;

	// Jika tidak ada frame dan tidak ada logo, kembalikan rawSvg apa adanya
	if (!hasFrame && !hasLogo) {
		return rawSvg;
	}

	// Hitung dimensi layout SVG
	let totalW = qrDim;
	let totalH = qrDim;
	let qrX = 0;
	let qrY = 0;
	let textX = totalW / 2;
	let textY = 0;
	let bannerH = 0;
	let framePadding = 0;
	let frameCornerRadius = 0;
	let textFontSize = qrDim * 0.08;
	let maxTextWidth = totalW * 0.84;

	if (hasFrame) {
		framePadding = qrDim * 0.08;
		bannerH = qrDim * 0.24;
		frameCornerRadius = qrDim * 0.06;
		totalW = qrDim + framePadding * 2;
		maxTextWidth = totalW * 0.84;
		
		// Skala font dinamis agar teks panjang tidak meluber dan teks pendek terlihat tegas
		const charCount = Math.max(config.frame.text.length, 1);
		const estimatedCharWidthFactor = 0.62;
		const idealFontSize = bannerH * 0.44;
		const boundedFontSize = maxTextWidth / (charCount * estimatedCharWidthFactor);
		textFontSize = Math.min(idealFontSize, boundedFontSize);

		switch (config.frame.style) {
			case 'top-header':
				totalH = qrDim + framePadding * 2 + bannerH;
				qrX = framePadding;
				qrY = framePadding + bannerH;
				textX = totalW / 2;
				textY = framePadding + bannerH * 0.52;
				break;
			case 'polaroid':
				const bottomPolaroidPadding = qrDim * 0.28;
				totalH = qrDim + framePadding + bottomPolaroidPadding;
				qrX = framePadding;
				qrY = framePadding;
				textX = totalW / 2;
				textY = qrY + qrDim + (bottomPolaroidPadding * 0.52);
				textFontSize = Math.min(bottomPolaroidPadding * 0.36, maxTextWidth / (charCount * estimatedCharWidthFactor));
				break;
			case 'callout':
			case 'badge':
				const calloutH = qrDim * 0.24;
				totalH = qrDim + framePadding * 2 + calloutH;
				qrX = framePadding;
				qrY = framePadding;
				textX = totalW / 2;
				textY = qrY + qrDim + (calloutH * 0.56);
				textFontSize = Math.min(calloutH * 0.40, maxTextWidth / (charCount * estimatedCharWidthFactor));
				break;
			case 'bottom-banner':
			default:
				totalH = qrDim + framePadding * 2 + bannerH;
				qrX = framePadding;
				qrY = framePadding;
				textX = totalW / 2;
				textY = qrY + qrDim + (bannerH * 0.55);
				break;
		}
	}

	// Bangun SVG composite
	let svgParts: string[] = [];
	svgParts.push(
		`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalW.toFixed(2)} ${totalH.toFixed(2)}" width="100%" height="100%">`
	);

	// 1. Layer Background Frame
	if (hasFrame) {
		const isBrightFrame = getLuminance(config.frame.frameColor) > 0.85;
		const frameStroke = isBrightFrame ? 'stroke="rgba(0,0,0,0.12)" stroke-width="0.8"' : '';

		svgParts.push(
			`<rect width="${totalW.toFixed(2)}" height="${totalH.toFixed(2)}" rx="${frameCornerRadius.toFixed(2)}" fill="${escapeXml(config.frame.frameColor)}" ${frameStroke} />`
		);

		// Container QR di dalam frame jika background QR tidak transparan
		if (!config.isTransparent) {
			svgParts.push(
				`<rect x="${qrX.toFixed(2)}" y="${qrY.toFixed(2)}" width="${qrDim.toFixed(2)}" height="${qrDim.toFixed(2)}" rx="${(frameCornerRadius * 0.7).toFixed(2)}" fill="${escapeXml(config.backgroundColor)}" />`
			);
		}

		// Jika style callout / badge: gambar badge tag solid dengan panah segitiga rapi
		if (config.frame.style === 'callout' || config.frame.style === 'badge') {
			const tagW = Math.min(totalW * 0.88, maxTextWidth + 12);
			const tagH = bannerH * 0.72;
			const tagX = (totalW - tagW) / 2;
			const tagY = textY - tagH / 2;
			const notchH = 3.5;
			const notchW = 7;
			const notchX = totalW / 2;

			// Segitiga penunjuk mengarah ke QR
			svgParts.push(
				`<polygon points="${(notchX - notchW / 2).toFixed(2)},${tagY.toFixed(2)} ${(notchX + notchW / 2).toFixed(2)},${tagY.toFixed(2)} ${notchX.toFixed(2)},${(tagY - notchH).toFixed(2)}" fill="${escapeXml(config.frame.textColor)}" />`
			);
			// Badan badge tag yang solid dan kontras
			svgParts.push(
				`<rect x="${tagX.toFixed(2)}" y="${tagY.toFixed(2)}" width="${tagW.toFixed(2)}" height="${tagH.toFixed(2)}" rx="${(tagH * 0.28).toFixed(2)}" fill="${escapeXml(config.frame.textColor)}" />`
			);
		}
	}

	// 2. Layer QR Code (grup dengan offset koordinat)
	svgParts.push(`<g transform="translate(${qrX.toFixed(2)}, ${qrY.toFixed(2)})">`);
	svgParts.push(innerSvg);
	svgParts.push(`</g>`);

	// 3. Layer Logo di Tengah QR
	if (hasLogo) {
		const logoPercent = Math.min(Math.max(config.logo.sizePercent, 12), 28) / 100;
		const logoSize = qrDim * logoPercent;
		const centerX = qrX + qrDim / 2;
		const centerY = qrY + qrDim / 2;
		const badgeSize = logoSize * 1.25;
		const badgeRadius = badgeSize / 2;
		const clipId = `qr-logo-clip-${Math.random().toString(36).substring(2, 8)}`;

		// Badge background di balik logo
		if (config.logo.shape === 'circle') {
			svgParts.push(
				`<circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${badgeRadius.toFixed(2)}" fill="${escapeXml(config.logo.bgColor)}" />`
			);
			svgParts.push(
				`<defs><clipPath id="${clipId}"><circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${(logoSize / 2).toFixed(2)}" /></clipPath></defs>`
			);
		} else {
			const badgeCorner = badgeSize * 0.18;
			svgParts.push(
				`<rect x="${(centerX - badgeSize / 2).toFixed(2)}" y="${(centerY - badgeSize / 2).toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${badgeCorner.toFixed(2)}" fill="${escapeXml(config.logo.bgColor)}" />`
			);
			const logoCorner = logoSize * 0.15;
			svgParts.push(
				`<defs><clipPath id="${clipId}"><rect x="${(centerX - logoSize / 2).toFixed(2)}" y="${(centerY - logoSize / 2).toFixed(2)}" width="${logoSize.toFixed(2)}" height="${logoSize.toFixed(2)}" rx="${logoCorner.toFixed(2)}" /></clipPath></defs>`
			);
		}

		// Elemen image logo
		svgParts.push(
			`<image href="${escapeXml(config.logo.dataUrl)}" x="${(centerX - logoSize / 2).toFixed(2)}" y="${(centerY - logoSize / 2).toFixed(2)}" width="${logoSize.toFixed(2)}" height="${logoSize.toFixed(2)}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid meet" />`
		);
	}

	// 4. Layer Teks Frame
	if (hasFrame && config.frame.text) {
		const isCallout = config.frame.style === 'callout' || config.frame.style === 'badge';
		const fillTextColor = isCallout ? escapeXml(config.frame.frameColor) : escapeXml(config.frame.textColor);
		svgParts.push(
			`<text x="${textX.toFixed(2)}" y="${textY.toFixed(2)}" fill="${fillTextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="${textFontSize.toFixed(2)}" letter-spacing="0.5" text-anchor="middle" dominant-baseline="central">${escapeXml(config.frame.text)}</text>`
		);
	}

	svgParts.push(`</svg>`);
	return svgParts.join('\n');
}

/**
 * Merender QR code secara pixel-perfect ke HTML5 Canvas element untuk keperluan ekspor PNG resolusi tinggi.
 */
export async function renderQRToCanvas(config: QRConfig, targetWidth = config.pngSize): Promise<HTMLCanvasElement> {
	const content = getQRContent(config);
	if (!content) throw new Error('Tidak ada data QR untuk diekspor.');

	const hasFrame = config.frame.enabled && config.frame.style !== 'none';
	const hasLogo = config.logo.enabled && !!config.logo.dataUrl;
	const effectiveECC = getEffectiveECC(config);

	// Hitung dimensi kanvas
	const baseQrWidth = targetWidth;
	let canvasWidth = baseQrWidth;
	let canvasHeight = baseQrWidth;
	let qrX = 0;
	let qrY = 0;
	let qrDrawSize = baseQrWidth;
	let textX = canvasWidth / 2;
	let textY = 0;
	let bannerH = 0;
	let framePadding = 0;
	let cornerRadius = 0;
	let fontSize = 0;
	let maxTextWidth = canvasWidth * 0.84;

	if (hasFrame) {
		framePadding = Math.round(baseQrWidth * 0.08);
		bannerH = Math.round(baseQrWidth * 0.24);
		cornerRadius = Math.round(baseQrWidth * 0.06);
		canvasWidth = baseQrWidth + framePadding * 2;

		maxTextWidth = canvasWidth * 0.84;
		const charCount = Math.max(config.frame.text.length, 1);
		const estimatedCharWidthFactor = 0.62;
		const idealFontSize = bannerH * 0.44;
		const boundedFontSize = maxTextWidth / (charCount * estimatedCharWidthFactor);
		fontSize = Math.round(Math.min(idealFontSize, boundedFontSize));

		switch (config.frame.style) {
			case 'top-header':
				canvasHeight = baseQrWidth + framePadding * 2 + bannerH;
				qrX = framePadding;
				qrY = framePadding + bannerH;
				textX = canvasWidth / 2;
				textY = framePadding + bannerH * 0.52;
				break;
			case 'polaroid':
				const bottomPolaroidPadding = Math.round(baseQrWidth * 0.28);
				canvasHeight = baseQrWidth + framePadding + bottomPolaroidPadding;
				qrX = framePadding;
				qrY = framePadding;
				textX = canvasWidth / 2;
				textY = qrY + qrDrawSize + bottomPolaroidPadding * 0.52;
				fontSize = Math.round(Math.min(bottomPolaroidPadding * 0.36, maxTextWidth / (charCount * estimatedCharWidthFactor)));
				break;
			case 'callout':
			case 'badge':
				const calloutH = Math.round(baseQrWidth * 0.24);
				canvasHeight = baseQrWidth + framePadding * 2 + calloutH;
				qrX = framePadding;
				qrY = framePadding;
				textX = canvasWidth / 2;
				textY = qrY + qrDrawSize + calloutH * 0.56;
				fontSize = Math.round(Math.min(calloutH * 0.40, maxTextWidth / (charCount * estimatedCharWidthFactor)));
				break;
			case 'bottom-banner':
			default:
				canvasHeight = baseQrWidth + framePadding * 2 + bannerH;
				qrX = framePadding;
				qrY = framePadding;
				textX = canvasWidth / 2;
				textY = qrY + qrDrawSize + bannerH * 0.55;
				break;
		}
	}

	const canvas = document.createElement('canvas');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Gagal menginisialisasi 2D Canvas context.');

	// Aktifkan smoothing berkualitas tinggi
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';

	// 1. Gambar Frame Background
	if (hasFrame) {
		const isBrightFrame = getLuminance(config.frame.frameColor) > 0.85;

		ctx.fillStyle = config.frame.frameColor;
		if (typeof ctx.roundRect === 'function') {
			ctx.beginPath();
			ctx.roundRect(0, 0, canvasWidth, canvasHeight, cornerRadius);
			ctx.fill();
			if (isBrightFrame) {
				ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
				ctx.lineWidth = Math.max(1, Math.round(baseQrWidth * 0.003));
				ctx.stroke();
			}
		} else {
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		}

		// Background container QR jika tidak transparan
		if (!config.isTransparent) {
			ctx.fillStyle = config.backgroundColor;
			if (typeof ctx.roundRect === 'function') {
				ctx.beginPath();
				ctx.roundRect(qrX, qrY, qrDrawSize, qrDrawSize, cornerRadius * 0.7);
				ctx.fill();
			} else {
				ctx.fillRect(qrX, qrY, qrDrawSize, qrDrawSize);
			}
		}

		// Jika callout / badge, gambar tag solid dengan panah segitiga rapi
		if (config.frame.style === 'callout' || config.frame.style === 'badge') {
			const tagW = Math.min(canvasWidth * 0.88, maxTextWidth + Math.round(baseQrWidth * 0.04));
			const tagH = Math.round(bannerH * 0.72);
			const tagX = (canvasWidth - tagW) / 2;
			const tagY = textY - tagH / 2;
			const notchH = Math.round(baseQrWidth * 0.018);
			const notchW = Math.round(notchH * 2);
			const notchX = canvasWidth / 2;

			ctx.fillStyle = config.frame.textColor;
			// Notch segitiga
			ctx.beginPath();
			ctx.moveTo(notchX - notchW / 2, tagY);
			ctx.lineTo(notchX + notchW / 2, tagY);
			ctx.lineTo(notchX, tagY - notchH);
			ctx.closePath();
			ctx.fill();

			// Tag body
			if (typeof ctx.roundRect === 'function') {
				ctx.beginPath();
				ctx.roundRect(tagX, tagY, tagW, tagH, tagH * 0.28);
				ctx.fill();
			} else {
				ctx.fillRect(tagX, tagY, tagW, tagH);
			}
		}
	} else if (!config.isTransparent) {
		ctx.fillStyle = config.backgroundColor;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	}

	// 2. Render QR code ke temp canvas lalu gambar ke kanvas utama
	const tempCanvas = document.createElement('canvas');
	await QRCode.toCanvas(tempCanvas, content, {
		width: qrDrawSize,
		margin: config.margin,
		errorCorrectionLevel: effectiveECC,
		color: {
			dark: config.foregroundColor,
			light: config.isTransparent ? '#00000000' : config.backgroundColor
		}
	});
	ctx.drawImage(tempCanvas, qrX, qrY, qrDrawSize, qrDrawSize);

	// 3. Render Logo di Tengah
	if (hasLogo) {
		await new Promise<void>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const logoPercent = Math.min(Math.max(config.logo.sizePercent, 12), 28) / 100;
				const logoSize = qrDrawSize * logoPercent;
				const centerX = qrX + qrDrawSize / 2;
				const centerY = qrY + qrDrawSize / 2;
				const badgeSize = logoSize * 1.25;
				const badgeRadius = badgeSize / 2;

				// Badge background
				ctx.fillStyle = config.logo.bgColor;
				if (config.logo.shape === 'circle') {
					ctx.beginPath();
					ctx.arc(centerX, centerY, badgeRadius, 0, Math.PI * 2);
					ctx.fill();
				} else {
					const badgeCorner = badgeSize * 0.18;
					if (typeof ctx.roundRect === 'function') {
						ctx.beginPath();
						ctx.roundRect(centerX - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize, badgeCorner);
						ctx.fill();
					} else {
						ctx.fillRect(centerX - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize);
					}
				}

				// Logo image dengan clipping
				ctx.save();
				ctx.beginPath();
				if (config.logo.shape === 'circle') {
					ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
				} else {
					const logoCorner = logoSize * 0.15;
					if (typeof ctx.roundRect === 'function') {
						ctx.roundRect(centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize, logoCorner);
					} else {
						ctx.rect(centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
					}
				}
				ctx.clip();
				ctx.drawImage(img, centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
				ctx.restore();
				resolve();
			};
			img.onerror = () => reject(new Error('Gagal memproses gambar logo.'));
			img.src = config.logo.dataUrl;
		});
	}

	// 4. Render Teks Frame
	if (hasFrame && config.frame.text) {
		const isCallout = config.frame.style === 'callout' || config.frame.style === 'badge';
		ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
		ctx.fillStyle = isCallout ? config.frame.frameColor : config.frame.textColor;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(config.frame.text, textX, textY);
	}

	return canvas;
}

export async function exportPngBlob(config: QRConfig): Promise<Blob> {
	const canvas = await renderQRToCanvas(config, config.pngSize);
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error('Gagal mengonversi canvas ke Blob PNG.'));
			}
		}, 'image/png');
	});
}

export async function exportSvgBlob(config: QRConfig): Promise<Blob> {
	const svgString = await generateQRSvg(config);
	if (!svgString) throw new Error('Tidak ada data QR untuk diekspor.');
	return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
