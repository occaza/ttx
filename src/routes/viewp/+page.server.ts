import { error } from '@sveltejs/kit';
import { ADMIN_RECOVERY_PASSWORD } from '$env/static/private';
import { ENCRYPTION_KEY } from '$lib/server/notepad.server';
import { supabaseAdmin } from '$lib/server/supabase.server';
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

export async function load({ cookies }) {
	const auth = cookies.get('viewp_auth');
	const unlocked = auth === ADMIN_RECOVERY_PASSWORD;

	let history: Array<{ id: string; slug: string; text: string; created_at: string }> = [];

	if (unlocked) {
		const { data, error: dbError } = await supabaseAdmin
			.from('notepad_history')
			.select('*')
			.order('created_at', { ascending: false });

		if (!dbError && data) {
			history = data.map(row => {
				let decrypted = 'Gagal decrypt';
				try {
					decrypted = decryptText(row.text);
				} catch (e) {
					console.error('Gagal decrypt baris history:', row.id);
				}
				return {
					...row,
					text: decrypted
				};
			});
		}
	}

	return { unlocked, history };
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
	}
};
