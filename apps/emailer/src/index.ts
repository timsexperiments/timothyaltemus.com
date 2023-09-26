export interface Env {
	NEWS_LETTER_KV: KVNamespace;
	NO_REPLY_SENDER: SendEmail;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response();
	},
};
