# E2E tests

Run with `pnpm --filter @acme/web e2e` (Docker required; containers start in globalSetup). CI runs the same suite against a production build.

## Layout

| Path | Holds |
| --- | --- |
| `<feature>/` | One folder per feature (`auth/`, `admin/`, `public/`): its tests and the page objects only it uses. |
| `<feature>/<screen>.e2e.ts` | Tests, named after the screen they drive (`sign-in.e2e.ts`), not the assertion. Several scenarios per file. |
| `<feature>/<screen>.po.ts` | Page object for **one** screen: locators, actions and `expect*` assertions (`SignInPO`). |
| `fixtures/` | Helpers shared across features. Move a page object here once a second feature needs it. |
| `fixtures/auth.ts` | `ROLES`, `TEST_EMAILS`, `roleTag`. |
| `fixtures/<entity>.db.ts` | Read-only queries for persisted state. Return rows, no `expect`. |
| `fixtures/<entity>.factory.ts` | Writes a test needs: create rows with unique `randomUUID()` defaults and overrides, or set state the UI can't (`setKnownOtp`). No `expect`. |
| `fixtures/<entity>-expect.ts` | Assertions over `.db.ts` getters. |
| `fixtures/network.ts` | `page.route` stubs for failures and external services CI can't reach. |
| `global-setup.ts` + `setup/` | Runs once per run: start containers, reset DB, seed users. One module per job. |
| `auth.setup.ts` | Mints one role's session cookie per `setup:<role>` project; runs only when selected tests need that role. |

## Rules

- **Data**: the DB is reset once per run, not per test, and tests run in parallel. Create your own data through a factory; never rely on another test's data or an empty table.
- **Auth**: tag a `test.describe` with `{ tag: roleTag('user') }` to run it signed in. Untagged tests run signed out. To add a role, extend `ROLES` and `TEST_EMAILS`; its user, setup project and test project follow.
- **Page objects**: a PO wraps `page.goto` only when it's the canonical entry onto its screen. One-off calls (`page.reload()`, `page.goto` to a screen without a PO, `expect(page).toHaveURL`) stay inline in the test.
