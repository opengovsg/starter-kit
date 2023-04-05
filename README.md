# Starter Kit v2

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopengovsg%2Fstarter-kit-v2%2Ftree%2Fdevelop-ian&env=DATABASE_URL,POSTMAN_API_KEY,SESSION_SECRET&integration-ids=oac_h3yNIuHlhe4j9QVzVJ3TS2W0&skippable-integrations=1)

## Features

- 🧙‍♂️ E2E typesafety with [tRPC](https://trpc.io)
- ⚡ Full-stack React with Next.js
- 🌈 Database with Prisma
- 🪳 [CockroachDB](https://www.cockroachlabs.com/lp/serverless/)
- 🌇 Image upload with [R2](https://developers.cloudflare.com/r2/)
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
- 💚 CI setup using GitHub Actions:
  - ✅ E2E testing with [Playwright](https://playwright.dev/)
  - ✅ Linting
- 🔐 Env var validation

## Running the app locally

### Install dependencies

```bash
npm i
```

### Set environment variables

```bash
cp .env.example .env
```

Set `POSTMAN_API_KEY` - required for login

### Start database

```bash
npm run setup
```

### Start server

```bash
npm run dev
```

## Deployment

> TODO: CI/CD test with GitHub Actions

> TODO: Github branch protection rules

# Cloud Features

### Enable image uploads on R2

See [R2 Readme](docs/r2/README.md)

### Creating Serverless Cockroach DB on Cloud

See [CockroachDB Readme](docs/cockroach/README.md)

# Useful notes

## Commands

```bash
npm run build      # runs `prisma generate` + `prisma migrate` + `next build`
npm run db:reset   # resets local db
npm run dev        # starts next.js
npm run setup      # starts cockroach db + runs migrations + seed
npm run test-dev   # runs e2e tests on dev
npm run test-start # runs e2e tests on `next start` - build required before
npm run test:unit  # runs normal Vitest unit tests
npm run test:e2e   # runs e2e tests
```

## Files of note

<table>
  <thead>
    <tr>
      <th>Path</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="./prisma/schema.prisma"><code>./prisma/schema.prisma</code></a></td>
      <td>Prisma schema</td>
    </tr>
    <tr>
      <td><a href="./src/pages/api/trpc/[trpc].ts"><code>./src/pages/api/trpc/[trpc].ts</code></a></td>
      <td>tRPC response handler</td>
    </tr>
    <tr>
      <td><a href="./src/server/routers"><code>./src/server/routers</code></a></td>
      <td>Your app's different tRPC-routers</td>
    </tr>
  </tbody>
</table>

---
