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
import { supabaseAdmin } from '$lib/server/supabase.server';
import { ENCRYPTION_KEY } from '$lib/server/notepad.server';
import { ADMIN_RECOVERY_PASSWORD } from '$env/static/private';
import nacl from 'tweetnacl';
import { createHash } from 'crypto';

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


export async function load({ params, cookies }) {
	const slug = params.slug;

	if (!/^[a-z0-9]{12}$/.test(slug)) {
		throw error(400, 'Slug harus 12 karakter alfanumerik');
	}

	const { data } = await supabaseAdmin
		.from('notepad')
		.select('text, updated_at')
		.eq('slug', slug)
		.single();

	let decryptedText = '';
	let isLocked = false;
	let hasPassword = false;

	if (data?.text) {
		try {
			decryptedText = decryptText(data.text);
			
			try {
				const parsed = JSON.parse(decryptedText);
				if (parsed && parsed.__is_locked) {
					isLocked = true;
					hasPassword = true;
					const authCookie = cookies.get(`np_auth_${slug}`);
					if (authCookie === parsed.password_hash) {
						isLocked = false;
						decryptedText = parsed.content || '';
					} else {
						decryptedText = '';
					}
				} else if (parsed && parsed.__notepad) {
					// Format JSON notepad tanpa password
					decryptedText = parsed.content || '';
				}
			} catch (e) {
				// Plain text biasa, tidak ada JSON
			}
		} catch (err) {
			console.error('Decryption error:', err);
			throw error(500, 'Gagal decrypt catatan');
		}
	}

	return {
		slug,
		text: decryptedText,
		isLocked,
		hasPassword,
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
		const password = (formData.get('password') || '').toString();

		if (!text) {
			throw error(400, 'Text tidak boleh kosong');
		}

		const { data: currentDbData } = await supabaseAdmin
			.from('notepad')
			.select('text')
			.eq('slug', slug)
			.single();

		let existingPasswordHash: string | null = null;
		let oldContent: string | null = null;

		if (currentDbData?.text) {
			try {
				const decrypted = decryptText(currentDbData.text);
				try {
					const parsed = JSON.parse(decrypted);
					if (parsed && parsed.__is_locked) {
						existingPasswordHash = parsed.password_hash || null;
						oldContent = parsed.content || '';
					} else if (parsed && parsed.__notepad) {
						oldContent = parsed.content || '';
					}
				} catch {
					oldContent = decrypted;
				}
			} catch (err) {
				console.error('Failed to decrypt old content', err);
			}
		}

		if (oldContent) {
			const oldContentNormalized = oldContent.replace(/\r\n/g, '\n');
			const textNormalized = text.replace(/\r\n/g, '\n');

			const oldLines = oldContentNormalized.split('\n').map((l: string) => l.trim()).filter((l: string) => l !== '');
			const newLinesSet = new Set(textNormalized.split('\n').map((l: string) => l.trim()));
			
			let deletedLines = oldLines.filter((line: string) => !newLinesSet.has(line));

			if (deletedLines.length > 0) {
				// Ambil history yang sudah ada untuk deduplikasi
				const { data: historyData } = await supabaseAdmin
					.from('notepad_history')
					.select('id, text')
					.eq('slug', slug)
					.order('created_at', { ascending: false });

				const previouslyDeletedLines = new Set<string>();
				let existingHistoryId: string | null = null;
				let existingText = '';

				if (historyData && historyData.length > 0) {
					existingHistoryId = historyData[0].id;
					existingText = historyData[0].text;
					historyData.forEach(row => {
						const lines = row.text.replace(/\r\n/g, '\n').split('\n');
						lines.forEach((l: string) => previouslyDeletedLines.add(l.trim()));
					});
				}

				// Filter hanya baris yang belum pernah dihapus sebelumnya
				deletedLines = deletedLines.filter(line => !previouslyDeletedLines.has(line));

				if (deletedLines.length > 0) {
					const deletedText = deletedLines.join('\n');
					try {
						if (existingHistoryId) {
							// Update record yang sudah ada (append)
							await supabaseAdmin.from('notepad_history')
								.update({ 
									text: existingText + '\n' + deletedText,
									created_at: new Date().toISOString() // perbarui waktu agar naik ke atas
								})
								.eq('id', existingHistoryId);
						} else {
							// Simpan sebagai record baru
							await supabaseAdmin.from('notepad_history').insert({
								slug,
								text: deletedText
							});
						}
					} catch (err) {
						console.error('Gagal menyimpan ke notepad_history:', err);
					}
				}
			}
		}

		let finalContentToEncrypt: string;
		let finalPasswordHash: string | null = null;

		if (existingPasswordHash) {
			// Jika sudah pernah dikunci, password dari form diabaikan, pertahankan password lama
			finalPasswordHash = existingPasswordHash;
		} else if (password) {
			// Jika belum dikunci, dan user mengisi password, buat hash baru
			finalPasswordHash = createHash('sha256').update(password).digest('hex');
		}

		if (finalPasswordHash) {
			finalContentToEncrypt = JSON.stringify({
				__is_locked: true,
				content: text,
				password_hash: finalPasswordHash
			});
		} else {
			// Simpan dalam format JSON notepad
			finalContentToEncrypt = JSON.stringify({
				__notepad: true,
				content: text
			});
		}

		try {
			const encryptedText = encryptText(finalContentToEncrypt);

			await supabaseAdmin.from('notepad').upsert({
				slug,
				text: encryptedText,
				updated_at: new Date().toISOString()
			});

			return { ok: true };
		} catch (err) {
			console.error('Encryption error:', err);
			throw error(500, 'Gagal encrypt catatan');
		}
	},
	unlock: async ({ request, params, cookies }) => {
		const slug = params.slug;
		const formData = await request.formData();
		const password = (formData.get('password') || '').toString().trim();

		if (!password) {
			return { success: false, error: 'Password tidak boleh kosong' };
		}

		// Ambil data untuk mengecek hash
		const { data } = await supabaseAdmin
			.from('notepad')
			.select('text')
			.eq('slug', slug)
			.single();

		if (!data?.text) {
			return { success: false, error: 'Catatan tidak ditemukan' };
		}

		try {
			const decryptedText = decryptText(data.text);
			const parsed = JSON.parse(decryptedText);

			if (parsed && parsed.__is_locked) {
				const inputHash = createHash('sha256').update(password).digest('hex');
				
				if (inputHash === parsed.password_hash) {
					// Password benar, set cookie (berlaku 1 hari)
					cookies.set(`np_auth_${slug}`, inputHash, {
						path: `/notepad/${slug}`,
						maxAge: 60 * 60 * 24,
						httpOnly: true,
						sameSite: 'strict',
						secure: process.env.NODE_ENV === 'production'
					});
					return { success: true };
				} else {
					return { success: false, error: 'Password salah' };
				}
			}
		} catch (e) {
			return { success: false, error: 'Catatan tidak dikunci' };
		}
		
		return { success: false, error: 'Terjadi kesalahan' };
	}
};
