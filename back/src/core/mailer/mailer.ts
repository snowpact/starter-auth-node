import { createTransport } from 'nodemailer';
import { buildConfig } from './config';

export interface IMailerSendOptions {
  to: string;
  html: string;
  subject: string;
}

export type MailerFunction = (options: IMailerSendOptions) => Promise<void>;

export const connectAndSendEmail: MailerFunction = async (
  options: IMailerSendOptions,
): Promise<void> => {
  const config = buildConfig();

  const transporter = createTransport({
    host: config.SMTP_ENDPOINT,
    port: config.SMTP_PORT,
    secure: false,
    auth: {
      user: config.SMTP_USERNAME,
      pass: config.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: config.FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};
