import { error, redirect, fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';
import type { PageServerLoad, Actions } from './$types';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const { data: doc } = await supabaseAdmin
		.from('notepad2_docs')
		.select('id, slug, title, content, updated_at, created_at, user_id, is_public')
		.eq('slug', params.slug)
		.single();

	if (!doc) {
		throw error(404, 'Dokumen tidak ditemukan');
	}

	const isOwner = user?.id === doc.user_id;

	if (!isOwner && !doc.is_public) {
		throw redirect(302, '/login');
	}

	return { doc, isOwner, isPublic: doc.is_public };
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw error(401, 'Unauthorized');

		const formData = await request.formData();
		let content = (formData.get('content') ?? '').toString();

		// Cek tier user
		const { data: profile } = await supabaseAdmin.from('profiles').select('tier').eq('id', user.id).single();
		const tier = profile?.tier ?? 'free';

		// Batasi 2000 baris untuk user gratis
		if (tier === 'free') {
			const lines = content.split('\n');
			if (lines.length > 2000) {
				content = lines.slice(0, 2000).join('\n');
			}
		}

		// Batasi konten maksimum 500KB
		const MAX_CONTENT_BYTES = 500 * 1024;
		if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
			throw error(400, 'Konten terlalu besar (maksimum 500KB)');
		}

		const { error: dbError } = await supabaseAdmin
			.from('notepad2_docs')
			.update({ content, updated_at: new Date().toISOString() })
			.eq('slug', params.slug)
			.eq('user_id', user.id);

		if (dbError) throw error(500, 'Gagal menyimpan');

		return { ok: true };
	},

	rename: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw error(401, 'Unauthorized');

		const formData = await request.formData();
		const title = (formData.get('title') ?? 'Untitled').toString().trim() || 'Untitled';

		let finalTitle = title;
		let counter = 1;
		let isUnique = false;

		const { data: existing } = await supabaseAdmin
			.from('notepad2_docs')
			.select('title')
			.eq('user_id', user.id)
			.neq('slug', params.slug)
			.ilike('title', `${title}%`);

		if (existing && existing.length > 0) {
			const existingTitles = existing.map(d => d.title);
			while (existingTitles.includes(finalTitle)) {
				finalTitle = `${title} (${counter})`;
				counter++;
			}
		}

		const { error: dbError } = await supabaseAdmin
			.from('notepad2_docs')
			.update({ title: finalTitle, updated_at: new Date().toISOString() })
			.eq('slug', params.slug)
			.eq('user_id', user.id);

		if (dbError) throw error(500, 'Gagal rename');

		return { ok: true, title: finalTitle };
	},

	create: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw error(401, 'Unauthorized');

		// Cek tier user
		const { data: profile } = await supabaseAdmin.from('profiles').select('tier').eq('id', user.id).single();
		const tier = profile?.tier ?? 'free';

		if (tier === 'free') {
			const { count, error: countError } = await supabaseAdmin
				.from('notepad2_docs')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', user.id);
			
			if (countError) throw error(500, 'Gagal memverifikasi batasan dokumen');
			if (count !== null && count >= 4) {
				return fail(403, { limitReached: true, message: 'Batas maksimal 4 dokumen.' });
			}
		}

		let finalTitle = 'Untitled';
		let counter = 1;
		let isUnique = false;

		const { data: existing } = await supabaseAdmin
			.from('notepad2_docs')
			.select('title')
			.eq('user_id', user.id)
			.ilike('title', 'Untitled%');

		if (existing && existing.length > 0) {
			const existingTitles = existing.map(d => d.title);
			while (existingTitles.includes(finalTitle)) {
				finalTitle = `Untitled (${counter})`;
				counter++;
			}
		}

		const slug = crypto.randomBytes(6).toString('hex');
		const { data: newDoc, error: dbError } = await supabaseAdmin
			.from('notepad2_docs')
			.insert({
				user_id: user.id,
				title: finalTitle,
				content: '',
				slug: slug
			})
			.select('slug')
			.single();

		if (dbError || !newDoc) throw error(500, 'Gagal membuat dokumen');

		throw redirect(302, `/notepad2/${newDoc.slug}`);
	},

	delete: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw error(401, 'Unauthorized');

		const { data: otherDocs } = await supabaseAdmin
			.from('notepad2_docs')
			.select('slug')
			.eq('user_id', user.id)
			.neq('slug', params.slug)
			.order('updated_at', { ascending: false })
			.limit(1);

		await supabaseAdmin
			.from('notepad2_docs')
			.delete()
			.eq('slug', params.slug)
			.eq('user_id', user.id);

		const redirectSlug = otherDocs?.[0]?.slug;

		if (redirectSlug) {
			throw redirect(302, `/notepad2/${redirectSlug}`);
		}

		// Buat doc baru jika tidak ada yang tersisa
		const slug = crypto.randomBytes(6).toString('hex');
		const { data: newDoc } = await supabaseAdmin
			.from('notepad2_docs')
			.insert({ user_id: user.id, title: 'Untitled', content: '', slug })
			.select('slug')
			.single();

		throw redirect(302, `/notepad2/${newDoc?.slug ?? ''}`);
	},

	togglePublic: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw error(401, 'Unauthorized');

		const { data: doc } = await supabaseAdmin
			.from('notepad2_docs')
			.select('is_public')
			.eq('slug', params.slug)
			.eq('user_id', user.id)
			.single();

		if (!doc) throw error(404, 'Dokumen tidak ditemukan');

		const newStatus = !doc.is_public;

		const { error: dbError } = await supabaseAdmin
			.from('notepad2_docs')
			.update({ is_public: newStatus })
			.eq('slug', params.slug)
			.eq('user_id', user.id);

		if (dbError) throw error(500, 'Gagal mengubah status');

		return { ok: true, isPublic: newStatus };
	}
};
