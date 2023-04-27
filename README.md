# Starter Kit

A technical kit to quickly build new products from
[Open Government Products](https://open.gov.sg), Singapore.

<!-- This README is also viewable as a [webpage](https://opengovsg.github.io/starter-kit). -->
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

## Quickstart

Follow these instructions if you are familiar with building applications,
and/or are in a hurry to prepare an environment to work on your product.

If you are new, see our [Getting Started guide](docs/guides/getting-started-1/README.md).

If you are exploring what else you can do with Starter Kit,
a more comprehensive set of documentation, including guides 
and tutorials, can be found [here](docs/README.md).

### One-click deploy

We recommend [Vercel](https://vercel.com) to deploy your application.
A one-click deployment step is provided [below](#deployment), which will
also set up your own copy of this codebase on GitHub for you to work on.

This needs a few prerequisites, detailed below.

#### Prerequisites

The deployment needs a few environment variables to be set for it to function. They are:

| Name | What It Is | How To Obtain |
|-|-|-|
|`DATABASE_URL`| Where the database resides for the deployed application | Follow this guide to set up [CockroachDB](docs/cockroach/README.md) |
|`POSTMAN_API_KEY`| An API key to send email via Postman | Follow Postman's guide to [Generate your API Key](https://guide.postman.gov.sg/api-guide/generate-your-api-key) |
|`SESSION_SECRET`| A sequence of random characters used to protect session identifiers | Run the command `npx uuid` from your terminal |

#### Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopengovsg%2Fstarter-kit%2Ftree%2Fdevelop&env=DATABASE_URL,POSTMAN_API_KEY,SESSION_SECRET)

## Working on your product

You may work on the codebase with:
- A [GitHub Codespace](#using-github-codespaces) provided by us, or;
- With your [local machine](#using-your-local-developer-environment).

### Using GitHub Codespaces

Follow the official GitHub [guide](https://docs.github.com/en/codespaces/developing-in-codespaces/creating-a-codespace-for-a-repository)
for developing with a codespace.

### Using your local developer environment

In summary:
- Clone the repository to your local machine
- Follow instructions for [running the app locally](#running-the-app-locally)

## Running the app locally

### Install dependencies

```bash
npm i
```

### Set environment variables

```bash
cp .env.example .env.development.local
```

Set `POSTMAN_API_KEY` - required for login

#### Retrieving client-side environment variables in code

⚠️ When adding client-only environment variables in NextJS, you must prefix the variable with `NEXT_PUBLIC_` to ensure that the variable is exposed to the browser. For example, if you want to add a variable called `MY_ENV_VAR`, you should add it to your `.env` file as `NEXT_PUBLIC_MY_ENV_VAR`.

You will also need to update [src/browserEnv.ts](src/browserEnv.ts#L19) to explicitly reference the variable so NextJS will correctly bundle the environment variable into the client-side bundle.

### Start database

```bash
npm run setup
```

### Start server

```bash
npm run dev
```

## Developer Operations

> TODO: CI/CD test with GitHub Actions

> TODO: Github branch protection rules

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

# Example feature

[Adding replies to posts](docs/examples/replies.md)
