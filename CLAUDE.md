# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`ryakarsa-market` is not an application — it's a **plugin/skill pack for Claude Code, ZCode, and Codex CLI** focused on marketing & branding. It's the sibling of [`ryakarsa`](https://github.com/revianto/ryakarsa) (PRD + design skills) and follows exactly the same conventions. Skills use the open `SKILL.md` format (agentskills.io).

## Source of truth vs. this repo

**The actual source of truth is `~/.agents/skills/`, not `skills/` in this repo.** This repo's `skills/` is a synced copy — edits made only inside the repo checkout are silently overwritten (via `rsync --delete`) the next time `scripts/sync-and-push.sh` runs.

Correct workflow when changing a skill:
1. Edit under `~/.agents/skills/<skill-name>/`.
2. Run `./scripts/sync-and-push.sh` — rsyncs each skill in its `SKILLS` array into `skills/`, validates frontmatter, **runs every `skills/*/scripts/test_*.py` and refuses to push if any fail**, mirrors `skills/` into `.codex/skills/`, then commits & pushes if anything changed.
3. `.codex/skills/` is always a mirror of `skills/` — never hand-edit it.

When adding a new skill, add its name to `SKILLS=(...)` in `scripts/sync-and-push.sh` or the sync silently skips it. Then **bump the version in both manifests** (`.claude-plugin/plugin.json` and `.zcode-plugin/plugin.json`) and update both descriptions together — there's no single source for the version number.

`library/`, `__pycache__/`, and `*.pyc` are excluded from sync and gitignored: `library/` holds the user's personal saved post templates (private brand data, not skill definitions).

## Commands

```bash
./scripts/sync-and-push.sh                          # sync, validate, test, commit & push

# Run tests for a skill's scripts manually (stdlib unittest, no extra deps)
cd skills/social-design/scripts && python3 -m unittest test_render_post test_manage_library -v
```

`RenderIntegrationTest` actually launches headless Chrome; it's skipped automatically when Chrome/Chromium isn't installed.

## How the five skills relate

`brand-kit` is the **hub**: it writes `BRAND-KIT.md`, which the other four read as their primary input.

- `brand-kit` — product → brand kit (name/tagline, positioning, voice with DO/DON'T examples, glossary, key messaging, value prop per persona). Two modes: **extract** (product already live — document the existing brand from its live copy, don't invent a new one) and **generate** (new product or explicit rebrand).
- `campaign-plan` — goals, channel choice *with reasons* (including channels deliberately not used), funnel, content pillars, and a calendar sized to the team's **real capacity** → `CAMPAIGN.md`.
- `content-post` — ready-to-post content per platform, obeying hard platform limits.
- `landing-copy` — write or audit landing-page copy → `LANDING-COPY.md`.
- `social-design` — reusable visual post templates at exact platform pixel sizes; "idea only" or "generate" (renders real PNGs via `scripts/render_post.py`).

**Inputs don't require `ryakarsa`.** Every skill works from a finished, already-live product (live URL, local codebase, existing social accounts, user-supplied brand materials). `ryakarsa` outputs (`PRD.md`, `DESIGN-BRIEF.md`, `design-tokens`) are an optional bonus source, never a prerequisite. When sources conflict, skills must flag the conflict rather than silently pick one — live product = reality, documents = intent.

## Platform rules — single source, and it goes stale

`skills/content-post/references/platform-rules.md` holds every platform limit (Instagram, TikTok, YouTube, X, Threads, WhatsApp) and is shared by `social-design` via relative path. Don't duplicate its numbers in other skills.

Those numbers change without notice. The file carries a "Terakhir diverifikasi" date; skills are instructed to re-verify via web search when the date is >~6 months old or the use is high-stakes, and then update the file and its date. When editing it, keep the distinction between **hard limits** (platform rejects/truncates) and **recommendations** (performance drops).

## Rendering gotcha (`social-design`)

`render_post.py` must keep `--virtual-time-budget`. Without it headless Chrome captures before Google Fonts load, and text using `font-display: block` renders **invisible** — the brand headline silently vanishes from a PNG that still has the correct dimensions. `BuildCommandTest` guards this; it was mutation-tested to fail when the flag is removed.

## Rules shared across all five skills

- **Never invent** claims, numbers, testimonials, customer names/logos, awards, or product photos. Use loud placeholders (`[TESTIMONI ASLI — ...]`) and list them at the end. This matters more here than in `ryakarsa`: marketing copy is published and can be legally challenged.
- Interactive questions via `AskUserQuestion` when available, numbered-list fallback otherwise — never gate on a specific client name.
- Run in the user's language; examples are Indonesian but not meant to force Indonesian output.
- Output files get backed up to `<NAME>_old.md` before being overwritten.
