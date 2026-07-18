---
name: save-rednote-favorites
description: "Import, resume, reset, or audit user-selected Rednote/Xiaohongshu favorites from the logged-in native Mac app through Obsidian Xiaohongshu Importer Plus, including runs that must start at a user-positioned current viewport. Use for archiving, exporting, preserving, syncing, test-importing, restarting, or validating 小红书/Rednote favorites. The plugin creates Markdown and configured media; never save screenshots or manually transcribe posts."
---

# Save Rednote Favorites

Copy each favorite share link into Xiaohongshu Importer Plus and verify every import as an atomic transaction.

## Scope

- Read the workspace AGENTS.md first.
- Require a total count or range. If omitted, propose five items.
- Count only newly created notes. Skip duplicate URLs and continue until the requested total is created or the list ends.
- Process 收藏 > 笔记 in one declared mode: `cursor` starts at the user-positioned current viewport and moves only downward; `fresh` starts at the top and moves downward; `backlog` starts at the bottom and moves upward. Do not call any direction chronological unless the app does.
- Never access 90.归档Archive/99.隐私Privacy/.

## Required apps

1. Use Computer Use and its confirmation policy.
2. Use the native Rednote app and installed Obsidian plugin Xiaohongshu Importer Plus (xhs-importer).
3. Resolve the live Rednote instance by running `bash scripts/resolve_rednote_wrapper.sh` at the start of every run. If process inspection is blocked by the sandbox, rerun only this read-only helper with the required escalation. Require exactly one `.../Wrapper/discover.app` path, use that full path for every Computer Use call in the run, and verify `get_app_state` reports the Rednote window. Never store or reuse a Wrapper path from another run. Stop if the helper or verification fails.
4. Open the importer through the configured `xhs-importer:import` hotkey. Do not rely on the ribbon control. Require the import modal to open before pasting.
5. Read .obsidian/plugins/xhs-importer/data.json. Follow noteFolder, imageFolder, and downloadMedia without changing them.
6. Stop if either app is unavailable or Rednote is logged out.

## Safety

- Never like, comment, follow, unfollow, repost, message, remove a favorite, or change collection state.
- In the share sheet, select only 复制链接.
- Never download, transcribe, summarize, template, tag, or screenshot content yourself.
- Ephemeral Computer Use screenshots are for navigation only and must never enter the vault.
- Re-query app state before every UI action. Prefer accessibility elements.
- Use coordinates only from the latest screenshot and only for one card. Never replay a coordinate macro across cards.
- Treat a Rednote copy-success toast as UI feedback only, never as proof that the system pasteboard changed.
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

1. Get fresh Rednote state, open the next card, and capture a readable card fingerprint from its title plus author only when needed. Do not record account identifiers.
2. Get fresh detail state and identify sharing:
   - Prefer an explicit button labeled 分享.
   - Otherwise, for video details only, use the first count button before like, favorite, and comment after verifying the order.
   - For image details, use the visible share control from the latest state.
3. Open the share sheet and select 复制链接.
4. Switch to Obsidian, run Import Xiaohongshu note, and require the modal before pasting.
5. Paste directly into Paste the share text below:. Do not use a scratch app.
6. Read the complete importer field and extract exactly one xhslink.com URL. Accept it only when the pasted share title or other distinctive readable text agrees with the current card fingerprint. Reject it as stale when it still describes the previous card, or when its URL equals the immediately previous card's URL while the current fingerprint differs.
7. On stale, empty, or mismatched input, close the importer without submitting, return to the same open Rednote detail, and repeat steps 2-6. Retry the same card at most three times; never advance to another card. Stop and report after the third mismatch.
8. Search the ledger and all existing notes for the accepted exact URL. If found, close the importer without submitting, count a duplicate, and continue.
9. Snapshot Markdown filenames and submit exactly once.
10. Poll `noteFolder` every two seconds for up to 90 seconds for a success state or new Markdown file. Never resubmit during this window. Declare zero output only after the full timeout.
11. Diff the snapshot. Require exactly one new Markdown file, then require it to be non-empty and unchanged in size across two consecutive polls. Stop the item on zero, multiple, empty, unstable, or ambiguous outputs.
12. Let the plugin manage configured media. Do not create supplemental artifacts.
13. Immediately append one ledger row with the URL and exact new relative path using apply_patch.
14. Re-query Rednote and return to the grid.

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

## Cursor mode

Use `cursor` whenever the user manually positions Rednote or says to continue from the current view.

1. Treat the current scroll position as the only starting boundary. Never navigate to the top or bottom to establish a new start.
2. Before opening the first card, capture an ephemeral viewport fingerprint from at least two readable card-title anchors in their visible order when available. Use one anchor plus the visible grid arrangement only when fewer than two titles are readable.
3. Start with the topmost fully visible card and process complete visible cards left to right, then top to bottom. Do not open a partly clipped card above the starting boundary.
4. After returning from every detail, re-query the grid and verify the expected anchor order or neighboring card before continuing. Do not trust the Back action alone to preserve scroll position.
5. After checking the complete current viewport, scroll down once by one viewport, keeping a small overlap when the app permits. Verify the viewport changed and that no unchecked region was skipped. Never scroll upward to recover context.
6. If the app returns to the collection top, the anchors disappear unexpectedly, or the scroll position cannot be verified, stop immediately and report the last successfully archived title, URL, and file. Never restart from the top or reconstruct the position from memory.

## Resume through an existing prefix

Do not rediscover a long processed prefix by opening every card and copying every URL.

1. Build a title index from current ledger targets. For comparison only, ignore the `.md` suffix, a leading `[V]`, and a collision suffix such as `-1`; never rename files from this index.
2. Start at the boundary defined by the selected mode and inspect one fresh viewport at a time with an ephemeral screenshot.
3. A visible card may be skipped without opening only when its readable title unambiguously matches one ledger target. Treat truncated, unreadable, generic, or multiply matching titles as unknown.
4. Open unknown cards and apply the exact-URL duplicate check from **Import one favorite**. A title match is a navigation optimization, not ledger evidence.
5. After every visible card in the viewport is either title-matched or URL-checked, scroll down exactly one viewport. Never jump over an unchecked viewport and never infer that all later cards are duplicates from a sample.
6. Once a new URL is found, leave prefix-scan mode and resume normal left-to-right, top-to-bottom importing from that viewport.
7. If the app returns to the top or loses the scroll position, stop and report the last verified import. Never silently restart the scan from the top.

## Backlog mode

Use `backlog` for a large existing collection that continues to receive new favorites.

1. Navigate to the actual bottom of 收藏 > 笔记. Prefer a supported end-of-scroll key, then verify the final row is visible and no further downward scroll changes the viewport. If direct navigation is unavailable, scroll in bounded steps with fresh state checks; never replay an unattended coordinate macro.
2. Process the bottom row first, right to left, then continue upward row by row. Within each higher viewport, keep right-to-left, bottom-to-top order.
3. After every visible card is title-matched or URL-checked, scroll up exactly one viewport. Keep the last verified URL and file path as the backlog cursor.
4. New favorites appearing at the top do not change the backlog cursor. Do not return to the top merely because the profile count changes.
5. When one complete viewport in backlog mode resolves entirely to unique ledger URLs, treat the historical backlog as joined to the previously imported region. Audit, stop backlog mode, and use `fresh` on later runs.
6. In `fresh`, start at the top, import new cards left to right and top to bottom, and stop after one complete viewport resolves entirely to unique ledger URLs.

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
