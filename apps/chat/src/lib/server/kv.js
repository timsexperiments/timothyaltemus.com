/**
 * Gets the list of existing users that are online.
 *
 * @param {KVNamespace} chatKv the platfform for the application.
 * @returns {Promise<User[]>} the list of all usernames currently online.
 */
export async function getOnlineUsers(chatKv) {
	return JSON.parse((await chatKv.get('online_users')) ?? '[]').map((/** @type {string} */ user) =>
		JSON.parse(user),
	);
}

/**
 * Sets the list of users that are currently online.
 *
 * @param {KVNamespace} chatKv the platfform for the application.
 * @param {User[]} users the list of users that are online.
 */
export async function saveOnlineUsers(chatKv, users) {
	await chatKv.put('online_users', JSON.stringify(users));
}
