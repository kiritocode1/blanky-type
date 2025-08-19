
# Blanky Type

A modern, interactive coding challenge and typing practice app built with **Next.js**, **TypeScript**, and **Radix UI**.  
Solve small challenges (e.g. *“Add two numbers”*) with instant execution and validation directly in the browser.

## Demo

- **Production**: _Add your deployment URL here  
- **Preview (Vercel)**: Automatically generated on PRs

## 🛠️ Tech Stack

- **Next.js 14+** (App Router)  
- **TypeScript**  
- **Tailwind CSS** (with PostCSS) + Radix UI  
- **ESLint** (Next + TS rules)  

## Requirements

- Node.js 18+ (20 recommended)  
- npm / pnpm / yarn

## Features

- 🧩 Coding challenges with instant browser feedback  
- ⌨️ Typing practice with speed tracking  
- 🎨 Accessible, themeable UI (Radix + Tailwind)  
- 📊 Progress charts and stats  
- 🔒 Security best practices (security headers, `robots.txt`)

## Getting Started

Install dependencies:

```bash
pnpm install
# or
npm ci
```

Run the development server:

```bash
pnpm dev
# or
npm run dev
```

Build for production:

```bash
pnpm build
pnpm start
```

Open http://localhost:3000 in your browser.

## 📂 Project Structure

- `src/app/` – Next.js App Router (pages, layouts, styles)
- `src/components/` – UI components (Radix + custom)
- `src/hooks/` – Custom React hooks
- `src/lib/` – Utilities and helpers
- `public/` – Static assets (images, sounds, robots.txt)

## 🔒 Security and SEO

- **Security headers** via `next.config.ts`:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (restricts unused APIs)
- **robots.txt** (in `public/`) allows indexing.
Add `Sitemap:` when available for better SEO.

## 📜 Scripts

Package scripts available:

```bash
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc -p tsconfig.json --noEmit"
}
```

Run with `pnpm <script>` or `npm run <script>`

## 🤝 Contributing

1. Create a branch:

```bash
git checkout -b feat/feature-name
```

2. Make your changes and run:

```bash
npm run lint && npm run typecheck
```

3. Push your branch:

```bash
git push origin feat/feature-name
```

4. Open a Pull Request 🎉

## License

MIT © kiritocode1

---

> Improve your typing and coding skills with Blanky Type!
