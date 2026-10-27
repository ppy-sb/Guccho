# Migration inventory: guccho endpoints and data access

Input for the `Guccho migration` workstream in
`refactor/osu-server-ts/docs/refactor-progress.md`, whose next step is
*"Inventory endpoints and data access before sequencing the cutover."*

Extracted 2026-10-28 from this repository at `develop`. Counts and tables are from reading the
providers and routers, not from a live database.

## Why this matters

guccho is the **pre-migration frontend**: it talks tRPC to itself and reads bancho.py's MySQL
directly through drizzle. The replacement backend exposes the osu! stable-client web API
(`/web/*.php`), throwaway server-rendered `/pages/*`, and gRPC between its own services — **there
is no JSON API for a frontend, no tRPC, and no JWT**. So every row below is something the new
backend must eventually expose before a cutover can be sequenced.

The cutover is not dark: osu-server-ts writes committed scores back to bancho.py through
`/sb/score-writeback` until the bridge is removed, which is what keeps this app's MySQL view
current while both stacks run.

## Data access by provider

`R` = referenced; `W` = written. Table names are the MySQL names; the drizzle symbol sometimes
differs (`schema.sources` is the `mapsets` table).

### `bancho.py` (shared with the backend)

| Provider / file | Reads | Writes |
| --- | --- | --- |
| `server/user.ts` | users, scores, stats, beatmaps, mapsets, clans | **users, stats** |
| `server/rank.ts` | users, stats, scores, beatmaps | — |
| `server/score.ts` | scores, beatmaps, mapsets, clans, users | — |
| `server/map.ts` | maps, mapsets | **map_requests** |
| `server/map-search.ts` | maps | — |
| `server/clan.ts` | clans, users, stats, scores, maps, mapsets | **users** (`clan_id`) |
| `server/user-relations.ts` | relationships, users | **relationships** |
| `server/mail-token.ts` | email_tokens | **email_tokens** |
| `server/admin/user.ts` | users, stats, scores, maps, clans | **users, stats** |
| `server/admin/map.ts` | maps, map_requests | **maps, map_requests** |
| `server/admin/score.ts` | scores | — |

### `ppy.sb@bancho.py` (guccho-only feature space)

| Provider / file | Reads | Writes |
| --- | --- | --- |
| `server/dan/index.ts` | sb_dans, sb_dan_courses, sb_dan_course_dans, sb_dan_conds, sb_requirement_cond_bindings, sb_requirement_cleared_scores, scores, maps, mapsets, users, sb_patcher_scores_meta | **all `sb_dan*` + cleared scores** |
| `server/dan/processor/interval.ts` | scores | **sb_requirement_cleared_scores** |
| `server/dan/processor/$sync.ts` | sb_dan_conds | — |
| `server/user/index.ts` | userpages, users, clans | **userpages** |

There is **no enforced write boundary** — the web app may write anything. In practice it currently
writes users, stats rows, relationships, clan membership, map requests, email tokens, user pages
and the whole Dan model, and never scores or beatmaps (except admin status). That is an
observation, not a rule.

## tRPC surface (what a replacement must cover)

| Router | Endpoints | Providers |
| --- | --- | --- |
| `session` | login, retrieve, destroy | sessions, users |
| `me` | settings, dynamicSettings.{get,update}, changeUserpage, changeEmail, changeSettings, changeAvatar, updatePassword, relation, relations, notMutual, removeOneRelation, addOneRelation, sessions, kickSession | users, userRelations, mail, mailToken, sessions |
| `user` | uniqueIdent, userpage, statistic, best, tops, recent, essential, countRelations, status, search, register, accountRecovery | users, scores, maps, userRelations, mail, mailToken |
| `rank` | countLeaderboard, getCountries, leaderboard, beatmap, countBeatmap | ranks |
| `score` | id (detail) | scores |
| `map` | beatmapset, beatmap, voteBeatmap, searchBeatmap, searchBeatmapset, searchBeatmapsetGrouped, canUseAdvancedSearch | maps |
| `clan` | search, detail, joinedUsers, bests, relation, join, leave | clanProvider, scores, maps, users |
| `dan` | search, get, delete, save, userRule, getQualifiedScores, userClearedScores.{count,list,recalc}, exportAll, course.{search,get,create,update,delete,searchDan,managementSearch} | dans, scores, users |
| `article` | get, localSlugs, editor | articles |
| `mail` | getToken | mailToken |
| `status` | public, metrics, config | monitor |
| `admin` | userManagement, map, score, id/name/safeName/email/flag filters, registered*/latestActivity*, roles | adminUser, adminMap, adminScore, users |
| `admin.log` | last, truncate | logs |

Non-tRPC routes: `/api/trpc/[trpc]`, `/b/:id`, `/beatmap/:id`, `/beatmaps/:id`,
`/difficulty-rating`, `/mail/verify`, `/replay/:id/download` (session-gated), plus admin
`/api/admin/dan/export` and `/api/test/*`.

## bancho.py coupling to retire

| Coupling | Where | Replacement need |
| --- | --- | --- |
| Direct MySQL reads/writes (the core debt) | every provider | JSON/tRPC-equivalent web API, or a shared-contract service layer |
| Live player status via `GET /v1/get_player_status` | `user.ts` → `api-client` | presence from the new session store |
| Cache invalidation via `DELETE /sb/cache` | `admin/map.ts` | backend-owned cache, no frontend trigger |
| `bcrypt(md5(pw), 11)` password compatibility | `crypto.ts` | already compatible; keep until login moves to `web_session` |
| Web sessions in redis/memory (`g-sid`, `g-persist`) | `session/`, `store/session.ts` | new backend's stateless HMAC `web_session` cookie + CSRF |
| `Id = number`, `ScoreId = bigint` stringified at the boundary | every router | preserved by the legacy-ID migration; keep stringification |
| `UserRole` conflating state and capability (`Disabled`/`Restricted`/`Inactive`) | `def/user.ts` | new model: sanctions + eligibility + action catalog |
| SQL-computed ranking, or Redis when `leaderboardSource: 'redis'` | `rank.ts`, `user.ts` | `user_pp` / `user_stats_classic` / `pp_version_config` |
| Dan tables and processor | `ppy.sb@bancho.py` | **port the Dan system into the backend** (planned workstream) |
| Patcher `no_pause` metadata | `sb_patcher_scores_meta` | same column must feed the ported Dan model |
| Articles on the filesystem (`articles/`, `.gal`) | `article/` | undecided; no backend concept |
| Mail/OTP through SMTP + `email_tokens` | `mail*` | new backend already implements registration OTP |
| `maps.frozen` semantics | `admin/map.ts` | new backend implements the conditional upsert; guccho must keep sending the same intent |

## Sequencing implications

1. **Dan first, server-side.** The tracker already orders it before the guccho migration, and the
   condition tree is the part the backend adopts. The inventory of its model/APIs/consumers is in
   `AGENTS.md` §"The Dan subsystem" and `def/dan.ts`.
2. **Reads before writes.** Most endpoints are read-only; a read-only JSON API unblocks profile,
   leaderboard, map and search pages while writes (settings, relations, clan, admin) stay on
   MySQL. Profiles + leaderboards are the two surfaces users actually depend on, so they are the
   read APIs to build first.
3. **Roles/administration are upstream.** `admin` and `me` cannot move until the backend's
   privilege and administration workstreams land — they are the tracker's first two rows. Note
   that admin/BN tooling is **operator-critical**: it carries little traffic but the maintainer
   depends on it daily, so it should be the last thing to leave guccho, not the first.
4. **Hybrid until a big-bang cutover.** guccho keeps DB ownership for now while osu-server-ts
   grows its own basic HTML until most features exist there; individual features may move earlier
   (BN tooling is the example, nothing decided). At cutover the `$base`/`use` compatibility layer
   is **removed entirely**, and multi-server compatibility is redrawn afterwards rather than
   maintained through the migration.

## Method and caveats

Generated by scanning `src/server/backend/**` for `schema.*` references and
`.insert/.update/.delete(schema.*)`, then cross-checked against the providers; router rows come
from imports of `~/server/singleton/service` and top-level router keys. Symbol/table name
divergences were corrected by hand. Treat counts as a floor: a table reached only through a
helper outside the scanned directories would not appear.
