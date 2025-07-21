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

Configure these variables in **Site settings → Environment variables** so the app can connect to Supabase, send confirmation emails and manage the mailing list:

- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon public key
- `SUPABASE_URL` – same as `VITE_SUPABASE_URL` for Netlify functions
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for Netlify functions
- `SUPABASE_TABLE` – table storing mailing list emails (e.g. `mailing_list`)
- `COMPANY_ADDRESS` – physical business address for CAN-SPAM compliance
- `COMPANY_CONTACT_EMAIL` – contact email shown in footers
- `SMTP_HOST` – SMTP host (e.g. `smtp.ionos.com`)
- `SMTP_PORT` – SMTP port, typically `465`
- `SMTP_USER` – SMTP username
- `SMTP_PASS` – SMTP password
- `MAIL_FROM_EMAIL` – from address for outgoing mail
- `MAIL_FROM_NAME` – name shown on outgoing mail
- `MAIL_REPLY_TO` – reply-to address
- `LIST_UNSUBSCRIBE_EMAIL` – email used in `List-Unsubscribe` header
- `LIST_UNSUBSCRIBE_URL` – URL used in `List-Unsubscribe` header
- `IMAP_HOST` – IMAP host for monitoring bounces (optional)
- `IMAP_PORT` – IMAP port, typically `993`
- `IMAP_USER` – IMAP username
- `IMAP_PASS` – IMAP password
- `UNSUBSCRIBE_WARNING_TEXT` – text displayed on the unsubscribe page

Legacy variables `IONOS_HOST`, `IONOS_PORT`, `IONOS_USER`, and `IONOS_PASS` are supported for compatibility but `SMTP_*` variables are preferred.

### Mailing list table

Create the table referenced by `SUPABASE_TABLE` inside your Supabase project:

```sql
create table if not exists mailing_list (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  unsubscribed boolean default false,
  created_at timestamp with time zone default now()
);
```

After running the SQL above in the Supabase SQL editor, add `SUPABASE_TABLE=mailing_list` to your Netlify environment variables.

Whenever a user signs up, the confirmation email Netlify function automatically adds their address to this table so you can manage subscriptions centrally.

For local development, copy `.env.example` to `.env` inside
`zenzalife-scheduler` and add your credentials. Netlify automatically exposes
variables prefixed with `VITE_` to the build. The variables without the prefix
are read by Netlify Functions.
Define these variables in the Netlify site settings so they are available during
the build. Avoid setting them in `netlify.toml` because empty placeholder values
would override the real credentials.

### Email confirmation flow

When a new account is created the app calls the `send-confirmation-email` Netlify
function. This function checks for disposable domains, saves the address in the
`mailing_list` table and sends an email through your IONOS SMTP credentials. The
message includes a Supabase signup link that redirects to `/confirmed` once the
user verifies their address. The `/confirmed` page thanks them and instructs them
to return to the application.

Users can opt out at any time by visiting `/unsubscribe`, which marks the
`unsubscribed` column in the mailing list. If they try to unsubscribe with an
unknown address, the page shows a dreamy warning.

