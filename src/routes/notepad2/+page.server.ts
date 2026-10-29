import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase.server';
import type { PageServerLoad } from './$types';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(302, '/login');
	}

	// Ambil doc terakhir yang diedit
	const { data: lastDoc } = await supabaseAdmin
		.from('notepad2_docs')
		.select('id, slug')
		.eq('user_id', user.id)
		.order('updated_at', { ascending: false })
		.limit(1)
		.single();

	if (lastDoc?.slug) {
		throw redirect(302, `/notepad2/${lastDoc.slug}`);
	}

	// Buat doc pertama jika belum ada
	const slug = crypto.randomBytes(6).toString('hex');
	const { data: newDoc, error } = await supabaseAdmin
		.from('notepad2_docs')
		.insert({
			user_id: user.id,
			title: 'Untitled',
			content: '',
			slug: slug
		})
		.select('slug')
		.single();

	if (error || !newDoc) {
		console.error("DB Insert Error:", error);
		throw new Error(error?.message || "Failed to create document");
	}

	throw redirect(302, `/notepad2/${newDoc.slug}`);
};
