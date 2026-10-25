import QRCode from 'qrcode';

export type ContentType = 'url' | 'text' | 'wifi';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type ExportFormat = 'png' | 'svg';
export type PngSize = 512 | 1024 | 2048;
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiConfig {
	ssid: string;
	password: string;
	encryption: WifiEncryption;
	hidden: boolean;
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
}

export interface ContrastResult {
	ratio: number;
	isRisky: boolean;
	message: string;
}

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
	pngSize: 1024
};

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
	const fullHex = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
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

export async function generateQRSvg(config: QRConfig): Promise<string> {
	const content = getQRContent(config);
	if (!content) return '';

	return QRCode.toString(content, {
		type: 'svg',
		margin: config.margin,
		errorCorrectionLevel: config.errorCorrection,
		color: {
			dark: config.foregroundColor,
			light: config.isTransparent ? '#00000000' : config.backgroundColor
		}
	});
}

export async function exportPngBlob(config: QRConfig): Promise<Blob> {
	const content = getQRContent(config);
	if (!content) throw new Error('Tidak ada data QR untuk diekspor.');

	const dataUrl = await QRCode.toDataURL(content, {
		width: config.pngSize,
		margin: config.margin,
		errorCorrectionLevel: config.errorCorrection,
		color: {
			dark: config.foregroundColor,
			light: config.isTransparent ? '#00000000' : config.backgroundColor
		}
	});

	const res = await fetch(dataUrl);
	return res.blob();
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
