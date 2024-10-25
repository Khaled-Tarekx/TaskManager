import { supabase } from '../modules/auth/supabase';
import { Session } from '@supabase/supabase-js';
import { test as baseTest } from 'vitest';
interface Fixtures {
	user: Session;
}

const user = {
	email: 'z-vxif_otn@yahoo.com',
	password: '0123456',
};

const test = baseTest.extend<Fixtures>({
	user: async ({}, use) => {
		const session = await supabase.auth.getSession();
		const sessionData = session.data.session;
		if (!sessionData || !sessionData.access_token) {
			const LoggedInUser = await supabase.auth.signInWithPassword({
				email: user.email,
				password: user.password,
			});
			await use(LoggedInUser.data.session!);
		}

		await use(sessionData!);
	},
});

export { test };
