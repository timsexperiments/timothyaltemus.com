export type GeneratedEmail = {
  html: string;
  subject: string;
  text: string;
};

export type EmailTemplateGenerator = (args: any) => GeneratedEmail;
