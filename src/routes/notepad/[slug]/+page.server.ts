// import { error } from '@sveltejs/kit';
// import { supabase } from '$lib/server/supabase.server';

// export async function load({ params }) {
// 	const slug = params.slug;

// 	if (!/^[a-z0-9]{12}$/.test(slug)) {
// 		throw error(400, 'Slug harus 12 karakter alfanumerik');
// 	}

// 	const { data } = await supabase
// 		.from('notepad')
// 		.select('text, updated_at')
// 		.eq('slug', slug)
// 		.single();

// 	return {
// 		slug,
// 		text: data?.text || '',
// 		updatedAt: data?.updated_at || null
// 	};
// }

// export const actions = {
// 	save: async ({ request, params }) => {
// 		const slug = params.slug;

// 		if (!/^[a-z0-9]{12}$/.test(slug)) {
// 			throw error(400, 'Slug harus 12 karakter alfanumerik');
// 		}

// 		const formData = await request.formData();
// 		const text = (formData.get('text') || '').toString().trim();

// 		if (!text) {
// 			throw error(400, 'Text tidak boleh kosong');
// 		}

// 		await supabase.from('notepad').upsert({ slug, text, updated_at: new Date().toISOString() });

// 		return { ok: true };
// 	}
// };
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase.server';
import { ENCRYPTION_KEY } from '$lib/server/notepad.server';
import nacl from 'tweetnacl';

const { secretbox, randomBytes } = nacl;

// UTF8 encode/decode helpers
function encodeUTF8(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

function decodeUTF8(bytes: Uint8Array): string {
	return new TextDecoder().decode(bytes);
}

// Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
	}
	return bytes;
}

// Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function encryptText(text: string): string {
	const key = hexToBytes(ENCRYPTION_KEY);
	const nonce = randomBytes(secretbox.nonceLength);
	const messageUint8 = encodeUTF8(text);
	const encrypted = secretbox(messageUint8, nonce, key);

	if (!encrypted) {
		throw new Error('Encryption failed');
	}

	// Combine nonce + encrypted data, then convert to hex
	const full = new Uint8Array(nonce.length + encrypted.length);
	full.set(nonce);
	full.set(encrypted, nonce.length);

	return bytesToHex(full);
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

export async function load({ params }) {
	const slug = params.slug;

	if (!/^[a-z0-9]{12}$/.test(slug)) {
		throw error(400, 'Slug harus 12 karakter alfanumerik');
	}

	const { data } = await supabase
		.from('notepad')
		.select('text, updated_at')
		.eq('slug', slug)
		.single();

	let decryptedText = '';
	if (data?.text) {
		try {
			decryptedText = decryptText(data.text);
		} catch (err) {
			console.error('Decryption error:', err);
			throw error(500, 'Gagal decrypt catatan');
		}
	}

	return {
		slug,
		text: decryptedText,
		updatedAt: data?.updated_at || null
	};
}

export const actions = {
	save: async ({ request, params }) => {
		const slug = params.slug;

		if (!/^[a-z0-9]{12}$/.test(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const formData = await request.formData();
		const text = (formData.get('text') || '').toString().trim();

		if (!text) {
			throw error(400, 'Text tidak boleh kosong');
		}

		try {
			const encryptedText = encryptText(text);

			await supabase.from('notepad').upsert({
				slug,
				text: encryptedText,
				updated_at: new Date().toISOString()
			});

			return { ok: true };
		} catch (err) {
			console.error('Encryption error:', err);
			throw error(500, 'Gagal encrypt catatan');
		}
	}
};
