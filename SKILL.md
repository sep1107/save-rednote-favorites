---
name: save-rednote-favorites
description: "Import, resume, reset, or audit user-selected Rednote/Xiaohongshu favorites from the logged-in native Mac app through Obsidian Xiaohongshu Importer Plus. Use for archiving, exporting, preserving, syncing, test-importing, restarting, or validating 小红书/Rednote favorites. The plugin creates Markdown and configured media; never save screenshots or manually transcribe posts."
---

# Save Rednote Favorites

Copy each favorite share link into Xiaohongshu Importer Plus and verify every import as an atomic transaction.

## Scope

- Read the workspace AGENTS.md first.
- Require a total count or range. If omitted, propose five items.
- Count only newly created notes. Skip duplicate URLs and continue until the requested total is created or the list ends.
- Process 收藏 > 笔记 in the app's current grid order, left to right and top to bottom. Do not call it chronological unless the app does.
- Never access 90.归档Archive/99.隐私Privacy/.

## Required apps

1. Use Computer Use and its confirmation policy.
2. Use the native Rednote app and installed Obsidian plugin Xiaohongshu Importer Plus (xhs-importer).
3. Resolve Rednote with rednote, then com.xingin.discover. If either is unavailable or ambiguous, derive the current running `.../Wrapper/discover.app` parent from the `discover` process command, then verify `get_app_state` succeeds and reports the Rednote window. Never record, reuse, or infer a Wrapper path from another run; stop if the current path cannot be resolved and verified.
4. Use the configured `xhs-importer:import` hotkey when the ribbon control cannot be triggered. Require the import modal to open before pasting.
5. Read .obsidian/plugins/xhs-importer/data.json. Follow noteFolder, imageFolder, and downloadMedia without changing them.
6. Stop if either app is unavailable or Rednote is logged out.

## Safety

- Never like, comment, follow, unfollow, repost, message, remove a favorite, or change collection state.
- In the share sheet, select only 复制链接.
- Never download, transcribe, summarize, template, tag, or screenshot content yourself.
- Ephemeral Computer Use screenshots are for navigation only and must never enter the vault.
- Re-query app state before every UI action. Prefer accessibility elements.
- Use coordinates only from the latest screenshot and only for one card. Never replay a coordinate macro across cards.
- Stop after three consecutive UI failures and report the last verified import.

## Reset requests

Treat deletion/reset as a separate preflight before importing:

1. Record every file that will be removed.
2. When preserving a note, preserve every local file referenced by that note. A note and its attachments are one preservation unit.
3. Delete only files explicitly covered by the request. Verify the preserved note has no broken local embeds afterward.
4. Recreate the ledger only from verified current notes; never infer URL-to-note mappings from modification time.

## Preflight

1. Confirm the plugin manifest exists and xhs-importer is enabled.
2. Snapshot Markdown and media filenames in configured folders.
3. Read noteFolder/小红书导入记录.md when present.
4. Record baseline note count, unique ledger URL count, and visible favorite count when available.
5. Run the audit script when a ledger exists. Resolve errors before adding more notes.

## Import one favorite

Complete all steps before opening another card:

1. Get fresh Rednote state and open the next card.
2. Get fresh detail state and identify sharing:
   - Prefer an explicit button labeled 分享.
   - Otherwise, for video details only, use the first count button before like, favorite, and comment after verifying the order.
   - For image details, use the visible share control from the latest state.
3. Open the share sheet and select 复制链接.
4. Switch to Obsidian and run Import Xiaohongshu note.
5. Paste directly into Paste the share text below:. Do not use a scratch app.
6. Read the importer field and extract the exact xhslink.com URL.
7. Search the ledger and all existing notes for that exact URL. If found, close the importer without submitting, count a duplicate, and continue.
8. Snapshot Markdown filenames, submit once, and wait for success or the new file to open.
9. Diff the snapshot. Require exactly one new non-empty Markdown file. Stop the item on zero, multiple, or ambiguous outputs.
10. Let the plugin manage configured media. Do not create supplemental artifacts.
11. Immediately append one ledger row with the URL and exact new relative path using apply_patch.
12. Re-query Rednote and return to the grid.

Never defer ledger writing, backfill it by modification time, or start the next card before the current URL, file, and ledger row agree.

## Ledger

Use a parser-safe relative path instead of a raw wikilink:

~~~markdown
# 小红书导入记录

- 2026-07-13 | https://xhslink.com/example | 导入的笔记.md
~~~

- Record only successful current files.
- Keep one row per unique URL.
- Treat the ledger as required when an imported note omits its source URL.
- Never record account identifiers, profile location, clipboard history, or private values.

## Batch control

- Use operational chunks of at most 20 items, even when the requested total is larger.
- After every 20 created notes, run the audit script and verify the created-note delta equals the unique-URL delta.
- Track URLs and exact created paths, never card coordinates.
- Send progress at least every 10 imports and at least once per 60 seconds.
- Resume from the last verified ledger row, not from memory or an old screenshot.

## Audit

Run:

~~~bash
node scripts/audit_imports.mjs <vault-root> <noteFolder> <imageFolder>
~~~

Require:

- Requested created-note count is met.
- Ledger URLs are unique and every ledger target exists.
- Every created note is non-empty.
- Every local Markdown image reference exists.
- No screenshot artifact was created.
- Plugin-managed media stayed in imageFolder.
- No Rednote social or favorite state changed.

Report requested, created, duplicate, and failure counts. If 30.知识库Wiki/log.md exists and workspace rules permit, append one concise organize entry with the date, counts, destination, and that content/media came from the plugin.
