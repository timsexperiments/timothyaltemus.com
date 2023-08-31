export const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
} as const;

export const CHAT_ROUTE = '/api/ws' as const;
export const MESSAGES_ROUTE = '/api/messages' as const;
export const MEMBERS_ROUTE = '/api/members' as const;

export const CHAT_KV_KEY = 'chat';
export const MEMBERS_KV_KEY = 'members';
