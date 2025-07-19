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

### Environment variables

Configure these variables in **Site settings → Environment variables** so the app can connect to Supabase and run edge functions:

- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon public key
- `SUPABASE_URL` – same as `VITE_SUPABASE_URL` for edge functions
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for edge functions

For local development, copy `.env.example` to `.env` inside
`zenzalife-scheduler` and add your credentials. Netlify automatically exposes
variables prefixed with `VITE_` to the build. The variables without the prefix
are read by Supabase Edge Functions.

