window.__ModuleLoader__.load({
	id: "@local/dsh-inline-diff",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/enhanced-shell.jsx
var import_react2 = require("react");

// src/client/diff.js
var CONTEXT_LINES = 3;
var ALIGN_MAX_SIDE_LINES = 4e3;
var ALIGN_MAX_CELLS = 25e5;
var INLINE_ROW_CAP = 42;
var FULL_VIEW_ROW_CAP = 4e3;
function contentLines(text) {
  if (typeof text !== "string" || text === "") return [];
  const body = text.endsWith("\n") ? text.slice(0, -1) : text;
  return body.split("\n");
}
function ctxRow(text, oldNo, newNo) {
  return { kind: "ctx", text, oldNo, newNo };
}
function delRow(text, oldNo) {
  return { kind: "del", text, oldNo, newNo: null };
}
function addRow(text, newNo) {
  return { kind: "add", text, oldNo: null, newNo };
}
function coarseAlign(oldLines, newLines) {
  const rows = [];
  let prefix = 0;
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix++;
  let oldEnd = oldLines.length;
  let newEnd = newLines.length;
  while (oldEnd > prefix && newEnd > prefix && oldLines[oldEnd - 1] === newLines[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  for (let i = 0; i < prefix; i++) rows.push(ctxRow(oldLines[i], i + 1, i + 1));
  for (let i = prefix; i < oldEnd; i++) rows.push(delRow(oldLines[i], i + 1));
  for (let j = prefix; j < newEnd; j++) rows.push(addRow(newLines[j], j + 1));
  let oldNo = oldEnd + 1;
  let newNo = newEnd + 1;
  while (oldNo <= oldLines.length && newNo <= newLines.length) {
    rows.push(ctxRow(oldLines[oldNo - 1], oldNo, newNo));
    oldNo++;
    newNo++;
  }
  return { rows, coarse: true };
}
function alignLines(oldLines, newLines) {
  const m = oldLines.length;
  const n = newLines.length;
  if (m === 0) return { rows: newLines.map((text, j2) => addRow(text, j2 + 1)), coarse: false };
  if (n === 0) return { rows: oldLines.map((text, i2) => delRow(text, i2 + 1)), coarse: false };
  if (m > ALIGN_MAX_SIDE_LINES || n > ALIGN_MAX_SIDE_LINES || m * n > ALIGN_MAX_CELLS) {
    return coarseAlign(oldLines, newLines);
  }
  const w = n + 1;
  const dp = new Uint32Array((m + 1) * w);
  for (let i2 = m - 1; i2 >= 0; i2--) {
    const row = i2 * w;
    const below = row + w;
    const line = oldLines[i2];
    for (let j2 = n - 1; j2 >= 0; j2--) {
      dp[row + j2] = line === newLines[j2] ? dp[below + j2 + 1] + 1 : Math.max(dp[below + j2], dp[row + j2 + 1]);
    }
  }
  const rows = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      rows.push(ctxRow(oldLines[i], i + 1, j + 1));
      i++;
      j++;
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
      rows.push(delRow(oldLines[i], i + 1));
      i++;
    } else {
      rows.push(addRow(newLines[j], j + 1));
      j++;
    }
  }
  while (i < m) {
    rows.push(delRow(oldLines[i], i + 1));
    i++;
  }
  while (j < n) {
    rows.push(addRow(newLines[j], j + 1));
    j++;
  }
  return { rows, coarse: false };
}
function locateOnce(needle, fileLines) {
  if (!Array.isArray(needle) || needle.length === 0) return -1;
  if (!Array.isArray(fileLines) || fileLines.length < needle.length) return -1;
  let found = -1;
  const last = fileLines.length - needle.length;
  outer: for (let i = 0; i <= last; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (fileLines[i + j] !== needle[j]) continue outer;
    }
    if (found !== -1) return -1;
    found = i;
  }
  return found;
}
function groupHunks(rows) {
  const keep = new Uint8Array(rows.length);
  let hasChange = false;
  for (let i2 = 0; i2 < rows.length; i2++) {
    if (rows[i2].kind === "ctx") continue;
    hasChange = true;
    for (let d = Math.max(0, i2 - CONTEXT_LINES); d <= Math.min(rows.length - 1, i2 + CONTEXT_LINES); d++) keep[d] = 1;
  }
  if (!hasChange) return [];
  const hunks = [];
  let oldCur = 0;
  let newCur = 0;
  let gap = null;
  let i = 0;
  while (i < rows.length) {
    if (keep[i] === 0) {
      const oldStart = oldCur + 1;
      const newStart = newCur + 1;
      const start = i;
      while (i < rows.length && keep[i] === 0) {
        const row = rows[i];
        if (row.oldNo !== null && row.oldNo !== void 0) oldCur = row.oldNo;
        if (row.newNo !== null && row.newNo !== void 0) newCur = row.newNo;
        i++;
      }
      const count = i - start;
      const oldCount = oldCur - (oldStart - 1);
      const newCount = newCur - (newStart - 1);
      if (hunks.length > 0 && i < rows.length && count > 0 && oldCount > 0) {
        gap = {
          count,
          oldCount,
          newCount,
          oldStart,
          oldEnd: oldCur,
          newStart,
          newEnd: newCur,
          // Mapping shift of the unchanged band, which is what the annotation
          // promises: old Lx now reads as new Ly.
          shift: newStart - oldStart
        };
      }
      continue;
    }
    const startOld = oldCur + 1;
    const startNew = newCur + 1;
    const seg = [];
    while (i < rows.length && keep[i] !== 0) {
      const row = rows[i];
      if (row.oldNo !== null && row.oldNo !== void 0) oldCur = row.oldNo;
      if (row.newNo !== null && row.newNo !== void 0) newCur = row.newNo;
      seg.push(row);
      i++;
    }
    const hunk = makeHunk(seg, startOld, startNew, gap);
    hunks.push(hunk);
    gap = null;
  }
  return hunks;
}
function makeHunk(rows, boundaryOld, boundaryNew, gapBefore) {
  let oldStart = null;
  let oldEnd = null;
  let newStart = null;
  let newEnd = null;
  let added = 0;
  let removed = 0;
  for (const row of rows) {
    if (row.kind === "del") {
      removed++;
      if (oldStart === null) oldStart = row.oldNo;
      oldEnd = row.oldNo;
    } else if (row.kind === "add") {
      added++;
      if (newStart === null) newStart = row.newNo;
      newEnd = row.newNo;
    } else {
      if (oldStart === null) oldStart = row.oldNo;
      oldEnd = row.oldNo;
      if (newStart === null) newStart = row.newNo;
      newEnd = row.newNo;
    }
  }
  const oldCount = rows.filter((row) => row.kind !== "add").length;
  const newCount = rows.filter((row) => row.kind !== "del").length;
  if (oldStart === null) {
    oldStart = boundaryOld;
    oldEnd = boundaryOld - 1;
  }
  if (newStart === null) {
    newStart = boundaryNew;
    newEnd = boundaryNew - 1;
  }
  return {
    index: 0,
    rows,
    oldStart,
    oldEnd,
    newStart,
    newEnd,
    oldCount,
    newCount,
    added,
    removed,
    gapBefore: gapBefore ?? null,
    hasNumbers: true
  };
}
var INTRA_MAX_CHARS = 4e3;
var INTRA_MAX_CELLS = 16e4;
var INTRA_MAX_TOTAL_CELLS = 2e6;
function lineTokens(text) {
  if (typeof text !== "string" || text === "") return [];
  const tokens = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[A-Za-z0-9_$]+|\s+|./gu);
  return tokens === null ? [] : tokens;
}
function pushSegment(segments, text, changed) {
  if (text === "") return;
  const last = segments[segments.length - 1];
  if (last !== void 0 && last.changed === changed) last.text += text;
  else segments.push({ text, changed });
}
function segmentsFromFlags(tokens, flags) {
  const segments = [];
  for (let i = 0; i < tokens.length; i++) pushSegment(segments, tokens[i], flags[i] === 1);
  return segments;
}
function lineSegments(oldText, newText, budget = null) {
  if (typeof oldText !== "string" || typeof newText !== "string") return null;
  if (oldText === newText) return null;
  if (oldText.length > INTRA_MAX_CHARS || newText.length > INTRA_MAX_CHARS) return null;
  const a = lineTokens(oldText);
  const b = lineTokens(newText);
  if (a.length === 0 || b.length === 0) return null;
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  let aEnd = a.length;
  let bEnd = b.length;
  while (aEnd > prefix && bEnd > prefix && a[aEnd - 1] === b[bEnd - 1]) {
    aEnd--;
    bEnd--;
  }
  const am = aEnd - prefix;
  const bn = bEnd - prefix;
  if (am === 0 && bn === 0) return null;
  const cells = am * bn;
  if (cells > INTRA_MAX_CELLS) return null;
  if (budget !== null) {
    if (cells > budget.remaining) return null;
    budget.remaining -= cells;
  }
  const oldFlags = new Uint8Array(a.length);
  const newFlags = new Uint8Array(b.length);
  for (let i = 0; i < prefix; i++) {
    oldFlags[i] = 0;
    newFlags[i] = 0;
  }
  for (let i = aEnd; i < a.length; i++) oldFlags[i] = 0;
  for (let i = bEnd; i < b.length; i++) newFlags[i] = 0;
  if (am > 0 && bn > 0) {
    const w = bn + 1;
    const dp = new Uint32Array((am + 1) * w);
    for (let i2 = am - 1; i2 >= 0; i2--) {
      const row = i2 * w;
      const below = row + w;
      const token = a[prefix + i2];
      for (let j2 = bn - 1; j2 >= 0; j2--) {
        dp[row + j2] = token === b[prefix + j2] ? dp[below + j2 + 1] + 1 : Math.max(dp[below + j2], dp[row + j2 + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < am && j < bn) {
      if (a[prefix + i] === b[prefix + j]) {
        i++;
        j++;
      } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
        oldFlags[prefix + i] = 1;
        i++;
      } else {
        newFlags[prefix + j] = 1;
        j++;
      }
    }
    while (i < am) {
      oldFlags[prefix + i] = 1;
      i++;
    }
    while (j < bn) {
      newFlags[prefix + j] = 1;
      j++;
    }
  } else if (am > 0) {
    for (let i = prefix; i < aEnd; i++) oldFlags[i] = 1;
  } else {
    for (let j = prefix; j < bEnd; j++) newFlags[j] = 1;
  }
  return {
    old: segmentsFromFlags(a, oldFlags),
    new: segmentsFromFlags(b, newFlags)
  };
}
function annotateIntraLine(rows) {
  let i = 0;
  const budget = { remaining: INTRA_MAX_TOTAL_CELLS };
  while (i < rows.length) {
    if (rows[i].kind === "ctx") {
      i++;
      continue;
    }
    const dels = [];
    const adds = [];
    while (i < rows.length && rows[i].kind !== "ctx") {
      if (rows[i].kind === "del") dels.push(rows[i]);
      else adds.push(rows[i]);
      i++;
    }
    const count = Math.min(dels.length, adds.length);
    if (count === 0) continue;
    for (let k = 0; k < count; k++) {
      if (budget.remaining <= 0) break;
      const segments = lineSegments(dels[k].text, adds[k].text, budget);
      if (segments === null) continue;
      dels[k].segments = segments.old;
      adds[k].segments = segments.new;
    }
  }
  return rows;
}
var MOVE_MIN_LINES = 2;
var MOVE_SINGLE_MIN_CHARS = 12;
var MOVE_MAX_LINES = 120;
function trimBlankEdges(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return { core: lines.slice(start, end), offset: start };
}
function runIsSignificant(lines) {
  if (lines.length >= MOVE_MIN_LINES && lines.some((text) => text.trim() !== "")) return true;
  if (lines.length === 1 && lines[0].trim().length >= MOVE_SINGLE_MIN_CHARS) return true;
  return false;
}
function detectMoves(hunks) {
  const deleted = [];
  const added = [];
  for (const hunk of hunks) {
    let i = 0;
    const rows = hunk.rows;
    while (i < rows.length) {
      const kind = rows[i].kind;
      if (kind === "ctx") {
        i++;
        continue;
      }
      const start = i;
      while (i < rows.length && rows[i].kind === kind) i++;
      const run = rows.slice(start, i);
      const lines = run.map((row) => row.text);
      const trimmed = trimBlankEdges(lines);
      const record = {
        hunk,
        start,
        coreOffset: trimmed.offset,
        core: trimmed.core,
        oldNo: run[0].oldNo ?? null,
        newNo: run[0].newNo ?? null
      };
      if (trimmed.core.length === 0) continue;
      if (kind === "del") deleted.push(record);
      else added.push(record);
    }
  }
  if (deleted.length === 0 || added.length === 0) return 0;
  const candidates = [];
  for (const d of deleted) {
    if (!runIsSignificant(d.core) || d.core.length > MOVE_MAX_LINES) continue;
    for (const a of added) {
      if (d.core.length !== a.core.length || !runIsSignificant(a.core)) continue;
      let equal = true;
      for (let k = 0; k < d.core.length; k++) {
        if (d.core[k] !== a.core[k]) {
          equal = false;
          break;
        }
      }
      if (!equal) continue;
      const distance = d.oldNo !== null && a.newNo !== null ? Math.abs(a.newNo - d.oldNo) : 0;
      candidates.push({ d, a, length: d.core.length, distance });
    }
  }
  if (candidates.length === 0) return 0;
  candidates.sort((x, y) => y.length - x.length || x.distance - y.distance);
  const usedDel = /* @__PURE__ */ new Set();
  const usedAdd = /* @__PURE__ */ new Set();
  let pairs = 0;
  for (const candidate of candidates) {
    const dKey = candidate.d.hunk.index + ":" + candidate.d.start;
    const aKey = candidate.a.hunk.index + ":" + candidate.a.start;
    if (usedDel.has(dKey) || usedAdd.has(aKey)) continue;
    usedDel.add(dKey);
    usedAdd.add(aKey);
    const delRow2 = candidate.d.hunk.rows[candidate.d.start + candidate.d.coreOffset];
    const addRow2 = candidate.a.hunk.rows[candidate.a.start + candidate.a.coreOffset];
    const length = candidate.length;
    if (addRow2.newNo !== null) delRow2.move = { kind: "to", line: addRow2.newNo, endLine: addRow2.newNo + length - 1 };
    if (delRow2.oldNo !== null) addRow2.move = { kind: "from", line: delRow2.oldNo, endLine: delRow2.oldNo + length - 1 };
    pairs++;
  }
  return pairs;
}
function hunkTotals(hunks) {
  let added = 0;
  let removed = 0;
  for (const hunk of hunks) {
    added += hunk.added;
    removed += hunk.removed;
  }
  return { added, removed };
}
function diffText(beforeText, afterText) {
  const oldLines = contentLines(beforeText ?? "");
  const newLines = contentLines(afterText ?? "");
  const { rows, coarse } = alignLines(oldLines, newLines);
  annotateIntraLine(rows);
  const hunks = groupHunks(rows);
  hunks.forEach((hunk, index) => {
    hunk.index = index + 1;
  });
  if (!coarse) detectMoves(hunks);
  const totals = hunkTotals(hunks);
  return {
    rows,
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    coarse,
    hasNumbers: true,
    beforeText: beforeText ?? "",
    afterText: afterText ?? "",
    beforeLineCount: oldLines.length,
    afterLineCount: newLines.length
  };
}
function fragmentDiff(oldText, newText) {
  const oldLines = contentLines(oldText ?? "");
  const newLines = contentLines(newText ?? "");
  const { rows } = alignLines(oldLines, newLines);
  annotateIntraLine(rows);
  const hunks = groupHunks(rows);
  hunks.forEach((hunk, index) => {
    hunk.index = index + 1;
  });
  const totals = hunkTotals(hunks);
  return {
    rows: [],
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    hasNumbers: false,
    fragment: true,
    beforeText: oldText ?? "",
    afterText: newText ?? ""
  };
}
function stripNumbers(hunks) {
  for (const hunk of hunks) {
    hunk.hasNumbers = false;
    hunk.oldStart = null;
    hunk.oldEnd = null;
    hunk.newStart = null;
    hunk.newEnd = null;
    for (const row of hunk.rows) {
      row.oldNo = null;
      row.newNo = null;
    }
  }
}
function computeGaps(hunks) {
  for (let i = 0; i < hunks.length; i++) {
    const current = hunks[i];
    if (i === 0) {
      current.gapBefore = null;
      continue;
    }
    const previous = hunks[i - 1];
    if (!current.hasNumbers || !previous.hasNumbers) {
      current.gapBefore = null;
      continue;
    }
    const oldStart = previous.oldEnd + 1;
    const newStart = previous.newEnd + 1;
    const count = current.oldStart - oldStart;
    if (count > 0) {
      current.gapBefore = {
        count,
        oldCount: count,
        newCount: count,
        oldStart,
        oldEnd: current.oldStart - 1,
        newStart,
        newEnd: current.newStart - 1,
        shift: newStart - oldStart
      };
    } else {
      current.gapBefore = null;
    }
  }
}
function attachLineNumbers(hunks, fileLines) {
  let shift = 0;
  for (const hunk of hunks) {
    const newSide = hunk.rows.filter((row) => row.kind !== "del").map((row) => row.text);
    const oldSide = hunk.rows.filter((row) => row.kind !== "add");
    let baseNew = null;
    if (newSide.length > 0) {
      const at = locateOnce(newSide, fileLines);
      if (at >= 0) baseNew = at + 1;
    } else if (oldSide.length > 0) {
      const probe = oldSide.slice(0, Math.min(CONTEXT_LINES, oldSide.length)).map((row) => row.text);
      const at = locateOnce(probe, fileLines);
      if (at >= 0) baseNew = at + 1 + shift;
    }
    if (baseNew !== null) {
      const baseOld = baseNew - shift;
      let oldNo = baseOld;
      let newNo = baseNew;
      for (const row of hunk.rows) {
        if (row.kind === "ctx") {
          row.oldNo = oldNo++;
          row.newNo = newNo++;
        } else if (row.kind === "del") {
          row.oldNo = oldNo++;
          row.newNo = null;
        } else {
          row.oldNo = null;
          row.newNo = newNo++;
        }
      }
      hunk.oldStart = hunk.rows.find((row) => row.oldNo !== null)?.oldNo ?? baseOld;
      hunk.newStart = hunk.rows.find((row) => row.newNo !== null)?.newNo ?? baseNew;
      hunk.oldEnd = [...hunk.rows].reverse().find((row) => row.oldNo !== null)?.oldNo ?? hunk.oldStart - 1;
      hunk.newEnd = [...hunk.rows].reverse().find((row) => row.newNo !== null)?.newNo ?? hunk.newStart - 1;
      hunk.hasNumbers = true;
    }
    shift += hunk.newCount - hunk.oldCount;
  }
  computeGaps(hunks);
}
function narrowDiffs(diffs) {
  if (!Array.isArray(diffs) || diffs.length === 0) return null;
  const out = [];
  for (const hunk of diffs) {
    if (hunk === null || typeof hunk !== "object") return null;
    const path = hunk.path;
    const oldText = hunk.oldText;
    const newText = hunk.newText;
    if (typeof path !== "string" || oldText !== null && typeof oldText !== "string" || typeof newText !== "string") return null;
    out.push({ path, oldText, newText });
  }
  return out;
}
function diffFromMeta(diffs, fileLines) {
  const hunks = [];
  let added = 0;
  let removed = 0;
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i];
    const oldLines = contentLines(diff.oldText ?? "");
    const newLines = contentLines(diff.newText);
    const { rows } = alignLines(oldLines, newLines);
    annotateIntraLine(rows);
    const hunk = makeHunk(rows, 1, 1, null);
    hunk.index = i + 1;
    added += hunk.added;
    removed += hunk.removed;
    hunks.push(hunk);
  }
  stripNumbers(hunks);
  if (Array.isArray(fileLines)) attachLineNumbers(hunks, fileLines);
  return {
    rows: [],
    hunks,
    added,
    removed,
    oldLineCount: null,
    newLineCount: Array.isArray(fileLines) ? fileLines.length : null,
    hasNumbers: hunks.length > 0 && hunks.every((hunk) => hunk.hasNumbers),
    source: Array.isArray(fileLines) ? "located" : "meta",
    beforeText: null,
    afterText: null
  };
}
function joinPath(cwd, path) {
  if (typeof path !== "string" || path === "") return "";
  if (/^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\") || path.startsWith("/")) return path;
  if (typeof cwd !== "string" || cwd === "") return path;
  const separator = cwd.includes("\\") ? "\\" : "/";
  return `${cwd.replace(/[\\/]+$/, "")}${separator}${path.replace(/^[\\/]+/, "")}`;
}
function displayPath(path, cwd, home) {
  if (typeof path !== "string" || path === "") return "";
  let text = path;
  if (typeof cwd === "string" && cwd !== "") {
    const root = cwd.replace(/[\\/]+$/, "");
    if (text === root) text = ".";
    else if (text.startsWith(root + "/") || text.startsWith(root + "\\")) text = text.slice(root.length + 1);
  }
  if (typeof home === "string" && home !== "" && !/^[A-Za-z]:/.test(home)) {
    const root = home.replace(/\/+$/, "");
    if (text === root) text = "~";
    else if (text.startsWith(root + "/")) text = "~" + text.slice(root.length);
  }
  return text;
}

// src/client/model.js
var MUTATION_TOOLS = ["edit", "write", "str_replace_editor"];
function parseArgs(raw) {
  if (typeof raw !== "string" || raw === "") return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function stringArg(args, key) {
  if (args === null) return void 0;
  const value = args[key];
  return typeof value === "string" ? value : void 0;
}
function deriveCall(block) {
  const settled = block !== null && typeof block === "object" && "kind" in block;
  const call2 = settled ? block.call : block;
  const phase = settled ? "result" : call2?.phase === "preparing" ? "preparing" : "start";
  return {
    settled,
    phase,
    name: typeof call2?.name === "string" ? call2.name : "",
    argsRaw: typeof call2?.argsRaw === "string" ? call2.argsRaw : null,
    args: parseArgs(call2?.argsRaw),
    meta: settled ? block.meta : void 0,
    callId: settled ? block.callId : call2?.callId,
    parentCallId: settled ? block.parentCallId : call2?.parentCallId,
    isError: settled && block.isError === true,
    error: settled ? block.error : void 0,
    content: settled && Array.isArray(block.content) ? block.content : [],
    raw: block
  };
}
function resolveToolName(call2, fallback) {
  if (call2.name !== "") return call2.name;
  return typeof fallback === "string" ? fallback : "";
}
function errorMessage(call2) {
  if (call2.isError !== true) return "";
  const parts = [];
  for (const part of call2.content) {
    if (part?.type === "text" && typeof part.text === "string") parts.push(part.text);
  }
  const info = call2.error;
  if (parts.length === 0 && info !== null && typeof info === "object") {
    const reason = typeof info.reason === "string" ? info.reason : typeof info.code === "string" ? info.code : typeof info.name === "string" ? info.name : "";
    if (reason !== "") parts.push(reason);
  }
  const text = parts.join("\n").trim();
  if (text === "") return "";
  const newline = text.indexOf("\n");
  return newline === -1 ? text : text.slice(0, newline);
}
function titleKeyOf(toolName) {
  if (toolName === "write") return "title.write";
  if (toolName === "str_replace_editor") return "title.strReplace";
  return "title.edit";
}
function operationKey(operation) {
  if (operation === "create") return "op.create";
  if (operation === "overwrite") return "op.overwrite";
  return "op.update";
}
function resolveOperation(snapshot, call2, diff) {
  if (snapshot !== null && snapshot !== void 0) {
    if (snapshot.operation === "create" || snapshot.before === null) return "create";
    return "update";
  }
  const metaOperation = call2.meta !== null && typeof call2.meta === "object" ? call2.meta.operation : void 0;
  if (metaOperation === "create") return "create";
  if (metaOperation === "update") return "update";
  if (diff !== void 0 && diff !== null && diff.hunks.length > 0) {
    const onlyAdds = diff.hunks.every((hunk) => hunk.removed === 0);
    if (onlyAdds) return "create";
  }
  return "update";
}
function exceedsAlignBudget(beforeText, afterText) {
  const oldCount = contentLines(beforeText).length;
  const newCount = contentLines(afterText).length;
  return oldCount > ALIGN_MAX_SIDE_LINES || newCount > ALIGN_MAX_SIDE_LINES || oldCount * newCount > ALIGN_MAX_CELLS;
}
function buildCardModel({ block, toolName, cwd, home, snapshot, fileText, loading }) {
  const call2 = deriveCall(block);
  const resolvedToolName = resolveToolName(call2, toolName);
  const argsPath = stringArg(call2.args, "file_path") ?? stringArg(call2.args, "path");
  const metaPath = call2.meta !== null && typeof call2.meta === "object" && typeof call2.meta.path === "string" ? call2.meta.path : null;
  const absolutePath = metaPath !== null && metaPath !== "" ? metaPath : joinPath(cwd, argsPath ?? "");
  const shownPath = displayPath(metaPath !== null && metaPath !== "" ? metaPath : argsPath ?? "", cwd, home);
  const base = {
    toolName: resolvedToolName,
    titleKey: titleKeyOf(resolvedToolName),
    callId: call2.callId,
    filePath: shownPath,
    absolutePath: absolutePath !== "" ? absolutePath : null,
    operation: "update",
    status: "running",
    source: null,
    diff: null,
    notice: null,
    errorMessage: "",
    loading: loading === true,
    parentCallId: call2.parentCallId
  };
  if (call2.phase === "preparing") {
    return { ...base, status: "preparing" };
  }
  if (call2.settled && call2.isError) {
    return { ...base, status: "error", errorMessage: errorMessage(call2) };
  }
  if (call2.settled) {
    if (snapshot !== null && snapshot !== void 0 && typeof snapshot.after === "string") {
      const before = typeof snapshot.before === "string" ? snapshot.before : null;
      const after = snapshot.after;
      const operation = resolveOperation(snapshot, call2, null);
      if (before !== null && before === after) {
        return { ...base, status: "nochange", operation, source: "snapshot", diff: diffText(before, after) };
      }
      if (before !== null && exceedsAlignBudget(before, after)) {
        const oldCount = contentLines(before).length;
        const newCount = contentLines(after).length;
        const diffs2 = narrowDiffs(call2.meta?.diffs);
        if (diffs2 !== null) {
          const located = diffFromMeta(diffs2, contentLines(after));
          located.oldLineCount = oldCount;
          located.newLineCount = newCount;
          return {
            ...base,
            status: "ok",
            operation,
            source: "located",
            notice: { kind: "huge", old: oldCount, new: newCount },
            diff: located
          };
        }
        const coarse = diffText(before, after);
        return {
          ...base,
          status: "ok",
          operation,
          source: "snapshot",
          notice: coarse.coarse ? { kind: "coarse", old: oldCount, new: newCount } : { kind: "huge", old: oldCount, new: newCount },
          diff: coarse
        };
      }
      return {
        ...base,
        status: "ok",
        operation,
        source: "snapshot",
        diff: diffText(before ?? "", after)
      };
    }
    const diffs = narrowDiffs(call2.meta?.diffs);
    if (diffs !== null) {
      const lines = typeof fileText === "string" ? contentLines(fileText) : null;
      const located = diffFromMeta(diffs, lines);
      return {
        ...base,
        status: "ok",
        operation: resolveOperation(null, call2, located),
        source: lines === null ? "meta" : "located",
        notice: lines === null ? loading === true ? null : { kind: "lines" } : { kind: "history" },
        diff: located
      };
    }
    if (resolvedToolName === "write") {
      const content = stringArg(call2.args, "content");
      const metaOperation = call2.meta !== null && typeof call2.meta === "object" ? call2.meta.operation : void 0;
      if (typeof content === "string" && metaOperation !== "update") {
        const created = diffText("", content);
        return { ...base, status: "ok", operation: "create", source: "args", diff: created };
      }
      return { ...base, status: "nochange", operation: metaOperation === "create" ? "create" : "update", source: null };
    }
    return { ...base, status: "empty" };
  }
  const args = call2.args;
  if (resolvedToolName === "write") {
    const content = stringArg(args, "content");
    if (typeof content === "string") {
      const preview = diffText("", content);
      return { ...base, status: "running", operation: "create", source: "preview", diff: preview };
    }
  } else if (resolvedToolName === "edit") {
    const oldString = stringArg(args, "old_string");
    const newString = stringArg(args, "new_string");
    if (typeof oldString === "string" && typeof newString === "string") {
      const preview = fragmentDiff(oldString, newString);
      return { ...base, status: "running", operation: "update", source: "preview", diff: preview };
    }
  } else if (resolvedToolName === "str_replace_editor") {
    const oldString = stringArg(args, "old_str");
    const newString = stringArg(args, "new_str");
    const fileTextArg = stringArg(args, "file_text");
    if (typeof fileTextArg === "string") {
      return { ...base, status: "running", operation: "create", source: "preview", diff: diffText("", fileTextArg) };
    }
    if (typeof oldString === "string" && typeof newString === "string") {
      return { ...base, status: "running", operation: "update", source: "preview", diff: fragmentDiff(oldString, newString) };
    }
  }
  return { ...base, status: "running" };
}

// src/client/enhanced-tools.jsx
var import_react = require("react");

// src/client/settings.js
var STORAGE_KEY = "dsh-inline-diff.settings.v3";
var LEGACY_KEY = "dsh-inline-diff.settings.v2";
var OLDER_KEY = "dsh-inline-diff.settings.v1";
var DEFAULTS = {
  /** 'enhanced' = inline diff cards; 'native' = DSH file-mutation rows. */
  fileCards: "enhanced",
  /** 'enhanced' = flat expanded Bash/PowerShell rows; 'native' = DSH rows. */
  shellRows: "native",
  /** 'enhanced' = other tool calls expand IN/OUT by default; 'native' = DSH disclosure rows. */
  toolCalls: "native",
  /** 'enhanced' = DSH verbose transcript (flat, unfolded); 'native' = don't touch it. */
  transcript: "native"
};
var listeners = /* @__PURE__ */ new Set();
var state = load();
var previousTranscript;
var transcriptForm;
var configFormsRef;
persist();
function normalizeMode(value) {
  if (value === "enhanced" || value === "native") return value;
  if (typeof value === "string" && value !== "") return "enhanced";
  return void 0;
}
function load() {
  try {
    const storage = globalThis.localStorage;
    if (storage === void 0 || storage === null) return { ...DEFAULTS };
    let raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== "string" || raw === "") {
      raw = storage.getItem(LEGACY_KEY);
    }
    if (typeof raw !== "string" || raw === "") return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return { ...DEFAULTS };
    const next = { ...DEFAULTS };
    const fileCards = normalizeMode(parsed.fileCards);
    const shellRows = normalizeMode(parsed.shellRows);
    const toolCalls = normalizeMode(parsed.toolCalls);
    const transcript = normalizeMode(parsed.transcript);
    if (fileCards !== void 0) next.fileCards = fileCards;
    if (shellRows !== void 0) next.shellRows = shellRows;
    if (toolCalls !== void 0) next.toolCalls = toolCalls;
    if (transcript !== void 0) next.transcript = transcript;
    if (typeof parsed.previousTranscript === "string" && parsed.previousTranscript !== "") {
      previousTranscript = parsed.previousTranscript;
    }
    return next;
  } catch {
    return { ...DEFAULTS };
  }
}
function persist() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      ...previousTranscript === void 0 ? {} : { previousTranscript }
    }));
    globalThis.localStorage?.removeItem(LEGACY_KEY);
    globalThis.localStorage?.removeItem(OLDER_KEY);
  } catch {
  }
}
function emit() {
  for (const listener of listeners) listener();
}
function getSettings() {
  return state;
}
function subscribeSettings(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function updateSettings(patch) {
  state = { ...state, ...patch };
  persist();
  emit();
}
async function resetSettings() {
  const wasEnhanced = state.transcript === "enhanced";
  state = { ...DEFAULTS };
  previousTranscript = void 0;
  persist();
  emit();
  try {
    if (state.transcript === "enhanced") await adoptTranscriptPreference();
    else if (wasEnhanced) await setTranscriptPreference("native");
  } catch {
  }
}
function initSettings(configForms) {
  configFormsRef = configForms;
  void adoptTranscriptPreference();
}
function chatForm() {
  if (configFormsRef === void 0) throw new Error("configForms is not available");
  if (transcriptForm === void 0) transcriptForm = configFormsRef.get("ui-chat");
  return transcriptForm;
}
function currentTranscriptMode() {
  try {
    return chatForm().getSnapshot().value?.transcriptView;
  } catch {
    return void 0;
  }
}
async function setTranscriptPreference(mode) {
  const form = chatForm();
  if (mode === "enhanced") {
    const current2 = form.getSnapshot().value?.transcriptView;
    if (typeof current2 === "string" && current2 !== "verbose" && current2 !== "normal" && current2 !== "expanded") {
      previousTranscript = current2;
    } else if (typeof current2 !== "string") {
      previousTranscript = "standard";
    }
    updateSettings({ transcript: "enhanced" });
    await form.set("transcriptView", "verbose");
    return;
  }
  updateSettings({ transcript: "native" });
  const current = form.getSnapshot().value?.transcriptView;
  if (current === "verbose") {
    await form.set("transcriptView", previousTranscript ?? "standard");
  }
}
async function adoptTranscriptPreference() {
  if (state.transcript !== "enhanced") return;
  try {
    if (configFormsRef === void 0) return;
    const form = chatForm();
    const current = form.getSnapshot().value?.transcriptView;
    if (current !== "verbose") {
      if (typeof current === "string" && current !== "normal" && current !== "expanded") previousTranscript = current;
      await form.set("transcriptView", "verbose");
      persist();
    }
  } catch {
  }
}

// src/client/enhanced-tools.jsx
var import_jsx_runtime = require("react/jsx-runtime");
function toolCallPhase(block) {
  if ("kind" in block) return { phase: "result", block };
  return block.phase === "preparing" ? { phase: "preparing", block } : { phase: "start", block };
}
function callName(call2) {
  return call2.phase === "result" ? call2.block.call?.name ?? "" : call2.block.name;
}
function toolLabel(name, t) {
  if (typeof name !== "string" || name === "") return "Tool";
  if (typeof t === "function") {
    const key = `toolTitle.${name}`;
    const translated = t(key);
    if (typeof translated === "string" && translated !== key) return translated;
  }
  return name.replace(/[_-]+/g, " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
function wireName(name, t) {
  if (typeof name !== "string" || name === "") return "Tool";
  if (typeof t === "function") {
    const key = `toolTitle.${name}`;
    const translated = t(key);
    if (typeof translated === "string" && translated !== key) return translated;
  }
  return name;
}
function summaryOf(args) {
  if (args === null || typeof args !== "object") return "";
  const keys = ["description", "command", "file_path", "path", "pattern", "url", "query", "prompt", "objective", "skill", "title", "name", "tool"];
  for (const key of keys) {
    const value = args[key];
    if (typeof value !== "string" || value.trim() === "") continue;
    const first = value.split("\n")[0].trim();
    return first.length > 120 ? first.slice(0, 120) + "…" : first;
  }
  return "";
}
function inputText(call2) {
  if (call2.args !== null && call2.args !== void 0) {
    try {
      return JSON.stringify(call2.args, null, 2);
    } catch {
      return call2.argsRaw ?? "";
    }
  }
  return call2.argsRaw ?? "";
}
function outputText(call2) {
  const parts = [];
  for (const part of call2.content) {
    if (part === null || typeof part !== "object") continue;
    if (part.type === "text" && typeof part.text === "string") parts.push(part.text);
    else if (part.type === "image") parts.push("[image]");
    else parts.push(JSON.stringify(part, null, 2));
  }
  if (parts.length === 0 && call2.error !== null && call2.error !== void 0) {
    const info = call2.error;
    const reason = typeof info.reason === "string" ? info.reason : typeof info.code === "string" ? info.code : typeof info.name === "string" ? info.name : "";
    if (reason !== "") parts.push(reason);
  }
  return parts.join("\n");
}
function genericModel(block, toolName, t) {
  const call2 = deriveCall(block);
  const stopped = call2.settled && call2.error !== null && call2.error !== void 0 && call2.error.code === "interrupted";
  const state2 = !call2.settled ? call2.phase === "preparing" ? "preparing" : "running" : stopped ? "stopped" : call2.isError ? "error" : "ok";
  return {
    title: toolLabel(call2.name !== "" ? call2.name : toolName, t),
    displayName: wireName(call2.name !== "" ? call2.name : toolName, t),
    summary: summaryOf(call2.args),
    input: inputText(call2),
    output: call2.settled ? outputText(call2) : "",
    state: state2
  };
}
function statusKey(state2) {
  if (state2 === "preparing") return "state.preparing";
  if (state2 === "running") return "state.running";
  if (state2 === "error") return "state.error";
  if (state2 === "stopped") return "state.stopped";
  return null;
}
function EnhancedExpandedTool({ block, toolName, t, inspect }) {
  const model = (0, import_react.useMemo)(() => genericModel(block, toolName, t), [block, toolName, t]);
  const [open, setOpen] = (0, import_react.useState)(true);
  const stateLabel = statusKey(model.state);
  const hasBody = model.input !== "" || model.output !== "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-tool enhanced-generic", "data-variant": "tool", "data-state": model.state, "data-tool": toolName, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-kind", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindIcon, { kind: "tool" }) }),
      hasBody ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "enhanced-toggle",
          "aria-expanded": open,
          "aria-label": open ? t("collapse") : t("expand"),
          onClick: () => setOpen((value) => !value),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "11", height: "11", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6 3.5 10.5 8 6 12.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) })
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-toggle-placeholder", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-dot", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-tag", children: t("tool.fallbackTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-sep", "aria-hidden": "true", children: "·" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-name", children: model.displayName }),
      model.summary !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-summary", title: model.summary, children: model.summary }) : null,
      stateLabel !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-state", children: t(stateLabel) }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectButton, { inspect, t })
    ] }),
    open && hasBody ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-io", children: [
      model.input !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", children: model.input }) })
      ] }) : null,
      model.input !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", "data-error": model.state === "error" ? "" : void 0, children: model.output }) })
      ] }) : null
    ] }) : null,
    model.state === "running" || model.state === "preparing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-empty", children: [
      t(statusKey(model.state)),
      "…"
    ] }) : null
  ] });
}
var ENHANCED_DETAILS_KEYS = [
  "create_goal",
  "get_goal",
  "update_goal",
  "schedule_create",
  "schedule_list",
  "schedule_delete",
  "schedule_update",
  "cordis_inspect_list",
  "cordis_inspect_query",
  "cordis_inspect_self",
  "workflow",
  "ralph",
  "session_event_read",
  "session_event_search",
  "session_event_trace",
  "session_search",
  "session_trace",
  "list_subagent_models",
  "subagent",
  "list_agents",
  "send_message",
  "interrupt_agent",
  "spawn_teammate",
  "wait_agent",
  "job_list",
  "job_output",
  "job_kill",
  "terminal_open",
  "terminal_read",
  "terminal_list",
  "terminal_signal",
  "terminal_close",
  "lsp",
  "team_task_create",
  "team_task_get",
  "team_task_update",
  "team_task_list"
];
var SHELL_KEYS = /* @__PURE__ */ new Set(["bash", "pwsh", "win_bash"]);
function useDisplaySettings() {
  return (0, import_react.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}
function NativeCompactTool({ block, toolName, t, variant = "generic", inspect }) {
  const call2 = deriveCall(block);
  const [open, setOpen] = (0, import_react.useState)(false);
  const model = genericModel(block, toolName, t);
  const state2 = model.state;
  const title = variant === "shell" ? toolLabel(call2.name !== "" ? call2.name : toolName, t) : `${t("tool.fallbackTitle")} · ${wireName(call2.name !== "" ? call2.name : toolName, t)}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-native", "data-variant": variant, "data-state": state2, "data-tool": toolName, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-native-headrow", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "enhanced-native-head", "aria-expanded": open, onClick: () => setOpen((value) => !value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-native-chevron", "data-open": open ? "true" : "false", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "11", height: "11", fill: "none", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6 3.5 10.5 8 6 12.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-name", children: title }),
        model.summary !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-summary", children: model.summary }) : null,
        state2 !== "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-state", children: t(state2 === "error" ? "state.error" : state2 === "running" ? "state.running" : state2 === "preparing" ? "state.preparing" : "state.stopped") }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectButton, { inspect, t })
    ] }),
    open && (model.input !== "" || model.output !== "") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-io", children: [
      model.input !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", children: model.input }) })
      ] }) : null,
      model.input !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", "data-error": state2 === "error" ? "" : void 0, children: model.output }) })
      ] }) : null
    ] }) : null
  ] });
}
var ENHANCED_GENERIC_KEYS = [
  "browser_navigate",
  "browser_click",
  "browser_type",
  "browser_press",
  "browser_scroll",
  "browser_snapshot",
  "browser_screenshot",
  "browser_console",
  "browser_network",
  "browser_tabs",
  "browser_close",
  "working_directory",
  "load_workspace_dependencies",
  "plugin_manager",
  "skill",
  "exit_plan_mode",
  "subagent_fork",
  "squads_list",
  "squads_read",
  "squads_create",
  "squads_update",
  "squads_delete",
  "squad_member_add",
  "squad_member_update",
  "squad_member_remove",
  "squads_run_member",
  "squads_run_squad",
  "task_board_list",
  "task_board_get",
  "task_board_create",
  "task_board_update",
  "task_board_manage",
  "task_board_run",
  "task_board_schedule",
  "task_board_set_parent",
  "task_board_github_list",
  "task_board_github_get",
  "task_board_github_refresh",
  "task_board_github_repositories",
  "task_board_github_setup",
  "task_board_github_comment",
  "task_board_github_create_pr",
  "task_board_github_link_pr",
  "task_board_github_close_issue"
];
function KindIcon({ kind }) {
  if (kind === "command") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m3.5 5 3.2 3-3.2 3M8.5 11h4", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 1.8l1.5 4.2L13.7 7.5l-4.2 1.5L8 13.2 6.5 9 2.3 7.5 6.5 6 8 1.8Z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round" }) });
}
function InspectButton({ inspect, t }) {
  if (typeof inspect !== "function") return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      className: "enhanced-inspect",
      title: t("inspectTrajectory"),
      "aria-label": t("inspectTrajectory"),
      onClick: (event) => {
        event.stopPropagation();
        inspect();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm2.3 3.7-1.6 3.9-3.9 1.6 1.6-3.9 3.9-1.6Z", stroke: "currentColor", strokeWidth: "1.25", strokeLinejoin: "round" }) })
    }
  );
}
function ToolBranch({ renderSlot, block, cwd, openFile, inspectCall, loadImage, useDisclosure, t }) {
  const call2 = (0, import_react.useMemo)(() => toolCallPhase(block), [block]);
  const callId = call2.block.callId;
  const toolName = callName(call2);
  const owner = (0, import_react.useMemo)(() => ({
    callId,
    toolName,
    ...call2,
    openFile,
    cwd,
    home: void 0,
    loadImage,
    useDisclosure,
    inspect: typeof inspectCall === "function" ? () => inspectCall(callId) : void 0
  }), [callId, toolName, call2, openFile, cwd, loadImage, useDisclosure, inspectCall]);
  const settings = useDisplaySettings();
  const shellTool = SHELL_KEYS.has(toolName);
  const inspect = owner.inspect;
  const fallback = shellTool && settings.shellRows === "native" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeCompactTool, { block: call2.block, toolName, t, variant: "shell", inspect }) : settings.toolCalls === "enhanced" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnhancedExpandedTool, { block: call2.block, phase: call2.phase, toolName, t, inspect }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeCompactTool, { block: call2.block, toolName, t, inspect });
  const rendered = typeof renderSlot === "function" ? renderSlot("tool.call.toolview", owner, { entryKey: toolName, fallback }) : fallback;
  const showSubCalls = call2.phase !== "preparing" && Array.isArray(call2.block.subCalls) && call2.block.subCalls.length > 0;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-call-row", "data-chat-anchor-key": `call:${callId}`, "data-chat-call-id": callId, children: [
    rendered,
    showSubCalls ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-subcalls", "data-subcalls": "true", children: call2.block.subCalls.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ToolBranch,
      {
        renderSlot,
        block: child,
        cwd,
        openFile,
        inspectCall,
        loadImage,
        useDisclosure,
        t
      },
      child.callId
    )) }) : null
  ] });
}
function EnhancedToolCallTree({ renderSlot, node, cwd, openFile, inspectCall, loadImage, useDisclosure, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ToolBranch,
    {
      renderSlot,
      block: node.data.root,
      cwd,
      openFile,
      inspectCall,
      loadImage,
      useDisclosure,
      t
    }
  );
}

// src/client/enhanced-shell.jsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function resultText(call2) {
  const parts = [];
  for (const part of call2.content) {
    if (part !== null && typeof part === "object") {
      if (part.type === "text" && typeof part.text === "string") parts.push(part.text);
      else if (part.type !== void 0) parts.push(JSON.stringify(part, null, 2));
    }
  }
  if (parts.length === 0 && call2.error !== null && call2.error !== void 0) {
    const info = call2.error;
    const reason = typeof info.reason === "string" ? info.reason : typeof info.code === "string" ? info.code : typeof info.name === "string" ? info.name : "";
    if (reason !== "") parts.push(reason);
  }
  return parts.join("\n");
}
function parseExit(text) {
  const signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(text);
  if (signal !== null) return { output: text.slice(0, signal.index), label: signal[1], failed: true };
  const exit = /\n\[exit code: (-?\d+|null)\]$/.exec(text);
  if (exit !== null) {
    const code = exit[1] === "null" ? null : Number(exit[1]);
    return { output: text.slice(0, exit.index), label: code === null ? "null" : `exit ${code}`, failed: code !== 0 };
  }
  return { output: text, label: void 0, failed: false };
}
function firstLine(text) {
  if (typeof text !== "string") return "";
  const newline = text.indexOf("\n");
  return (newline === -1 ? text : text.slice(0, newline)).trim();
}
function shellModel(block, toolName) {
  const call2 = deriveCall(block);
  const args = call2.args ?? parseArgs(call2.argsRaw) ?? null;
  const command = args !== null && typeof args.command === "string" ? args.command : "";
  const description = args !== null && typeof args.description === "string" ? args.description : "";
  const background = args !== null && args.run_in_background === true;
  const title = call2.name === "pwsh" || toolName === "pwsh" ? "PowerShell" : "Bash";
  const summary = description.trim() !== "" ? firstLine(description) : firstLine(command);
  const text = call2.settled ? resultText(call2) : "";
  const exit = call2.settled && text !== "" ? parseExit(text) : { output: text, label: void 0, failed: false };
  const stopped = call2.settled && call2.error !== null && call2.error !== void 0 && call2.error.code === "interrupted";
  const state2 = !call2.settled ? call2.phase === "preparing" ? "preparing" : "running" : stopped ? "stopped" : call2.isError || exit.failed ? "error" : "ok";
  return {
    title,
    summary,
    command,
    description,
    output: call2.settled ? exit.output : "",
    exitLabel: call2.settled && !call2.isError ? exit.label : void 0,
    state: state2,
    background,
    errorLine: call2.settled && call2.isError ? firstLine(exit.output) : "",
    expanded: command !== "" || exit.output !== ""
  };
}
function EnhancedShellCard(props) {
  const { block, toolName, phase, t, inspect } = props;
  const model = (0, import_react2.useMemo)(() => shellModel(block, toolName), [block, toolName]);
  const hasIO = model.command !== "" || model.output !== "";
  const stateLabel = model.state === "error" ? t("state.error") : model.state === "stopped" ? t("state.stopped") : model.state === "running" ? t("state.running") : model.state === "preparing" ? t("state.preparing") : "";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-tool enhanced-command", "data-variant": "command", "data-state": model.state, "data-tool": toolName, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-kind", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KindIcon, { kind: "command" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-dot", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-name", children: model.title }),
      model.summary !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-summary", title: model.command, children: model.summary }) : null,
      model.exitLabel !== void 0 && model.exitLabel !== "exit 0" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-exit", children: model.exitLabel }) : null,
      stateLabel !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-state", children: stateLabel }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(InspectButton, { inspect, t })
    ] }),
    hasIO ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-io", children: [
      model.command !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-label", children: t("shell.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { className: "enhanced-code", children: model.command }) })
      ] }) : null,
      model.command !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-label", children: t("shell.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { className: "enhanced-code", "data-error": model.state === "error" ? "" : void 0, children: model.output }) })
      ] }) : null
    ] }) : phase === "preparing" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-empty", children: [
      t("state.preparing"),
      "…"
    ] }) : null,
    model.state === "error" && model.errorLine !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-error", children: model.errorLine }) : null
  ] });
}

// src/client/components.jsx
var import_react3 = require("react");
var import_react_dom = require("react-dom");

// src/client/api.js
var API_PREFIX = "/dsh-inline-diff/api";
var TIMEOUT_MS = 1e4;
async function call(action, payload2) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_PREFIX}/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload2 ?? {}),
      signal: controller.signal
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data !== null && typeof data === "object" ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
async function fetchSnapshot(sessionId, callId) {
  if (typeof sessionId !== "string" || sessionId === "" || callId === void 0 || callId === null) return null;
  const data = await call("snapshot", { sessionId, callId: String(callId) });
  if (data === null || data.ok !== true) return null;
  const snapshot = data.snapshot;
  if (snapshot === null || typeof snapshot !== "object") return null;
  if (typeof snapshot.after !== "string") return null;
  return {
    path: typeof snapshot.path === "string" ? snapshot.path : "",
    before: typeof snapshot.before === "string" ? snapshot.before : null,
    after: snapshot.after,
    operation: typeof snapshot.operation === "string" ? snapshot.operation : snapshot.before === null ? "create" : "update"
  };
}
async function fetchFileText(cwd, path) {
  if (typeof cwd !== "string" || cwd === "" || typeof path !== "string" || path === "") return null;
  const data = await call("read", { cwd, path });
  if (data === null || data.ok !== true) return null;
  if (data.kind === "text" && typeof data.text === "string") return { kind: "text", text: data.text, size: data.size };
  if (data.kind === "binary") return { kind: "binary", size: data.size };
  if (data.kind === "oversized") return { kind: "oversized", size: data.size };
  return null;
}
var FILE_CACHE_LIMIT = 24;
var FILE_CACHE_TTL = 15e3;
var fileCache = /* @__PURE__ */ new Map();
async function cachedFileText(cwd, path) {
  const key = `${cwd ?? ""}\0${path ?? ""}`;
  const now = Date.now();
  const hit = fileCache.get(key);
  if (hit !== void 0 && now - hit.at < FILE_CACHE_TTL) {
    fileCache.delete(key);
    fileCache.set(key, hit);
    return hit.value;
  }
  const value = await fetchFileText(cwd, path);
  fileCache.set(key, { value, at: now });
  if (fileCache.size > FILE_CACHE_LIMIT) {
    const oldest = fileCache.keys().next().value;
    if (oldest !== void 0) fileCache.delete(oldest);
  }
  return value;
}
var snapshotCache = /* @__PURE__ */ new Map();
async function cachedSnapshot(sessionId, callId) {
  const key = `${sessionId ?? ""}\0${callId ?? ""}`;
  if (snapshotCache.has(key)) return snapshotCache.get(key) ?? null;
  let snapshot = await fetchSnapshot(sessionId, callId);
  if (snapshot === null) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    snapshot = await fetchSnapshot(sessionId, callId);
  }
  snapshotCache.set(key, snapshot);
  if (snapshotCache.size > 160) {
    const oldest = snapshotCache.keys().next().value;
    if (oldest !== void 0) snapshotCache.delete(oldest);
  }
  return snapshot;
}

// src/client/store.js
var payload = null;
var listeners2 = /* @__PURE__ */ new Set();
function openDiffModal(next) {
  payload = next;
  for (const listener of listeners2) listener();
}
function closeDiffModal() {
  if (payload === null) return;
  payload = null;
  for (const listener of listeners2) listener();
}
function getDiffModal() {
  return payload;
}
function subscribeDiffModal(listener) {
  listeners2.add(listener);
  return () => {
    listeners2.delete(listener);
  };
}

// src/client/components.jsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function Icon({ kind, size = 14 }) {
  const common = {
    viewBox: "0 0 16 16",
    width: size,
    height: size,
    fill: "none",
    "aria-hidden": true,
    focusable: "false"
  };
  if (kind === "chevron") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6 3.5 10.5 8 6 12.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) });
  }
  if (kind === "expand") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "path",
      {
        d: "M9.5 2h4.5v4.5M6.5 2H2v4.5M9.5 14H14V9.5M6.5 14H2V9.5",
        stroke: "currentColor",
        strokeWidth: "1.4",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ) });
  }
  if (kind === "close") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "path",
    {
      d: "M11.6 1.9a1.75 1.75 0 0 1 2.5 2.5l-.7.7-2.5-2.5.7-.7Zm-1.4 1.4 2.5 2.5-7.4 7.4-3.4.9.9-3.4 7.4-7.4Z",
      fill: "currentColor"
    }
  ) });
}
function range(start, end) {
  if (start === null || start === void 0) return "";
  return start === end ? `L${start}` : `L${start}–L${end}`;
}
function hunkRangeText(hunk, t) {
  if (hunk.hasNumbers !== true) return t("unknownRange");
  if (hunk.oldCount === 0) return t("hunkHeaderNew", { new: range(hunk.newStart, hunk.newEnd) });
  if (hunk.newCount === 0) return t("hunkHeaderDel", { old: range(hunk.oldStart, hunk.oldEnd) });
  return t("hunkHeader", {
    old: range(hunk.oldStart, hunk.oldEnd),
    new: range(hunk.newStart, hunk.newEnd)
  });
}
function stateKeyOf(status) {
  if (status === "preparing") return "state.preparing";
  if (status === "running") return "state.running";
  if (status === "error") return "state.error";
  if (status === "stopped") return "state.stopped";
  return null;
}
function sourceLabel(source, t) {
  if (source === "snapshot") return t("snapshotSource");
  if (source === "located") return t("locatedSource");
  if (source === "preview") return t("preview");
  if (source === "args") return t("argsSource");
  return t("lineUnknown");
}
function buildInlinePlan(diff) {
  const parts = [];
  let budget = INLINE_ROW_CAP;
  let total = 0;
  let shown = 0;
  for (const hunk of diff.hunks) {
    total += hunk.rows.length;
    if (budget <= 0) break;
    if (hunk.gapBefore !== null && hunk.gapBefore !== void 0) {
      parts.push({ type: "gap", gap: hunk.gapBefore, key: "gap" + hunk.index });
    }
    const rows = [];
    for (const row of hunk.rows) {
      if (budget <= 0) break;
      rows.push(row);
      budget--;
      shown++;
    }
    parts.push({ type: "hunk", hunk, rows, key: "hunk" + hunk.index });
  }
  return { parts, shown, total };
}
function RowText({ row, fallback }) {
  const segments = row === null || row === void 0 ? null : row.segments;
  if (!Array.isArray(segments) || segments.length === 0) return fallback;
  return segments.map((segment, index) => segment.changed === true ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-seg", "data-changed": "true", children: segment.text }, index) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: segment.text }, index));
}
function moveText(move, t) {
  const end = move.endLine;
  if (typeof end === "number" && end > move.line) {
    return move.kind === "to" ? t("movedToRange", { from: move.line, to: end }) : t("movedFromRange", { from: move.line, to: end });
  }
  return move.kind === "to" ? t("movedTo", { line: move.line }) : t("movedFrom", { line: move.line });
}
function InlineRow({ row, t }) {
  const code = row.text === "" ? " " : row.text;
  const move = row.move;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-row", "data-kind": row.kind, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", children: row.oldNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", children: row.newNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-sign", children: row.kind === "add" ? "+" : row.kind === "del" ? "−" : " " }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "did-code", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RowText, { row, fallback: code }) }),
    move !== void 0 && move !== null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-move", children: moveText(move, t) }) : null
  ] });
}
function GapBand({ gap, t }) {
  if (gap === null || gap === void 0) return null;
  const shift = gap.shift;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-gap", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", children: "⋯" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-gap-range", children: t("gapUnchanged", { n: gap.count }) }),
    shift !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-gap-range", children: t("gapRange", { old: `L${gap.oldStart}–L${gap.oldEnd}`, new: `L${gap.newStart}–L${gap.newEnd}` }) }) : null,
    shift !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-shift", children: shift > 0 ? t("shift", { delta: shift }) : t("shiftDown", { delta: Math.abs(shift) }) }) : null
  ] });
}
function InlineHunk({ hunk, rows, t, pathLabel }) {
  const hidden = hunk.rows.length - rows.length;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-hunk", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-bar-file", title: pathLabel || void 0, children: pathLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-bar-range", children: hunkRangeText(hunk, t) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-bar-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-add", children: [
          "+",
          hunk.added
        ] }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-del", children: [
          "−",
          hunk.removed
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-rows", children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InlineRow, { row, t }, index)) }),
    hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-note", children: t("inlineMore", { n: hidden }) }) : null
  ] });
}
function pairRows(rows, cap) {
  const pairs = [];
  let i = 0;
  let used = 0;
  while (i < rows.length && used < cap) {
    const row = rows[i];
    if (row.kind === "ctx") {
      pairs.push({ left: row, right: row });
      i++;
      used++;
      continue;
    }
    const deleted = [];
    const added = [];
    while (i < rows.length && rows[i].kind !== "ctx") {
      if (rows[i].kind === "del") deleted.push(rows[i]);
      else added.push(rows[i]);
      i++;
      used++;
    }
    const count = Math.max(deleted.length, added.length);
    for (let k = 0; k < count; k++) pairs.push({ left: deleted[k] ?? null, right: added[k] ?? null });
  }
  return { pairs, truncated: i < rows.length };
}
function SideCell({ row, side, t }) {
  const kind = row === null ? "none" : row.kind;
  const lineNo = row === null ? null : side === "left" ? row.oldNo : row.newNo;
  const code = row === null ? "" : row.text === "" ? " " : row.text;
  const move = row === null ? null : row.move;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-cell", "data-kind": kind, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", children: lineNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "did-code", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RowText, { row, fallback: code || " " }) }),
    move !== null && move !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-move", children: moveText(move, t) }) : null
  ] });
}
function PairRow({ pair, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-pair", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SideCell, { row: pair.left, side: "left", t }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SideCell, { row: pair.right, side: "right", t })
  ] });
}
function PanesHead({ t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-panes-head", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-pane-label", children: t("before") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-pane-label", children: t("after") })
  ] });
}
function SideBySide({ diff, mode, pathLabel, t }) {
  if (mode === "full") {
    const { pairs, truncated } = pairRows(diff.rows, FULL_VIEW_ROW_CAP);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-sbs", "data-mode": "full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PanesHead, { t }),
      pairs.map((pair, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PairRow, { pair, t }, index)),
      truncated ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-full-note", children: t("fullNote", { n: diff.rows.length }) }) : null
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-sbs", "data-mode": "hunks", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PanesHead, { t }),
    diff.hunks.map((hunk) => {
      const { pairs } = pairRows(hunk.rows, Number.POSITIVE_INFINITY);
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react3.Fragment, { children: [
        hunk.gapBefore !== null && hunk.gapBefore !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GapBand, { gap: hunk.gapBefore, t }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-bar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-bar-file", title: pathLabel || void 0, children: pathLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-bar-range", children: [
            t("hunk.i", { i: hunk.index, n: diff.hunks.length }),
            " · ",
            hunkRangeText(hunk, t)
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-bar-stats", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-add", children: [
              "+",
              hunk.added
            ] }),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-del", children: [
              "−",
              hunk.removed
            ] })
          ] })
        ] }),
        pairs.map((pair, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PairRow, { pair, t }, index))
      ] }, hunk.index);
    })
  ] });
}
function noticeText(notice, t) {
  if (notice.kind === "huge") return t("noticeHuge", { old: notice.old, new: notice.new });
  if (notice.kind === "coarse") return t("noticeCoarse");
  if (notice.kind === "history") return t("noticeHistory");
  return t("noticeLinesPending");
}
function modalPayloadOf(model) {
  return {
    callId: model.callId,
    toolName: model.toolName,
    titleKey: model.titleKey,
    filePath: model.filePath,
    absolutePath: model.absolutePath,
    operation: model.operation,
    status: model.status,
    source: model.source,
    diff: model.diff,
    notice: model.notice
  };
}
function InlineDiffCard(props) {
  const { block, toolName, cwd, home, openFile, inspect, sessionId, t } = props;
  const call2 = (0, import_react3.useMemo)(() => deriveCall(block), [block]);
  const [snapshot, setSnapshot] = (0, import_react3.useState)(void 0);
  const [fileText, setFileText] = (0, import_react3.useState)(null);
  const [collapsed, setCollapsed] = (0, import_react3.useState)(false);
  const requested = (0, import_react3.useRef)(false);
  (0, import_react3.useEffect)(() => {
    if (requested.current) return;
    if (!call2.settled || call2.isError) return;
    requested.current = true;
    let alive = true;
    const run = async () => {
      const captured = await cachedSnapshot(sessionId, call2.callId);
      if (!alive) return;
      setSnapshot(captured ?? null);
      if (captured === null) {
        const metaPath = call2.meta !== null && typeof call2.meta === "object" && typeof call2.meta.path === "string" ? call2.meta.path : "";
        if (metaPath !== "" && typeof cwd === "string" && cwd !== "") {
          const read = await cachedFileText(cwd, metaPath);
          if (alive && read !== null && read.kind === "text") setFileText(read.text);
        }
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [call2.settled, call2.isError, call2.callId, call2.meta, cwd, sessionId]);
  const model = (0, import_react3.useMemo)(() => buildCardModel({
    block,
    toolName,
    cwd,
    home,
    snapshot: snapshot ?? null,
    fileText,
    loading: snapshot === void 0 && call2.settled && !call2.isError
  }), [block, toolName, cwd, home, snapshot, fileText, call2.settled, call2.isError]);
  const diff = model.diff;
  const hasHunks = diff !== null && diff !== void 0 && diff.hunks.length > 0;
  const stateKey = stateKeyOf(model.status);
  const totalHunks = hasHunks ? diff.hunks.length : 0;
  const plan = (0, import_react3.useMemo)(() => hasHunks ? buildInlinePlan(diff) : null, [diff, hasHunks]);
  const hidden = plan === null ? 0 : plan.total - plan.shown;
  const openModal = (event) => {
    event?.stopPropagation?.();
    if (!hasHunks) return;
    openDiffModal(modalPayloadOf(model));
  };
  const toggle = () => setCollapsed((value) => !value);
  const onHeadKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };
  const emptyBody = () => {
    if (model.status === "error") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-error", children: model.errorMessage || t("failedSummary") });
    if (model.status === "nochange") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-empty", children: t("noChanges") });
    if (model.loading) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-empty", children: t("loading") });
    if (model.status === "preparing") return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-empty", children: [
      t("state.preparing"),
      "…"
    ] });
    if (model.status === "running") return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-empty", children: [
      t("state.running"),
      "…"
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-empty", children: t("noDiff") });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react3.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-card", "data-state": model.status, "data-tool": model.toolName, "data-call-id": model.callId, "data-inline-diff": "row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: "did-head",
        role: "button",
        tabIndex: 0,
        "aria-expanded": !collapsed,
        onClick: toggle,
        onKeyDown: onHeadKeyDown,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-chevron", "data-open": !collapsed ? "true" : "false", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "chevron" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-icon", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "edit" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-title", children: t(model.titleKey) }),
          model.operation !== null && model.operation !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-op", children: t(operationKey(model.operation)) }) : null,
          model.filePath !== "" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              className: "did-path",
              title: model.absolutePath ?? model.filePath,
              onClick: (event) => {
                event.stopPropagation();
                const target = model.absolutePath ?? model.filePath;
                if (target !== "" && typeof openFile === "function") openFile(target);
              },
              onKeyDown: (event) => event.stopPropagation(),
              children: model.filePath
            }
          ) : null,
          hasHunks ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-stats", "aria-label": t("hunks", { n: totalHunks }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-add", children: [
              "+",
              diff.added
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-del", children: [
              "−",
              diff.removed
            ] })
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-meta", children: hasHunks ? t("hunks", { n: totalHunks }) : model.status === "nochange" ? t("noChanges") : model.status === "error" ? t("failedSummary") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-spacer" }),
          stateKey !== null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-state", "data-state": model.status, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-dot", "aria-hidden": "true" }),
            t(stateKey)
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              className: "did-zoom",
              disabled: !hasHunks,
              onClick: openModal,
              title: t("zoom"),
              "aria-label": t("zoom"),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "expand", size: 11 }),
                t("zoom")
              ]
            }
          )
        ]
      }
    ),
    model.notice !== null && model.notice !== void 0 && model.notice.kind !== "history" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-notice", children: noticeText(model.notice, t) }) : null,
    !collapsed ? hasHunks ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-body", children: plan.parts.map((part) => {
        if (part.type === "gap") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GapBand, { gap: part.gap, t }, part.key);
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InlineHunk, { hunk: part.hunk, rows: part.rows, t, pathLabel: model.filePath }, part.key);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-foot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: sourceLabel(model.source, t) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-grow" }),
        hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("inlineMore", { n: hidden }) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "did-link", onClick: openModal, children: t("openViewer") }),
        typeof inspect === "function" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "did-link", onClick: (event) => {
          event.stopPropagation();
          inspect();
        }, children: t("inspect") }) : null
      ] })
    ] }) : emptyBody() : null
  ] }) });
}
function DiffModal({ t }) {
  const payload2 = (0, import_react3.useSyncExternalStore)(subscribeDiffModal, getDiffModal, getDiffModal);
  const [tab, setTab] = (0, import_react3.useState)("hunks");
  const [portalHost, setPortalHost] = (0, import_react3.useState)(null);
  const dialogRef = (0, import_react3.useRef)(null);
  const callId = payload2 === null ? null : payload2.callId;
  (0, import_react3.useEffect)(() => {
    setPortalHost(document.body);
  }, []);
  (0, import_react3.useEffect)(() => {
    setTab("hunks");
  }, [callId]);
  (0, import_react3.useEffect)(() => {
    if (payload2 === null) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeDiffModal();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [payload2]);
  (0, import_react3.useEffect)(() => {
    if (payload2 === null) return;
    dialogRef.current?.focus?.();
  }, [payload2]);
  if (payload2 === null) return null;
  const diff = payload2.diff;
  const hasHunks = diff !== null && diff !== void 0 && diff.hunks.length > 0;
  if (!hasHunks) return null;
  const canFull = diff.hasNumbers === true && Array.isArray(diff.rows) && diff.rows.length > 0;
  const activeTab = tab === "full" && canFull ? "full" : "hunks";
  const oldLines = diff.oldLineCount;
  const newLines = diff.newLineCount;
  const close = () => closeDiffModal();
  const overlay = /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react3.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-overlay-root", "data-open": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-overlay", onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "did-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t("modal.title"),
      tabIndex: -1,
      ref: dialogRef,
      onClick: (event) => event.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-icon", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "edit" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-title", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-dialog-path", title: payload2.absolutePath ?? payload2.filePath, children: payload2.filePath !== "" ? payload2.filePath : t(payload2.titleKey) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-dialog-sub", children: [
              t(payload2.titleKey),
              payload2.operation !== null && payload2.operation !== void 0 ? ` · ${t(operationKey(payload2.operation))}` : "",
              ` · +${diff.added} −${diff.removed}`,
              oldLines !== null && newLines !== null ? ` · ${t("oldFile", { n: oldLines })} / ${t("newFile", { n: newLines })}` : ""
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-tabs", role: "tablist", "aria-label": t("modal.title"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "did-tab",
                role: "tab",
                "aria-selected": activeTab === "hunks",
                "data-active": activeTab === "hunks" ? "true" : "false",
                onClick: () => setTab("hunks"),
                children: t("tab.hunks")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "did-tab",
                role: "tab",
                "aria-selected": activeTab === "full",
                "data-active": activeTab === "full" ? "true" : "false",
                disabled: !canFull,
                title: canFull ? void 0 : payload2.notice?.kind === "history" || payload2.notice?.kind === "lines" ? t("fullHistoryUnavailable") : t("fullTooLarge"),
                onClick: () => setTab("full"),
                children: t("tab.full")
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "did-close", onClick: close, "aria-label": t("close"), title: t("close"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "close", size: 13 }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-body", children: [
          payload2.notice !== null && payload2.notice !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-notice did-dialog-notice", children: noticeText(payload2.notice, t) }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SideBySide, { diff, mode: activeTab, pathLabel: payload2.filePath, t })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-foot", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: sourceLabel(payload2.source, t) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-grow" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: `${t("oldFile", { n: oldLines ?? "?" })} · ${t("newFile", { n: newLines ?? "?" })}` }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            "Esc · ",
            t("close")
          ] })
        ] })
      ]
    }
  ) }) }) });
  return portalHost === null ? overlay : (0, import_react_dom.createPortal)(overlay, portalHost);
}

// src/client/locales.js
var NS = "inline-diff";
var zh = {
  "title.edit": "编辑",
  "title.write": "写入",
  "title.strReplace": "替换编辑",
  "op.create": "新建文件",
  "op.update": "更新文件",
  "op.overwrite": "覆盖写入",
  "state.preparing": "准备中",
  "state.running": "执行中",
  "state.error": "失败",
  "state.stopped": "已中止",
  "hunks": "{n} 处修改",
  "hunk.i": "修改点 {i}/{n}",
  "noChanges": "内容无变化",
  "noDiff": "没有可展示的差异",
  "zoom": "放大",
  "collapse": "收起",
  "expand": "展开",
  "modal.title": "修改对比",
  "tab.hunks": "变更块",
  "tab.full": "全文对照",
  "close": "关闭",
  "before": "修改前",
  "after": "修改后",
  "oldFile": "旧文件 {n} 行",
  "newFile": "新文件 {n} 行",
  "gapUnchanged": "{n} 行未修改",
  "shift": "行号顺延 {delta}",
  "shiftDown": "行号顺延 −{delta}",
  "movedTo": "移至 新 L{line}",
  "movedToRange": "移至 新 L{from}–L{to}",
  "movedFrom": "移自 旧 L{line}",
  "movedFromRange": "移自 旧 L{from}–L{to}",
  "inlineMore": "另有 {n} 行未展开，点击「放大」查看全部",
  "openViewer": "左右对照",
  "preview": "执行中的预览（精确行号将在完成后标注）",
  "lineUnknown": "行号待定",
  "snapshotSource": "按执行快照精确对照",
  "argsSource": "按调用参数重建",
  "locatedSource": "按文件定位行号",
  "failedSummary": "文件修改失败",
  "loading": "读取文件上下文…",
  "fullTooLarge": "文件较大，全文对照不可用",
  "fullHistoryUnavailable": "历史回放缺少修改前全文，全文对照不可用",
  "noticeHistory": "这是历史回放：只能读取修改块和行号，修改前全文已不可用，因此「全文对照」置灰；当前实时修改的卡片仍可全文对照。",
  "noticeHuge": "文件较大（旧 {old} 行 / 新 {new} 行），已切换为差异块模式：保留逐行号与修改点，移动识别与「全文对照」不可用。",
  "noticeCoarse": "文件较大，已使用粗粒度对齐：颜色与行号仍准确，移动识别已关闭。",
  "noticeLinesPending": "未能读取当前文件，行号标记为待定；差异内容仍按工具记录展示。",
  "openFile": "在文件面板中打开",
  "hunkHeader": "旧 {old} → 新 {new}",
  "hunkHeaderNew": "新文件 {new}",
  "hunkHeaderDel": "删除 旧 {old}",
  "added": "新增 {n} 行",
  "removed": "删除 {n} 行",
  "unknownRange": "行号待定",
  "fullNote": "共 {n} 行；超出显示上限的部分已截断",
  "emptyFile": "（空文件）",
  "inspect": "检查调用",
  "settings.nav": "内联差异",
  "settings.short": "差异样式",
  "settings.title": "内联差异 · 显示样式",
  "settings.description": "只影响 Web 界面的展示方式，不改变会话记录、模型输入或工具执行。「展开风格」采用类现代编码代理的平板透明输出（逐次内联差异、字符级高亮、默认展开 IN/OUT）；DSH 原生保持官方样式。",
  "settings.fileCards": "文件修改卡片",
  "settings.fileCardsDesc": "edit / write 工具调用在对话中的展示方式。",
  "settings.shellRows": "命令执行行",
  "settings.toolCalls": "其它工具调用",
  "settings.toolCallsDesc": "普通/详情类工具调用（如查询运行时、任务与会话查询等）；展开风格（展开式/类现代编码代理）默认展开输入的 IN 与输出 OUT，并保留折叠按钮。Read/搜索/网页/待办/提问等富结果卡片保持原生。开启本项会即时生效，并自动同时把「过程折叠」切成不折叠，否则展开行会被 DSH 折叠组遮住。",
  "settings.toolCallsNeedsFlat": "提示：当前「过程折叠」是 DSH 原生，完成的工具行会被收进折叠组；想直接看到展开效果，请把「过程折叠」也切换为「不折叠」。",
  "settings.shellRowsDesc": "Bash / PowerShell 工具调用的展示方式；展开风格默认展开 IN/OUT。",
  "settings.transcript": "过程折叠（整份对话）",
  "settings.transcriptEnhancedNote": "启用 DSH 官方的 Verbose 对话记录偏好：整轮过程不折叠、工具行平板展示。设置会持久保存，可在 DSH 设置 → 通用 → 对话记录样式中恢复。",
  "settings.transcriptNativeNote": "保持你当前在 DSH 中的对话记录偏好，插件不会改动它。",
  "settings.styleEnhanced": "展开风格",
  "settings.styleNative": "DSH 原生",
  "settings.flat": "不折叠",
  "settings.subagentNote": "子代理会话与主会话共用这套设置；差异快照按各自 Session 独立记录，互不影响。",
  "settings.dsmCurrent": "当前 DSH 对话记录模式：{mode}",
  "settings.reset": "恢复默认",
  "settings.saving": "正在保存…",
  "settings.live": "设置自动生效",
  "shell.in": "IN",
  "shell.out": "OUT",
  "tool.in": "IN",
  "tool.out": "OUT",
  "tool.fallbackTitle": "工具调用",
  "readFrom": "L {line} 起",
  "inspectTrajectory": "在轨迹中查看",
  "gapRange": "旧 {old} → 新 {new}",
  "toolTitle.create_goal": "创建目标",
  "toolTitle.get_goal": "查看目标",
  "toolTitle.update_goal": "更新目标",
  "toolTitle.schedule_create": "创建定时任务",
  "toolTitle.schedule_list": "查看定时任务",
  "toolTitle.schedule_delete": "删除定时任务",
  "toolTitle.schedule_update": "更新定时任务",
  "toolTitle.cordis_inspect_list": "检查提供方",
  "toolTitle.cordis_inspect_query": "查询运行时",
  "toolTitle.cordis_inspect_self": "检查动态插件",
  "toolTitle.workflow": "运行工作流",
  "toolTitle.ralph": "运行循环工作流",
  "toolTitle.session_event_read": "读取事件",
  "toolTitle.session_event_search": "搜索事件",
  "toolTitle.session_event_trace": "追踪事件",
  "toolTitle.session_search": "搜索会话",
  "toolTitle.session_trace": "追踪会话",
  "toolTitle.list_subagent_models": "查看可用模型",
  "toolTitle.subagent": "创建子智能体",
  "toolTitle.list_agents": "查看子智能体",
  "toolTitle.send_message": "发送消息",
  "toolTitle.interrupt_agent": "中断智能体",
  "toolTitle.spawn_teammate": "创建队友",
  "toolTitle.wait_agent": "等待智能体",
  "toolTitle.job_list": "查看后台任务",
  "toolTitle.job_output": "读取任务输出",
  "toolTitle.job_kill": "取消后台任务",
  "toolTitle.terminal_open": "创建终端",
  "toolTitle.terminal_read": "读取终端",
  "toolTitle.terminal_list": "查看终端",
  "toolTitle.terminal_signal": "发送终端信号",
  "toolTitle.terminal_close": "关闭终端",
  "toolTitle.lsp": "语言服务",
  "toolTitle.team_task_create": "创建团队任务",
  "toolTitle.team_task_get": "查看团队任务",
  "toolTitle.team_task_update": "更新团队任务",
  "toolTitle.team_task_list": "查看团队任务列表"
};
var en = {
  "title.edit": "Edit",
  "title.write": "Write",
  "title.strReplace": "Replace",
  "op.create": "New file",
  "op.update": "Updated file",
  "op.overwrite": "Overwritten",
  "state.preparing": "Preparing",
  "state.running": "Running",
  "state.error": "Failed",
  "state.stopped": "Stopped",
  "hunks": "{n} changes",
  "hunk.i": "Change {i}/{n}",
  "noChanges": "No content change",
  "noDiff": "No diff to show",
  "zoom": "Expand",
  "collapse": "Collapse",
  "expand": "Expand",
  "modal.title": "Change comparison",
  "tab.hunks": "Changes",
  "tab.full": "Whole file",
  "close": "Close",
  "before": "Before",
  "after": "After",
  "oldFile": "Before · {n} lines",
  "newFile": "After · {n} lines",
  "gapUnchanged": "{n} unchanged lines",
  "shift": "line numbers shifted {delta}",
  "shiftDown": "line numbers shifted −{delta}",
  "movedTo": "moved to new L{line}",
  "movedToRange": "moved to new L{from}–L{to}",
  "movedFrom": "moved from old L{line}",
  "movedFromRange": "moved from old L{from}–L{to}",
  "inlineMore": "{n} more lines not shown — use “Expand” to see all",
  "openViewer": "Side-by-side",
  "preview": "Live preview — exact line numbers appear when the edit settles",
  "lineUnknown": "line numbers pending",
  "snapshotSource": "Exact comparison from the execution snapshot",
  "argsSource": "Rebuilt from the call arguments",
  "locatedSource": "Line numbers located in the file",
  "failedSummary": "File change failed",
  "loading": "Reading file context…",
  "fullTooLarge": "File is large — whole-file comparison unavailable",
  "fullHistoryUnavailable": "Before-image text is unavailable for replayed history; whole-file comparison is unavailable",
  "noticeHistory": "Replayed history: only the changed hunks and line numbers are available, so the whole-file tab is disabled. Cards from the live session still support it.",
  "noticeHuge": "Large file (before: {old} lines, after: {new} lines) — switched to changed-hunk mode: line numbers and hunks are kept; moved-block detection and the whole-file tab are unavailable.",
  "noticeCoarse": "Large file — coarse alignment in use. Coloring and line numbers stay accurate; moved-block detection is off.",
  "noticeLinesPending": "The current file could not be read, so line numbers are pending; the recorded diff is still shown.",
  "openFile": "Open in file panel",
  "hunkHeader": "old {old} → new {new}",
  "hunkHeaderNew": "new file {new}",
  "hunkHeaderDel": "deleted old {old}",
  "added": "{n} added",
  "removed": "{n} removed",
  "unknownRange": "line numbers pending",
  "fullNote": "{n} lines total; display capped",
  "emptyFile": "(empty file)",
  "inspect": "Inspect call",
  "settings.nav": "Inline Diff",
  "settings.short": "Diff style",
  "settings.title": "Inline Diff · Display",
  "settings.description": "Presentation only: session records, model input, and tool execution are unchanged. The expanded style gives modern coding-agent-like flat, transparent output; DSH native keeps the stock presentation.",
  "settings.fileCards": "File-change cards",
  "settings.fileCardsDesc": "How edit / write tool calls render in the conversation.",
  "settings.shellRows": "Command rows",
  "settings.toolCalls": "Other tool calls",
  "settings.toolCallsDesc": "Generic/details tool calls such as runtime queries, session/job queries, and team tasks. The enhanced style (expanded, modern coding-agent-like) starts expanded with IN/OUT and keeps a fold button. Rich cards (Read, search, web, todo, questions) stay native. Enabling this applies instantly and also unfolds completed turns, otherwise DSH folding would hide the expanded rows.",
  "settings.toolCallsNeedsFlat": "Note: process folding is DSH-native, so completed tool rows stay inside folded groups. Switch Process folding to Unfolded to see the expanded rows directly.",
  "settings.shellRowsDesc": "How Bash / PowerShell calls render; the enhanced style shows IN/OUT expanded.",
  "settings.transcript": "Process folding (whole chat)",
  "settings.transcriptEnhancedNote": "Uses DSH's official Verbose transcript preference: completed turns stay unfolded and tool rows stay flat. It is persisted and can be restored in DSH Settings → General → Transcript.",
  "settings.transcriptNativeNote": "Keep your current DSH transcript preference; the plugin does not modify it.",
  "settings.styleEnhanced": "Expanded",
  "settings.styleNative": "DSH native",
  "settings.flat": "Unfolded",
  "settings.subagentNote": "Subagent sessions use the same settings; diff snapshots are recorded per Session and never interfere.",
  "settings.dsmCurrent": "Current DSH transcript mode: {mode}",
  "settings.reset": "Reset to defaults",
  "settings.saving": "Saving…",
  "settings.live": "Settings apply automatically",
  "shell.in": "IN",
  "shell.out": "OUT",
  "tool.in": "IN",
  "tool.out": "OUT",
  "tool.fallbackTitle": "Tool call",
  "readFrom": "from L {line}",
  "inspectTrajectory": "Inspect in trajectory",
  "gapRange": "old {old} → new {new}",
  "toolTitle.create_goal": "Create goal",
  "toolTitle.get_goal": "Get goal",
  "toolTitle.update_goal": "Update goal",
  "toolTitle.schedule_create": "Create schedule",
  "toolTitle.schedule_list": "List schedules",
  "toolTitle.schedule_delete": "Delete schedule",
  "toolTitle.schedule_update": "Update schedule",
  "toolTitle.cordis_inspect_list": "Inspect providers",
  "toolTitle.cordis_inspect_query": "Query runtime",
  "toolTitle.cordis_inspect_self": "Inspect plugins",
  "toolTitle.workflow": "Run workflow",
  "toolTitle.ralph": "Run loop workflow",
  "toolTitle.session_event_read": "Read event",
  "toolTitle.session_event_search": "Search events",
  "toolTitle.session_event_trace": "Trace event",
  "toolTitle.session_search": "Search sessions",
  "toolTitle.session_trace": "Trace session",
  "toolTitle.list_subagent_models": "List models",
  "toolTitle.subagent": "Create subagent",
  "toolTitle.list_agents": "List subagents",
  "toolTitle.send_message": "Send message",
  "toolTitle.interrupt_agent": "Interrupt agent",
  "toolTitle.spawn_teammate": "Spawn teammate",
  "toolTitle.wait_agent": "Wait agent",
  "toolTitle.job_list": "List jobs",
  "toolTitle.job_output": "Read job output",
  "toolTitle.job_kill": "Kill job",
  "toolTitle.terminal_open": "Open terminal",
  "toolTitle.terminal_read": "Read terminal",
  "toolTitle.terminal_list": "List terminals",
  "toolTitle.terminal_signal": "Signal terminal",
  "toolTitle.terminal_close": "Close terminal",
  "toolTitle.lsp": "Language service",
  "toolTitle.team_task_create": "Create team task",
  "toolTitle.team_task_get": "Get team task",
  "toolTitle.team_task_update": "Update team task",
  "toolTitle.team_task_list": "List team tasks"
};
var dicts = { zh, en };

// src/client/styles.js
var CSS = `
/* ---- enhanced flat flat command row (bash / pwsh) ---- */
.enhanced-tool {
  --enhanced-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin: 4px 0 4px 2px;
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
}
.enhanced-head { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 1px 2px; }
.enhanced-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-alias-label-tertiary);
}
.enhanced-tool[data-state='ok'] .enhanced-dot { background: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-state='error'] .enhanced-dot { background: var(--dsw-alias-state-error-primary); }
.enhanced-tool[data-state='stopped'] .enhanced-dot { background: var(--dsw-alias-state-warn-primary); }
.enhanced-tool[data-state='running'] .enhanced-dot,
.enhanced-tool[data-state='preparing'] .enhanced-dot { background: var(--dsw-alias-brand-primary); animation: did-pulse 1.1s ease-in-out infinite; }
.enhanced-kind { display: inline-flex; flex: none; color: var(--dsw-alias-label-tertiary); }
.enhanced-tool[data-variant='command'] .enhanced-kind { color: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-variant='tool'] .enhanced-kind { color: var(--dsw-alias-brand-primary); }
.enhanced-tag {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.02em;
}
.enhanced-sep { flex: none; color: var(--dsw-alias-label-tertiary); opacity: 0.65; }
.enhanced-name { flex: none; font-weight: 600; color: var(--dsw-alias-label-primary); }
.enhanced-tool[data-variant='command'] .enhanced-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.01em;
}
.enhanced-inspect {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.enhanced-inspect:hover { color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent); }
.enhanced-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
}
.enhanced-exit { flex: none; color: var(--dsw-alias-state-error-primary); font-family: var(--enhanced-mono); font-size: 11px; }
.enhanced-state { flex: none; margin-left: auto; color: var(--dsw-alias-label-tertiary); font-size: 11px; white-space: nowrap; }
.enhanced-io {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 11px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 6px);
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
}
.enhanced-tool[data-variant='command'] .enhanced-io {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 3%, var(--dsw-alias-bg-layer-2));
}
.enhanced-tool[data-variant='tool'] .enhanced-io {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-brand-primary) 42%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 4%, var(--dsw-alias-bg-layer-2));
}
.enhanced-section {
  display: grid;
  grid-template-columns: 2.6em minmax(0, 1fr);
  gap: 8px;
  padding: 8px 10px;
}
.enhanced-scroll { min-width: 0; max-height: 260px; overflow: auto; }
.enhanced-scroll-in { max-height: 180px; }
.enhanced-label {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 18px;
  font-family: var(--enhanced-mono);
  user-select: none;
}
.enhanced-code {
  min-width: 0;
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-family: var(--enhanced-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
}
.enhanced-code[data-error] { color: var(--dsw-alias-state-error-primary); }
.enhanced-divider { flex: none; height: 0.5px; background: var(--dsw-alias-border-l1); }
.enhanced-error {
  margin-left: 11px;
  color: var(--dsw-alias-state-error-primary);
  font-size: 11.5px;
  line-height: 16px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.enhanced-native { display: flex; flex-direction: column; min-width: 0; margin: 4px 0 4px 2px; color: var(--dsw-alias-label-primary); font-size: var(--dsh-content-font-size-secondary, 13px); }
.enhanced-native-headrow { display: flex; align-items: center; gap: 4px; min-width: 0; }
.enhanced-native-headrow .enhanced-native-head { flex: 1 1 auto; min-width: 0; }
.enhanced-native-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 2px 2px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.enhanced-native-head:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent); border-radius: var(--dsw-radius-sm, 4px); }
.enhanced-native-chevron { display: inline-flex; flex: none; color: var(--dsw-alias-label-tertiary); transition: transform 0.12s ease; }
.enhanced-native-chevron[data-open='true'] { transform: rotate(90deg); }
.enhanced-native-output {
  margin: 2px 0 0 22px;
  padding: 8px 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 6px);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-family: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, monospace);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 260px;
  overflow: auto;
}
.enhanced-empty { margin-left: 11px; color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }
.enhanced-toggle {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  transition: transform 0.12s ease;
}
.enhanced-toggle[aria-expanded='true'] { transform: rotate(90deg); }
.enhanced-toggle:hover { color: var(--dsw-alias-label-primary); }
.enhanced-toggle-placeholder { flex: none; width: 14px; height: 14px; }
.enhanced-call-row { min-width: 0; margin: 2px 0; border-radius: var(--dsw-radius-sm, 4px); }
.enhanced-subcalls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 4px 0 2px 22px;
  padding-left: 8px;
  border-left: 0.5px solid var(--dsw-alias-border-l2);
}

/* ---- sidebar-foot launcher ---- */
.did-launcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.did-launcher:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }
.did-launcher-label { overflow: hidden; text-overflow: ellipsis; }

/* ---- settings panel / page / modal ---- */
.did-settings-page { max-width: 760px; padding: 4px 0 24px; }
.did-settings { display: flex; flex-direction: column; min-width: 0; color: var(--dsw-alias-label-primary); }
.did-settings-head { display: flex; align-items: flex-start; gap: 12px; padding: 2px 0 16px; }
.did-settings-headtext { flex: 1 1 auto; min-width: 0; }
.did-settings-title { font-size: 18px; font-weight: 600; line-height: 26px; }
.did-settings-sub { margin-top: 4px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.did-settings-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.did-settings-close:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }
.did-settings-body { display: flex; flex-direction: column; border-top: 0.5px solid var(--dsw-alias-border-l1); }
.did-setting { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; border-bottom: 0.5px solid var(--dsw-alias-border-l1); }
.did-setting-text { flex: 1 1 auto; min-width: 0; }
.did-setting-label { font-size: 14px; color: var(--dsw-alias-label-primary); line-height: 21px; }
.did-setting-desc { margin-top: 3px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.did-setting-control { flex: none; }
.did-seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); }
.did-seg-option {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;
}
.did-seg-option[data-active='true'] { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.did-seg-option:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
.did-seg-option:disabled { opacity: 0.5; cursor: default; }
.did-settings-note {
  margin-top: 12px;
  padding: 9px 12px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.did-settings-error { margin-top: 10px; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; white-space: pre-wrap; }
.did-settings-foot { display: flex; align-items: center; gap: 10px; padding-top: 14px; }
.did-settings-reset {
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 12px;
  text-decoration: underline dotted 1px;
  text-underline-offset: 2px;
  cursor: pointer;
}
.did-settings-grow { flex: 1 1 auto; }
.did-settings-author {
  color: var(--dsw-alias-label-tertiary);
  text-decoration: none;
  font-size: 11px;
  white-space: nowrap;
}
.did-settings-author:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.did-settings-hint { color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }

.did-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 32%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
  pointer-events: auto;
}
.did-settings-dialog {
  width: min(760px, 96vw);
  max-height: min(820px, 90vh);
  overflow: auto;
  padding: 18px 22px 16px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
}
@media (max-width: 720px) {
  .did-setting { flex-direction: column; align-items: stretch; gap: 8px; }
  .did-setting-control { align-self: flex-start; }
  .did-settings-dialog { padding: 16px; }
}
.did-card {
  --did-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 4px 0 4px 2px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
  overflow: hidden;
}

.did-card[data-state='error'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1));
}

.did-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  font: inherit;
}

.did-head:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent); }
.did-head:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }

.did-chevron {
  display: inline-flex;
  flex: none;
  width: 12px;
  height: 12px;
  color: var(--dsw-alias-label-tertiary);
  transition: transform 0.12s ease;
}
.did-chevron[data-open='true'] { transform: rotate(90deg); }

.did-icon {
  display: inline-flex;
  flex: none;
  width: 15px;
  height: 15px;
  color: var(--dsw-alias-label-secondary);
}

.did-title {
  flex: none;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}

.did-op {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  line-height: 16px;
}

.did-path {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 46%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  text-align: left;
  text-decoration: underline dotted 1px;
  text-underline-offset: 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}
.did-path:hover { color: var(--dsw-alias-brand-primary); }

.did-stats {
  display: inline-flex;
  flex: none;
  gap: 5px;
  margin-left: 2px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  font-variant-numeric: tabular-nums;
}
.did-add { color: var(--dsw-alias-state-success-primary); }
.did-del { color: var(--dsw-alias-state-error-primary); }

.did-meta {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11.5px;
  white-space: nowrap;
}

.did-spacer { flex: 1 1 auto; min-width: 4px; }

.did-state {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  white-space: nowrap;
}
.did-state[data-state='error'] { color: var(--dsw-alias-state-error-primary); }
.did-state[data-state='running'], .did-state[data-state='preparing'] { color: var(--dsw-alias-brand-primary); }
.did-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
.did-state[data-state='running'] .did-dot, .did-state[data-state='preparing'] .did-dot { animation: did-pulse 1.1s ease-in-out infinite; }
@keyframes did-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.did-zoom {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11px;
  line-height: 17px;
  cursor: pointer;
}
.did-zoom:hover:not(:disabled) { color: var(--dsw-alias-brand-primary); border-color: currentColor; }
.did-zoom:disabled { opacity: 0.4; cursor: default; }

.did-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2, transparent);
}

.did-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 3px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, var(--dsw-alias-bg-layer-1, transparent));
  color: var(--dsw-alias-label-secondary);
  position: sticky;
  top: 0;
  z-index: 4;
  font-size: 11.5px;
  line-height: 18px;
}
.did-body > .did-hunk:first-child > .did-bar { border-top: 0; }

.did-bar-file {
  min-width: 0;
  max-width: 38%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
.did-bar-range { white-space: nowrap; font-variant-numeric: tabular-nums; }
.did-bar-stats { margin-left: auto; flex: none; font-family: var(--did-mono); font-variant-numeric: tabular-nums; }

.did-rows { display: flex; flex-direction: column; min-width: 0; }

.did-row {
  display: grid;
  grid-template-columns: 3.1em 3.1em 1em minmax(0, 1fr) auto;
  column-gap: 2px;
  min-width: 0;
  padding: 0 8px 0 2px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
}
.did-row[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-row[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-num {
  overflow: hidden;
  text-align: right;
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
  user-select: none;
  font-size: 11px;
}
.did-sign { text-align: center; user-select: none; color: var(--dsw-alias-label-tertiary); }
.did-row[data-kind='add'] .did-sign { color: var(--dsw-alias-state-success-primary); }
.did-row[data-kind='del'] .did-sign { color: var(--dsw-alias-state-error-primary); }

.did-code {
  min-width: 0;
  margin: 0;
  padding: 0 4px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: inherit;
  color: var(--dsw-alias-label-primary);
  tab-size: 4;
}

.did-move {
  align-self: center;
  margin-left: 6px;
  padding: 0 5px;
  border: 0.5px solid currentColor;
  border-radius: 999px;
  font-family: var(--dsh-content-font-family, system-ui, sans-serif);
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
  opacity: 0.85;
}
.did-row[data-kind='del'] .did-move { color: var(--dsw-alias-state-error-primary); }
.did-row[data-kind='add'] .did-move { color: var(--dsw-alias-state-success-primary); }

/* Word/character-level spans: deeper than the row's line-level wash. */
.did-row[data-kind='del'] .did-seg[data-changed='true'],
.did-cell[data-kind='del'] .did-seg[data-changed='true'] {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent);
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 65%, transparent);
}
.did-row[data-kind='add'] .did-seg[data-changed='true'],
.did-cell[data-kind='add'] .did-seg[data-changed='true'] {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 30%, transparent);
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 62%, transparent);
}

.did-gap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 2px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 3.5%, transparent);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
}
.did-gap-range { font-variant-numeric: tabular-nums; white-space: nowrap; }
.did-shift {
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  white-space: nowrap;
}

.did-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 3px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 17px;
}
.did-foot .did-grow { flex: 1 1 auto; }
.did-link {
  flex: none;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 11px;
  text-decoration: underline dotted 1px;
  text-underline-offset: 2px;
  cursor: pointer;
}

.did-note {
  padding: 6px 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
}

.did-notice {
  padding: 5px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  line-height: 16px;
}
.did-dialog-notice {
  border-top: 0;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  position: sticky;
  top: 0;
  z-index: 3;
}

.did-empty {
  padding: 8px 10px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11.5px;
}

.did-error {
  padding: 7px 10px;
  color: var(--dsw-alias-state-error-primary);
  font-size: 11.5px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* ---- root overlay / modal ---- */

.did-overlay-root { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; }
.did-overlay-root[data-open='true'] { pointer-events: auto; }

.did-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 32%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
}

.did-dialog {
  display: flex;
  flex-direction: column;
  width: min(1440px, 96vw);
  height: min(900px, 90vh);
  min-width: 0;
  overflow: hidden;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
}

.did-dialog-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 14px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1, transparent);
}

.did-dialog-title { display: flex; flex-direction: column; gap: 1px; flex: 1 1 auto; min-width: 0; }
.did-dialog-path { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.did-dialog-sub { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.did-tabs { display: inline-flex; flex: none; gap: 2px; padding: 2px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); }
.did-tab {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}
.did-tab[data-active='true'] { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.did-tab:disabled { opacity: 0.4; cursor: default; }

.did-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.did-close:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }

.did-dialog-body { flex: 1 1 auto; min-height: 0; overflow: auto; background: var(--dsw-alias-bg-base); }

.did-dialog-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 7px 14px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11.5px;
}
.did-dialog-foot .did-grow { flex: 1 1 auto; }

.did-sbs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

.did-panes-head { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); position: sticky; top: 0; z-index: 2; background: var(--dsw-alias-bg-layer-1); border-bottom: 0.5px solid var(--dsw-alias-border-l2); }
.did-pane-label { padding: 4px 12px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; }
.did-pane-label + .did-pane-label { border-left: 0.5px solid var(--dsw-alias-border-l1); }

.did-sbs .did-bar { grid-column: 1 / -1; align-self: start; top: 23px; }

.did-read-main { min-width: 0; }
.did-read-range[hidden] { display: none; }
.did-read-range {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-tertiary);
  font-family: var(--enhanced-mono, var(--dsw-font-markdown-code-block-small, ui-monospace, monospace));
  font-size: 10.5px;
  line-height: 16px;
  white-space: nowrap;
  vertical-align: middle;
}
.did-sbs .did-gap { grid-column: 1 / -1; }
.did-sbs .did-note { grid-column: 1 / -1; }

.did-pair { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

.did-cell {
  display: grid;
  grid-template-columns: 3.2em minmax(0, 1fr) auto;
  min-width: 0;
  padding: 0 6px 0 0;
  font-family: var(--did-mono, 12px/18px ui-monospace, monospace);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
  border-left: 0.5px solid transparent;
}
.did-pair > .did-cell + .did-cell { border-left: 0.5px solid var(--dsw-alias-border-l1); }
.did-cell[data-kind='none'] { background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent); }
.did-cell[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); }
.did-cell[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); }
.did-cell[data-kind='del'] { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-cell[data-kind='add'] { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-cell .did-num { font-size: 11px; }
.did-cell .did-code { padding: 0 4px; }

.did-full-note { grid-column: 1 / -1; padding: 8px 14px; color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }

@media (max-width: 860px) {
  .did-overlay { padding: 8px; }
  .did-dialog { width: 100%; height: 94vh; }
  .did-pair { grid-template-columns: minmax(0, 1fr); }
  .did-cell + .did-cell { border-top: 0.5px dashed var(--dsw-alias-border-l2); }
}
`;

// src/client/read-range.js
function compressLineRanges(numbers) {
  const ranges = [];
  let start = null;
  let previous = null;
  for (const value of numbers) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (start === null) {
      start = previous = value;
    } else if (value === previous + 1) {
      previous = value;
    } else {
      ranges.push({ start, end: previous });
      start = previous = value;
    }
  }
  if (start !== null) ranges.push({ start, end: previous });
  return ranges;
}
function positiveInt(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
}
function readRangesForBlock(block) {
  const call2 = deriveCall(block);
  const meta = call2.meta;
  if (meta !== null && typeof meta === "object" && Array.isArray(meta.lines) && meta.lines.length > 0) {
    const numbers = meta.lines.map((line) => line !== null && typeof line === "object" ? line.number : void 0).filter((value) => typeof value === "number" && Number.isFinite(value));
    if (numbers.length > 0) return compressLineRanges(numbers);
  }
  const args = call2.args;
  if (args === null || typeof args !== "object") return null;
  const offset = positiveInt(args.offset);
  const limit = positiveInt(args.limit);
  if (offset === null && limit === null) return null;
  const start = offset ?? 1;
  if (limit === null) return [{ start, end: null }];
  return [{ start, end: start + limit - 1 }];
}
function readRangeLabels(ranges, t) {
  if (!Array.isArray(ranges) || ranges.length === 0) return null;
  const max = 4;
  const labels = ranges.slice(0, max).map((range2) => {
    if (range2.end === null) return t("readFrom", { line: range2.start });
    if (range2.start === range2.end) return `L ${range2.start}`;
    return `L ${range2.start} – L ${range2.end}`;
  });
  if (ranges.length > max) labels.push("…");
  return labels.join(" · ");
}

// src/client/read-range-dom.js
var CHIP_ATTR = "data-dsh-inline-diff-read-range";
var rowCache = /* @__PURE__ */ new WeakMap();
function blockFromFiber(element) {
  const key = Object.keys(element).find((name) => name.startsWith("__reactFiber$") || name.startsWith("__reactInternalInstance$"));
  if (key === void 0) return null;
  let fiber = element[key];
  let guard = 0;
  while (fiber !== null && fiber !== void 0 && guard < 60) {
    const props = fiber.memoizedProps;
    if (props !== null && typeof props === "object") {
      const block = props.block;
      if (block !== null && typeof block === "object" && ("kind" in block || "phase" in block || "call" in block)) return block;
    }
    fiber = fiber.return;
    guard++;
  }
  return null;
}
function syncReadRow(row, t) {
  const block = blockFromFiber(row);
  if (block === null) return;
  const cached = rowCache.get(row);
  let label;
  if (cached !== void 0 && cached.block === block) {
    label = cached.label;
  } else {
    const ranges = readRangesForBlock(block);
    label = ranges === null ? null : readRangeLabels(ranges, t);
    rowCache.set(row, { block, label });
  }
  const explicitHeader = row.querySelector("[data-disclosure-row]");
  if (explicitHeader === null) return;
  let chip = explicitHeader.querySelector(`[${CHIP_ATTR}]`);
  if (label === null) {
    if (chip !== null) chip.remove();
    return;
  }
  const fileLink = explicitHeader.querySelector("button");
  if (fileLink === null) return;
  if (chip === null || chip.isConnected !== true) {
    chip = document.createElement("span");
    chip.className = "did-read-range";
    chip.setAttribute(CHIP_ATTR, "true");
    fileLink.insertAdjacentElement("afterend", chip);
  }
  if (chip.textContent !== label) chip.textContent = label;
  if (chip.title !== label) chip.title = label;
  const expanded = explicitHeader.getAttribute("aria-expanded") === "true";
  if (chip.hidden !== expanded) chip.hidden = expanded;
}
function startReadRangeChips(t) {
  if (typeof document === "undefined" || typeof MutationObserver !== "function") return () => {
  };
  let scheduled = false;
  let frame = null;
  const scan = () => {
    scheduled = false;
    frame = null;
    for (const row of document.querySelectorAll('[data-tool="read"]')) syncReadRow(row, t);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(scan) : setTimeout(scan, 16);
  };
  scan();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-expanded"] });
  return () => {
    observer.disconnect();
    if (frame !== null) {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      else clearTimeout(frame);
    }
    for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) chip.remove();
  };
}

// src/client/project.js
var VERSION = "1.0.0";
var AUTHOR = "Him666233";
var AUTHOR_URL = "https://github.com/Him666233";
var REPO_URL = "https://github.com/Him666233/dsh-inline-diff";

// src/client/settings-ui.jsx
var import_react4 = require("react");
var import_react_dom2 = require("react-dom");
var import_jsx_runtime4 = require("react/jsx-runtime");
var modalOpen = false;
var modalListeners = /* @__PURE__ */ new Set();
function openSettingsModal() {
  if (modalOpen) return;
  modalOpen = true;
  for (const listener of modalListeners) listener();
}
function closeSettingsModal() {
  if (!modalOpen) return;
  modalOpen = false;
  for (const listener of modalListeners) listener();
}
function subscribeModal(listener) {
  modalListeners.add(listener);
  return () => modalListeners.delete(listener);
}
function useModalOpen() {
  return (0, import_react4.useSyncExternalStore)(subscribeModal, () => modalOpen, () => modalOpen);
}
function useSettings() {
  return (0, import_react4.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}
function Segmented({ ariaLabel, value, options, disabled, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-seg", role: "radiogroup", "aria-label": ariaLabel, children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "button",
    {
      type: "button",
      role: "radio",
      "aria-checked": value === option.value,
      className: "did-seg-option",
      "data-active": value === option.value ? "true" : "false",
      disabled,
      onClick: () => onChange(option.value),
      children: option.label
    },
    option.value
  )) });
}
function SlidersIcon({ size = 15 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { viewBox: "0 0 16 16", width: size, height: size, fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "path",
      {
        d: "M2 4h6M11.5 4H14M2 8h2.5M8 8h6M2 12h7M12.5 12H14",
        stroke: "currentColor",
        strokeWidth: "1.4",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "9.75", cy: "4", r: "1.6", stroke: "currentColor", strokeWidth: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "6.25", cy: "8", r: "1.6", stroke: "currentColor", strokeWidth: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "10.75", cy: "12", r: "1.6", stroke: "currentColor", strokeWidth: "1.4" })
  ] });
}
function SettingRow({ label, description, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-setting", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-setting-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-label", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-desc", children: description })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-control", children })
  ] });
}
function SettingsPanel({ t, onClose }) {
  const settings = useSettings();
  const [dsmMode, setDsmMode] = (0, import_react4.useState)(void 0);
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const [error, setError] = (0, import_react4.useState)("");
  (0, import_react4.useEffect)(() => {
    setDsmMode(currentTranscriptMode());
  }, [settings.transcript]);
  const chooseTranscript = async (mode) => {
    setBusy(true);
    setError("");
    try {
      await setTranscriptPreference(mode);
      setDsmMode(currentTranscriptMode());
    } catch (reason) {
      setError(String(reason?.message ?? reason));
    } finally {
      setBusy(false);
    }
  };
  const doReset = async () => {
    setBusy(true);
    setError("");
    const previousToolCalls = settings.toolCalls;
    try {
      await resetSettings();
      setDsmMode(currentTranscriptMode());
      if (getSettings().toolCalls !== previousToolCalls) window.setTimeout(() => window.location.reload(), 180);
    } catch (reason) {
      setError(String(reason?.message ?? reason));
    } finally {
      setBusy(false);
    }
  };
  const transcriptNote = settings.transcript === "enhanced" ? t("settings.transcriptEnhancedNote") : t("settings.transcriptNativeNote");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-headtext", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-title", children: t("settings.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-sub", children: t("settings.description") })
      ] }),
      onClose === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "did-settings-close", onClick: onClose, "aria-label": t("close"), title: t("close"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.fileCards"), description: t("settings.fileCardsDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.fileCards"),
          value: settings.fileCards,
          onChange: (value) => updateSettings({ fileCards: value }),
          options: [
            { value: "enhanced", label: t("settings.styleEnhanced") },
            { value: "native", label: t("settings.styleNative") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.shellRows"), description: t("settings.shellRowsDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.shellRows"),
          value: settings.shellRows,
          onChange: (value) => updateSettings({ shellRows: value }),
          options: [
            { value: "enhanced", label: t("settings.styleEnhanced") },
            { value: "native", label: t("settings.styleNative") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.toolCalls"), description: t("settings.toolCallsDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.toolCalls"),
          value: settings.toolCalls,
          onChange: (value) => {
            if (value === settings.toolCalls) return;
            updateSettings({ toolCalls: value });
            if (value === "enhanced" && settings.transcript === "native") {
              setTranscriptPreference("enhanced").catch(() => {
              });
            }
          },
          options: [
            { value: "enhanced", label: t("settings.styleEnhanced") },
            { value: "native", label: t("settings.styleNative") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.transcript"), description: transcriptNote, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.transcript"),
          value: settings.transcript,
          disabled: busy,
          onChange: chooseTranscript,
          options: [
            { value: "enhanced", label: t("settings.flat") },
            { value: "native", label: t("settings.styleNative") }
          ]
        }
      ) }),
      settings.toolCalls === "enhanced" && settings.transcript === "native" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("settings.toolCallsNeedsFlat") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("settings.subagentNote") }),
      dsmMode !== void 0 && settings.transcript === "enhanced" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("settings.dsmCurrent", { mode: dsmMode }) }) : null,
      error !== "" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-error", children: error }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "did-settings-reset", disabled: busy, onClick: doReset, children: t("settings.reset") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-settings-grow" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("a", { className: "did-settings-author", href: AUTHOR_URL, target: "_blank", rel: "noreferrer", title: AUTHOR_URL, children: AUTHOR }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("a", { className: "did-settings-author", href: REPO_URL, target: "_blank", rel: "noreferrer", title: REPO_URL, children: "GitHub" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "did-settings-hint", children: [
        "v",
        VERSION,
        " · ",
        busy ? t("settings.saving") : t("settings.live")
      ] })
    ] })
  ] });
}
function SettingsSection({ t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-page", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsPanel, { t }) });
}
function SettingsLauncher({ wide, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      className: "did-launcher",
      onClick: openSettingsModal,
      title: t("settings.title"),
      "aria-label": t("settings.title"),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SlidersIcon, {}),
        wide ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-launcher-label", children: t("settings.short") }) : null
      ]
    }
  );
}
function SettingsModal({ t }) {
  const open = useModalOpen();
  const [host, setHost] = (0, import_react4.useState)(null);
  (0, import_react4.useEffect)(() => {
    setHost(document.body);
  }, []);
  (0, import_react4.useEffect)(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeSettingsModal();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open]);
  if (!open) return null;
  const overlay = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react4.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-overlay", onPointerDown: closeSettingsModal, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("settings.title"), onPointerDown: (event) => event.stopPropagation(), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsPanel, { t, onClose: closeSettingsModal }) }) }) });
  return host === null ? overlay : (0, import_react_dom2.createPortal)(overlay, host);
}

// src/client/index.jsx
var inject = ["slots", "locale", "configForms"];
var INLINE_DIFF_KEYS = MUTATION_TOOLS;
var ENHANCED_SHELL_KEYS = ["bash", "pwsh", "win_bash"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dicts), "dsh-inline-diff: dictionaries");
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.dshPlugin = "inline-diff";
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, "dsh-inline-diff: stylesheet");
  const t = ctx.locale.bind(NS);
  console.info(`[dsh-inline-diff] client ${VERSION} · enhanced presentation`);
  ctx.effect(() => startReadRangeChips(t), "dsh-inline-diff: read range chips");
  initSettings(ctx.configForms);
  ctx.slots.inject("tool.call.toolview", () => {
    let disposers = [];
    let signature = "";
    const clear = () => {
      for (const dispose of disposers) dispose();
      disposers = [];
    };
    const sync = () => {
      const settings = getSettings();
      const next = `${settings.fileCards}|${settings.shellRows}|${settings.toolCalls}`;
      if (next === signature) return;
      signature = next;
      clear();
      if (settings.fileCards === "enhanced") {
        for (const key of INLINE_DIFF_KEYS) {
          disposers.push(ctx.slots.register({
            name: "tool.call.toolview",
            key,
            priority: -1,
            locale: NS
          }, InlineDiffCard));
        }
      }
      if (settings.shellRows === "enhanced") {
        for (const key of ENHANCED_SHELL_KEYS) {
          disposers.push(ctx.slots.register({
            name: "tool.call.toolview",
            key,
            priority: -1,
            locale: NS
          }, EnhancedShellCard));
        }
      }
      if (settings.toolCalls === "enhanced") {
        for (const key of [...ENHANCED_DETAILS_KEYS, ...ENHANCED_GENERIC_KEYS]) {
          disposers.push(ctx.slots.register({
            name: "tool.call.toolview",
            key,
            priority: -1,
            locale: NS
          }, EnhancedExpandedTool));
        }
      }
    };
    const unsubscribe = subscribeSettings(sync);
    sync();
    return () => {
      unsubscribe();
      clear();
    };
  });
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "tool-call",
    priority: -1,
    locale: NS,
    children: {
      "tool.call.toolview": { kind: "keyed", scope: "session" }
    }
  }, EnhancedToolCallTree));
  ctx.slots.inject("shell.overlay", function* () {
    yield ctx.slots.register({
      name: "shell.overlay",
      id: "inline-diff.modal",
      order: 60,
      locale: NS
    }, DiffModal);
    yield ctx.slots.register({
      name: "shell.overlay",
      id: "inline-diff.settings",
      order: 61,
      locale: NS
    }, SettingsModal);
  });
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "inline-diff",
    order: 40,
    label: () => t("settings.nav"),
    locale: NS
  }, SettingsSection));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "inline-diff.settings",
    order: 40,
    label: () => t("settings.short"),
    locale: NS
  }, SettingsLauncher));
}
		return module.exports;
	}
});
