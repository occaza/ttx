<script lang="ts">
	// Mendefinisikan tipe data untuk form
	interface FormData {
		uid: string;
		password: string;
		cookies: string;
	}

	// Variabel reaktif untuk menyimpan nilai input
	let uid: string = '';
	let password: string = '';
	let cookies: string = '';

	// Variabel state untuk mengontrol visibilitas toast
	let showToast: boolean = false;

	// Fungsi untuk menangani submit form
	function handleSubmit(event: Event) {
		event.preventDefault();

		const data: FormData = {
			uid,
			password,
			cookies
		};

		console.log('Form submitted with data:', data);
		showToast = true;

		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	function hideToast() {
		showToast = false;
	}
</script>

<main class="mx-auto max-w-5xl space-y-3 bg-base-200 p-6 shadow-lg lg:rounded-2xl">
	<section class="card bg-base-100 shadow-xl" aria-labelledby="form-heading">
		<div class="card-body">
			<h2 id="form-heading" class="mb-4 card-title justify-center text-2xl font-bold">
				Input Form
			</h2>

			<form on:submit={handleSubmit}>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control mb-4">
						<label for="uid-input" class="label">
							<span class="label-text">UID</span>
						</label>
						<input
							id="uid-input"
							type="text"
							placeholder="Masukkan UID"
							class="input-bordered input w-full"
							bind:value={uid}
							required
						/>
					</div>

					<div class="form-control mb-4">
						<label for="password-input" class="label">
							<span class="label-text">Password</span>
						</label>
						<input
							id="password-input"
							type="password"
							placeholder="Masukkan Password"
							class="input-bordered input w-full"
							bind:value={password}
							required
						/>
					</div>
				</div>

				<div class="form-control mb-6">
					<label for="cookies-textarea" class="label">
						<span class="label-text">Cookies</span>
					</label>
					<textarea
						id="cookies-textarea"
						class="textarea-bordered textarea h-36 w-full resize-none"
						placeholder="Masukkan Cookies"
						bind:value={cookies}
						required
					></textarea>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn w-full btn-primary">Submit</button>
				</div>
			</form>
		</div>
	</section>

	{#if showToast}
		<aside class="toast">
			<div class="alert alert-success shadow-lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 flex-shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>Akun berhasil disimpan!</span>
				<button
					on:click={hideToast}
					class="btn text-white btn-ghost btn-sm"
					aria-label="Tutup notifikasi"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/></svg
					>
				</button>
			</div>
		</aside>
	{/if}
</main>
