<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	let uid: string = '';
	let password: string = '';
	let cookies: string = '';
	let showToast: boolean = false;
	let toastMessage: string = '';
	let editMode: string | null = null;
	let deleteModal: HTMLDialogElement;
	let uidToDelete: string = '';

	$: totalCount = data.totalCount || 0;
	$: startIndex = (data.currentPage - 1) * data.limit + 1;
	$: endIndex = Math.min(data.currentPage * data.limit, totalCount);

	$: if (form?.success) {
		uid = '';
		password = '';
		cookies = '';
		editMode = null;
		showToast = true;
		toastMessage = form.message || 'Berhasil!';
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	function hideToast() {
		showToast = false;
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			showToast = true;
			toastMessage = 'Berhasil dicopy!';
			setTimeout(() => {
				showToast = false;
			}, 2000);
		});
	}

	function startEdit(account: any) {
		editMode = account.uid;
		uid = account.uid;
		password = account.pwd;
		cookies = account.cookies || '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancelEdit() {
		editMode = null;
		uid = '';
		password = '';
		cookies = '';
	}

	function openDeleteModal(accountUid: string) {
		uidToDelete = accountUid;
		deleteModal?.showModal();
	}

	function closeDeleteModal() {
		deleteModal?.close();
		uidToDelete = '';
	}

	function handleUidPaste(e: ClipboardEvent) {
		const pastedText = e.clipboardData?.getData('text');
		if (!pastedText) return;

		// Format 1: uid|password|cookies
		if (pastedText.includes('|')) {
			e.preventDefault();
			const parts = pastedText.split('|');

			if (parts.length >= 2) {
				uid = parts[0].trim();
				password = parts[1].trim();
				cookies = parts.length >= 3 ? parts[2].trim() : '';
			}
			return;
		}

		// Format 2: cookies only (extract c_user as uid)
		if (pastedText.includes('c_user=')) {
			e.preventDefault();

			// Extract c_user value
			const cUserMatch = pastedText.match(/c_user=(\d+)/);
			if (cUserMatch) {
				uid = cUserMatch[1];
				password = ''; // Password kosong untuk format cookies
				cookies = pastedText.trim();
			}
		}
	}

	function goToPage(page: number) {
		goto(`?page=${page}&limit=${data.limit}`);
	}

	function changeLimit(newLimit: number) {
		goto(`?page=1&limit=${newLimit}`);
	}
	function resetForm() {
		uid = '';
		password = '';
		cookies = '';
		editMode = null;
	}
</script>

<main class="mx-auto max-w-5xl space-y-3 bg-base-200 p-6 shadow-lg lg:rounded-2xl">
	<section class="card bg-base-100 shadow-xl" aria-labelledby="form-heading">
		<div class="card-body">
			<h2 id="form-heading" class="mb-4 card-title justify-center text-2xl font-bold">
				{editMode ? 'Edit Akun' : 'Send ur account'}
			</h2>

			<form method="POST" action="?/{editMode ? 'update' : 'create'}" use:enhance>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label class="floating-label">
							<span>UID here</span>
							<input
								type="text"
								name="uid"
								placeholder="Paste format: uid|pwd|cookies ATAU cookies saja (c_user akan otomatis diambil)"
								class="input-bordered input w-full"
								bind:value={uid}
								onpaste={handleUidPaste}
								readonly={editMode !== null}
								required
							/>
						</label>
					</div>

					<div class="form-control mb-4">
						<label class="floating-label">
							<span>Password (opsional)</span>
							<input
								type="password"
								name="password"
								autocomplete="current-password"
								placeholder="Password Here"
								class="input-bordered input w-full"
								bind:value={password}
							/>
						</label>
					</div>
				</div>

				<div class="form-control mb-6">
					<label class="floating-label">
						<span>Cookies (opsional)</span>
						<textarea
							name="cookies"
							class="textarea-bordered textarea h-18 w-full resize-none"
							placeholder="Masukkan Cookies (opsional)"
							bind:value={cookies}
						></textarea>
					</label>
				</div>

				<div class="form-control mt-6 flex flex-row gap-2">
					<button type="submit" class="btn flex-1 btn-primary">
						{editMode ? 'Update' : 'Submit'}
					</button>

					<button type="button" class="btn btn-outline" onclick={resetForm}> Reset </button>

					{#if editMode}
						<button type="button" class="btn btn-ghost" onclick={cancelEdit}> Batal </button>
					{/if}
				</div>
			</form>

			{#if form?.message && !form?.success}
				<div class="mt-4 alert alert-error">
					<span>{form.message}</span>
				</div>
			{/if}
		</div>
	</section>

	<section class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="card-title text-xl font-bold">Data Akun Tersimpan</h2>
				<div class="flex items-center gap-2">
					<div>
						<span class="text-sm">Tampilkan:</span>
					</div>
					<div>
						<select
							class="select-bordered select w-20 select-sm"
							value={data.limit}
							onchange={(e) => changeLimit(parseInt(e.currentTarget.value))}
						>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="25">25</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>
				</div>
			</div>

			{#if data.accounts.length === 0}
				<p class="text-gray-500">Belum ada data tersimpan</p>
			{:else}
				<div class="mb-2 text-sm text-gray-600">
					Menampilkan {startIndex} - {endIndex} dari {totalCount} data
				</div>

				<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>UID</th>
								<th>Password</th>
								<th>Cookies</th>
								<th>Tanggal</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each data.accounts as account}
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<span class="truncate">{account.uid}</span>
											<button
												type="button"
												class="btn btn-ghost btn-xs"
												onclick={() => copyToClipboard(account.uid)}
												aria-label="Copy UID"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button>
										</div>
									</td>
									<td>
										<div class="flex items-center gap-2">
											<span class="truncate">••••••••</span>
											<button
												type="button"
												class="btn btn-ghost btn-xs"
												onclick={() => copyToClipboard(account.pwd)}
												aria-label="Copy Password"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button>
										</div>
									</td>
									<td>
										<div class="flex items-center gap-2">
											{#if account.cookies}
												<span class="max-w-xs truncate">{account.cookies}</span>
												<button
													type="button"
													class="btn btn-ghost btn-xs"
													onclick={() => copyToClipboard(account.cookies)}
													aria-label="Copy Cookies"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
														/>
													</svg>
												</button>
											{:else}
												<span class="text-gray-400">-</span>
											{/if}
										</div>
									</td>
									<td>{new Date(account.added_at).toLocaleDateString('id-ID')}</td>
									<td>
										<div class="flex gap-1">
											<button
												type="button"
												class="btn btn-ghost btn-xs"
												onclick={() => startEdit(account)}
												aria-label="Edit akun"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												type="button"
												class="btn text-error btn-ghost btn-xs"
												onclick={() => openDeleteModal(account.uid)}
												aria-label="Hapus akun"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if data.totalPages > 1}
					<div class="mt-4 flex justify-center gap-2">
						<button
							class="btn btn-sm"
							disabled={data.currentPage === 1}
							onclick={() => goToPage(data.currentPage - 1)}
							aria-label="Halaman sebelumnya"
						>
							«
						</button>

						{#each Array(data.totalPages) as _, i}
							{#if i + 1 === 1 || i + 1 === data.totalPages || Math.abs(i + 1 - data.currentPage) <= 1}
								<button
									class="btn btn-sm {data.currentPage === i + 1 ? 'btn-primary' : ''}"
									onclick={() => goToPage(i + 1)}
									aria-label="Halaman {i + 1}"
								>
									{i + 1}
								</button>
							{:else if Math.abs(i + 1 - data.currentPage) === 2}
								<span class="btn-disabled btn btn-sm">...</span>
							{/if}
						{/each}

						<button
							class="btn btn-sm"
							disabled={data.currentPage === data.totalPages}
							onclick={() => goToPage(data.currentPage + 1)}
							aria-label="Halaman selanjutnya"
						>
							»
						</button>
					</div>
				{/if}
			{/if}
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
				<span>{toastMessage}</span>
				<button
					onclick={hideToast}
					class="btn text-white btn-ghost btn-sm"
					aria-label="Tutup notifikasi"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</aside>
	{/if}

	<dialog bind:this={deleteModal} class="modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Konfirmasi Hapus</h3>
			<p class="py-4">Yakin ingin menghapus akun dengan UID: <strong>{uidToDelete}</strong>?</p>
			<p class="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={closeDeleteModal}>Batal</button>
				<form method="POST" action="?/delete" use:enhance onsubmit={closeDeleteModal}>
					<input type="hidden" name="uid" value={uidToDelete} />
					<button type="submit" class="btn btn-error">Hapus</button>
				</form>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</main>
