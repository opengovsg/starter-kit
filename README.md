# Starter Kit

> Looking for the older version of Starter Kit? Check out the [`v2` branch](https://github.com/opengovsg/starter-kit/tree/v2).

A technical kit to quickly build new products from
[Open Government Products](https://open.gov.sg), Singapore.

## Features

- 🗼 Monorepo setup with [Turborepo](https://turborepo.com)
- 🧙‍♂️ E2E typesafety with [tRPC v11](https://trpc.io)
- ⚡ Full-stack React with [Next.js v15](https://nextjs.org)
- 🌈 Database with [Prisma](https://www.prisma.io/)
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
- 💚 CI setup using GitHub Actions:
  - ✅ E2E testing with [Playwright](https://playwright.dev/)
  - ✅ Unit testing with [Vitest](https://vitest.dev/)
  - ✅ Visual regression testing with [Storybook](https://storybook.js.org/) + [Chromatic](https://www.chromatic.com/)
  - ✅ Linting
  - ✅ Type checking
- 🔐 Env var validation

## Project structure

```
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  └─ web
      ├─ Next.js 15
      ├─ React 19
      ├─ Tailwind CSS v4
      └─ E2E Typesafe API Server & Client
packages
  ├─ db
  │   └─ Typesafe db calls using Prisma
  └─ ui
      └─ Start of a UI package for the webapp using react-aria-components + @opengovsg/oui
tooling
  ├─ eslint
  │   └─ shared, fine-grained, eslint presets
  ├─ prettier
  │   └─ shared prettier configuration
  ├─ tailwind
  │   └─ shared tailwind theme and configuration
  └─ typescript
      └─ shared tsconfig you can extend from

```

## Working on your product

You may work on the codebase with:

- A [GitHub Codespace](#using-github-codespaces) provided by us, or;
- With your [local machine](#using-your-local-developer-environment).

### Quick Start

Copy this template using `Use this template` button on GitHub > `Create a new repository`.

To change the repository name in the codebase, run the following command after cloning:

```bash
# Replace `@acme` (case-sensitive search) monorepo scope with your desired scope (e.g. `@myprojectname`)
grep -rl '@acme' --exclude='*.md' --exclude-dir='.git' --exclude-dir='node_modules' . | xargs sed -i '' 's/@acme/@<your_project_name>/g'

# Replace `Starter Kit` (case-sensitive search) with your project name with proper casing
grep -rl 'Starter Kit' --exclude='*.md' --exclude-dir='.git' --exclude-dir='node_modules' . | xargs sed -i '' 's/Starter Kit/<your_project_name>/g'
```

Then, follow the instructions instructions to get started.

### Using GitHub Codespaces

Follow the official GitHub [guide](https://docs.github.com/en/codespaces/developing-in-codespaces/creating-a-codespace-for-a-repository)
for developing with a codespace.

### Using your local developer environment

In summary:

- Clone the repository to your local machine
- Follow instructions for [running the app locally](#running-the-app-locally)

## Running the app locally

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env

# Start docker containers
# use `docker compose down` to stop the containers afterwards
docker compose up -d

# Push the Prisma schema to the database
pnpm db:push
```

Optionally set `POSTMAN_API_KEY` to send login OTP emails via [Postman](https://postman.gov.sg).
If not set, OTP emails will be logged to the console instead.

#### Retrieving client-side environment variables in code

⚠️ When adding client-only environment variables in NextJS, you must prefix the variable with `NEXT_PUBLIC_` to ensure that the variable is exposed to the browser. For example, if you want to add a variable called `MY_ENV_VAR`, you should add it to your `.env` file as `NEXT_PUBLIC_MY_ENV_VAR`.

You will also need to update the various environment files (like [apps/web/src/env.ts](apps/web/src/env.ts#L5) or [packages/db/src/env.ts](packages/db/src/env.ts#L6)) to explicitly reference the variable so NextJS will correctly bundle the environment variable into the client-side bundle.

### 2. Adding a new package

To add a new package, simply run `pnpm turbo gen init` in the monorepo root. This will prompt you for a package name as well as if you want to install any dependencies to the new package (of course you can also do this yourself later).

The generator sets up the `package.json`, `tsconfig.json` and a `index.ts`, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking. When the package is created, you're ready to go build out the package.

## Deployment

Follow these instructions if you are familiar with building applications,
and/or are in a hurry to prepare an environment to work on your product.

If you are new, see our [Getting Started guide](https://start.open.gov.sg/docs/getting-started/prerequisites).

If you are exploring what else you can do with Starter Kit,
a more comprehensive set of documentation, including guides
and tutorials, can be found [here](https://start.open.gov.sg).

> The Vercel deployment outlined below is optimised for quick prototyping and development. It is **not recommended** for serious production use. \
> \
> For serious production use cases, consider directly deploying Starter Kit to AWS. We provide [a command line interface (CLI) tool](https://start.open.gov.sg/docs/guides/migrate-vercel-to-aws#cli) (for internal use only) that can help you deploy Starter Kit to a standardised AWS infrastructure.\
> \
> Nonetheless, on low-risk production use cases, Vercel can still be used as a production deployment. We have a document on when one might want to migrate to AWS [here](https://start.open.gov.sg/docs/guides/migrate-vercel-to-aws).

### Deploy to Vercel

Let's deploy the Next.js application to [Vercel](https://vercel.com). If you've never deployed a Turborepo app there, don't worry, the steps are quite straightforward. You can also read [the official Turborepo guide](https://vercel.com/docs/concepts/monorepos/turborepo) on deploying to Vercel.

1. Create a new project on Vercel, select the `apps/web` folder as the root directory. Vercel's zero-config system should handle all configurations for you.

2. Add the prerequisite environment variables outlined in the [Prerequisites](#prerequisites) section.

3. Done! Your app should successfully deploy.

#### Prerequisites

The deployment needs a few environment variables to be set for it to function. They are:

| Name              | What It Is                                                                                                              | Example                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`    | The connection string for your database. This should have been obtained from Neon                                       | postgresql://user:pass@xyz.ap-southeast-1.aws.neon.tech/app?sslmode=require |
| `POSTMAN_API_KEY` | An API key to send email via Postman                                                                                    | asdfn_v1_6DBRljleevjsd9DHPThsKDVDSenssCwW9zfA8W2ddf/T                       |
| `SESSION_SECRET`  | A sequence of random characters used to protect session identifiers, generated by running `pnpx uuid` from your terminal | 66a21b98-fb17-4259-ac4f-e94d303ac894                                        |

#### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopengovsg%2Fstarter-kit%2Ftree%2Fmain&env=SESSION_SECRET)

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app) and [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) with some additional OGP-specific tweaks.
