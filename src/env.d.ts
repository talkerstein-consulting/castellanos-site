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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
