# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`ryakarsa-market` is not an application — it's a **plugin/skill pack for Claude Code, ZCode, and Codex CLI** focused on marketing & branding. It's the sibling of [`ryakarsa`](https://github.com/revianto/ryakarsa) (PRD + design skills) and follows exactly the same conventions. Skills use the open `SKILL.md` format (agentskills.io).

## Source of truth vs. this repo

**The actual source of truth is `~/.agents/skills/`, not `skills/` in this repo.** This repo's `skills/` is a synced copy — edits made only inside the repo checkout are silently overwritten (via `rsync --delete`) the next time `scripts/sync-and-push.sh` runs.

Correct workflow when changing a skill:
1. Edit under `~/.agents/skills/<skill-name>/`.
2. Run `./scripts/sync-and-push.sh` — rsyncs each skill in its `SKILLS` array into `skills/`, validates frontmatter, **runs every `skills/*/scripts/test_*.py` and every `engine/` Node test suite (in the source dir) and refuses to push if any fail**, mirrors `skills/` into `.codex/skills/`, then commits & pushes if anything changed.
3. `.codex/skills/` is always a mirror of `skills/` — never hand-edit it.

When adding a new skill, add its name to `SKILLS=(...)` in `scripts/sync-and-push.sh` or the sync silently skips it. Then **bump the version in both manifests** (`.claude-plugin/plugin.json` and `.zcode-plugin/plugin.json`) and update both descriptions together — there's no single source for the version number.

`library/`, `__pycache__/`, `*.pyc`, and `node_modules/` are excluded from sync and gitignored. Brand data for `social-design` (brand configs, decks, custom patterns) does **not** live in this repo at all — it lives in a separate private "studio" repo (default `~/Documents/social-studio`, override with `$SOCIAL_STUDIO`). This repo only holds the engine code.

## Commands

```bash
./scripts/sync-and-push.sh                          # sync, validate, test, commit & push

# social-design engine (Node) — run in the SOURCE dir, where node_modules is installed
cd ~/.agents/skills/social-design/engine && npm install && npm test

# Fallback Python renderer (stdlib unittest, no extra deps)
cd skills/social-design/scripts && python3 -m unittest test_render_post -v
```

Render integration tests (both engine and Python) launch real headless Chrome; they're skipped automatically when Chrome (or, for the engine, `playwright-core`) isn't available. The sync script runs the engine tests in the source dir precisely so they aren't skipped.

## How the five skills relate

`brand-kit` is the **hub**: it writes `BRAND-KIT.md`, which the other four read as their primary input.

- `brand-kit` — product → brand kit (name/tagline, positioning, voice with DO/DON'T examples, glossary, key messaging, value prop per persona). Two modes: **extract** (product already live — document the existing brand from its live copy, don't invent a new one) and **generate** (new product or explicit rebrand).
- `campaign-plan` — goals, channel choice *with reasons* (including channels deliberately not used), funnel, content pillars, and a calendar sized to the team's **real capacity** → `CAMPAIGN.md`.
- `content-post` — ready-to-post content per platform, obeying hard platform limits.
- `landing-copy` — write or audit landing-page copy → `LANDING-COPY.md`.
- `social-design` — a local render **engine** (`skills/social-design/engine/`, Node + `playwright-core` driving the installed Chrome): deck JSON + pattern registry + brand tokens generated from `design-tokens` → PNGs at exact platform sizes. CLI: `node engine/cli.mjs brands|init-brand|tokens|patterns|decks|validate|render`. `scripts/render_post.py` remains only as a zero-install fallback for one-off HTML.

**Inputs don't require `ryakarsa`.** Every skill works from a finished, already-live product (live URL, local codebase, existing social accounts, user-supplied brand materials). `ryakarsa` outputs (`PRD.md`, `DESIGN-BRIEF.md`, `design-tokens`) are an optional bonus source, never a prerequisite. When sources conflict, skills must flag the conflict rather than silently pick one — live product = reality, documents = intent.

## Platform rules — single source, and it goes stale

`skills/content-post/references/platform-rules.md` holds every platform limit (Instagram, TikTok, YouTube, X, Threads, WhatsApp) and is shared by `social-design` via relative path. Don't duplicate its numbers in other skills.

Those numbers change without notice. The file carries a "Terakhir diverifikasi" date; skills are instructed to re-verify via web search when the date is >~6 months old or the use is high-stakes, and then update the file and its date. When editing it, keep the distinction between **hard limits** (platform rejects/truncates) and **recommendations** (performance drops).

## Engine design (`social-design/engine`)

- **Role contract.** Patterns never use a brand's own token names. They use fixed `--ss-*` roles (`bg`, `bgAlt`, `text`, `heading`, `accent`, `accentText`, `accentOnAlt`, `onAlt`, `onAltMuted`, `ctaBg`, `ctaText`, fonts `display`/`body`); each brand's `brand.json` maps roles to paths in its design-tokens `tokens.json`, and `tokens.css` is generated from that. `accent` (decorative) and `accentText` (text-sized) are deliberately separate: a pretty accent for rules is often too pale for numbers.
- **Contrast is checked at token-build time** for every fg/bg pair the engine actually renders together (`CONTRAST_PAIRS` in `lib/tokens.mjs`). The very first real brand tripped it (2.76:1) — keep it.
- **Patterns are plain browser scripts** calling `UC.register({name, required, span, cta, render})`. The validator reads their metadata in Node via `vm` without executing `render`, so a new pattern's required fields are enforced with no extra wiring. Brand patterns load after engine patterns and override by name.
- **Chrome elements (wordmark/handle/swipe) are added by `core.js`, not by patterns**, so their coordinates are identical on every slide. For `span: 2` patterns the chrome repeats per output segment.

## Rendering gotchas

- **Fonts must be verified, not waited for.** `document.fonts.check()` returns `true` for a family that was never declared (e.g. the Google Fonts stylesheet failed offline), so it can't detect the failure. `render.mjs` instead checks that every required face has a `FontFace` with `status === 'loaded'` and throws otherwise. It also catches the bare `page.addStyleTag: Event` Playwright throws when the stylesheet 400s, so the user sees *which* font is missing. Both are regression-tested (`render.test.mjs`, mutation-tested).
- The Python fallback `render_post.py` must keep `--virtual-time-budget` — without it text with `font-display: block` renders **invisible** in a PNG that still has correct dimensions. `BuildCommandTest` guards this (mutation-tested).

## Rules shared across all five skills

- **Never invent** claims, numbers, testimonials, customer names/logos, awards, or product photos. Use loud placeholders (`[TESTIMONI ASLI — ...]`) and list them at the end. This matters more here than in `ryakarsa`: marketing copy is published and can be legally challenged.
- Interactive questions via `AskUserQuestion` when available, numbered-list fallback otherwise — never gate on a specific client name.
- Run in the user's language; examples are Indonesian but not meant to force Indonesian output.
- Output files get backed up to `<NAME>_old.md` before being overwritten.
