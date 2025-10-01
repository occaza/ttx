import { error, fail } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase.server';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

async function verifyTurnstile(token: string, ip: string) {
	const formData = new FormData();
	formData.append('secret', TURNSTILE_SECRET_KEY);
	formData.append('response', token);
	formData.append('remoteip', ip);

	const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: formData
	});

	const outcome = await result.json();
	return outcome.success;
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

	return {
		slug,
		text: data?.text || '',
		updatedAt: data?.updated_at || null,
		turnstileSiteKey: PUBLIC_TURNSTILE_SITE_KEY
	};
}

export const actions = {
	save: async ({ request, params, getClientAddress }) => {
		const slug = params.slug;

		if (!/^[a-z0-9]{12}$/.test(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const formData = await request.formData();
		const text = (formData.get('text') || '').toString();
		const turnstileToken = formData.get('cf-turnstile-response')?.toString();

		// Verifikasi Turnstile
		if (!turnstileToken) {
			return fail(400, { error: 'Captcha tidak valid. Refresh halaman dan coba lagi.' });
		}

		const ip = getClientAddress();
		const isValid = await verifyTurnstile(turnstileToken, ip);

		if (!isValid) {
			return fail(400, { error: 'Captcha gagal diverifikasi. Coba lagi.' });
		}

		// Save ke database
		await supabase.from('notepad').upsert({ slug, text, updated_at: new Date().toISOString() });

		return { ok: true };
	}
};
