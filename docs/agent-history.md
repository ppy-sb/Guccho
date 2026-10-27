# Agent history — what prior sessions established

Archaeology from the Claude Code and Codex histories for this repo, gathered 2026-10-28.
The goal is to stop rediscovering decisions that were already made, and to know which
"obvious" fixes were already tried and rejected.

Read [`AGENTS.md`](../AGENTS.md) for the current operating manual. This file is the *why*.

## Where the history lives (if you need to dig further)

| Agent | Location | State |
|---|---|---|
| Claude Code | `~/.claude/projects/-Users-Shared-git-ppy-sb-guccho/*.jsonl` (3 sessions, Sep 17–18) | Readable JSONL transcripts. `memory/` subdir is **empty** — nothing was ever consolidated. |
| Codex | `~/.codex/state_5.sqlite` (`threads`), `~/.codex/sessions/2026/**` rollouts | 11 threads with `cwd=guccho` (Aug 31, Sep 14–17). `memories_1.sqlite` is **empty** (`stage1_outputs` = 0). |
| DSH | `~/.dsh/` | Current harness state. |

Codex state is only inspectable through SQLite + rollout files; there is no consolidated
memory to read. `~/.codex/logs_2.sqlite` and `history.jsonl` contain nothing useful about
this project.

## Timeline

### Aug 31 — BN beatmap status audit log
Commit `a47edf56` added logging when a beatmap nominator changes a beatmap's ranked status
(`src/server/trpc/routers/admin/index.ts`). Cross-repo consequence, discovered later: the
admin/BN UI sets `maps.frozen = 1` on the bancho.py side, and bancho.py used to overwrite the
frozen status when refreshing from the osu! API. That was fixed **in the bancho.py repo**
(branch `fix/frozen-beatmap-status`, `a952cb26`), not here.

### Sep 14–17 — the `/search` page
The largest workstream. Built osu!-style filtered search: operator chips (`=`, `>`, `>=`, `<`,
`<=`), separate Beatmaps/Users scopes sharing only free text, permanent filter strip (not inside
a modal), cold search (submit, no hot reload), paginated results, `maps.frozen=1` meaning
"custom ranked", supporter/BN/staff-gated advanced filters.

Design decisions that were argued out and settled:

- **Frontend-only gating is not enough.** The server strips disallowed filters even if the client
  sends them, and keeps empty-string guards. Capability queries are preferred over duplicating
  rules client + server.
- **mania CS = key count.** Label it "key", not "CS"; buckets 4–7 / <4 / >7.
- **Duration's last bucket is `>= 10:00`, not `10:00+` semantics of a closed interval.**
- A native `type="search"` clear button duplicated the custom clear affordance → removed.
- `<details>` cannot animate; use a checkbox-driven collapse, which doubles as a master switch.
- `only_full_group_by` broke the grouped mapset query → ordering terms wrapped in `MAX(...)`.
- Decimal artifacts (CS/AR/OD/HP/BPM, stars) are normalized in `toBeatmapCompact`, not in the UI.
- daisyUI `bg-base-content/3` is not a real class → PostCSS build error.

Architecture outcomes:

- State split across three composables — `useSearchShared.ts` (state + operators),
  `useSearchModal.ts` (quick search), `useSearchPage.ts` (advanced search) — each with its own
  `useAsyncData` keys (`searchModal:*`, `searchPage:*`). The single shared `useSearch.ts` caused
  modal/page cross-talk and was deleted.
- URL state is kebab-case (`?q=`, `maps=grouped|set-only`, `rank=all|custom|ranked`), restored on
  load and on back/forward. A URL↔state circular watcher ("search query is not updating at all")
  was fixed by syncing on submit only, with a `fromUrl` guard on restore.
- Result limits are load-bearing: `autoResultSize()` = 5 ("all") / 10, `beatmapPerPage` = 10.
  Doubling them once made the modal unusable.
- Client-side cancel + stale-response guard only. **Server-side cancellation is impossible today**:
  `trpc-nuxt` does not forward the abort signal, `context.ts` only exposes the H3 event, and the
  MySQL pool is not abort-aware. Real cancellation would need H3 `close` + a dedicated connection
  + `KILL QUERY`.

### Sep 17–18 — FULLTEXT search and i18n

- `src/server/backend/bancho.py/server/map.ts` was switched from a wall of `LIKE` comparisons to
  MySQL FULLTEXT. Two indexes were required: `(artist, title, version)` for map search and
  `(artist, title)` for mapset-only search. A `MATCH` on a column subset fails with
  *Can't find FULLTEXT index matching the column list*.
- `ADD FULLTEXT INDEX` on the local DB failed with a phantom
  `Duplicate entry '0-' for key 'maps.maps_set_id_server_IDX'` (later `Duplicate entry '' for key
  'maps.maps_md5_uindex'`) even though the index is non-unique and diagnostics were empty.
  `REPAIR TABLE` is unsupported on the storage engine in use. `ALGORITHM=COPY, LOCK=SHARED`
  works; that is why the migration carries it.
- The `filename` index was considered for removal and **kept**: the osu! client fetches maps by
  filename, the bancho.py API path is `/web/maps/{map_filename}`, and older Dan searches used it.
- `creator` is not indexed anywhere. Adding it as a `LIKE` blew up modal result counts and was
  dropped as a secondary filter.
- The same FULLTEXT predicate was then applied to the Dan beatmap search
  (`ppy.sb@bancho.py/server/dan/index.ts`). Note the correction that mattered: the removed `LIKE`
  predicates sat on `bmId`/`bmMd5` aliases that are only joined for exact ID/MD5 conditions —
  the metadata search had to be **added**, not merely un-`LIKE`d.
- de-DE lagged behind the other locales and broke `tsc` (`TS2352`/`TS2322`) because every locale
  is `satisfies GlobalI18n`. Missing keys were `dan`, `title.dan`, and several `GucchoError`
  members. Fixed in `d521b2db`.
- Later: French translations for the Dan feature and clan/admin pages, then DE locale
  (`89ea349a`, `95538653`, `d521b2db`).

### Sep 20–21 — admin beatmap filters, styles
`a46c0387`, `c6ea6977` (admin beatmap search filters), `0d5694f7` (styles). This is HEAD on
`develop`.

### Oct 28 — checks turned green, notes materialized
Cleared the three pre-existing failures and wrote this documentation set.

- `assertNotReachable` built `new Error('')` purely to capture a stack; `unicorn/error-message`
  rejects an empty message. It now carries a label.
- `extractSettingLocales` returned a per-locale-optional type whose values were
  `TLang | undefined`, which `useI18n({ messages })` rejects. Retyped to
  `Record<Lang, Record<string, LocaleMessageValue>>`, which also fixed a latent bug: the function
  only seeded `en-GB` and `zh-CN`, so any future `fr-FR`/`de-DE` setting locale would have been
  silently dropped. All four languages are now seeded.
- Removed an unused `getDB` helper from `dan/compose.vue` (`noUnusedLocals`).

Pitfall worth keeping: vue-i18n's `LocaleMessageObject` looks like the right target but is not.
It aliases `LocaleMessageDictionary<Message = string>`, while
`LocaleMessageDictionary<T, Message = string>` takes the *message schema* first — so the default
produces a `string`-valued dictionary that rejects nested message objects (TS2418/TS2322).

## Decisions already made (don't re-litigate)

| Question | Answer |
|---|---|
| Where does the drizzle config go? | `src/server/backend/<backend>/drizzle/config.ts`, never the repo root. |
| Are migrations generated? | No — hand-written SQL + hand-edited `meta/_journal.json`. |
| Can drizzle declare FULLTEXT indexes? | No (0.43.1 has no MySQL FULLTEXT builder). Keep them in SQL. |
| Can queries be cancelled server-side? | No. Client abort + stale guard only. |
| Is TypeScript 7 viable? | No. `vue-tsc@2.x` + Volar + Nuxt need TS ≤ 6. |
| Should the search page and modal share a composable? | No. Separate composables, separate `useAsyncData` keys. |
| Use a component library wrapper or native elements? | Native elements + daisyUI classes; prefer CSS over JS wrappers. |
| Reuse a shared component that doesn't quite fit? | Duplicate it rather than force-fit. |
| Is the quick-search modal allowed to show many results? | No — 5 in "all" mode, 10 otherwise. |
| Is there a write boundary for the web app? | No. It may write anything; nothing is off-limits. |
| Does the `$base`/`use` provider layer survive the migration? | No. It exists for multi-server deployments today and is removed at cutover; compatibility is redrawn afterwards. |
| Where does Dan end up? | osu-server-ts — not bancho.py, which is not worth modifying. guccho is a temporary home. |
| Refactor guccho or rewrite it? | Undecided. Expect a hybrid first (guccho keeps the DB, osu-server-ts grows basic HTML) and a big-bang cutover. |
| Is multi-server reuse still a goal? | Today yes (deployed against other bancho.py servers); no reuse commitment after the cutoff. |
| What is guccho's core? | Profiles + scores, and leaderboards/ranking (asked 2026-10-28: "1 and 2 mostly"). Admin/BN is low traffic but operator-critical: "7 breaks me". |

## Environment facts

- Local dev DB is a Docker MySQL 8 (`ppysb-docker-mysql-1`, published on host port **3307**),
  database `banchopy`, matching the bancho.py schema; `DB_DSN` in `.env` points at it. Redis is
  used when `sessionStore: 'redis'`.
- **No MySQL client is installed on this machine.** Earlier agents had to write `.sql` files at
  the repo root for the human to run. Clean up after yourself if you do the same.
- The legacy Python bancho.py source is checked out at
  `/Users/Shared/git/ppy-sb/refactor/bancho.py` — useful when a DB symptom actually originates
  server-side. Its parent `/Users/Shared/git/ppy-sb/refactor/` is a separate migration project
  (osu-router in Go, osu-server-go, osu-server-ts) that treats **guccho as the "previous
  frontend" reference**; that project has its own `AGENTS.md`.
- Production is `https://osu.ppy.sb` against `https://api.ppy.sb/v1`. `/replay/:id/download`
  requires a login session.

## Friction worth remembering

- Interactive `git rebase -i` has no editor here and auto-completes, leaving commits misordered.
  Use `GIT_SEQUENCE_EDITOR` or a sequence file. Conflicts recur in `src/locales/base/fr-FR.ts`
  when two translation commits overlap.
- The linter/formatter rewrites files between read and write; target edits, and re-read before a
  whole-file write. A whole-file write once destroyed an in-progress refactor of `useSearch.ts`
  and needed `git checkout HEAD -- <path>`.
- Two Sep 14 Codex sessions were provisioned without shell/file tools; retrying did not help, a
  fresh session did.
- `find drizzle.config.ts` and `mysql` both "not found" here are environment facts, not bugs in
  the repo.

## Open threads (as of 2026-10-28)

1. ~~`pnpm typecheck` / `pnpm lint` failed on pre-existing errors.~~ **Fixed** — see the
   2026-10-28 entry above; both gates now pass.
2. `dan.course.search` / `dan.course.managementSearch` are not feature-gated.
3. The beatmap keyword-search predicate is duplicated between `map-search.ts` and `DanProvider`.
4. `optional-user.ts` bypasses the provider singleton and mutates `ctx`.
5. The `ADD FULLTEXT INDEX` duplicate-entry error was never root-caused; the workaround shipped
   but the underlying cause is still unknown. Worth investigating if it recurs.
6. `mania_key_search (mode, cs)` was declared in the schema; nobody has verified whether
   `(frozen)`, `(frozen, mode)` or `(frozen, mode, cs)` is the right index with `EXPLAIN ANALYZE`.
7. README TODO: first registered user should become owner.

## Domain notes

Background gathered 2026-10-28, after the maintainer corrected an earlier reading of the feature:
*"Dan is a collection of maps with clear requirements. it's a mania thing and we are the first
server made it modular and expandable."*

- A **dan** (段位) is a skill-grade test borrowed from BMS/PMS: an ordered set of charts with
  explicit clear conditions — usually an accuracy or score floor, often no-pause, sometimes
  forced mods. Clearing every stage earns the dan.
- osu!mania has several independent dan families, each with its own numbering and named extras.
  The main ones are catalogued in the VSRG-4K wiki (below).
- Dans are **mania-only**, and key count is part of the identity — hence `mania.keyCount` on dan
  search.
- The **modular requirement tree is the differentiator**, not an implementation detail. Most
  servers store a fixed `minAcc`-style rule per dan; guccho composes arbitrary conditions, which
  is why `OP`/`Cond` exists and why new condition kinds are additive.

Where to look when extending the feature:

- [VSRG-4K wiki: 段位 / dan course](https://electrowind.github.io/VSRG-4K-wiki/difficulty-rate/dan/) —
  history of the families (Shoegazer, 4K LN/UJ, Reform, Malody CN, Jinjin's 7K) and their
  contents. The most useful single reference found.
- [Dan ~ REFORM ~](https://www.danreform.com/) — home of the Reform (DDMythical) family.
- [osu! forum: Dan: Celestial](https://osu.ppy.sh/community/forums/topics/1803173) — an example of
  a newly proposed dan series; the full text requires an osu! login.
- **Mamestagram** (`https://web.mamesosu.net`) — pointed at by the maintainer as another server
  with a dan implementation. Cloudflare answers 403 to non-browser clients, so it can only be
  inspected in a real browser.

These are external community sources: treat their specifics as reference, not as requirements for
this codebase.

## Handoff (2026-10-28)

`develop` is green (typecheck, lint, build) and these notes are committed, so a new session can
start from [`AGENTS.md`](../AGENTS.md) alone. If no task has been given yet, these are the
obvious next steps, cheapest first:

1. Feature-gate `dan.course.search` / `dan.course.managementSearch` with `Feature.Dan` — they are
   the only Dan endpoints that bypass `withFeature`.
2. Make `DanProvider` call the shared `createBeatmapKeywordSearch` instead of keeping a private
   copy of the FULLTEXT predicate.
3. Give `optional-user.ts` the singleton provider and return a new context instead of mutating
   `ctx` in place.
4. Only if it resurfaces: root-cause the phantom `ADD FULLTEXT INDEX` duplicate-entry error.
