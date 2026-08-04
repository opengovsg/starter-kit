# pnpm supply-chain hardening: what we have, what's missing

Research date: 2026-08-04. Primary sources are the pnpm docs (`pnpm.io`), the npm docs
(`docs.npmjs.com`) and the GitHub Actions docs. Every factual claim below carries a URL.
Anything I could not confirm against a first-party doc is marked **UNVERIFIED**.

> **Location note.** This repo has no existing in-repo docs convention — the only tracked
> Markdown files are `README.md` and `packages/db/README.md`, and the project's real
> documentation lives externally at <https://start.open.gov.sg/docs>. So this file is
> placed at the default `docs/research/` path rather than matching an existing convention.

## Repo snapshot (facts established by reading the repo)

| Fact | Value |
| --- | --- |
| pnpm declared | `pnpm@11.1.2+sha512.415a1cc...` (`package.json` `packageManager`) |
| pnpm installed locally | `11.1.2` (`pnpm --version`) |
| Latest pnpm on npm | `11.20.0` (`registry.npmjs.org/pnpm/latest`) |
| Node | `>=24.13.0` (`engines`), `devEngines.runtime` 24.13.0 with `onFail: download`, `.nvmrc` 24.13.0 |
| Lockfile | `pnpm-lock.yaml` committed, `lockfileVersion: '9.0'`, ~15k lines / 566 KB |
| `.npmrc` | **none** anywhere in the repo |
| Workspace security settings | `blockExoticSubdeps`, `pnpmfile: []`, `minimumReleaseAge: 1440`, `minimumReleaseAgeExclude`, `allowBuilds`, `overrides`, `publicHoistPattern`, `linkWorkspacePackages` |
| CI install | `tooling/github/setup/action.yml` runs bare `pnpm install` (no flags) |
| CI workflows | `ci.yml`, `codeql.yml`, `chromatic.yml`. All actions pinned to full commit SHAs. All three have a `permissions:` block. No publish workflow. |
| Dependabot | `.github/dependabot.yml`, npm + github-actions ecosystems, weekly, `cooldown.default-days: 7`, grouped |
| Root `postinstall` | `pnpm lint:ws` → `pnpm dlx sherif@latest` |
| Package privacy | all workspace packages `private: true` **except `tooling/github/package.json`**, which has no `private` field |

---

## Already in place

Each row maps an existing setting to the attack it blunts.

### `blockExoticSubdeps: true`

Only direct dependencies may resolve from exotic sources (git repos, direct tarball URLs);
transitive deps must come from the registry, local paths, workspace links, or trusted
GitHub repos. Blocks a compromised transitive from redirecting to attacker-controlled
tarball/git infrastructure that no registry scanner ever sees.
Docs: <https://pnpm.io/settings/dependency-resolution#blockexoticsubdeps>

**Note:** this defaults to `true` since pnpm v10.26.0, so the explicit line is documentation
rather than a change in behaviour. Keeping it explicit is still worthwhile — it survives a
future default flip.

### `allowBuilds` (explicit allow/deny per package)

pnpm v10+ blocks dependency lifecycle scripts by default; `allowBuilds` is the explicit
allowlist. This is the single most important control, because the overwhelming majority of
real npm compromises (Shai-Hulud 2.0, s1ngularity, the chalk/debug September 2025 attack)
execute via `preinstall`/`postinstall`. Anything not listed is denied, and since
`strictDepBuilds` defaults to `true` an unreviewed build script **fails the install** with
`ERR_PNPM_IGNORED_BUILDS` rather than warning.
Docs: <https://pnpm.io/settings/build#allowbuilds>, <https://pnpm.io/settings/build#strictdepbuilds>,
<https://pnpm.io/supply-chain-security> ("Block risky postinstall scripts")

Currently `true` for: `@prisma/client`, `@prisma/engines`, `esbuild`, `prisma`.
Currently `false` for: `@datadog/native-*`, `@datadog/pprof`, `core-js-pure`, `cpu-features`,
`dd-trace`, `msw`, `protobufjs`, `sharp`, `ssh2`. The deny list is genuinely good hygiene.

### `minimumReleaseAge: 1440`

No version is installable until 24 h after publication, transitive deps included. Malicious
releases are typically pulled fast — ~2.5 h for the September 2025 chalk/debug attack, ~12 h
for Shai-Hulud 2.0 — so a 24 h cooldown would have blocked both.
Docs: <https://pnpm.io/settings/dependency-resolution#minimumreleaseage>,
<https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security>

**Bonus you already get for free:** `minimumReleaseAgeStrict` defaults to `true` *when
`minimumReleaseAge` is explicitly configured* — which it is here. So resolution **fails**
rather than silently falling back to a too-fresh version. Had you relied on the built-in
v11 default of 1440, strict mode would have been off.
Docs: <https://pnpm.io/settings/dependency-resolution#minimumreleaseagestrict>

**Second bonus:** since pnpm v11.0.0, `pnpm dlx` / `pnx` also honours `minimumReleaseAge`,
`minimumReleaseAgeExclude`, `minimumReleaseAgeStrict` and the `trustPolicy` family.
Docs: <https://pnpm.io/cli/pnx#security-and-trust-policies>

### `pnpmfile: []`

A `.pnpmfile.mjs` is arbitrary JS executed inside the install process, with hooks that can
mutate dependency manifests (`readPackage`) and the lockfile (`afterAllResolved`), and can
register custom `resolvers` and `fetchers`. Explicitly disabling lookup removes that
code-execution and resolution-hijack surface. Note the comment in `pnpm-workspace.yaml`
says this was done for a dd-trace ESM-loader reason, not for security — the security benefit
is incidental but real. Also worth knowing: `ignoreScripts` does *not* stop a pnpmfile.
Docs: <https://pnpm.io/pnpmfile>, <https://pnpm.io/settings/build#ignorescripts>

### `overrides` (security overrides block)

Forces patched versions of vulnerable transitives (`ajv@8`, `hono@4`, `lodash@4`,
`postcss@8`, `effect@3`, `defu@6`, `@hono/node-server@1`) that parents pin. This is exactly
the documented remediation path when `pnpm update` alone can't fix an advisory. The block is
commented with which parent pins each one, which is the right practice.
Docs: <https://pnpm.io/cli/audit> ("use overrides to force versions that are not vulnerable"),
<https://pnpm.io/settings/dependency-resolution#overrides>

### Committed `pnpm-lock.yaml`

The baseline control: pins exact versions and integrity hashes so an install can't silently
pick up a newer, compromised version.
Docs: <https://pnpm.io/supply-chain-security> ("Use a lockfile")

### Defaults you benefit from without configuring them

- `verifyStoreIntegrity: true` — store file contents are re-checked before linking into
  `node_modules`. <https://pnpm.io/settings/store#verifystoreintegrity>
- `strictStorePkgContentCheck: true` — validates the name/version of store packages.
  <https://pnpm.io/settings/store#strictstorepkgcontentcheck>
- `strictSsl: true` — TLS validation on registry requests.
  <https://pnpm.io/settings/network#strictssl>
- Frozen lockfile in CI — pnpm flips `--frozen-lockfile` to `true` automatically when it
  detects CI, and since v11 also **fails** on a lockfile written by a newer pnpm major
  instead of rewriting it. <https://pnpm.io/cli/install#--frozen-lockfile>,
  <https://pnpm.io/continuous-integration>
- `verifyDepsBeforeRun: install` — `pnpm run`/`pnpm exec` check `node_modules` state first.
  <https://pnpm.io/settings/build#verifydepsbeforerun> — *UNVERIFIED* that 11.1.2 already
  uses `install` as the default; the docs I read describe current pnpm (11.20.x).

### Non-pnpm controls already good

- **Every GitHub Action is pinned to a full-length commit SHA** across `ci.yml`,
  `codeql.yml`, `chromatic.yml` and `tooling/github/setup/action.yml`. GitHub: "Pinning an
  action to a full-length commit SHA is currently the only way to use an action as an
  immutable release", and it means an attacker "would need to generate a SHA-1 collision
  for a valid Git object payload".
  <https://docs.github.com/en/actions/reference/security/secure-use>
- **Least-privilege `permissions:` blocks** on all three workflows (`contents: read` as the
  floor). Same doc.
- **Dependabot `cooldown.default-days: 7`** on both ecosystems, with the inline comment "to
  make supply chain attacks harder" — a second, independent cooldown layer on top of
  `minimumReleaseAge`. <https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference>
- **CodeQL** on push/PR/daily.

---

## Things in the CURRENT config that weaken security

Listed worst-first. These are the items to look at before adding anything new.

### 1. `pnpm dlx sherif@latest` as the root `postinstall` — worst offender

```json
"lint:ws": "pnpm dlx sherif@latest",
"postinstall": "pnpm lint:ws",
```

This downloads and **executes** the newest `sherif` on every single `pnpm install`,
including in CI, from an unpinned dist-tag. It is not in the lockfile, so it gets none of
the lockfile's integrity pinning, and packages that `dlx` executes are **allowed to run
postinstall scripts by default** — pnpm's own docs say so explicitly: "The actual packages
executed by `dlx` are allowed to run postinstall scripts by default."
<https://pnpm.io/cli/pnx#--allow-build>

The one mitigation you do have: since v11.0.0 `dlx` honours `minimumReleaseAge` and
`trustPolicy`. <https://pnpm.io/cli/pnx#security-and-trust-policies> So a sherif published
in the last 24 h is refused. That reduces the window but does not fix the shape of the
problem — a >24 h-old malicious sherif still runs, and it runs on *every* install rather
than only when a human asks for it.

This entirely bypasses the `allowBuilds` allowlist that the rest of the config is built
around. It is the biggest hole in an otherwise careful setup.

### 2. `minimumReleaseAgeExclude` widens the trusted set by whole-package wildcard

```yaml
minimumReleaseAgeExclude:
  - '@opengovsg/*'
  - 'vitest'
  - '@vitest/*'
```

The docs are explicit that "the exclusion works by **package name** and applies to all
versions of that package".
<https://pnpm.io/settings/dependency-resolution#minimumreleaseageexclude>

So every `vitest` and `@vitest/*` release installs the instant it is published, with zero
cooldown, forever. Vitest is not a low-value target: it runs in CI with `DD_API_KEY`,
`CHROMATIC_WEB_PROJECT_TOKEN` and the workflow's `GITHUB_TOKEN` in the environment, and
`@vitest/*` is a large family. `@opengovsg/*` is more defensible (you control publishing),
but it is still a wildcard covering packages you may not all own.

The comment above the block says the intent is CVE hotfixes — "If there is a CVE, exclude it
here so we can update it immediately". But the mechanism used is a permanent
whole-package wildcard, not a hotfix exception. pnpm has supported **version-pinned**
exclusions since v10.19.0 exactly for this:

```yaml
minimumReleaseAgeExclude:
  - nx@21.6.5
  - webpack@4.47.0 || 5.102.1
```

Same doc anchor. That is the shape the stated intent actually calls for.

### 3. `publicHoistPattern` exposes phantom dependencies at the root

```yaml
publicHoistPattern:
  - '*oxfmt*'
  - '*@opengovsg/oui*'
  - '*prisma*'
  - pg
```

pnpm's docs: "Hoisting to the root modules directory means that application code will have
access to phantom dependencies, even if they modify the resolution strategy improperly."
<https://pnpm.io/settings/node-modules#publichoistpattern>

Severity is **low** and this is mostly a correctness concern, not a breach path — but it is
a real widening. `*prisma*` is a broad glob; anything matching it becomes importable from
app code at the root, so a compromised transitive under that glob gains root-level
reachability it would not have under pnpm's isolated layout. Undeclared-but-importable
modules are also how typosquat confusion gets a foothold. The docs recommend the narrow
approach ("if you know that only some flawed packages have phantom dependencies, you can use
this option to exclusively hoist the phantom dependencies (recommended)" — said of
`hoistPattern`, same page).

### 4. `allowBuilds: esbuild: true` is worth re-testing

This is the smallest item, and it may well be necessary — but it is worth 10 minutes,
because pnpm's own case-study blog post covers exactly this package and concludes the
opposite:

> **esbuild:** Optimizes CLI tool startup by milliseconds—not needed since we only use the
> JavaScript API

<https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security> — they set it to
blocked with "Zero impact on functionality". Note they also blocked `protobufjs`, which you
already deny. Whether it holds here depends on whether Vite/Vitest need the linked binary in
this repo, so **verify by flipping it and running `pnpm test:ci` + `pnpm build`** rather than
taking the blog's word for it. If it works, that's one fewer trusted build script on a
package with an enormous blast radius.

### 5. `tooling/github/package.json` has no `private: true`

Every other workspace package sets it. This is an accidental-publish risk (namespace
squatting on a name you'd rather own), not an inbound supply-chain risk. One-line fix.

### 6. Cooldown windows disagree with each other

`minimumReleaseAge: 1440` (1 day) vs Dependabot `cooldown.default-days: 7`. Not a
vulnerability — two layers with different windows is fine, and the effective window for
Dependabot-driven bumps is the longer of the two. But it means the *pnpm* floor for anything
that arrives outside Dependabot (a manual `pnpm add`, a transitive resolution) is 1 day, not
7. Worth a deliberate decision rather than an accident.

---

## Gaps / recommendations

Ordered by impact ÷ effort. The first four are where the value is concentrated.

### R1. Pin `sherif` and get it out of `postinstall`

**What:** replace the unpinned `dlx` invocation with a catalog-pinned devDependency executed
via `pnpm exec`, so it lands in the lockfile with an integrity hash and is subject to
`allowBuilds`.

```yaml
# pnpm-workspace.yaml
catalog:
  sherif: ^1.13.0   # latest as of 2026-08-04, per registry.npmjs.org/sherif/latest
```

```json
// package.json
{
  "scripts": {
    "lint:ws": "pnpm exec sherif"
  },
  "devDependencies": {
    "sherif": "catalog:"
  }
}
```

Also consider dropping `"postinstall": "pnpm lint:ws"` and calling `lint:ws` from the CI
`lint` job only — `ci.yml` already runs `pnpm lint && pnpm lint:ws`, so the `postinstall`
hook is redundant with CI and just adds an install-time execution point on every developer
machine.

**Mitigates:** arbitrary code execution from an unpinned `@latest` package on every install,
outside the lockfile and outside `allowBuilds`. The exact class of attack the rest of this
config is designed to stop.
**Cost:** ~15 minutes. Slight behaviour change: workspace lint no longer auto-runs after
install. `pnpm exec` runs `node_modules/.bin`. <https://pnpm.io/cli/exec>
**Confidence:** High on the diagnosis and on `dlx` semantics (doc-confirmed). Medium on the
exact snippet — confirm sherif has no build script of its own (if it does, it needs an
`allowBuilds` entry, which is the point: it becomes a reviewed decision instead of an
implicit one).
**Docs:** <https://pnpm.io/cli/pnx#--allow-build>, <https://pnpm.io/cli/exec>, <https://pnpm.io/catalogs>

### R2. Enable `trustPolicy: no-downgrade`

**What:** fail the install when a package's *publishing trust level* drops relative to
earlier releases. npm has three levels (strongest first): Trusted Publisher (GitHub Actions
OIDC + provenance) → Provenance (signed CI attestation) → no trust evidence
(username/password or token). A maintainer-credential compromise almost always produces a
downgrade, because the attacker publishes from their own machine and cannot reach the
victim's CI.

```yaml
# pnpm-workspace.yaml
trustPolicy: no-downgrade

# Recommended companion: don't demand trust evidence from packages published
# before provenance was widely available. 525600 minutes = 1 year.
trustPolicyIgnoreAfter: 525600

trustPolicyExclude:
  # Document each entry: why the downgrade is legitimate (new maintainer,
  # CI/CD migration, manual hotfix while CI was down).
  - 'some-pkg@1.2.3'
```

**Mitigates:** maintainer account/token compromise. pnpm's blog states this control would
have blocked the August 2025 s1ngularity attack, where "attackers compromised maintainer
credentials and published malicious versions from their own machines … a clear trust
downgrade".
**Cost:** Real, and front-loaded. Expect a batch of legitimate failures on first enable
(packages with no provenance at all, mid-migration projects) that each need investigation
then a `trustPolicyExclude` entry. `trustPolicyIgnoreAfter` cuts most of this down.
Also a **memory** cost: pnpm 11.3's release notes report that on "~4k lockfile entries with
`minimumReleaseAge` + `trustPolicy: no-downgrade` enabled" the verification pass "could OOM
CI runners with a 2 GB heap cap"; 11.3 fixed this by projecting the metadata cache. Your
lockfile is ~15k lines, so **do R3 first** and enable this on ≥11.3.
**Confidence:** High that the setting exists and does this (v10.21.0+, so available on
11.1.2). Medium on the friction estimate — depends on your specific graph.
**Docs:** <https://pnpm.io/settings/dependency-resolution#trustpolicy>,
<https://pnpm.io/settings/dependency-resolution#trustpolicyexclude>,
<https://pnpm.io/settings/dependency-resolution#trustpolicyignoreafter>,
<https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security>,
<https://pnpm.io/blog/releases/11.3>

### R3. Upgrade pnpm 11.1.2 → 11.20.x

**What:** bump `packageManager`. You are 19 minor versions behind, and several of the
recommendations here need a newer pnpm.

```json
"packageManager": "pnpm@11.20.0+sha512.<hash-from-the-release>"
```

Easiest via `pnpm self-update 11` from inside the repo, which updates the pin in place
rather than installing globally. <https://pnpm.io/cli/self-update>

What the upgrade unlocks, with the version each landed in:

| Feature | Landed | Why you want it |
| --- | --- | --- |
| `audit.level` / `audit.ignore` config section | v11.16.0 | Declarative audit policy in `pnpm-workspace.yaml` instead of CLI flags |
| `trustLockfile` | v11.3.0 | Explicit control of the lockfile verification pass; also the trust-verification **memory fix** |
| Registry-qualified lockfile keys | v11.20.0 | Closes a package-substitution hole (see R8) |
| `update.githubActions` | v11.16.0 | `pnpm update`/`outdated` can check and bump the SHA pins in your workflow files |
| `savePrefix: '='` | v11.19.0 | Exact-pin newly added deps |
| `frozenStore` | v11.7.0 | Read-only store installs |

**Mitigates:** nothing directly; it is the enabler for R2 (safely), R4, R8.
**Cost:** Low-moderate. It is a minor bump within v11, so no v10→v11 codemod needed. Read
the release notes for 11.2 → 11.20 for behaviour changes; the notable one is the v11.20.0
lockfile re-keying, which only matters if you install through a registry alias (you don't —
no `.npmrc`, no `namedRegistries`).
**Confidence:** High on the version facts. Medium that the bump is uneventful for this repo.
**Docs:** <https://pnpm.io/blog/releases/11.3>, <https://pnpm.io/cli/self-update>,
<https://pnpm.io/settings/dependency-resolution#named-registries-in-the-lockfile>

### R4. Add `pnpm audit` and `pnpm audit signatures` to CI

**What:** nothing in `ci.yml` currently checks for known advisories, even though
`pnpm-workspace.yaml` carries a hand-maintained "Security overrides … (see `pnpm audit`)"
block — so audit is being run manually and can silently drift.

Add a job to `.github/workflows/ci.yml`:

```yaml
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Setup
        uses: ./tooling/github/setup
      - name: Audit advisories
        run: pnpm audit --audit-level=high --ignore-unfixable
      - name: Verify registry signatures
        run: pnpm audit signatures
```

On pnpm ≥11.16.0 (see R3) move the policy into config instead of flags:

```yaml
# pnpm-workspace.yaml
audit:
  level: high
  ignore:
    - GHSA-xxxx-xxxx-xxxx   # document why each is tolerated
```

Two distinct commands, two distinct purposes:

- `pnpm audit` — known advisories. `--audit-level` is `low`/`moderate`/`high`/`critical`,
  default `low`. `--ignore-unfixable` (v10.11.0+) drops advisories with no resolution.
  Since v11, advisories are filtered by **GHSA**, not CVE.
- `pnpm audit signatures` (v11.1.0+, so **available on 11.1.2**) — verifies ECDSA registry
  signatures of installed packages against the keys each registry publishes at
  `/-/npm/v1/keys`. Exits `1` if any signature is invalid, **or if a registry advertises
  signing keys but a package was published without a signature**. This is the consumer-side
  counterpart to npm provenance: npm's own docs point at `npm audit signatures` for
  verifying attestations against the Sigstore transparency log.

Also useful when fixing: `pnpm audit --fix` writes `overrides`, and when `minimumReleaseAge`
is set it *also* adds the minimum patched version to `minimumReleaseAgeExclude` so the
security fix installs without waiting out the cooldown — i.e. pnpm generates exactly the
version-pinned exclusions recommended in weakening #2, rather than wildcards.
`--fix=update` (v11.0.0+) updates the lockfile instead of adding overrides, and
`--interactive` (v11.0.0+) lets you pick.

**Mitigates:** known-vulnerability drift; unsigned or tampered tarballs; silent decay of the
`overrides` block.
**Cost:** Low. One CI job. The usual caveat applies: audit jobs are noisy and can block
unrelated PRs, so `--audit-level=high --ignore-unfixable` is the pragmatic starting point.
Consider `--ignore-registry-errors` if registry flakiness causes false failures.
**Confidence:** High — all flags and versions doc-confirmed.
**Docs:** <https://pnpm.io/cli/audit>, <https://pnpm.io/blog/releases/11.1>,
<https://docs.npmjs.com/generating-provenance-statements>

### R5. `minimumReleaseAgeIgnoreMissingTime: false`

**What:** by default (`true`) pnpm **skips** the `minimumReleaseAge` check entirely for any
package whose registry metadata lacks a `time` field. Setting it to `false` fails resolution
instead.

```yaml
minimumReleaseAgeIgnoreMissingTime: false
```

**Mitigates:** a bypass of your primary cooldown control. Today you resolve everything from
`registry.npmjs.org`, which does supply `time`, so this should be a no-op — which is exactly
why it's cheap. It matters the moment anyone introduces a private registry, mirror or proxy
that omits `time`, at which point the cooldown would silently stop applying to those
packages with no signal to you.
**Cost:** Near zero, assuming it is indeed a no-op. Verify with one install.
**Confidence:** High on the setting (v11.0.0+, available on 11.1.2). High that npmjs
supplies `time`; the docs say the omission is a trait of "some private registries and
mirrors".
**Docs:** <https://pnpm.io/settings/dependency-resolution#minimumreleaseageignoremissingtime>

### R6. Convert the wildcard `minimumReleaseAgeExclude` entries to version pins

**What:** the fix for weakening #2. Drop the standing `vitest` / `@vitest/*` wildcards and
add pins only when a specific version genuinely needs to bypass the cooldown.

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  # Version-pinned exceptions only. Delete each once the cooldown has passed.
  # - vitest@4.1.8
  - '@opengovsg/*'   # keep only if you're confident you own every package in the scope
```

**Mitigates:** a permanent zero-cooldown hole on a large dev-tooling family that executes in
CI alongside `DD_API_KEY`, `CHROMATIC_WEB_PROJECT_TOKEN` and `GITHUB_TOKEN`.
**Cost:** Moderate *process* friction, not moderate effort. Vitest ships frequently, and
with `minimumReleaseAgeStrict` effectively on, a Dependabot PR bumping vitest within the
cooldown window will **fail** rather than fall back. Two ways to absorb that: rely on the
Dependabot `cooldown.default-days: 7` you already have (it should keep bumps outside the
1-day pnpm window in practice), or let `pnpm audit --fix` add the pin for you when the bump
is a security fix. Note that if the wildcards were added specifically to stop vitest PRs
failing, removing them will reintroduce that failure mode — so land this alongside checking
that the Dependabot cooldown genuinely covers it.
**Confidence:** High on the mechanism. Medium on the friction, because I could not verify
from the repo *why* the vitest wildcards were added — the comment only mentions CVEs.
**Docs:** <https://pnpm.io/settings/dependency-resolution#minimumreleaseageexclude>,
<https://pnpm.io/cli/audit#--fix>

### R7. Make the CI install explicitly frozen

**What:** `tooling/github/setup/action.yml` ends with a bare `pnpm install`. pnpm *does*
auto-enable `--frozen-lockfile` on detected CI, so this is already correct in effect — but
it depends on CI auto-detection, and the composite action is also used from `chromatic.yml`.

```yaml
    - shell: bash
      run: pnpm install --frozen-lockfile
```

**Mitigates:** a lockfile-drifting install if CI detection ever fails, or if the action is
reused somewhere pnpm doesn't recognise as CI. Defence-in-depth on a control you already
have rather than a new control.
**Cost:** Effectively zero. Consider `pnpm ci` (v11.0.0+, = `pnpm clean` +
`pnpm install --frozen-lockfile`) if you want a genuinely clean install, but note it discards
`node_modules` and so gives up the warm-cache benefit — probably not worth it given the
turbo cache setup.
**Confidence:** High.
**Docs:** <https://pnpm.io/cli/install#--frozen-lockfile>, <https://pnpm.io/continuous-integration>,
<https://pnpm.io/cli/ci>

### R8. Pin the default registry explicitly

**What:** there is no `.npmrc` and no `registries` setting anywhere, so the default registry
is whatever pnpm's built-in default plus any machine-level global config resolves to. Make
it explicit.

```yaml
# pnpm-workspace.yaml
registries:
  default: https://registry.npmjs.org/
```

**Mitigates:** a developer's global config, or an inherited `pnpm_config_*` environment
variable, silently redirecting resolution to a different registry. Modest — it is a
belt-and-braces measure, and note that `registries` can *also* be set in the machine-global
`config.yaml` (v11.11.0+), so project-level config is the stronger place to state it.

The larger related point, which **does not currently apply to you**: pnpm ≥11.20.0 records
named-registry packages in the lockfile under registry-qualified keys
(`<name>@<registryName>:<version>`) because, before that, "the same name and version served
by two registries collapsed onto a single entry and whichever resolved first decided the
tarball that every consumer got. That is a package-substitution risk". You install nothing
through a registry alias today, so you are not exposed — but **if you ever add a private or
GitHub Packages registry, be on ≥11.20.0 first** (R3), and have the whole team on it, since
the docs warn an older pnpm will flip the lockfile back to the vulnerable shape without
warning.
**Cost:** Near zero.
**Confidence:** High on the docs. Medium on the value of the explicit pin for this repo
specifically — it is genuinely marginal today, and its real payoff is as a precondition for
safely adding a second registry later.
**Docs:** <https://pnpm.io/settings/dependency-resolution#registries>,
<https://pnpm.io/settings/dependency-resolution#named-registries-in-the-lockfile>,
<https://pnpm.io/supply-chain-security> ("Pin dependencies to the registry they come from")

### R9. Decide the cooldown window deliberately

**What:** align `minimumReleaseAge` with the 7-day Dependabot cooldown, or consciously keep
them different. pnpm documents `10080` (one week) as a supported stricter value.

```yaml
minimumReleaseAge: 10080   # 7 days, matching .github/dependabot.yml cooldown
```

**Mitigates:** widens the detection window for anything arriving outside Dependabot. Shai-Hulud
2.0 took ~12 h to remediate, so 1 day already covers the observed cases; 7 days buys margin
against a slower-detected attack.
**Cost:** Real friction on manual `pnpm add` of anything recently published, and on
transitive resolution. Given `minimumReleaseAgeStrict` is effectively on, over-tightening
produces hard resolution failures. **My read: 1440 is a reasonable place to stay** — the
empirical detection times support it, and the Dependabot cooldown already gives 7 days on
the path that produces most of your upgrades. Flagging this as a decision to make explicitly
rather than a change to make.
**Confidence:** High on the mechanics, low-confidence recommendation — this is a risk-appetite
call, not a defect.
**Docs:** <https://pnpm.io/settings/dependency-resolution#minimumreleaseage>,
<https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security>

### R10. Narrow `supportedArchitectures`

**What:** constrain which platform-specific optional dependencies get fetched at all.

```yaml
supportedArchitectures:
  os:
    - current
    - linux      # CI + deploy
    - darwin     # developer machines
  cpu:
    - x64
    - arm64
```

**Mitigates:** shrinks the attack surface by reducing the number of native optional packages
downloaded and unpacked. Native platform packages (`@esbuild/*`, `@img/sharp-*`,
`@prisma/engines` variants) are a well-worn vector because they ship binaries. Modest gain.
**Cost:** Low, but be careful — over-narrowing breaks a developer on an unlisted platform,
and this interacts with your existing `@img/sharp-libvips-darwin-arm64: '-'` override. Also
consider `ignoredOptionalDependencies` if there are specific optional packages you never
need.
**Confidence:** Medium. The setting and syntax are doc-confirmed; the security benefit is my
inference from reduced surface, not something the pnpm docs frame as a security control.
**Docs:** <https://pnpm.io/settings/dependency-resolution#supportedarchitectures>,
<https://pnpm.io/settings/dependency-resolution#ignoredoptionaldependencies>

### R11. Narrow `publicHoistPattern`

**What:** the fix for weakening #3. Replace broad globs with the specific packages that
actually need root hoisting. `hoistPattern` defaults to `['*']`, so also consider narrowing
that.

```yaml
publicHoistPattern:
  - 'oxfmt'
  - '@opengovsg/oui'
  - '@opengovsg/oui-theme'
  - 'prisma'
  - '@prisma/client'
  - 'pg'
```

**Mitigates:** phantom-dependency reachability from application code.
**Cost:** Moderate and fiddly — each glob is presumably there because something broke, and
narrowing means finding out what. Needs a full `pnpm build` + `pnpm test:ci` +
`pnpm typecheck` + Storybook check to validate. Low security payoff for the effort, so this
is a "when you're already in here" item.
**Confidence:** High on the doc guidance; low on whether the narrowed list above is
sufficient for this repo.
**Docs:** <https://pnpm.io/settings/node-modules#publichoistpattern>,
<https://pnpm.io/settings/node-modules#hoistpattern>

### R12. `pnpm dedupe --check` in CI

**What:** fails if the lockfile carries duplicate versions that could be collapsed.

```yaml
      - name: Check for duplicate dependencies
        run: pnpm dedupe --check
```

**Mitigates:** indirectly. Fewer distinct versions in the graph means fewer packages to
trust and a smaller review surface, and it surfaces unexpected duplicate entries. This is a
hygiene control, not a security control — I'm not claiming otherwise.
**Cost:** Low, but it will fail on legitimate duplicates (peer-dep-driven ones especially),
so expect some tuning. `sherif` already covers adjacent ground.
**Confidence:** High on the command. Low on it being worth a CI gate here.
**Docs:** <https://pnpm.io/cli/dedupe#--check>

### R13. Generate an SBOM in CI

**What:** `pnpm sbom` (v11.0.0+, **available on 11.1.2**) emits CycloneDX 1.7 or SPDX 2.3.

```yaml
      - name: Generate SBOM
        run: pnpm sbom --sbom-format cyclonedx --prod --out sbom.cdx.json
      - uses: actions/upload-artifact@<pinned-sha>
        with:
          name: sbom
          path: sbom.cdx.json
```

**Mitigates:** nothing preventively. Its value is **incident response** — when the next
Shai-Hulud drops, a per-release SBOM answers "were we exposed, and in which deploy?" in
minutes instead of hours of lockfile archaeology. Given the OGP/government context, it may
also be an assurance requirement.
CycloneDX output marks devDependency-only components with `scope: "excluded"` and the
`cdx:npm:package:development` property. Note `--exclude-peers` (v11.9.0+) is useful here
because your lockfile has `autoInstallPeers: true`, which makes resolved peers otherwise
indistinguishable from real dependencies.
**Cost:** Low.
**Confidence:** High on the command and flags.
**Docs:** <https://pnpm.io/cli/sbom>

### R14. `pnpm licenses list` as a CI check

**What:** you already hand-manage one license problem via
`'@img/sharp-libvips-darwin-arm64': '-'` with the comment "uses a copyleft license". That is
a manual catch that a check could automate.

```sh
pnpm licenses list --prod --json
```

**Mitigates:** license/compliance risk, **not** supply-chain security. Included only because
the existing override shows you care about it. There is no built-in allowlist/deny flag —
you'd need to post-process the JSON yourself.
**Cost:** Low to run, moderate to turn into a real gate.
**Confidence:** High on the command; the "no built-in policy flag" claim is from the
documented option list, which shows only `--dev`/`--prod`/`--json`/`--long`/`--no-optional`/`--filter`.
**Docs:** <https://pnpm.io/cli/licenses>

### R15. `engineStrict` + `nodeVersion` (optional, low value here)

**What:** refuse to install any dependency declaring incompatibility with a pinned Node
version.

```yaml
nodeVersion: 24.13.0
engineStrict: true
```

**Mitigates:** not really a supply-chain control — pnpm frames it as stopping contributors
"from adding new incompatible dependencies". Listed for completeness since it appeared in
the brief. Your `devEngines.runtime` + `.nvmrc` + `engines.node` already pin Node itself.
**Cost:** Low, but `engineStrict: true` can fail installs on dependencies with sloppy
`engines` fields.
**Confidence:** High on mechanics; low that this is worth doing for security reasons.
**Docs:** <https://pnpm.io/settings/cli#enginestrict>, <https://pnpm.io/settings/cli#nodeversion>

### R16. Add `private: true` to `tooling/github/package.json`

One line. Prevents accidental publication of an internal tooling package. Every sibling
already has it.

---

## Settings deliberately NOT recommended

- **`trustLockfile: true`** — skips the supply-chain verification pass that re-applies
  `minimumReleaseAge` and `trustPolicy` to every lockfile entry. Tempting as a perf/memory
  win, but the docs warn: "A poisoned lockfile (one a contributor authored under a weaker
  policy than CI enforces) can slip through, so leave this `false` whenever outside
  collaborators can edit the lockfile." This is a public OGP starter kit taking outside PRs,
  so **keep the default `false`**. The docs also note "Most projects with the default
  `frozenLockfile` CI workflow do not need to set this."
  <https://pnpm.io/settings/dependency-resolution#trustlockfile>
- **`dangerouslyAllowAllBuilds: true`** — the opposite of what you want. It exists, it is
  documented, and pnpm's own warning is emphatic. Never set it.
  <https://pnpm.io/settings/build#dangerouslyallowallbuilds>
- **`ignoreScripts: true`** — a blunter instrument than `allowBuilds`. It also disables your
  *own* project scripts, and does not stop a pnpmfile. `allowBuilds` already gives you finer
  control. <https://pnpm.io/settings/build#ignorescripts>
- **`resolutionMode: time-based`** — genuinely relevant on paper: pnpm says it "reduces the
  chance of subdependency hijacking as subdependencies will be updated only if direct
  dependencies are updated". But it resolves direct deps to their *lowest* satisfying
  version, which fights hard against your catalog-based `^`-range setup and would be a large
  behavioural change. `minimumReleaseAge` + a committed lockfile already covers most of the
  same ground at far lower cost. **Not recommended, but worth knowing it exists.**
  <https://pnpm.io/settings/other#resolutionmode>
- **`gitBranchLockfile`** — per-branch lockfiles to dodge merge conflicts. Actively bad for
  security review: a single reviewable lockfile diff is the control.
  <https://pnpm.io/settings/store#gitbranchlockfile>
- **`verifyStoreIntegrity: false` / `strictStorePkgContentCheck: false`** — both default to
  `true`; do not turn them off. Note the docs' honest caveat that `verifyStoreIntegrity`
  "helps detect accidental store corruption" but "does not make a store that is writable by
  untrusted users safe". <https://pnpm.io/settings/store#verifystoreintegrity>
- **`lockfileIncludeTarballUrl: true`** — records full tarball URLs. Adds auditability, but
  the current docs describe canonical URLs being *omitted* by design and recomputed, so
  enabling this cuts against the grain. Skip.
  <https://pnpm.io/settings/store#lockfileincludetarballurl>

## Non-pnpm layers

Short by design — pnpm is the focus, and these are largely already handled.

- **npm provenance / attestations.** All workspace packages are `private: true` and there is
  no publish workflow, so the *publishing* side does not apply. The *consuming* side does,
  and you get at it two ways: `pnpm audit signatures` (R4) and `trustPolicy: no-downgrade`
  (R2), which reads exactly the trust evidence provenance produces. npm's docs describe
  provenance as establishing "where a package was built and who published a package".
  <https://docs.npmjs.com/generating-provenance-statements>
- **GitHub Actions hardening.** Already good: every action SHA-pinned, `permissions:` blocks
  on all workflows. On pnpm ≥11.16.0, `update.githubActions: true` lets `pnpm update` /
  `pnpm outdated` check and bump the SHA pins in your workflow files — a nice consolidation
  given Dependabot already covers `github-actions`.
  <https://docs.github.com/en/actions/reference/security/secure-use>,
  <https://pnpm.io/settings/dependency-resolution#updategithubactions>
- **CI cache trust.** `tooling/github/setup/action.yml` caches `.turbo`, and
  `actions/setup-node` with `cache: 'pnpm'` caches the pnpm store. pnpm's CI docs are
  explicit: "Only cache pnpm's store and cache directories in locations writable by trusted
  jobs. Do not let untrusted CI jobs write to a store or metadata cache that trusted jobs
  later restore." Worth a look at whether `pull_request` runs from forks can populate a
  cache that `push`-to-`main` runs later restore — GitHub's cache scoping normally prevents
  this, but I did not verify it for this repo's settings. **UNVERIFIED.**
  <https://pnpm.io/continuous-integration>, <https://pnpm.io/settings/store#storedir>,
  <https://pnpm.io/settings/other#cachedir>
- **OSSF Scorecard / Allstar.** Not assessed — I did not read a first-party doc for either,
  so per the brief I make no claim about them. **UNVERIFIED.**

## Corrections found while implementing (2026-08-04)

The recommendations above were written from the docs. Applying them on this repo
corrected five of them. Where this section disagrees with the text above, this
section is right — it is backed by observed behaviour on pnpm 11.20.0.

1. **R3 — `pnpm self-update` does not work here.** pnpm is Corepack-managed, so it
   refuses with `ERR_PNPM_CANT_SELF_UPDATE_IN_COREPACK`. Use
   `corepack use pnpm@11.20.0`, which rewrites `packageManager` (including the
   `+sha512` hash) in place.
2. **R10 — `supportedArchitectures` was rejected, not applied.** It only ever *adds*
   architectures beyond the current one, so it cannot shrink an install. Measured
   both ways on this tree, it produced an identical package set. It was dropped as
   config that reads like a control while doing nothing.
3. **R4 — `--ignore-unfixable` mutates `pnpm-workspace.yaml`.** It writes an
   `auditConfig` block rather than filtering in-memory, so it is unsafe in CI. Not
   used. Separately: `audit.level` *does* gate the exit code (initial testing
   suggested otherwise because vulnerabilities existed at every threshold).
4. **R11 — narrowing `publicHoistPattern` surfaced a real phantom dependency.**
   `apps/web` imports `@prisma/adapter-pg` in `tests/db/setup.ts` and
   `tests/e2e/setup/db-setup.ts` but never declared it; it resolved only because
   `'*prisma*'` hoisted it to the root. Fixed by declaring it in
   `apps/web/package.json` as `catalog:prisma`, not by re-widening the glob.
5. **Weakening #4 — blocking `esbuild`'s build script is safe here.** Verified with
   a forced reinstall (only `@prisma/engines` and `prisma` scripts ran) followed by
   `pnpm typecheck`, `pnpm build --force`, `pnpm lint` and `pnpm test:ci`, all
   green. This matches pnpm's own case study.

Two recommendations were **deliberately not applied**:

- **R12 (`pnpm dedupe --check` in CI)** — it exits 1 on the current tree (duplicate
  `vite`, `vitest`, `zod`). Making it pass requires running `pnpm dedupe`, which is
  dependency churn out of scope for this change.
- **R14 (`pnpm licenses` gate)** — there is no built-in allow/deny flag, so a gate
  needs a custom JSON post-processor. Worth noting that `pnpm licenses list --prod`
  currently reports `lightningcss` (and its platform binaries) as **MPL-2.0**, a
  weak copyleft the existing `@img/sharp-libvips-darwin-arm64: '-'` override does
  not cover.

Also unchanged from the research: the 19 open advisories (1 critical
`@vitest/browser` GHSA-p63j-vcc4-9vmv, 18 high) were left unremediated at the
user's direction. `pnpm audit --fix=override` does generate correct overrides for
all of them, with one wrinkle: for GHSA-c96f-x56v-gq3h it emits `^9.6.1` for
`find-my-way`, but 9.6.1 was never published (9.6.0 → 9.7.0), so the caret is doing
the real work.

## Unverified / open questions

1. Whether pnpm itself (as opposed to Corepack) validates the `+sha512.415a1cc...` integrity
   suffix on the `packageManager` field. I found no pnpm doc describing this. pnpm v11
   replaced `packageManagerStrict` / `packageManagerStrictVersion` /
   `managePackageManagerVersions` with a single `pmOnFail` setting (default `download`), and
   documents `pmOnFail: error` as the equivalent of the old
   `packageManagerStrictVersion: true` — but the docs discuss *version* mismatch behaviour,
   not hash verification. **UNVERIFIED.**
   <https://pnpm.io/settings/cli#pmonfail>
2. Whether `verifyDepsBeforeRun`'s default was already `install` in 11.1.2, or changed later
   in the v11 line. Current docs say the default is `install`. **UNVERIFIED for 11.1.2.**
   <https://pnpm.io/settings/build#verifydepsbeforerun>
3. Why `vitest` / `@vitest/*` were added to `minimumReleaseAgeExclude`. The inline comment
   only mentions CVEs, which does not explain a standing wildcard. If the real reason was
   recurring install failures on vitest bumps, R6 needs the Dependabot-cooldown check
   described there. **UNVERIFIED — needs a human who knows the history.**
4. Whether `allowBuilds: esbuild: true` is actually required in this repo. Must be tested,
   not assumed either way (see weakening #4).
5. Fork-PR CI cache isolation (see "CI cache trust" above).
