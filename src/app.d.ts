declare global {
	namespace App {
		interface Locals {
			user: any;
		}
	}
}

declare namespace NodeJS {
	interface ProcessEnv {
		TRIPAY_API_KEY: string;
		TRIPAY_PRIVATE_KEY: string;
		TRIPAY_MERCHANT_CODE: string;
		TRIPAY_MODE: string;
		SUPABASE_URL: string;
		SUPABASE_SERVICE_KEY: string;
		NOTEPAD_ENCRYPTION_KEY: string;
	}
}

export {};
