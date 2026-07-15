import { error } from '@sveltejs/kit';
import { ADMIN_RECOVERY_PASSWORD } from '$env/static/private';
import { ENCRYPTION_KEY } from '$lib/server/notepad.server';
import nacl from 'tweetnacl';

const { secretbox } = nacl;

function decodeUTF8(bytes: Uint8Array): string {
	return new TextDecoder().decode(bytes);
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

function decryptText(encryptedHex: string): string {
	const key = hexToBytes(ENCRYPTION_KEY);
	const full = hexToBytes(encryptedHex);

	const nonce = full.slice(0, secretbox.nonceLength);
	const encrypted = full.slice(secretbox.nonceLength);

	const decrypted = secretbox.open(encrypted, nonce, key);

	if (!decrypted) {
		throw new Error('Decryption failed - data corrupted or invalid key');
	}

	return decodeUTF8(decrypted);
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString().trim();
		const encryptedHex = formData.get('encryptedHex')?.toString().trim();

		if (!password || !encryptedHex) {
			return { success: false, error: 'Password dan data hex harus diisi' };
		}

		if (password !== ADMIN_RECOVERY_PASSWORD) {
			return { success: false, error: 'Password salah' };
		}

		try {
			const decrypted = decryptText(encryptedHex);
			
			// Coba format jika bentuknya JSON
			try {
				const parsed = JSON.parse(decrypted);
				return { 
					success: true, 
					result: JSON.stringify(parsed, null, 2),
					isJson: true
				};
			} catch {
				return { 
					success: true, 
					result: decrypted,
					isJson: false
				};
			}
		} catch (err: any) {
			console.error('Decryption error:', err);
			return { success: false, error: err.message || 'Gagal decrypt catatan' };
		}
	}
};
