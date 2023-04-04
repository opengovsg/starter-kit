# Prisma + tRPC

## Features

- 🧙‍♂️ E2E typesafety with [tRPC](https://trpc.io)
- ⚡ Full-stack React with Next.js
- ⚡ Database with Prisma
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
- 💚 CI setup using GitHub Actions:
  - ✅ E2E testing with [Playwright](https://playwright.dev/)
  - ✅ Linting
- 🔐 Validates your env vars on build and start

## Setup

### Install dependencies

```bash
npm i
```

### Create a database

- [Create a neon.tech project](https://neon.tech/docs/get-started-with-neon/setting-up-a-project)
- Create two databases, one `app` and one `shadow` database to use with Prisma. As the name suggests, the `shadow` database is used to run migrations in a safe environment before applying them to the `app` database, and is recommended for Prisma migrations (`npx prisma migrate`) to work reliably.
  - View how to [use Prisma with Neon](https://neon.tech/docs/guides/prisma-guide) for more information.
- Set up the environment variables:

```bash
cp .env.example .env
```

- Open `.env` and set the `DATABASE_URL` variable with the connection string from neon.tech.
- Create the database schema:

```bash
npx prisma db push
```

### Configure authentication

GitHub authentication settings are available as defaults, but thanks to NextAuth.js, you can configure this app with most other common authentication providers.

- [Configuring GitHub authentication](docs/github_setup.md)

The auth implementation in this application uses [NextAuth.js](https://next-auth.js.org/), so if you prefer to use one of the [many providers](https://next-auth.js.org/providers/) it supports, you can customize your own installation. Simply update the [`lib/auth.ts`](src/lib/auth.ts#L11) file to add your own provider.

> TODO: Add implementation and docs for custom email auth and SGID login.

### Enable image uploads on R2

See [R2 Readme](docs/r2_setup.md) for instructions.

### Configure Slack notifications

> TODO: Implement and documentation, mostly to show webhooks usage.

WIP [instructions](docs/slack_setup.md).

### Requirements

- Node >= 14
- Postgres

## Running the app locally

### Start project

```bash
npm run dx
```

### Commands

```bash
npm run build      # runs `prisma generate` + `prisma migrate` + `next build`
npm run db-reset   # resets local db
npm run dev        # starts next.js
npm run dx         # starts postgres db + runs migrations + seeds + starts next.js
npm run test-dev   # runs e2e tests on dev
npm run test-start # runs e2e tests on `next start` - build required before
npm run test:unit  # runs normal Vitest unit tests
npm run test:e2e   # runs e2e tests
```

## Deployment

### Deploying to Vercel

One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopengovsg%2Fstarter-kit-v2-kr&env=SHADOW_DATABASE_URL,DATABASE_URL,GITHUB_ID,GITHUB_SECRET,NEXTAUTH_SECRET,CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET)

⚠️ Remember to update your callback URLs after deploying.

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
