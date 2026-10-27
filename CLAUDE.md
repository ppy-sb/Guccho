# CLAUDE.md

@AGENTS.md

The imported file is the operating manual for this repo (stack, architecture, request flow,
conventions, check baseline, gotchas, hot spots). Read it first.

## Claude-specific notes

- **Prior session archaeology:** [`docs/agent-history.md`](docs/agent-history.md). It records
  decisions that were already argued out (search composable split, FULLTEXT index choices,
  server-side gating, TypeScript version ceiling). Do not reopen them without new evidence.
- **Before claiming a task is done**, run `pnpm typecheck` and `pnpm lint` yourself. Earlier
  sessions here were explicitly called out for skipping this. Both commands currently fail on
  pre-existing errors — compare against the baseline in `AGENTS.md` rather than expecting green.
- **Mining the history:** transcripts live in
  `~/.claude/projects/-Users-Shared-git-ppy-sb-guccho/*.jsonl`. The `memory/` directory there is
  empty; nothing was auto-consolidated, so grep the JSONL directly.
- **Commit style observed here:** conventional-commit subjects, one concern per commit, then
  `--fixup` + `rebase -i --autosquash` to squash to 1–2 commits. Commit only when asked.
- **No MySQL client, no `drizzle.config.ts` at the root** — both are expected; see the gotchas.
