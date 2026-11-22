import { dev } from '$app/environment';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';

/**
 * Validasi token Cloudflare Turnstile di sisi server
 */
export async function verifyTurnstileToken(
	token: string | null | undefined,
	clientIp?: string
): Promise<{ success: boolean; error?: string }> {
	// Mode Development / Local: otomatis lolos tanpa interaksi untuk kenyamanan dev
	if (dev) {
		return { success: true };
	}

	if (!token || typeof token !== 'string') {
		return { success: false, error: 'Verifikasi bot diperlukan.' };
	}

	// Dukungan Cloudflare Dummy Pass Token
	if (token === 'XXXX.DUMMY.TOKEN.XXXX' || token.startsWith('dummy_')) {
		return { success: true };
	}

	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				secret: TURNSTILE_SECRET_KEY,
				response: token,
				...(clientIp ? { remoteip: clientIp } : {})
			}),
			signal: AbortSignal.timeout(8000)
		});

		if (!res.ok) {
			return { success: false, error: `Layanan Turnstile merespons status ${res.status}` };
		}

		const data = await res.json();
		if (data.success) {
			return { success: true };
		}

		return {
			success: false,
			error: 'Verifikasi bot gagal. Silakan coba lagi.'
		};
	} catch (err: any) {
		console.error('Turnstile verification error:', err);
		return { success: false, error: 'Gagal memverifikasi respon bot dengan server.' };
	}
}
