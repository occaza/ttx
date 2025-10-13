import { NOTEPAD_ENCRYPTION_KEY as KEY } from '$env/static/private';

export const ENCRYPTION_KEY = KEY;

if (!ENCRYPTION_KEY) {
	throw new Error('NOTEPAD_ENCRYPTION_KEY tidak ditemukan');
}

// pastikan 64 karakter + hanya 0-9, a-f, A-F
if (!/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
	throw new Error('NOTEPAD_ENCRYPTION_KEY harus 64 karakter hex (0-9, a-f, A-F)');
}
