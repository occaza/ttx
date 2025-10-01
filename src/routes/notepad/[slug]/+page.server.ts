import { error } from '@sveltejs/kit';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'data/notepad';
function path(slug: string) {
	return join(DIR, `${slug}.json`);
}

export async function load({ params }) {
	const slug = params.slug;

	if (!/^[a-z0-9]{12}$/.test(slug)) {
		throw error(400, 'Slug harus 12 karakter alfanumerik');
	}

	if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
	const file = path(slug);
	let text = '';
	if (existsSync(file)) {
		try {
			text = JSON.parse(readFileSync(file, 'utf-8')).text;
		} catch {}
	}
	return { slug, text };
}

export const actions = {
	save: async ({ request, params }) => {
		const slug = params.slug;

		if (!/^[a-z0-9]{12}$/.test(slug)) {
			throw error(400, 'Slug harus 12 karakter alfanumerik');
		}

		const data = await request.formData();
		const text = (data.get('text') || '').toString();
		writeFileSync(path(slug), JSON.stringify({ text }, null, 2));
		return { ok: true };
	}
};
