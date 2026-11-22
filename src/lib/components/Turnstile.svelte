<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dev } from '$app/environment';
	import { browser } from '$app/environment';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

	interface Props {
		action?: string;
		theme?: 'light' | 'dark' | 'auto';
		size?: 'normal' | 'compact' | 'flexible';
		onSuccess?: (token: string) => void;
		onError?: (error?: any) => void;
		onExpire?: () => void;
	}

	let {
		action = 'submit',
		theme = 'auto',
		size = 'normal',
		onSuccess,
		onError,
		onExpire
	}: Props = $props();

	// Jika mode dev/local, gunakan Cloudflare Dummy Site Key yang SELALU PASS tanpa interaksi
	const siteKey = dev ? '1x00000000000000000000AA' : PUBLIC_TURNSTILE_SITE_KEY;

	let container: HTMLDivElement | undefined = $state();
	let widgetId: string | undefined = $state();

	export function reset() {
		if (browser && (window as any).turnstile && widgetId !== undefined) {
			(window as any).turnstile.reset(widgetId);
		}
	}

	onMount(() => {
		if (!browser) return;

		const renderWidget = () => {
			if (!container || !(window as any).turnstile) return;
			// Bersihkan render lama jika ada
			if (widgetId !== undefined) {
				try {
					(window as any).turnstile.remove(widgetId);
				} catch {}
			}

			try {
				widgetId = (window as any).turnstile.render(container, {
					sitekey: siteKey,
					action,
					theme,
					size,
					callback: (token: string) => {
						onSuccess?.(token);
					},
					'error-callback': (err: any) => {
						onError?.(err);
					},
					'expired-callback': () => {
						onExpire?.();
					}
				});
			} catch (err) {
				console.error('Turnstile render error:', err);
			}
		};

		if ((window as any).turnstile) {
			renderWidget();
		} else {
			const callbackName = `onloadTurnstileCallback_${Math.random().toString(36).substring(2, 9)}`;
			(window as any)[callbackName] = () => {
				renderWidget();
				delete (window as any)[callbackName];
			};

			if (!document.querySelector('script[src*="turnstile/v0/api.js"]')) {
				const script = document.createElement('script');
				script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${callbackName}&render=explicit`;
				script.async = true;
				script.defer = true;
				document.head.appendChild(script);
			} else {
				// Script sudah ada tapi belum loaded, poll sebentar
				const checkInterval = setInterval(() => {
					if ((window as any).turnstile) {
						clearInterval(checkInterval);
						renderWidget();
					}
				}, 100);
			}
		}

		return () => {
			if ((window as any).turnstile && widgetId !== undefined) {
				try {
					(window as any).turnstile.remove(widgetId);
				} catch {}
			}
		};
	});
</script>

<div class="turnstile-wrapper my-2 flex justify-center">
	<div bind:this={container}></div>
</div>
