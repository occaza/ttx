import { fail, redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		throw redirect(303, '/login');
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('first_name, last_name, username, email, phone, role, tier')
		.eq('id', user.id)
		.single();

	return {
		user,
		profile,
		hasEmailProvider: user.app_metadata?.providers?.includes('email') ?? false
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals: { safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { message: 'Tidak terautentikasi.' });

		const fd = await request.formData();
		const first_name = (fd.get('first_name') ?? '').toString().trim();
		const last_name = (fd.get('last_name') ?? '').toString().trim();
		const username = (fd.get('username') ?? '').toString().trim();
		const phone = (fd.get('phone') ?? '').toString().trim();

		if (!first_name) {
			return fail(400, { message: 'Nama depan wajib diisi.' });
		}

		if (username && username.length < 3) {
			return fail(400, { message: 'Username minimal 3 karakter.' });
		}

		// Cek username unik (kalau diisi)
		if (username) {
			const { data: existing } = await supabaseAdmin
				.from('profiles')
				.select('id')
				.eq('username', username)
				.neq('id', user.id)
				.single();

			if (existing) {
				return fail(409, { message: 'Username sudah dipakai, coba yang lain.' });
			}
		}

		const { error } = await supabaseAdmin
			.from('profiles')
			.update({ first_name, last_name, username: username || null, phone: phone || null })
			.eq('id', user.id);

		if (error) {
			console.error('Update profile error:', error);
			return fail(500, { message: 'Gagal menyimpan perubahan. Coba lagi.' });
		}

		return { success: true, message: 'Profil berhasil diperbarui.' };
	},

	changeEmail: async ({ request, locals: { safeGetSession, supabase } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { message: 'Tidak terautentikasi.' });

		const fd = await request.formData();
		const newEmail = (fd.get('email') ?? '').toString().trim().toLowerCase();

		if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
			return fail(400, { message: 'Format email tidak valid.' });
		}

		if (newEmail === user.email) {
			return fail(400, { message: 'Email baru sama dengan email saat ini.' });
		}

		const { error } = await supabase.auth.updateUser({ email: newEmail });

		if (error) {
			return fail(500, { message: error.message || 'Gagal mengubah email.' });
		}

		return { success: true, message: 'Email konfirmasi telah dikirim ke alamat baru.' };
	},

	changePassword: async ({ request, locals: { safeGetSession, supabase } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { message: 'Tidak terautentikasi.' });

		const fd = await request.formData();
		const oldPassword = (fd.get('old_password') ?? '').toString();
		const newPassword = (fd.get('password') ?? '').toString();
		const confirmPassword = (fd.get('confirm_password') ?? '').toString();

		if (newPassword.length < 8) {
			return fail(400, { message: 'Password minimal 8 karakter.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: 'Konfirmasi password tidak cocok.' });
		}

		const hasEmailProvider = user.app_metadata?.providers?.includes('email');
		
		if (hasEmailProvider) {
			if (!oldPassword) {
				return fail(400, { message: 'Password lama wajib diisi.' });
			}
			
			// Verifikasi password lama
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user.email as string,
				password: oldPassword
			});
			
			if (signInError) {
				return fail(400, { message: 'Password lama salah.' });
			}
		}

		const { error } = await supabase.auth.updateUser({ password: newPassword });

		if (error) {
			return fail(500, { message: error.message || 'Gagal mengubah password.' });
		}

		return { success: true, message: 'Password berhasil diubah.' };
	}
};
