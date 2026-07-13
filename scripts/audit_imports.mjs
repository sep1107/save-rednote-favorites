#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [vaultArg, noteFolderArg, imageFolderArg] = process.argv.slice(2);
if (!vaultArg || !noteFolderArg || !imageFolderArg) {
  console.error("Usage: node audit_imports.mjs <vault-root> <noteFolder> <imageFolder>");
  process.exit(2);
}

const vaultRoot = path.resolve(vaultArg);
const noteFolder = path.resolve(vaultRoot, noteFolderArg);
const imageFolder = path.resolve(vaultRoot, imageFolderArg);
const ledgerPath = path.join(noteFolder, "小红书导入记录.md");
const errors = [];
const warnings = [];

const noteFiles = fs
  .readdirSync(noteFolder, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "小红书导入记录.md")
  .map((entry) => entry.name)
  .sort();

for (const name of noteFiles) {
  const body = fs.readFileSync(path.join(noteFolder, name), "utf8");
  if (!body.trim()) errors.push({ type: "empty-note", note: name });

  for (const match of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|data:)/i.test(target)) continue;
    const resolved = path.isAbsolute(target)
      ? target
      : path.resolve(vaultRoot, decodeURIComponent(target));
    if (!fs.existsSync(resolved)) errors.push({ type: "missing-embed", note: name, target });
  }
}

const rows = [];
if (!fs.existsSync(ledgerPath)) {
  errors.push({ type: "missing-ledger" });
} else {
  const lines = fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!line.startsWith("- ")) continue;
    const match = line.match(/^-\s+([^|]+)\|\s*(https?:\/\/xhslink\.com\/\S+)\s*\|\s*(.+)$/);
    if (!match) {
      errors.push({ type: "invalid-ledger-row", line: index + 1 });
      continue;
    }
    let target = match[3].trim();
    if (target.startsWith("[[") && target.endsWith("]]")) target = target.slice(2, -2);
    rows.push({ line: index + 1, url: match[2], target });
  }
}

const seenUrls = new Map();
for (const row of rows) {
  if (seenUrls.has(row.url)) {
    errors.push({ type: "duplicate-url", url: row.url, lines: [seenUrls.get(row.url), row.line] });
  } else {
    seenUrls.set(row.url, row.line);
  }

  const targetPath = path.resolve(noteFolder, row.target);
  if (!fs.existsSync(targetPath)) {
    errors.push({ type: "missing-ledger-target", line: row.line, target: row.target });
    continue;
  }

  const body = fs.readFileSync(targetPath, "utf8");
  const sourceUrls = [...body.matchAll(/https?:\/\/xhslink\.com\/[^\s)]+/g)].map((match) => match[0]);
  if (sourceUrls.length && !sourceUrls.includes(row.url)) {
    errors.push({ type: "ledger-url-mismatch", line: row.line, target: row.target, url: row.url });
  } else if (!sourceUrls.length) {
    warnings.push({ type: "note-has-no-source-url", line: row.line, target: row.target });
  }
}

const screenshots = fs.existsSync(imageFolder)
  ? fs.readdirSync(imageFolder).filter((name) => /截图|screenshot/i.test(name))
  : [];
if (screenshots.length) errors.push({ type: "screenshot-artifacts", files: screenshots });

console.log(JSON.stringify({
  noteCount: noteFiles.length,
  mediaCount: fs.existsSync(imageFolder) ? fs.readdirSync(imageFolder).length : 0,
  ledgerRows: rows.length,
  uniqueLedgerUrls: seenUrls.size,
  errors,
  warnings,
}, null, 2));

process.exit(errors.length ? 1 : 0);
