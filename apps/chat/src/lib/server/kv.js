import {
  createChat,
  createChatMembers,
  deserializeChat,
  deserializeChatMembers,
} from 'chat-messages';

const MEMBERS_KEY = 'members';
const CHAT_KEY = 'chat';

/**
 * Gets the list of existing users that are online.
 *
 * @param {KVNamespace} chatKv the kv for the chat application.
 * @returns {Promise<import("chat-messages").ChatMembers>} the members of the chat.
 */
export async function getMembers(chatKv) {
  const membersRaw = await chatKv.get(MEMBERS_KEY);
  if (!membersRaw) {
    console.log('No members were found in the store.');
    return createChatMembers({ onlineUsers: [] });
  }
  return deserializeChatMembers(membersRaw);
}

/**
 * Gets the state of the chat.
 *
 * @param {KVNamespace} chatKv the kv for the chat application.
 * @returns {Promise<import('chat-messages').Chat>} the state of the chat application.
 */
export async function getChat(chatKv) {
  const chatRaw = await chatKv.get(CHAT_KEY);
  if (!chatRaw) {
    console.log('No messages were found in the store.');
    return createChat({ messages: [] });
  }
  return deserializeChat(chatRaw);
}
