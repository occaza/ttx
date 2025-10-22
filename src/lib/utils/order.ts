export function generateOrderId() {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `INV${timestamp}${random}`;
}
