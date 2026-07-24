import { error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';
import { ENCRYPTION_KEY } from '$lib/server/notepad.server';
import { ADMIN_RECOVERY_PASSWORD } from '$env/static/private';
import nacl from 'tweetnacl';
import { createHash, createHmac, pbkdf2Sync } from 'crypto';
import { hash, verify } from '@node-rs/argon2';

const { secretbox, randomBytes } = nacl;

// ─── UTF-8 helpers ────────────────────────────────────────────────────────────
function encodeUTF8(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}
function decodeUTF8(bytes: Uint8Array): string {
	return new TextDecoder().decode(bytes);
}
function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
	}
	return bytes;
}
function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ─── Encryption (NaCl secretbox) ──────────────────────────────────────────────
function encryptText(text: string): string {
	const key = hexToBytes(ENCRYPTION_KEY);
	const nonce = randomBytes(secretbox.nonceLength);
	const messageUint8 = encodeUTF8(text);
	const encrypted = secretbox(messageUint8, nonce, key);
	if (!encrypted) throw new Error('Encryption failed');
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
	if (!decrypted) throw new Error('Decryption failed - data corrupted or invalid key');
	return decodeUTF8(decrypted);
}

// ─── Password hashing ─────────────────────────────────────────────────────────
// SHA-256 (format lama, hanya untuk backward compatibility)
function hashPasswordLegacy(password: string): string {
	return createHash('sha256').update(password).digest('hex');
}

// Verifikasi password dengan fallback ke format lama
async function verifyPassword(
	password: string,
	storedHash: string,
	slug: string
): Promise<{ valid: boolean; needsMigration: boolean }> {
	if (storedHash.startsWith('$argon2')) {
		const valid = await verify(storedHash, password);
		return { valid, needsMigration: false };
	}
	
	// Fallback PBKDF2 (in case data was migrated recently)
	const pbkdf2Hash = pbkdf2Sync(password, `np_${slug}`, 100_000, 64, 'sha512').toString('hex');
	if (pbkdf2Hash === storedHash) {
		return { valid: true, needsMigration: true };
	}

	// Fallback SHA-256
	if (hashPasswordLegacy(password) === storedHash) {
		return { valid: true, needsMigration: true };
	}
	
	return { valid: false, needsMigration: false };
}

// ─── Cookie auth: HMAC opaque token ───────────────────────────────────────────
// Cookie tidak menyimpan hash password langsung, melainkan HMAC(slug:hash, key)
// Tidak bisa di-reverse untuk mendapatkan password_hash dari cookie.
function generateAuthToken(slug: string, passwordHash: string): string {
	return createHmac('sha256', ENCRYPTION_KEY).update(`${slug}:${passwordHash}`).digest('hex');
}

function verifyAuthToken(token: string, slug: string, passwordHash: string): boolean {
	return token === generateAuthToken(slug, passwordHash);
}

// ─── Rate limiter (in-memory) ─────────────────────────────────────────────────
interface RateLimitEntry {
	count: number;
	resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000; // 15 menit

function checkRateLimit(key: string): { allowed: boolean; waitSeconds?: number } {
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	if (!entry || now > entry.resetAt) {
		rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return { allowed: true };
	}

	entry.count++;
	if (entry.count > RATE_LIMIT_MAX) {
		return { allowed: false, waitSeconds: Math.ceil((entry.resetAt - now) / 1000) };
	}

	return { allowed: true };
}

// ─── Slug validator ───────────────────────────────────────────────────────────
function isValidSlug(slug: string): boolean {
	return /^[a-z0-9]{12}$/.test(slug);
}

// ─── Load ─────────────────────────────────────────────────────────────────────
export async function load({ params, cookies }) {
	const slug = params.slug;

	if (!isValidSlug(slug)) {
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
			const raw = decryptText(data.text);
			try {
				const parsed = JSON.parse(raw);
				if (parsed?.__is_locked) {
					isLocked = true;
					hasPassword = true;
					const authCookie = cookies.get(`np_auth_${slug}`);
					if (authCookie && verifyAuthToken(authCookie, slug, parsed.password_hash)) {
						isLocked = false;
						decryptedText = parsed.content || '';
					}
				} else if (parsed?.__notepad) {
					decryptedText = parsed.content || '';
				}
			} catch {
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

// ─── Actions ──────────────────────────────────────────────────────────────────
export const actions = {
	save: async ({ request, params, cookies }) => {
		const slug = params.slug;

		if (!isValidSlug(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const formData = await request.formData();
		const rawText = (formData.get('text') || '').toString().trim();
		const password = (formData.get('password') || '').toString();

		const LINE_LIMIT = 1000;
		const lines = rawText.split('\n');
		const text = lines.length > LINE_LIMIT ? lines.slice(0, LINE_LIMIT).join('\n') : rawText;

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
		let isCurrentlyLocked = false;

		if (currentDbData?.text) {
			try {
				const decrypted = decryptText(currentDbData.text);
				try {
					const parsed = JSON.parse(decrypted);
					if (parsed?.__is_locked) {
						isCurrentlyLocked = true;
						existingPasswordHash = parsed.password_hash || null;
						oldContent = parsed.content || '';
					} else if (parsed?.__notepad) {
						oldContent = parsed.content || '';
					}
				} catch {
					oldContent = decrypted;
				}
			} catch (err) {
				console.error('Failed to decrypt old content', err);
			}
		}

		// SECURITY: Jika catatan terkunci, verifikasi cookie auth sebelum izinkan save
		if (isCurrentlyLocked) {
			const authCookie = cookies.get(`np_auth_${slug}`);
			if (!authCookie || !verifyAuthToken(authCookie, slug, existingPasswordHash!)) {
				throw error(403, 'Catatan terkunci. Masukkan password terlebih dahulu.');
			}
		}

		// History: simpan baris yang dihapus
		if (oldContent) {
			const oldContentNormalized = oldContent.replace(/\r\n/g, '\n');
			const textNormalized = text.replace(/\r\n/g, '\n');
			const oldLines = oldContentNormalized
				.split('\n')
				.map((l: string) => l.trim())
				.filter((l: string) => l !== '');
			const newLinesSet = new Set(textNormalized.split('\n').map((l: string) => l.trim()));
			let deletedLines = oldLines.filter((line: string) => !newLinesSet.has(line));

			if (deletedLines.length > 0) {
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
					historyData.forEach((row) => {
						const rowLines = row.text.replace(/\r\n/g, '\n').split('\n');
						rowLines.forEach((l: string) => previouslyDeletedLines.add(l.trim()));
					});
				}

				deletedLines = deletedLines.filter((line) => !previouslyDeletedLines.has(line));

				if (deletedLines.length > 0) {
					const deletedText = deletedLines.join('\n');
					try {
						if (existingHistoryId) {
							await supabaseAdmin
								.from('notepad_history')
								.update({
									text: existingText + '\n' + deletedText,
									created_at: new Date().toISOString()
								})
								.eq('id', existingHistoryId);
						} else {
							await supabaseAdmin
								.from('notepad_history')
								.insert({ slug, text: deletedText });
						}
					} catch (err) {
						console.error('Gagal menyimpan ke notepad_history:', err);
					}
				}
			}
		}

		let finalPasswordHash: string | null = null;

		if (existingPasswordHash) {
			// Pertahankan password yang sudah ada
			finalPasswordHash = existingPasswordHash;
		} else if (password) {
			// Password baru: gunakan Argon2
			finalPasswordHash = await hash(password);
		}

		let finalContentToEncrypt: string;
		if (finalPasswordHash) {
			finalContentToEncrypt = JSON.stringify({
				__is_locked: true,
				content: text,
				password_hash: finalPasswordHash
			});
		} else {
			finalContentToEncrypt = JSON.stringify({
				__notepad: true,
				content: text
			});
		}

		try {
			const encryptedText = encryptText(finalContentToEncrypt);
			await supabaseAdmin
				.from('notepad')
				.upsert({ slug, text: encryptedText, updated_at: new Date().toISOString() });
			return { ok: true };
		} catch (err) {
			console.error('Encryption error:', err);
			throw error(500, 'Gagal encrypt catatan');
		}
	},

	unlock: async ({ request, params, cookies, getClientAddress }) => {
		const slug = params.slug;

		if (!isValidSlug(slug)) {
			return { success: false, error: 'Slug tidak valid' };
		}

		const formData = await request.formData();
		const password = (formData.get('password') || '').toString().trim();

		if (!password) {
			return { success: false, error: 'Password tidak boleh kosong' };
		}

		// Rate limit berdasarkan IP + slug
		const clientIP = getClientAddress();
		const rateLimitKey = `unlock:${clientIP}:${slug}`;
		const rl = checkRateLimit(rateLimitKey);
		if (!rl.allowed) {
			return {
				success: false,
				error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.waitSeconds} detik.`
			};
		}

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

			if (parsed?.__is_locked) {
				const { valid, needsMigration } = await verifyPassword(password, parsed.password_hash, slug);

				if (valid) {
					let currentPasswordHash = parsed.password_hash;

					// Auto-migrasi: upgrade hash lama ke Argon2 secara transparan
					if (needsMigration) {
						const newHash = await hash(password);
						const migratedContent = JSON.stringify({
							__is_locked: true,
							content: parsed.content,
							password_hash: newHash
						});
						try {
							const encryptedMigrated = encryptText(migratedContent);
							await supabaseAdmin
								.from('notepad')
								.update({
									text: encryptedMigrated,
									updated_at: new Date().toISOString()
								})
								.eq('slug', slug);
							currentPasswordHash = newHash;
						} catch (migErr) {
							console.error('Password migration failed, using old hash for cookie:', migErr);
						}
					}

					// Set HMAC opaque cookie (bukan hash password langsung)
					const token = generateAuthToken(slug, currentPasswordHash);
					cookies.set(`np_auth_${slug}`, token, {
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
	},

	changePassword: async ({ request, params, cookies }) => {
		const slug = params.slug;

		if (!isValidSlug(slug)) {
			return { changePasswordError: 'Slug tidak valid' };
		}

		const formData = await request.formData();
		const adminPassword = (formData.get('adminPassword') || '').toString().trim();
		const newPassword = (formData.get('newPassword') || '').toString();

		if (!adminPassword) {
			return { changePasswordError: 'Admin password diperlukan' };
		}

		if (adminPassword !== ADMIN_RECOVERY_PASSWORD) {
			return { changePasswordError: 'Admin password salah' };
		}

		const { data } = await supabaseAdmin
			.from('notepad')
			.select('text')
			.eq('slug', slug)
			.single();

		if (!data?.text) {
			return { changePasswordError: 'Catatan tidak ditemukan' };
		}

		let parsed: Record<string, unknown>;
		try {
			const decryptedText = decryptText(data.text);
			parsed = JSON.parse(decryptedText);
		} catch {
			return { changePasswordError: 'Gagal membaca catatan' };
		}

		if (!parsed?.__is_locked) {
			return { changePasswordError: 'Catatan ini tidak dikunci' };
		}

		const content = (parsed.content as string) || '';

		let newEncryptedContent: string;
		if (newPassword) {
			// Ganti dengan password baru (Argon2)
			const newHash = await hash(newPassword);
			newEncryptedContent = encryptText(
				JSON.stringify({ __is_locked: true, content, password_hash: newHash })
			);
		} else {
			// Hapus password (buka kunci)
			newEncryptedContent = encryptText(JSON.stringify({ __notepad: true, content }));
		}

		const { error: dbError } = await supabaseAdmin
			.from('notepad')
			.update({ text: newEncryptedContent, updated_at: new Date().toISOString() })
			.eq('slug', slug);

		if (dbError) {
			return { changePasswordError: 'Gagal menyimpan perubahan' };
		}

		// Hapus cookie auth lama
		cookies.delete(`np_auth_${slug}`, { path: `/notepad/${slug}` });

		return { changePasswordSuccess: true };
	}
};
