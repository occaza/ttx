<script>
	let formData = {
		username: '',
		email: '',
		password: '',
		confirmPassword: ''
	};

	function handleSubmit() {
		// Handle form submission here
		console.log('Form submitted:', formData);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="mb-4 card-title justify-center">Register</h2>
			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						type="text"
						id="username"
						bind:value={formData.username}
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						type="password"
						id="password"
						bind:value={formData.password}
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="confirmPassword">
						<span class="label-text">Confirm Password</span>
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={formData.confirmPassword}
						class="input-bordered input"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button class="btn btn-primary">Register</button>
				</div>
			</form>
		</div>
	</div>
</div>
