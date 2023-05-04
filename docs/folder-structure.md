# 🗄️ Project Structure

This is a general overview of the project structure. Further down, you will find a description of each entry.

```
.
├─ public
│  └─ favicon.ico
├─ prisma
│  └─ schema.prisma
├─ src
│  ├─ pages
│  │  ├─ _app.tsx
│  │  ├─ 404.tsx
│  │  ├─ api
│  │  │  └─ trpc
│  │  │     └─ [trpc].ts
│  │  └─ index.tsx
│  ├─ lib
│  ├─ schemas
│  ├─ server
│  │  ├─ env.ts
│  │  ├─ prisma.ts
│  │  ├─ context.ts
│  │  ├─ trpc.ts
│  │  ├─ _app.ts
│  │  └─ modules
│  │     └─ <example_feature>
│  │        └─ <example>.router.ts
│  ├─ theme
│  │  └─ index.ts
│  └─ utils
│     └─ trpc.ts
├─ .env
├─ .env.example
├─ .eslintrc.json
├─ .gitignore
├─ next-env.d.ts
├─ next.config.js
├─ package.json
├─ README.md
└─ tsconfig.json
```

## `prisma`

The `prisma` folder contains the `schema.prisma` file which is used to configure the database connection and the database schema. It is also the location to store migration files and/or seed scripts, if used. See [Prisma usage](usage/prisma.md) for more information.

### `public`

The `public` folder contains static assets that are served by the web server. The `favicon.ico` file is an example of a static asset.

### `src/pages`

The `pages` folder contains all the pages of the Next.js application. The `index.tsx` file at the root directory of `/pages` is the homepage of the application. The `_app.tsx` file is used to wrap the application with providers. See [Next.js documentation](https://nextjs.org/docs/basic-features/pages) for more information.

#### `src/pages/api`

The `api` folder contains all the API routes of the Next.js application. See [Next.js Api Routes Docs](https://nextjs.org/docs/api-routes/introduction) for info on api routes.

#### `src/pages/api/trpc/[trpc].ts`

The `[trpc].ts` file is the tRPC API entrypoint. It is used to handle tRPC requests. See [tRPC usage](usage/trpc.md#-srcpagesapitrpctrpcts) for more information on this file, and [Next.js Dynamic Routes Docs](https://nextjs.org/docs/routing/dynamic-routes) for info on catch-all/slug routes.

### `src/lib`

The `lib` folder contains service functions that are used throughout the application.

### `src/schemas`

The `schemas` folder contains zod schema definitions for the application, which can be shared between the client and server with `tRPC` and `react-hook-form`. See [tRPC usage on the client](usage/trpc.md#on-the-client) for more information.

### `src/server`

The `server` folder is used to clearly separate server-side code from client-side code.

#### `src/server/modules/auth`

This directory handles authentication logic.

#### `src/server/prisma.ts`

The `prisma.ts` file is used to instantiate the Prisma client at global scope. See [Prisma usage](usage/prisma.md#prisma-client) and [best practices for using Prisma with Next.js](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices) for more information.

#### `src/server/modules/<module>/*`

As a practice, this app colocates modules in their own directory. Each module contains:

- `<module>.router.ts` file which is used to define the routes for that module.
- `<module>.service.ts` which may also be used to define the business logic for that module.
- `<module>.utils.ts` which may also be used to define utility functions for that module.
- Or any other files that may be needed for that module.

#### `src/server/modules/_app.ts`

The `_app.ts` file is used to merge tRPC routers and export them as a single router, as well as the router's type definition. See [tRPC usage](usage/trpc.md#-srcservermodules_appts) for more information.

#### `src/server/trpc.ts`

The `trpc.ts` file is the main configuration file for your tRPC back-end. In here we export procedure helpers. See [tRPC usage](usage/trpc.md#-srcservertrpcts) for more information.

#### `src/server/context.ts`

The context used in tRPC requests is defined in this file. See [tRPC usage](usage/trpc.md#-srcservercontextts) for more information.

#### `src/server/env.ts`

Used for server-only environment variable validation and type definitions - see [Environment Variables](usage/env-variables.md).

### `src/theme`

The `theme` folder contains the theme configuration for the application client, using [`@opengovsg/design-system-react`](https://www.npmjs.com/package/@opengovsg/design-system-react). See [Application Theme](usage/application-theme.md) for more information.

### `src/utils`

The `utils` folder is used to store commonly re-used utility functions.

#### `src/utils/trpc.ts`

The `trpc.ts` file is the front-end entrypoint to tRPC. See [tRPC usage](usage/trpc.md#-srcutilstrpcts) for more information.

### `src/browserEnv.ts`

The `browserEnv.ts` file is used to expose environment variables to the client. See [Environment Variables](usage/env-variables.md) for more information.

### `.env`

The `.env` file is used to store environment variables. See [Environment Variables](usage/env-variables.md) for more information. This file should **not** be committed to git history.

### `.env.example`

The `.env.example` file shows example environment variables based on the chosen libraries. This file should be committed to git history.

### `.eslintrc.json`

The `.eslintrc.json` file is used to configure ESLint. See [ESLint Docs](https://eslint.org/docs/latest/user-guide/configuring/configuration-files) for more information.

### `next-env.d.ts`

The `next-env.d.ts` file ensures Next.js types are picked up by the TypeScript compiler. **You should not remove it or edit it as it can change at any time.** See [Next.js Docs](https://nextjs.org/docs/basic-features/typescript#existing-projects) for more information.

### `next.config.js`

The `next.config.js` file is used to configure Next.js. See [Next.js Docs](https://nextjs.org/docs/api-reference/next.config.js/introduction) for more information.

### `tsconfig.json`

The `tsconfig.json` file is used to configure TypeScript. Some non-defaults, such as `strict mode`, have been enabled to ensure the best usage of TypeScript for this application and its libraries. See [TypeScript Docs](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) or [TypeScript Usage](usage/typescript.md) for more information.

### `docker-compose.yml`

Strictly used for local development, spins up the necessary services for the application to run. See [Getting Started](guides/README.md) for more information.
