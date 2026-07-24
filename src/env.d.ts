/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_RECAPTCHA_SITE_KEY: string;
  readonly RECAPTCHA_SECRET_KEY: string | undefined;
  readonly SMTP_HOST: string;
  readonly SMTP_PORT: string;
  readonly SMTP_SECURE: string;
  readonly SMTP_USER: string;
  readonly SMTP_PASS: string;
  readonly FORM_RECIPIENT_EMAIL: string | undefined;

  readonly DATABASE_URL: string | undefined;
  readonly DB_HOST: string | undefined;
  readonly DB_PORT: string | undefined;
  readonly DB_USER: string | undefined;
  readonly DB_PASSWORD: string | undefined;
  readonly DB_NAME: string | undefined;

  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly AUTH_SECRET: string;
  readonly AUTH_TRUST_HOST: string;
  readonly ADMIN_EMAILS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
