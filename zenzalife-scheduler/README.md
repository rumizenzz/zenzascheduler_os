# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Deploying to Netlify

1. Push this repository to GitHub or another Git provider.
2. Sign in to [Netlify](https://www.netlify.com/) and choose **New site from Git**.
3. Select this repository and configure the following build settings:
   - **Base directory**: `zenzalife-scheduler`
   - **Build command**: `pnpm run build`
   - **Publish directory**: `dist`
4. Click **Deploy site** and wait for the build to complete.
5. After deployment, Netlify provides a public URL which can be customized in the site settings.
6. Netlify reads the `netlify.toml` in the repo root which sets the same build options and includes a redirect rule for single-page app routing.

### Environment variables

Configure these variables in **Site settings → Environment variables** so the app can connect to Supabase and run edge functions:

- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon public key
- `SUPABASE_URL` – same as `VITE_SUPABASE_URL` for edge functions
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for edge functions

Additional variables for IONOS mail configuration:

- `COMPANY_ADDRESS` – physical company address for email footers
- `COMPANY_CONTACT_EMAIL` – contact address for subscribers
- `IMAP_HOST` – IMAP server hostname
- `IMAP_PASS` – IMAP account password
- `IMAP_PORT` – IMAP server port
- `IMAP_USER` – IMAP account username
- `IONOS_PASS` – SMTP account password
- `IONOS_USER` – SMTP account username
- `LIST_UNSUBSCRIBE_EMAIL` – email for `List-Unsubscribe` header
- `LIST_UNSUBSCRIBE_URL` – URL for unsubscribe link
- `MAIL_FROM_EMAIL` – default from email address
- `MAIL_FROM_NAME` – from display name
- `MAIL_REPLY_TO` – reply-to address
- `SMTP_HOST` – SMTP server hostname
- `SMTP_PASS` – SMTP server password
- `SMTP_PORT` – SMTP server port
- `SMTP_USER` – SMTP server username
- `SUPABASE_ANON_KEY` – Supabase anon key for server code
- `SUPABASE_SERVICE_KEY` – service key for database access
- `SUPABASE_TABLE` – table storing subscribers, set to `mailing_list`
- `UNSUBSCRIBE_WARNING_TEXT` – message shown near unsubscribe options


For local development, copy `.env.example` to `.env` inside
`zenzalife-scheduler` and add your credentials. Netlify automatically exposes
variables prefixed with `VITE_` to the build. The variables without the prefix
are read by Supabase Edge Functions.
Define these variables in the Netlify site settings so they are available during
the build. Avoid setting them in `netlify.toml` because empty placeholder values
would override the real credentials.

