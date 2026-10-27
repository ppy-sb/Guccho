# AGENTS.md

Operating notes for coding agents working in this repo. Maintained from a full read of the
codebase plus the mined histories of prior Claude Code / Codex sessions (see
[`docs/agent-history.md`](docs/agent-history.md)). Keep this file current; it is loaded into
every new session.

## What this repo is

`guccho` (`v1.3.0`) is the **Nuxt 3 SSR frontend for private osu! servers** running
[bancho.py](https://github.com/osuAkatsuki/bancho.py). It is the production UI for `ppy.sb`
(`https://osu.ppy.sb`), and the reference frontend for the newer `refactor/` project. It has also
been deployed against **other bancho.py backends** (other private servers) — that is what the
`$base` / `use` provider layer exists for.

Stack: Nuxt 3.15 + Vue 3.5 (SSR **on**), TypeScript strict, tRPC 10 (`trpc-nuxt`),
drizzle-orm 0.43 + MySQL, Tailwind + daisyUI v4, `@nuxtjs/i18n`, Pinia, pnpm 9.15.1.

### Migration context (read before investing in a design)

This app is the **pre-migration frontend**. The `bancho.py` stack (Python/MySQL) is being replaced
by the `refactor/` workspace: osu-router (Go), osu-server-go (Go), osu-server-ts
(TypeScript/PostgreSQL). Confirmed with the maintainer 2026-10-28:

- **Hybrid for now.** guccho keeps owning the database; osu-server-ts grows its own basic HTML
  interface until most features exist there. Individual features may move earlier (e.g. BN-related
  tooling) — nothing is decided. Steps are deliberately slow: expect the current structure to
  persist for a while.
- **The cutover is big-bang**, and afterwards the provider compatibility layer is **removed**:
  no more `$base` and no more `use`. Multi-server compatibility will be redrawn after the
  migration, not maintained through it.
- **Dan is going to osu-server-ts.** It lives in guccho today only because bancho.py is not worth
  touching; it is not a long-term frontend feature.
- **No write boundary.** The web app may write anything; nothing is enforced or off-limits.
- The new backend currently exposes stable-client `/web/*.php`, throwaway `/pages/*` SSR and gRPC:
  no JSON API, no tRPC, no JWT. Until cutover, osu-server-ts writes committed scores back to
  bancho.py through `/sb/score-writeback`, which keeps this app's MySQL view current.

Consequences: prefer changes that keep behaviour identical and transferable; do not treat the
provider seam as a permanent investment, and do not invent a client for an API that is not yet
specified. Endpoint and data-access map: [`docs/migration-inventory.md`](docs/migration-inventory.md).

### What matters (maintainer, 2026-10-28)

- **Player-facing product: profiles + scores, and leaderboards/ranking.** These are what users
  actually use; they define "guccho works".
- **Operator-critical: admin / BN tooling.** Low traffic, but if it breaks the maintainer is
  blocked the same day. Treat admin regressions as more severe than their usage suggests.
- **Secondary:** beatmap search, clans, articles. Dan is leaving regardless.

When trading off, correctness of scores/rank and a working admin surface outrank polish anywhere
else.

## Quick start

```bash
cp guccho.ui.config.example.ts guccho.ui.config.ts
cp guccho.backend.config.example.ts guccho.backend.config.ts
cp .env.example .env          # DB_DSN, REDIS_URL, SMTP_URL, ...
pnpm install                  # postinstall runs build:hljs (bg) + nuxi prepare
pnpm dev                      # http://localhost:3000
```

```bash
pnpm typecheck    # nuxi typecheck  (vue-tsc; slow, ~1-2 min)
pnpm lint         # eslint --ext .js,.vue,.ts,.jsx,.tsx .
pnpm lint:fix
pnpm build        # nuxi build -> .output/
pnpm start:prod   # dotenv -e .env node .output/server/index.mjs
```

Both config files are real TypeScript and are validated at boot: [`scripts/ensure-env.ts`](scripts/ensure-env.ts)
(rejects an unset/unknown/`base` backend) and [`src/server/backend/$base/env.ts`](src/server/backend/$base/env.ts)
(zod). A bad `use` value or missing env var throws immediately, not at request time.

## Architecture — the one idea to internalize

Everything is a **provider abstraction with interchangeable backends**:

```
src/server/backend/$base/          abstract contracts only (alias `$base`) — no traffic
  ├── bancho.py/                   bancho.py osu! DB: drizzle+MySQL, Id=number, ScoreId=bigint
  └── ppy.sb@bancho.py/            = bancho.py + the "Dan" feature (alias `$active`)
```

- Active backend = `use` in [`guccho.backend.config.ts`](guccho.backend.config.ts), wired as a Vite
  alias in [`nuxt.config.ts`](nuxt.config.ts).
- `ppy.sb@bancho.py` **extends** `bancho.py`: it re-exports the bancho version of `Id`,
  `ScoreId`, modes/rulesets/ranking systems, then subclasses every provider
  (see [`server/index.ts`](src/server/backend/ppy.sb@bancho.py/server/index.ts)) and adds
  `Feature.Dan`.
- Provider singletons are constructed once in
  [`src/server/singleton/service.ts`](src/server/singleton/service.ts) and imported as
  `users`, `maps`, `scores`, `dans`, `sessions`, … Never instantiate a provider yourself.
- `$base` is **purely interfaces plus platform-neutral codes**: the `Id`/`ScoreId` aliases,
  ranking-system definitions, `userRoles`, and the provider contracts. It carries no platform
  behaviour and is rejected by `ensure-env`.
- Adding a backend: new dir `src/server/backend/<name>/` exporting the same surface
  (`index.ts`, `server/index.ts`, `drizzle/`, `locales/`, `env.ts`, `dynamic-settings.ts`,
  `log.ts`), then set `use: '<name>'`.
- **This whole layer is temporary.** `$base` + `use` exist so the site can be deployed against
  different bancho.py servers; both are removed at cutover. Do not build new abstractions on top
  of it — see Migration context above.

### Request flow

```
app.$client (tRPC, batched)                      src/plugins/client.ts
  └─ POST /api/trpc                              src/server/api/trpc/[trpc].ts
       └─ Nitro middleware 0.session -> 1.user -> 2.admin   src/server/middleware/
            └─ tRPC chain: public -> session -> user|optionalUser -> role/staff/admin/bN
                 └─ router                                src/server/trpc/routers/
                      └─ provider singleton               src/server/singleton/service.ts
                           └─ drizzle (MySQL)             backend/*/server/source/drizzle.ts
```

- Session cookie `g-sid`, persist cookie `g-persist` ([`constants.ts`](src/server/common/constants.ts)).
  Nitro middleware refreshes it; tRPC wraps it in a **write-lazy** `SessionBinding`
  ([`session-binding.ts`](src/server/common/session-binding.ts)) so routers can update sessions
  without a second store round-trip.
- Serialization is asymmetric on purpose: **superjson input, devalue `uneval` output**
  ([`transformer.ts`](src/server/trpc/transformer.ts)). The output side is `eval`'d in the
  browser — keep every tRPC return shape **plain data** (no class instances, no functions).
- **IDs cross the tRPC boundary as strings.** Providers work in `Id`/`ScoreId`; routers must
  wrap returns with `mapId(x, Provider.idToString)` and parse inputs with `stringToId`. Forgetting
  this leaks `bigint`/`number` into JSON and breaks the client.

## The Dan subsystem

### Domain: what a dan is

A **dan** (段位, "grade") is a graded skill test inherited from BMS/PMS: a collection of charts
("stages") with explicit clear conditions — typically an accuracy or score floor, often "no
pause", sometimes forced mods — and satisfying them earns the dan. In guccho's model a **course**
then groups several dans into a named ladder. osu!mania has several independent dan families, each
with its own numbering and named extras: Shoegazer (`1st`–`10th`, luminal, tachyon), 4K LN / UJ
(`Level 1`–`10`, Yoake…Yume), Reform (DDMythical; `1`–`10`, alpha–epsilon), Malody CN
(`Regular 0`–`10`, `Extra`–`Final`), and Jinjin's 7K series. Dans are a **mania** concept, and key
count is part of the identity — that is why search takes `mania.keyCount`.

### What guccho adds

Most servers hard-code a dan's clear rule (a `minAcc`-style column). Here a dan is a set of
**requirement bindings**, and every binding is an arbitrary **condition tree**
([`def/dan.ts`](src/def/dan.ts)). That modularity is deliberate — per the maintainer, guccho is
the first server to make dan requirements composable rather than fixed.

- Leaves pin a stage and constrain the play: `bancho/bm-id-eq`, `bm-md5-eq`, `acc-gte`,
  `score-gte`, `stable/mod-contains-any|all`, `no-pause`, `mode-eq`, `ruleset-eq`, or a generic
  `expect` comparison over `accuracy`, `maxCombo`, `count.*` or `score`.
- `and` / `or` / `not` wrap subtrees; `rem` attaches a remark; `extends` binds a requirement kind
  (`pass`, `no-pause`) to a subtree.
- A new condition kind is a three-point change: add it to `Cond`, teach `danSQLChunks` the SQL
  form, and teach `transformCond` the in-memory form. No schema change, no migration.

So a course can express "stage 1: acc ≥ 95%, stage 2: score ≥ 950k with HD, stage 3: pass without
pausing" without new columns. Requirements are evaluated **per binding, against the player's
existing scores** — there is no notion of one continuous multi-map run.

### Implementation

- Leaves are evaluated twice: as SQL in [`sql-dan.ts`](src/server/backend/ppy.sb@bancho.py/utils/sql-dan.ts)
  (for listing qualified scores and batch recomputation) and in memory in
  [`common/utils/dan.ts`](src/common/utils/dan.ts) (`transformUsecase` / `runUsecase`, for dry runs
  and the online composer). Keep the two in sync when adding a condition.
- `validateCond` / `validateUsecase` guard persistence; the router reuses them as a zod
  refinement.
- `DanProvider` (`ppy.sb@bancho.py/server/dan/`) persists to `sb_dans`, `sb_dan_courses`,
  `sb_dan_course_dans`, `sb_dan_conds`, `sb_requirement_cond_bindings`, and materialises
  qualified clears into `sb_requirement_cleared_scores`.
- A processor selected by `dan.processor` in the backend config (`noop` | `interval`) recomputes
  clears. `CacheSyncedDanProcessor` keeps dans and compiled pipelines in memory and reads the
  cond tree with a recursive CTE against `sb_dan_conds`.
- UI is `pages/dan/**` (`list`, `detail/[id]`, `course/**`, `compose`); the `dan` router exposes
  `search`/`get`/`save`/`delete`, `userRule` (dry-run a candidate tree against real scores),
  `getQualifiedScores`, and `userClearedScores.{count,list,recalc}`.

Reference implementations of dan (other servers and the wider community) are listed in
[`docs/agent-history.md`](docs/agent-history.md#domain-notes).

**This subsystem is leaving.** Dan belongs in osu-server-ts; it lives here only because bancho.py
is not worth modifying. Plan the condition model and these tables as a **port**, not as something
to extend indefinitely.

## Directory map

| Path | Contents |
|---|---|
| [`src/def/`](src/def/index.ts) | Framework-free domain types: `Mode`/`Ruleset`/`Rank`, `UserRole`, `Feature`, `GucchoError` (numeric codes: 2xxx user, 3xxx auth, 5xxx session, 6xxx admin, 7xxx beatmap, 8xxx score, 11xxx Dan) |
| [`src/server/trpc/routers/`](src/server/trpc/routers/index.ts) | `admin, session, me, article, clan, map, user, rank, score, status, mail, dan` |
| [`src/server/backend/$base/server/`](src/server/backend/$base/server/index.ts) | Abstract providers (`UserProvider`, `MapProvider`, `DanProvider`, …) |
| [`src/server/routes/`](src/server/routes/beatmap/[id].ts) | Non-tRPC Nitro routes: `/b/:id`, `/beatmap/:id`, `/beatmaps/:id`, `/replay/:id/download`, `/mail/verify`, `/difficulty-rating` |
| [`src/pages/`](src/pages/index.vue) | File-routed pages: `user/[handle]`, `beatmapset/[id]`, `score/[id]`, `leaderboard/[[mode]]`, `search`, `dan/**`, `admin/**`, `auth/**`, `article/**` |
| [`src/components/`](src/components/T/modal.vue) | `T/` = primitives, `app/` = chrome, `userpage/` = profile blocks, `content/` = tiptap editor |
| [`src/composables/`](src/composables/useSearchShared.ts) | Search (split modal/page/shared), editor, switchers, zoom modal |
| [`src/store/`](src/store/session.ts) | Pinia: `session`, `userpage`, `dynamic-settings` |
| [`src/locales/base/`](src/locales/base/index.ts) | UI translations, 4 locales |
| `backend/*/locales/` | Backend-specific translations (same 4 locales) |
| `backend/*/drizzle/` | `schema.ts`, migrations, `config.ts` (drizzle-kit) |
| `articles/` | Content storage for the article system (`.gal` = guccho article) |

Auto-imports: Nuxt picks up `src/composables/**` and `src/utils/**`; Nitro picks up
`src/server/utils/**`. Both [`src/utils/common.ts`](src/utils/common.ts) and
[`src/server/utils/common.ts`](src/server/utils/common.ts) `export *` from `src/common/utils`,
which is how `noop`, `raise`, `pick`, `lazySingleton`, `throwGucchoError`, `mapId`, `withFeature`
are usable without imports.

## Conventions

- **i18n completeness is compiler-enforced.** Each of the four base locales
  (`en-GB`, `zh-CN`, `fr-FR`, `de-DE`) is asserted `satisfies GlobalI18n as GlobalI18n`
  ([`@types.d.ts`](src/locales/@types.d.ts)). Adding a key to `en-GB` breaks the typecheck of the
  others until translated — that is intended. Same for `backend/*/locales/`.
- **FULLTEXT search has a house algorithm** ([`map-search.ts`](src/server/backend/bancho.py/server/map-search.ts)):
  NFKC-normalize → tokenize `/[\p{L}\p{N}_]+/gu` → append `*` to each term → `AGAINST(... IN BOOLEAN MODE)`.
  Never pass raw user input as a boolean query. Two indexes exist because MySQL requires all
  columns of an index or a left prefix: `maps_metadata_fulltext (artist,title,version)` and
  `maps_mapset_fulltext (artist,title)`.
- **Authorization must be re-checked server-side.** Frontend gating is presentation only; the
  tRPC router must strip/reject what the client shouldn't be able to ask for. Prefer exposing a
  capability query over duplicating a rule in client and server.
- **`noUnusedLocals: true`** — dead code fails `pnpm typecheck`.
- **ESLint** (`@antfu` + vue): no semicolons, single quotes, 2-space indent, inline
  `import { type X }`, multi-line trailing commas. Run `pnpm lint:fix` on touched files.
- **Git**: conventional-commit subjects, one concern per commit, `--fixup` + `rebase -i --autosquash`,
  squash to 1–2 commits. Branches: `develop` (active), `rc`, `stable` — CI runs on all three.
  Agent-authored commits end with a trailer naming model and harness, e.g.
  `Co-Authored-By: deepseek-flash (DeepSeek Harness) <noreply@deepseek.com>`; older history
  carries `Claude Sonnet 5 <noreply@anthropic.com>`.

## Checks

Both gates pass as of 2026-10-28 on `develop`:

```bash
pnpm typecheck   # exit 0
pnpm lint        # exit 0 (16 warnings, accepted)
```

Always run both before claiming a task is done; do not trust a previous session's result.
Known/accepted warnings: `vue/no-template-shadow` in `T/single-select.vue` and
`pages/admin/beatmaps.vue`, `unused-imports/no-unused-vars` in a few providers and routers,
`no-alert` in `pages/dan/compose.vue`.

**vue-i18n typing trap:** `LocaleMessageObject` is a trap here. Its alias is
`LocaleMessageDictionary<Message = string>`, but `LocaleMessageDictionary<T, Message>` takes a
*message schema* as its first parameter — so the default yields a `string`-valued dictionary and
rejects any nested message object. For setting-locale bundles use
`Record<Lang, Record<string, LocaleMessageValue>>` instead.

## Gotchas

1. **Quote `$base` in shell.** `ls src/server/backend/$base` expands to `.../` and silently
   lists the wrong thing. Use `'src/server/backend/$base'` or `\$base`.
2. **drizzle config is not at the repo root.** It lives at
   `src/server/backend/<backend>/drizzle/config.ts`; the ppy.sb one overrides the bancho one.
   `find drizzle.config.ts` will fail.
3. **Migrations are hand-written.** Add `drizzle/migrations/000N_*.sql` **and** hand-edit
   `migrations/meta/_journal.json` (+ snapshot). drizzle-kit is not used to generate them here.
4. **drizzle 0.43 has no MySQL FULLTEXT index builder** — keep FULLTEXT indexes in explicit SQL
   (see the note in [`schema.ts`](src/server/backend/bancho.py/drizzle/schema.ts) ~line 177).
5. **`ADD FULLTEXT INDEX` can fail with a phantom duplicate-key error** (`Duplicate entry '0-' for
   key 'maps.maps_set_id_server_IDX'`) even though diagnostics look clean.
   `ALGORITHM=COPY, LOCK=SHARED` works around it — it is already in
   [`0003_maps_metadata_fulltext.sql`](src/server/backend/bancho.py/drizzle/migrations/0003_maps_metadata_fulltext.sql).
6. **`Can't find FULLTEXT index matching the column list`** means the `MATCH(...)` column set is
   not an index or a left prefix of one. That is why there are two indexes.
7. **`only_full_group_by`** — grouped mapset aggregation must wrap ordering terms in `MAX(...)`.
8. **Decimal noise** (CS/AR/OD/HP/BPM, stars) is normalized in the transforms
   (`toBeatmapCompact`); the UI should be presentation-only, not a float fixer.
9. **daisyUI arbitrary opacity classes must already exist** (`bg-base-content/3` breaks the
   PostCSS build). Stick to the configured opacity scale.
10. **No MySQL client on this machine.** `mysql` is not on PATH and `mariadb`/`mysqlsh`/`mycli`
    are absent. Write SQL for the human to run rather than trying to connect.
11. **`useAsyncData` key collisions** cause cross-talk between the search modal and the search
    page. Each consumer owns its own composable and its own keys (`searchModal:*`, `searchPage:*`).
12. **Server-side query cancellation is not supported** by this stack: `trpc-nuxt` doesn't forward
    the abort signal and the MySQL pool isn't abort-aware. Client-side abort + stale-response
    guards are all that exists; real cancellation is an architecture change.
13. **`vue-tsc` needs TypeScript ≤ 6.** Do not bump to TS 7 while `vue-tsc@2.x` + Volar are in use.
14. **The lockfile is branch-named** (`git-branch-lockfile=true`): on `develop` pnpm uses
    [`pnpm-lock.develop.yaml`](pnpm-lock.develop.yaml). Never commit a plain `pnpm-lock.yaml`.
15. **Formatters may rewrite files between your read and your write.** Re-read before a
    whole-file write; prefer targeted edits. A whole-file `write` once destroyed a refactor here.
16. **`ssr: true`** despite the stale "Disable server-side rendering" comment in
    [`nuxt.config.ts`](nuxt.config.ts). Pages fetch data with `useAsyncData`/`callOnce`, so code
    must be SSR-safe (no `window` at module scope; use `.client.vue` suffixes for browser-only
    components).

## Hot spots

| Task | Start here |
|---|---|
| Auth / sessions | [`routers/session.ts`](src/server/trpc/routers/session.ts), `src/server/middleware/`, `src/store/session.ts` |
| User profile | [`pages/user/[handle].vue`](src/pages/user/[handle].vue), [`store/userpage.ts`](src/store/userpage.ts), `src/components/userpage/` |
| Search | `src/composables/useSearch{Shared,Modal,Page}.ts`, [`pages/search.vue`](src/pages/search.vue), [`routers/map.ts`](src/server/trpc/routers/map.ts), `bancho.py/server/map-search.ts` |
| Admin / BN | [`routers/admin/`](src/server/trpc/routers/admin/index.ts), `pages/admin/`, `backend/*/server/admin/` |
| Dan (hardest) | [`def/dan.ts`](src/def/dan.ts), [`common/utils/dan.ts`](src/common/utils/dan.ts), [`routers/dan.ts`](src/server/trpc/routers/dan.ts), `ppy.sb@bancho.py/server/dan/` |
| Articles / editor | `src/components/content/`, `backend/$base/server/article/`, `articles/` |
| i18n | `src/locales/base/`, `i18n.config.ts`, `backend/*/locales/` |

## Known smells / open threads

- `dan.course.search` and `dan.course.managementSearch`
  ([`routers/dan.ts`](src/server/trpc/routers/dan.ts)) use plain `publicProcedure`; every other
  Dan endpoint is wrapped in `withFeature(Feature.Dan, …)`.
- Beatmap keyword-search predicate is duplicated: the shared
  [`map-search.ts`](src/server/backend/bancho.py/server/map-search.ts) and a private copy inside
  `DanProvider` ([`dan/index.ts`](src/server/backend/ppy.sb@bancho.py/server/dan/index.ts)).
- [`optional-user.ts`](src/server/trpc/middleware/optional-user.ts) instantiates `new UserProvider()`
  instead of using the singleton, and mutates `ctx` in place instead of returning a new context.
- README TODO: grant owner privileges to the first registered user.
- Dan condition caching walks a recursive CTE over `sb_dan_conds`; it predates drizzle's
  `withRecursive` support and carries a TODO.

## Do not

- Do not switch package managers or run `npm install`/`npm run build` — pnpm only.
- Do not edit `.nuxt/`, `.output/`, or `node_modules/` (generated).
- Do not commit secrets. `.env` is local; never copy its values into source, docs, or notes.
- Do not trust the README's architecture diagram as a directory map; it describes intent, and
  the `$base`/`$active` split is the part that actually matters.
