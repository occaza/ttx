import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase.server';

// Helper to check if user has owner role
async function checkIsOwner(safeGetSession: () => Promise<{ user: any }>) {
	try {
		const { user } = await safeGetSession();
		if (!user) return false;
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();
		return profile?.role === 'owner';
	} catch {
		return false;
	}
}

// GET /api/panic-solutions?sensor=mic1 OR ?admin=true
export const GET: RequestHandler = async ({ url, locals }) => {
	const sensor = url.searchParams.get('sensor');
	const isAdmin = url.searchParams.get('admin') === 'true';

	if (isAdmin) {
		const isOwner = await checkIsOwner(locals.safeGetSession);
		if (!isOwner) {
			return json({ error: 'Unauthorized: Hanya owner yang dapat mengakses draft solutions.' }, { status: 403 });
		}

		const { data, error } = await supabaseAdmin
			.from('panic_solutions')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}
		return json({ solutions: data || [], isOwner: true });
	}

	let query = supabaseAdmin
		.from('panic_solutions')
		.select('id, sensor_code, component, solution_text, author_name, created_at')
		.eq('status', 'approved')
		.order('created_at', { ascending: false });

	if (sensor) {
		query = query.eq('sensor_code', sensor.toLowerCase());
	}

	const { data, error } = await query;
	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ solutions: data || [] });
};

// POST /api/panic-solutions - Submit new draft solution
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { sensor_code, component, solution_text, author_name } = body;

		if (!sensor_code || !solution_text?.trim()) {
			return json(
				{ error: 'Kode sensor dan penjelasan solusi wajib diisi.' },
				{ status: 400 }
			);
		}

		const cleanSensor = String(sensor_code).trim().toLowerCase();
		const cleanComp = String(component || 'Komponen Terkait').trim();
		const cleanSol = String(solution_text).trim();
		const cleanAuthor = String(author_name || 'Anonim (Teknisi)').trim();

		const { data, error } = await supabaseAdmin
			.from('panic_solutions')
			.insert({
				sensor_code: cleanSensor,
				component: cleanComp,
				solution_text: cleanSol,
				author_name: cleanAuthor,
				status: 'pending' // always pending for validation
			})
			.select()
			.single();

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({
			success: true,
			message: 'Solusi berhasil dikirim ke antrean draft. Menunggu peninjauan oleh owner.',
			data
		});
	} catch (err: any) {
		return json({ error: err?.message || 'Gagal memproses data.' }, { status: 500 });
	}
};

// PATCH /api/panic-solutions - Owner approves or rejects solution
export const PATCH: RequestHandler = async ({ request, locals }) => {
	const isOwner = await checkIsOwner(locals.safeGetSession);
	if (!isOwner) {
		return json({ error: 'Unauthorized: Hanya owner yang dapat memvalidasi solusi.' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { id, status, solution_text, notes } = body;

		if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
			return json({ error: 'Parameter tidak valid.' }, { status: 400 });
		}

		const updatePayload: Record<string, any> = {
			status,
			updated_at: new Date().toISOString()
		};
		if (solution_text) updatePayload.solution_text = solution_text.trim();
		if (notes !== undefined) updatePayload.notes = notes;

		const { data, error } = await supabaseAdmin
			.from('panic_solutions')
			.update(updatePayload)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ success: true, data });
	} catch (err: any) {
		return json({ error: err?.message || 'Gagal memvalidasi solusi.' }, { status: 500 });
	}
};

// DELETE /api/panic-solutions - Owner deletes solution
export const DELETE: RequestHandler = async ({ request, locals }) => {
	const isOwner = await checkIsOwner(locals.safeGetSession);
	if (!isOwner) {
		return json({ error: 'Unauthorized: Hanya owner yang dapat menghapus data.' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { id } = body;
		if (!id) return json({ error: 'ID wajib diisi.' }, { status: 400 });

		const { error } = await supabaseAdmin
			.from('panic_solutions')
			.delete()
			.eq('id', id);

		if (error) return json({ error: error.message }, { status: 500 });
		return json({ success: true });
	} catch (err: any) {
		return json({ error: err?.message || 'Gagal menghapus solusi.' }, { status: 500 });
	}
};
