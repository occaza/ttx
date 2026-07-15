import { error } from '@sveltejs/kit';
import { ADMIN_RECOVERY_PASSWORD } from '$env/static/private';
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

function decryptText(encryptedHex: string, customKey: string): string {
	const key = hexToBytes(customKey);
	const full = hexToBytes(encryptedHex);

	const nonce = full.slice(0, secretbox.nonceLength);
	const encrypted = full.slice(secretbox.nonceLength);

	const decrypted = secretbox.open(encrypted, nonce, key);

	if (!decrypted) {
		throw new Error('Decryption failed - data corrupted or invalid key');
	}

	return decodeUTF8(decrypted);
}

export async function load({ cookies }) {
	const auth = cookies.get('viewp_auth');
	const unlocked = auth === ADMIN_RECOVERY_PASSWORD;
	return { unlocked };
}

export const actions = {
	unlock: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString().trim();

		if (!password) {
			return { unlockError: 'Password harus diisi' };
		}

		if (password !== ADMIN_RECOVERY_PASSWORD) {
			return { unlockError: 'Password salah' };
		}

		// Set cookie for 1 hour
		cookies.set('viewp_auth', password, { 
			path: '/viewp', 
			httpOnly: true, 
			sameSite: 'lax', 
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60
		});
		return { success: true };
	},
	decrypt: async ({ request, cookies }) => {
		const auth = cookies.get('viewp_auth');
		if (auth !== ADMIN_RECOVERY_PASSWORD) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const decryptionKey = formData.get('decryptionKey')?.toString().trim();
		const encryptedHex = formData.get('encryptedHex')?.toString().trim();

		if (!decryptionKey || !encryptedHex) {
			return { decryptError: 'Decryption Key dan Payload Hex harus diisi' };
		}

		try {
			const decrypted = decryptText(encryptedHex, decryptionKey);
			
			// Coba format jika bentuknya JSON
			try {
				const parsed = JSON.parse(decrypted);
				return { 
					success: true, 
					result: JSON.stringify(parsed, null, 2),
				};
			} catch {
				return { 
					success: true, 
					result: decrypted,
				};
			}
		} catch (err: any) {
			console.error('Decryption error:', err);
			return { decryptError: err.message || 'Gagal decrypt catatan' };
		}
	}
};
