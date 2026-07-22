<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { LogIn, ArrowLeft } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let oauthLoading = $state(false);

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	async function handleOAuthLogin(provider: 'google') {
		oauthLoading = true;
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});
		if (error) {
			errorMsg = error.message;
			oauthLoading = false;
		}
	}

	async function handleLogin() {
		if (!email || !password) {
			errorMsg = 'Email dan password harus diisi';
			return;
		}

		loading = true;
		errorMsg = '';

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			errorMsg = error.message;
			loading = false;
		} else {
			goto('/dashboard');
		}
	}
</script>

<div
	class="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-base-200/30 px-4 sm:px-6"
>
	<!-- Back to Home Button -->
	<div class="absolute inset-x-0 top-6 mx-auto w-full max-w-7xl px-4 md:px-8 z-10">
		<a 
			href="/" 
			class="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content w-fit -ml-3"
		>
			<ArrowLeft size={16} />
			<span class="hidden sm:inline">Kembali ke Beranda</span>
		</a>
	</div>
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-base-content">Masuk ke akun Anda</h2>
			<p class="mt-2 text-sm text-base-content/60">
				Belum punya akun? <a href="/register" class="font-medium text-primary hover:underline"
					>Daftar sekarang</a
				>
			</p>
		</div>

		<div class="rounded-2xl bg-base-100 p-8 shadow-sm ring-1 ring-base-content/5">
			{#if errorMsg}
				<div class="mb-4 alert alert-error py-2 text-sm">
					<span>{errorMsg}</span>
				</div>
			{/if}

			<form onsubmit={handleLogin} class="space-y-4">
				<fieldset class="fieldset">
					<label class="fieldset-label font-medium" for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="nama@email.com"
						class="input w-full bg-base-200/50 transition-all focus:bg-base-100 focus:ring-1 focus:ring-primary/50"
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<div class="flex w-full items-center justify-between">
						<label class="fieldset-label font-medium" for="password">Password</label>
						<a href="/forgot-password" class="text-xs font-medium text-primary hover:underline"
							>Lupa password?</a
						>
					</div>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						class="input w-full bg-base-200/50 transition-all focus:bg-base-100 focus:ring-1 focus:ring-primary/50"
						required
					/>
				</fieldset>

				<div class="pt-4">
					<button type="submit" class="btn w-full shadow-sm btn-primary" disabled={loading}>
						{loading ? 'Memproses...' : 'Masuk'}
					</button>
				</div>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-base-content/10"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-base-100 px-2 text-base-content/50">Atau</span>
					</div>
				</div>

				<div class="mt-6 flex justify-center">
					<button
						type="button"
						class="gsi-material-button"
						onclick={() => handleOAuthLogin('google')}
						disabled={oauthLoading}
					>
						<div class="gsi-material-button-state"></div>
						<div class="gsi-material-button-content-wrapper">
							<div class="gsi-material-button-icon">
								{#if oauthLoading}
									<span class="loading loading-sm loading-spinner" style="width:20px;height:20px;"
									></span>
								{:else}
									<svg
										version="1.1"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 48 48"
										style="display: block;"
									>
										<path
											fill="#EA4335"
											d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
										></path>
										<path
											fill="#4285F4"
											d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
										></path>
										<path
											fill="#FBBC05"
											d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
										></path>
										<path
											fill="#34A853"
											d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
										></path>
										<path fill="none" d="M0 0h48v48H0z"></path>
									</svg>
								{/if}
							</div>
							<span class="gsi-material-button-contents">Continue with Google</span>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Official Google Sign-In Button styles */
	.gsi-material-button {
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-appearance: none;
		appearance: none;
		background-color: WHITE;
		background-image: none;
		border: 1px solid #747775;
		-webkit-border-radius: 4px;
		border-radius: 4px;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #1f1f1f;
		cursor: pointer;
		font-family: 'Roboto', arial, sans-serif;
		font-size: 14px;
		height: 40px;
		letter-spacing: 0.25px;
		outline: none;
		overflow: hidden;
		padding: 0 12px;
		position: relative;
		text-align: center;
		-webkit-transition:
			background-color 0.218s,
			border-color 0.218s,
			box-shadow 0.218s;
		transition:
			background-color 0.218s,
			border-color 0.218s,
			box-shadow 0.218s;
		vertical-align: middle;
		white-space: nowrap;
		min-width: min-content;
	}

	.gsi-material-button .gsi-material-button-icon {
		height: 20px;
		margin-right: 12px;
		min-width: 20px;
		width: 20px;
	}

	.gsi-material-button .gsi-material-button-content-wrapper {
		-webkit-align-items: center;
		align-items: center;
		display: flex;
		-webkit-flex-direction: row;
		flex-direction: row;
		-webkit-flex-wrap: nowrap;
		flex-wrap: nowrap;
		height: 100%;
		justify-content: space-between;
		position: relative;
		width: 100%;
	}

	.gsi-material-button .gsi-material-button-contents {
		-webkit-flex-grow: 1;
		flex-grow: 1;
		font-family: 'Roboto', arial, sans-serif;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		vertical-align: top;
	}

	.gsi-material-button .gsi-material-button-state {
		-webkit-transition: opacity 0.218s;
		transition: opacity 0.218s;
		bottom: 0;
		left: 0;
		opacity: 0;
		position: absolute;
		right: 0;
		top: 0;
	}

	.gsi-material-button:disabled {
		cursor: default;
		background-color: #ffffff61;
		border-color: #1f1f1f1f;
	}

	.gsi-material-button:disabled .gsi-material-button-contents {
		opacity: 38%;
	}

	.gsi-material-button:disabled .gsi-material-button-icon {
		opacity: 38%;
	}

	.gsi-material-button:not(:disabled):active .gsi-material-button-state,
	.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
		background-color: #303030;
		opacity: 12%;
	}

	.gsi-material-button:not(:disabled):hover {
		-webkit-box-shadow:
			0 1px 2px 0 rgba(60, 64, 67, 0.3),
			0 1px 3px 1px rgba(60, 64, 67, 0.15);
		box-shadow:
			0 1px 2px 0 rgba(60, 64, 67, 0.3),
			0 1px 3px 1px rgba(60, 64, 67, 0.15);
	}

	.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
		background-color: #303030;
		opacity: 8%;
	}
</style>
