import { error, fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';

export const load = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const offset = (page - 1) * limit;

		const {
			data: accounts,
			error: err,
			count
		} = await supabaseAdmin
			.from('cookies')
			.select('*', { count: 'exact' })
			.order('added_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (err) {
			console.error('Supabase load error:', err);
			return { accounts: [], totalPages: 0, currentPage: page, limit };
		}

		const totalPages = Math.ceil((count || 0) / limit);

		return {
			accounts: accounts || [],
			totalPages,
			currentPage: page,
			limit,
			totalCount: count || 0
		};
	} catch (err) {
		console.error('Load function error:', err);
		return { accounts: [], totalPages: 0, currentPage: 1, limit: 10, totalCount: 0 };
	}
};

export const actions = {
	create: async ({ request }) => {
		try {
			const fd = await request.formData();
			const uid = (fd.get('uid') || '').toString().trim();
			const pwd = (fd.get('password') || '').toString().trim();
			const cook = (fd.get('cookies') || '').toString().trim();

			if (!uid || !pwd) {
				return fail(400, { message: 'UID dan Password wajib diisi' });
			}

			const { error: err } = await supabaseAdmin.from('cookies').insert({
				uid,
				pwd,
				cookies: cook || null
			});

			if (err) {
				console.error('Supabase insert error:', err);
				if (err.code === '23505') {
					return fail(409, { message: 'UID sudah tersimpan sebelumnya' });
				}
				return fail(500, { message: 'Gagal menyimpan ke database' });
			}

			return { success: true, message: 'Akun berhasil disimpan!' };
		} catch (err) {
			console.error('Action error:', err);
			return fail(500, { message: 'Terjadi kesalahan server' });
		}
	},

	update: async ({ request }) => {
		try {
			const fd = await request.formData();
			const uid = (fd.get('uid') || '').toString().trim();
			const pwd = (fd.get('password') || '').toString().trim();
			const cook = (fd.get('cookies') || '').toString().trim();

			if (!uid || !pwd) {
				return fail(400, { message: 'UID dan Password wajib diisi' });
			}

			const { error: err } = await supabaseAdmin
				.from('cookies')
				.update({
					pwd,
					cookies: cook || null,
					last_login: new Date().toISOString()
				})
				.eq('uid', uid);

			if (err) {
				console.error('Supabase update error:', err);
				return fail(500, { message: 'Gagal update data' });
			}

			return { success: true, message: 'Data berhasil diupdate!' };
		} catch (err) {
			console.error('Update error:', err);
			return fail(500, { message: 'Terjadi kesalahan server' });
		}
	},

	delete: async ({ request }) => {
		try {
			const fd = await request.formData();
			const uid = (fd.get('uid') || '').toString().trim();

			if (!uid) {
				return fail(400, { message: 'UID tidak valid' });
			}

			const { error: err } = await supabaseAdmin.from('cookies').delete().eq('uid', uid);

			if (err) {
				console.error('Supabase delete error:', err);
				return fail(500, { message: 'Gagal menghapus data' });
			}

			return { success: true, message: 'Data berhasil dihapus!' };
		} catch (err) {
			console.error('Delete error:', err);
			return fail(500, { message: 'Terjadi kesalahan server' });
		}
	}
};
