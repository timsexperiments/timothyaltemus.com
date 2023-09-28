import { subscriptionEmail } from "./subscription";
import { GeneratedEmail } from "./types";

export const emailTypes = ["SUBSCRIPTION"] as const;
export type EmailTemplate = (typeof emailTypes)[number];
export const emailTemplates = {
  SUBSCRIPTION: subscriptionEmail,
} as const;

type EmailTemplates = typeof emailTemplates;
type SendEmailOptionsBase<T extends EmailTemplate> = {
  [Key in keyof EmailTemplates]: EmailTemplates[Key] extends (
    ...args: infer Args
  ) => GeneratedEmail
    ? {
        template: Key;
        args: Args;
      }
    : never;
}[EmailTemplate];

export interface SendEmailOptions<T extends EmailTemplate>
  extends SendEmailOptionsBase<T> {
  to: string;
  from: string;
  subject?: string;
  apiKey?: string;
}

export const sendEmail = async <T extends EmailTemplate>({
  to,
  from,
  template,
  subject,
  args,
  apiKey = process?.env?.RESEND_KEY,
}: SendEmailOptions<T>): Promise<void> => {
  const generator = emailTemplates[template];
  const { html, subject: defaultSubject, text } = generator(...args);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey ?? ""}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: subject ?? defaultSubject,
      html,
      text,
    }),
  });
};
