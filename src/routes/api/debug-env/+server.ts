// src/routes/api/debug-env/+server.ts
import { json } from '@sveltejs/kit';

export async function GET() {
	return json({
		mode: process.env.TRIPAY_MODE,
		key: process.env.TRIPAY_PRIVATE_KEY?.slice(0, 5) + '...'
	});
}
