# Application state machines

This document catalogs explicit and implicit finite-state behavior in the acme web starter kit, records invariants and transitions, and tracks invalid reachable states confirmed in code review.

**Last updated:** 2026-11-09 (OTP consumption ordering fix, verify-step concurrency guard)

---

## 1. Email OTP verification token (server / database)

**Location:** `VerificationToken` model, `auth.service.ts`, `auth.email.router.ts`

**Roles:** One row per `(email, codeChallenge)` pair (`identifier = JSON.stringify([email, codeChallenge])`).

### States

| State | Meaning | Row shape |
| --- | --- | --- |
| `absent` | No outstanding OTP for this PKCE challenge | row missing |
| `pending` | OTP issued, not yet consumed | `attempts < 6`, not expired |
| `locked` | Too many failed checks | `attempts >= 6` (after increment) |
| `expired` | Past `OTP_EXPIRY` from `issuedAt` | still `pending` row, validation fails |
| `consumed` | Successful login completed | row deleted |

### Invariants

1. At most one row per `identifier` (primary key).
2. Plaintext OTP never stored; only scrypt hash keyed by `(email, codeChallenge)`.
3. Token MUST NOT transition to `consumed` until the browser session is persisted (`session.save()` success).
4. `attempts` increments on every verify try that finds the row (before validity check).

### Transition table

| From | Event | To | Handler |
| --- | --- | --- | --- |
| `absent` | `auth.email.login` | `pending` | `emailLogin` → `create` |
| `absent` | `login` duplicate challenge | **reject** | Prisma `P2002` → BAD_REQUEST |
| `pending` | `verifyOtp` wrong/expired | `pending` | increment `attempts`, BAD_REQUEST |
| `pending` | `verifyOtp` too many failures | `locked` | increment → `attempts > 5` → TOO_MANY_REQUESTS |
| `pending` | `verifyOtp` valid + session saved | `consumed` | `deleteVerificationToken` |
| `pending` | `verifyOtp` valid + login/save fails | `pending` | **must stay** pending (regression-tested) |
| `pending` | verify with wrong PKCE verifier | **reject** | update `P2025` → BAD_REQUEST (reuse) |
| `consumed` | any verify | **reject** | update `P2025` |
| `expired` | verify | `pending`/`locked` | same as wrong OTP (attempts still increment) |

### Confirmed bugs

| ID | Impact | Status | Evidence |
| --- | --- | --- | --- |
| **OTP-1** | **High** – valid OTP consumed with no session; user must restart sign-in | **Fixed** | Previously `emailVerifyOtp` deleted the row before `loginUserByEmail` / `session.save()`. Any failure after delete left no token. See `auth.email.router.test.ts` (login/save failure retains row). |
| OTP-2 | Low – multiple concurrent `pending` rows per email (different challenges) | Open (by design) | Resend issues new challenge; older rows remain until expiry. Mitigated by PKCE binding. |
| OTP-3 | Low – concurrent double-submit of correct OTP | Mitigated | Two tabs: one deletes token; other gets P2025. Session may be written twice; acceptable. Client guard added on verify submit while mutation pending. |

### Regression tests

- `apps/web/src/server/modules/auth/__tests__/auth.service.test.ts`
- `apps/web/src/server/api/routers/__tests__/auth.email.router.test.ts`

---

## 2. Sign-in wizard (client UI)

**Location:** `wizard/context.tsx`, `email/email-flow.tsx`, `email/*.tsx`

### States (implicit)

```
email_step ──login success──► verification_step
     ▲                              │
     │                              │ resend (new challenge)
     └──────────────────────────────┘ (stays on verification; updates vfnStepData)
```

Sub-state: **resend timer** (`timer ∈ [0, delayForResendSeconds]`), active only when `vfnStepData` is defined.

### Invariants

1. `codeChallenge` in `vfnStepData` must exist in `challengeToVerifierMap` for verify to succeed.
2. Verification UI renders only when `vfnStepData.email` is non-empty.
3. Resend disabled while `timer > 0` or resend mutation pending.

### Transition table

| From | Event | To | Notes |
| --- | --- | --- | --- |
| `email_step` | `login` OK | `verification_step` | sets `vfnStepData`, starts timer interval |
| `verification_step` | `verifyOtp` OK | (exit) | `clearVerifierMap`, `router.refresh()` |
| `verification_step` | resend OK | `verification_step` | new challenge + prefix; `resetTimer()` |
| `verification_step` | page reload | **lost** | verifiers are in-memory only → user restarts |
| any | `newChallenge` failure | unchanged | toast error |

### Confirmed issues

| ID | Impact | Status | Evidence |
| --- | --- | --- | --- |
| UI-1 | Medium – reload during verification | Open | `challengeToVerifierMap` is a ref; no recovery without new OTP. Documented; consider sessionStorage backup in a future change. |
| UI-2 | Low – double verify submit | **Mitigated** | `verification-step.tsx` skips mutate when `verifyOtpMutation.isPending` or missing verifier. |

---

## 3. Iron session (auth cookie)

**Location:** `session.ts`, `auth.email.router.ts`, `auth.router.ts`, `(authed)/layout.tsx`, `api/trpc/[trpc]/route.ts`

### States

| State | `userId` | `sessionId` | Access |
| --- | --- | --- | --- |
| `anonymous` | unset/empty | unset | public routes |
| `authenticated` | set | set (after OTP verify) | authed routes, `protectedProcedure` |

### Invariants

1. `protectedProcedure` requires non-empty `userId`.
2. `sessionId` assigned only on successful `verifyOtp` (audit correlation).
3. `UNAUTHORIZED` tRPC errors destroy the session cookie (`api/trpc` `onError`).

### Transition table

| From | Event | To |
| --- | --- | --- |
| `anonymous` | `verifyOtp` + `save()` | `authenticated` |
| `authenticated` | `auth.logout` | `anonymous` | destroy + audit |
| `authenticated` | `me.get` UNAUTHORIZED path N/A | — |
| `authenticated` | any procedure → UNAUTHORIZED | `anonymous` | cookie destroyed |
| `authenticated` | browser client gets UNAUTHORIZED | redirect sign-in | `query-client.ts` `signOut()` |

### Confirmed issues

| ID | Impact | Status | Evidence |
| --- | --- | --- | --- |
| SESS-1 | Medium – **ghost session** | Open | `me.get` returns `null` when `userId` points at deleted user; layout still treats cookie as authed. `me.router.test.ts` "returns null when authenticated user does not exist". **Fix backlog:** fail auth middleware if user row missing. |
| SESS-2 | Low – logout without `sessionId` | Open | `auth.router` skips terminate audit if `sessionId` missing (legacy cookies). |

---

## 4. Client version compatibility

**Location:** `trpc/react.tsx`, `version-check-wrapper.tsx`, `constants.ts`

### States

| State | Meaning |
| --- | --- |
| `synced` | Client `NEXT_PUBLIC_APP_VERSION` matches `X-App-Version` response header |
| `stale` | Mismatch detected on any tRPC HTTP response |

### Transitions

| From | Event | To |
| --- | --- | --- |
| `synced` | response header mismatch | `stale` (dispatch `require-update`, modal + banner) |
| `stale` | user refresh | `synced` (full reload) |

No invalid transitions identified; state is monotonic per page load.

---

## 5. TanStack Query auth error handling (client)

**Location:** `trpc/query-client.ts`

### Behavior (implicit state per request)

On tRPC error codes in `trpcHandleableErrorCodeSchema`:

- `UNAUTHORIZED` → `signOut()` (POST sign-out, navigate to `/sign-in`)
- `FORBIDDEN` / `NOT_FOUND` → toast

**Invariant:** Mutations do not retry (`retry: false`).

**Note:** A transient `UNAUTHORIZED` during background `me.get` while the user is on a public page will still clear the session and redirect — usually desirable.

---

## 6. Rate limiting (per tRPC path)

**Location:** `rate-limit.service.ts`, `trpc.ts` middleware

### States (per fingerprint key)

Bursty limiter: sustained bucket + burst bucket (defaults 2 rps, burst 5 / 10s).

| Event | Result |
| --- | --- |
| `consume` under limit | allow |
| `consume` over limit | `TOO_MANY_REQUESTS` + `Retry-After` |
| Redis unavailable | `rejectIfRedisNotReady: true` → error path (falls through to throw unless insurance) |

Disabled when `meta.rateLimitOptions === null` or `NODE_ENV === 'test'`.

No invalid internal transitions; failures surface as HTTP 429.

---

## Fix backlog (grouped issues)

### Issue A – OTP login atomicity (OTP-1) — **Done**

Defer token deletion until after `session.save()`; export `deleteVerificationToken`.

### Issue B – Session / user row consistency (SESS-1) — **Backlog**

In `authMiddleware` or `me.get`, reject sessions whose `userId` has no `User` row (transition to `anonymous` + UNAUTHORIZED).

### Issue C – Sign-in wizard resilience (UI-1) — **Backlog**

Persist PKCE verifier keyed by challenge for the OTP TTL (e.g. `sessionStorage`) to survive refresh.

### Issue D – Verify UX concurrency (UI-2) — **Done**

Block duplicate verify mutation while pending.

---

## How to extend this document

When adding flows with lifecycle (onboarding, payments, jobs):

1. Name states explicitly (enum or table).
2. Add transitions with file/line references.
3. Add tests for any invariant that must survive retries and concurrency.
4. Record new reachable invalid states here before or with the fix.
