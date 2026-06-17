---
name: push
description: Commit all changes and push to GitHub with a commit message that summarises what changed.
---

When the user types `/push`, follow these steps:

## Step 1 — Check what changed

Run these in parallel:
- `git status` to see which files have changed
- `git diff` to see the actual line-by-line changes
- `git log --oneline -5` to see recent commit message style

## Step 2 — Stage all changes

```bash
git add -A
```

## Step 3 — Write the commit message

Read the diff carefully and write a short commit message (one line, under 72 characters) that summarises **what changed and why** in plain English. Focus on the purpose of the change, not just the file names.

Examples of good messages:
- `seed clue selection per country so all users get same clues daily`
- `replace flag_colour_keep with coin flip for flag clue selection`
- `fix exempt player bypass when daily country limit is reached`

## Step 4 — Commit

```bash
git commit -m "<your message here>"
```

## Step 5 — Push

```bash
git push
```

## Rules
- Never skip or bypass commit hooks (no `--no-verify`)
- If the commit fails due to a hook, fix the issue and try again with a new commit — do not amend
- Do not push if there is nothing to commit — tell the user instead
- Do not force push (`--force`) under any circumstances
