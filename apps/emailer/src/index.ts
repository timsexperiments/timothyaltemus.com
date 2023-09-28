import { emailTypes, sendEmail } from '@timsexperiments/email-templates';
import { email, enumType, flatten, minLength, object, optional, safeParse, string } from 'valibot';

export interface Env {
	NEWS_LETTER_KV: KVNamespace;
	FROM: string;
	VALID_API_KEY: string;
	RESEND_API_KEY: string;
}

const requestBodySchema = object({
	email: string('Email is required.', [
		minLength(1, 'Email must not be empty.'),
		email('Email must be a valid email.'),
	]),
	template: enumType(emailTypes, 'Template must be a supported template.'),
	subject: optional(string([minLength(1, 'Subject must not be empty when present.')])),
});

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response(
				JSON.stringify(`Method Not Allowed: ${request.method} is not a valid method for this endpoint.`),
				{
					status: 405,
					headers: new Headers({ 'content-type': 'application/json' }),
				},
			);
		}

		const apiKey = request.headers.get('x-api-key');
		if (!apiKey) {
			return new Response(
				JSON.stringify({ message: 'Unauthenticated: no authentication was provided to the endpoint.' }),
				{
					status: 401,
					headers: new Headers({
						'content-type': 'application/json',
					}),
				},
			);
		}

		if (apiKey !== env.VALID_API_KEY) {
			return new Response(JSON.stringify({ message: 'Unauthorized: the provided api key is invalid.' }), {
				status: 403,
				headers: new Headers({
					'content-type': 'application/json',
				}),
			});
		}

		let json: unknown;
		try {
			json = await request.json();
		} catch (e) {
			console.error(e);
			return new Response(JSON.stringify({ message: 'Unsupported Media Type: the request body must be valid json.' }), {
				status: 415,
				headers: new Headers({ 'content-type': 'application/json' }),
			});
		}
		const parsed = safeParse(requestBodySchema, json);
		if (!parsed.success && parsed.success === false) {
			const errors = flatten(parsed.issues);
			for (const field in errors.nested) {
				const fieldErrors = errors.nested[field];
				if (fieldErrors && fieldErrors.length) {
					return new Response(JSON.stringify({ message: `Invalid Argument: ${fieldErrors[0]}` }), {
						status: 400,
						headers: new Headers({ 'content-type': 'application/json' }),
					});
				}
			}
		}

		if (!parsed.success) {
			return new Response(JSON.stringify('Unknown Error: unable to parse request body.'), {
				status: 500,
				headers: new Headers({ 'content-type': 'application/json' }),
			});
		}
		const { email, template, subject } = parsed.output;

		try {
			sendEmail({
				to: email,
				from: env.FROM,
				template: template,
				args: [email],
				apiKey: env.RESEND_API_KEY,
				subject,
			});
		} catch (e) {
			console.error(e);
			return new Response(JSON.stringify({ message: 'Unknown Error: unable to send email. Please try again later.' }), {
				status: 500,
				headers: new Headers({ 'content-type': 'application/json' }),
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	},
};
