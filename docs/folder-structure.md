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
