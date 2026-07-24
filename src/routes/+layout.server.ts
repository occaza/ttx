import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, locals: { safeGetSession, supabase } }) => {
	depends('supabase:auth');
	const { session, user } = await safeGetSession();

	let profile = null;
	if (user) {
		const { data: profileData } = await supabase
			.from('profiles')
			.select('first_name, last_name, username, email, phone, role, tier')
			.eq('id', user.id)
			.single();
		
		profile = profileData;
	}

	return {
		session,
		user,
		profile
	};
};
